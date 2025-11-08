# Max Booster - Infrastructure Templates

**⚠️ IMPORTANT: PRODUCTION DEPLOYMENT CHECKLIST**

These templates provide production-ready starting points for scaling Max Booster from 10K to 100M users. However, **DO NOT deploy to production as-is**. Follow this checklist first.

---

## 🔒 Security Hardening Required

### 1. **Secrets Management** 🔴 **CRITICAL**

**Current State**: Placeholder secrets in templates  
**Required Before Production**:

```bash
# ❌ NEVER do this in production
stringData:
  DATABASE_URL: "postgresql://user:password@postgres..."

# ✅ Use managed secrets instead
```

**Fix for Terraform (AWS)**:
```hcl
# Use AWS Secrets Manager
resource "aws_secretsmanager_secret" "db_password" {
  name = "maxbooster-db-password"
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = random_password.db_password.result
}

# Reference in user-data
export DATABASE_URL=$(aws secretsmanager get-secret-value \
  --secret-id maxbooster-db-password --query SecretString --output text)
```

**Fix for Kubernetes**:
```yaml
# Use External Secrets Operator or CSI driver
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: maxbooster-secrets
spec:
  secretStoreRef:
    name: aws-secrets-manager
  target:
    name: maxbooster-secrets
  data:
    - secretKey: DATABASE_URL
      remoteRef:
        key: maxbooster-db-url
```

---

### 2. **Network Security** 🔴 **CRITICAL**

**Missing Components**:
- NAT Gateways for private subnet egress
- Web Application Firewall (WAF)
- Network policies (Kubernetes)
- DDoS protection

**Add to Terraform**:
```hcl
# NAT Gateway
resource "aws_nat_gateway" "main" {
  count         = 3
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
}

# WAF (Web Application Firewall)
resource "aws_wafv2_web_acl" "main" {
  name  = "maxbooster-waf"
  scope = "REGIONAL"

  default_action {
    allow {}
  }

  # Rate limiting rule
  rule {
    name     = "RateLimit"
    priority = 1

    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }

    action {
      block {}
    }
  }
}

# Associate WAF with ALB
resource "aws_wafv2_web_acl_association" "main" {
  resource_arn = aws_lb.main.arn
  web_acl_arn  = aws_wafv2_web_acl.main.arn
}
```

**Add to Kubernetes**:
```yaml
# Network Policy (restrict pod-to-pod traffic)
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: maxbooster-api-netpol
  namespace: maxbooster
spec:
  podSelector:
    matchLabels:
      app: maxbooster-api
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - protocol: TCP
          port: 5000
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: postgres
      ports:
        - protocol: TCP
          port: 5432
    - to:
        - podSelector:
            matchLabels:
              app: redis
      ports:
        - protocol: TCP
          port: 6379
```

---

### 3. **Terraform State Backend** 🟡 **HIGH**

**Current State**: Local state (commented out S3 backend)  
**Required Before Production**:

```hcl
terraform {
  backend "s3" {
    bucket         = "maxbooster-terraform-state"  # Create this first!
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"  # Create this for locking
  }
}
```

**Setup Commands**:
```bash
# Create S3 bucket for state
aws s3 mb s3://maxbooster-terraform-state
aws s3api put-bucket-versioning \
  --bucket maxbooster-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

---

### 4. **Environment-Specific Configuration** 🟡 **HIGH**

**Required**: Parameterize all environment-specific values

**Create**: `terraform.tfvars` files for each environment

```hcl
# terraform.tfvars (DO NOT commit this file!)
aws_region        = "us-east-1"
environment       = "production"
instance_count    = 3
db_instance_class = "db.r5.xlarge"
redis_node_type   = "cache.r5.large"

# Add your actual values
domain_name       = "api.maxbooster.com"
certificate_arn   = "arn:aws:acm:us-east-1:..."
```

---

## 📋 Pre-Deployment Checklist

### Before Running `terraform apply`:

- [ ] **Secrets**: Migrate to AWS Secrets Manager / Kubernetes Secrets
- [ ] **State Backend**: Set up S3 + DynamoDB for state
- [ ] **Network**: Add NAT Gateways to private subnet route tables
- [ ] **WAF**: Configure Web Application Firewall rules
- [ ] **SSL/TLS**: Obtain and configure SSL certificates
- [ ] **DNS**: Set up Route53 or equivalent DNS
- [ ] **IAM**: Review and minimize IAM permissions (least privilege)
- [ ] **Monitoring**: Configure CloudWatch alarms for critical metrics
- [ ] **Backup**: Verify RDS automated backups are configured
- [ ] **Cost**: Run `terraform plan` and review estimated costs
- [ ] **Security Groups**: Review and restrict inbound rules
- [ ] **Encryption**: Enable encryption at rest for RDS, ElastiCache, S3
- [ ] **Tags**: Add proper resource tags for cost tracking

### Before Deploying to Kubernetes:

- [ ] **Secrets**: Use External Secrets Operator or CSI driver
- [ ] **Resource Limits**: Tune CPU/memory requests and limits
- [ ] **Network Policies**: Restrict pod-to-pod traffic
- [ ] **RBAC**: Configure Role-Based Access Control
- [ ] **Pod Security**: Enable Pod Security Standards
- [ ] **Ingress**: Configure TLS certificates via cert-manager
- [ ] **Monitoring**: Deploy Prometheus + Grafana
- [ ] **Logging**: Set up centralized logging (Loki, CloudWatch)
- [ ] **Autoscaling**: Verify HPA metrics server is installed
- [ ] **Quotas**: Set namespace resource quotas

---

## 🚀 Deployment Instructions

### **Terraform (AWS - Phase 1: 100K Users)**

**Cost**: ~$600-2,000/month

```bash
# 1. Install Terraform
brew install terraform  # macOS
# or download from https://terraform.io

# 2. Configure AWS credentials
aws configure

# 3. Initialize Terraform
cd infrastructure/terraform
terraform init

# 4. Review the plan (NO changes made yet)
terraform plan -out=tfplan

# 5. Review estimated costs
# Use AWS Cost Calculator or terraform-cost-estimation

# 6. Apply changes (creates infrastructure)
terraform apply tfplan

# 7. Save outputs
terraform output -json > outputs.json
```

**Outputs**:
- `load_balancer_dns` - Point your DNS here
- `database_endpoint` - Add to application env vars
- `redis_endpoint` - Add to application env vars
- `s3_bucket` - Add to application env vars

---

### **Kubernetes (Phase 3: 100M Users)**

**Cost**: ~$50K-200K/month

```bash
# 1. Ensure kubectl is installed and configured
kubectl version

# 2. Create namespace
kubectl create namespace maxbooster

# 3. Set up secrets (use External Secrets Operator)
kubectl apply -f external-secrets.yaml

# 4. Dry-run to validate manifests
kubectl apply -f deployment.yaml --dry-run=client

# 5. Deploy to cluster
kubectl apply -f deployment.yaml

# 6. Verify deployment
kubectl get pods -n maxbooster
kubectl get svc -n maxbooster
kubectl get hpa -n maxbooster

# 7. Check logs
kubectl logs -f deployment/maxbooster-api -n maxbooster

# 8. Monitor scaling
watch kubectl get hpa -n maxbooster
```

---

### **Docker Compose (Local Testing)**

**Cost**: Free

```bash
# 1. Ensure Docker is installed
docker --version

# 2. Start all services
cd infrastructure/docker
docker-compose up -d

# 3. View logs
docker-compose logs -f api-1

# 4. Test load balancing
curl http://localhost/api/system/health

# 5. Access monitoring
open http://localhost:3000  # Grafana
open http://localhost:9090  # Prometheus
open http://localhost:9001  # MinIO Console

# 6. Stop all services
docker-compose down

# 7. Clean up volumes
docker-compose down -v
```

---

## 🔍 Validation & Testing

### **After Terraform Deployment**:

```bash
# Test ALB health check
curl https://your-alb-dns/api/system/health

# Test database connection
psql postgresql://user:pass@your-rds-endpoint:5432/maxbooster

# Test Redis connection
redis-cli -h your-redis-endpoint ping

# Test S3 access
aws s3 ls s3://your-bucket-name/

# Load test (use Apache Bench or k6)
ab -n 10000 -c 100 https://your-alb-dns/api/system/health
```

### **After Kubernetes Deployment**:

```bash
# Check pod readiness
kubectl get pods -n maxbooster

# Test internal service
kubectl run -it --rm debug --image=alpine --restart=Never -- sh
wget -O- http://maxbooster-api.maxbooster.svc.cluster.local/api/system/health

# Check autoscaling
kubectl describe hpa maxbooster-api-hpa -n maxbooster

# Load test
kubectl run siege --image=yokogawa/siege --rm -it --restart=Never -- \
  -c 100 -t 60s https://your-domain/api/system/health
```

---

## 📊 Cost Optimization

### **Terraform (AWS)**:
- Use Reserved Instances for predictable workloads (up to 70% savings)
- Enable S3 lifecycle policies (archive to Glacier after 90 days)
- Use Auto Scaling to scale down during off-peak hours
- Leverage Spot Instances for worker processes (up to 90% savings)

### **Kubernetes**:
- Use Cluster Autoscaler to scale nodes based on demand
- Implement Pod Disruption Budgets to use Spot/Preemptible nodes safely
- Right-size resource requests/limits to avoid over-provisioning
- Use Horizontal Pod Autoscaling (HPA) aggressively

---

## 🛡️ Compliance & Regional Considerations

### **Data Sovereignty**:
- Deploy separate infrastructure per region for GDPR/data residency
- Use multi-region RDS replicas for disaster recovery
- Configure CloudFront geo-restrictions if needed

### **SLA Targets**:
| Phase | Uptime SLA | RTO | RPO |
|-------|-----------|-----|-----|
| Phase 1 (100K) | 99.5% | 1 hour | 1 hour |
| Phase 2 (1M) | 99.9% | 15 min | 5 min |
| Phase 3 (10M+) | 99.99% | 5 min | 0 (sync replication) |

---

## 📞 Support & Troubleshooting

### **Common Issues**:

**Terraform fails with "bucket does not exist"**:
- Create the S3 bucket for state first (see Terraform State Backend section)

**Kubernetes pods stuck in Pending**:
- Check resource availability: `kubectl describe pod <pod-name>`
- Verify node pool has capacity
- Check HPA metrics: `kubectl get hpa`

**Database connection timeout**:
- Verify security group allows traffic from application servers
- Check database is in "available" state
- Verify connection string is correct

**High costs**:
- Review CloudWatch metrics for over-provisioning
- Check Auto Scaling settings
- Use AWS Cost Explorer to identify expensive resources

---

## 📚 Additional Resources

- **SCALABILITY_READINESS_PLAN.md** - Complete scaling strategy
- **SCALABILITY_IMPLEMENTATION_SUMMARY.md** - Executive summary
- **cost-calculator.js** - Infrastructure cost estimation tool
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Kubernetes Production Best Practices](https://kubernetes.io/docs/setup/best-practices/)

---

## ⚠️ Final Warning

**These templates are STARTING POINTS, not production-ready deployments.**

Before deploying to production:
1. ✅ Complete the Pre-Deployment Checklist
2. ✅ Conduct security review
3. ✅ Perform load testing in staging
4. ✅ Set up monitoring and alerting
5. ✅ Document runbooks for incident response
6. ✅ Get approval from security/compliance team

**When in doubt, consult a DevOps/SRE expert before deploying.**

---

**Document Version**: 1.0  
**Last Updated**: November 8, 2025  
**Maintained By**: Development Team
