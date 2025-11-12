# Redis and CDN Production Deployment Guide

**Document Version:** 1.0  
**Last Updated:** November 12, 2025  
**Target Scale:** 10 Billion User Accounts

This guide provides comprehensive instructions for deploying and scaling Max Booster's Redis infrastructure and CDN services to support global-scale operations.

---

## Table of Contents

1. [Redis Setup for 10 Billion Users](#redis-setup-for-10-billion-users)
2. [CDN Migration Plan](#cdn-migration-plan)
3. [Scaling Architecture by Phase](#scaling-architecture-by-phase)
4. [Monitoring and Observability](#monitoring-and-observability)
5. [Disaster Recovery](#disaster-recovery)

---

## Redis Setup for 10 Billion Users

### 1.1 Cluster Topology and Configuration

#### Production Architecture

```
Global Redis Infrastructure:
├── 5 Geographic Regions (Americas, EMEA, APAC, China, Australia)
│   ├── Primary Redis Cluster (per region)
│   │   ├── 200 Master Nodes (sharded by user ID hash)
│   │   ├── 200 Replica Nodes (1:1 master-replica ratio)
│   │   └── 3 Sentinel Nodes (failover management)
│   ├── Session Store Cluster (dedicated)
│   │   ├── 50 Master Nodes
│   │   └── 50 Replica Nodes
│   └── Cache Cluster (optional, for hot data)
│       ├── 30 Master Nodes
│       └── 30 Replica Nodes
└── Global Coordination Layer
    ├── CRDT-enabled cross-region replication
    └── Conflict resolution with last-write-wins
```

**Total Infrastructure:**
- 1,000 Master Nodes globally (200 per region × 5 regions)
- 1,000 Replica Nodes globally
- 15 Sentinel Nodes (3 per region)
- Total: 2,015 Redis instances

#### Per-Node Configuration

**redis.conf - Production Settings:**

```conf
# Network
bind 0.0.0.0
port 6379
tcp-backlog 511
timeout 0
tcp-keepalive 300

# Memory Management
maxmemory 64gb
maxmemory-policy allkeys-lru
maxmemory-samples 10

# Persistence (AOF for session data, RDB for cache)
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# Replication
repl-diskless-sync yes
repl-diskless-sync-delay 5
repl-ping-replica-period 10
repl-timeout 60
repl-backlog-size 512mb
repl-backlog-ttl 3600

# Clustering
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 15000
cluster-replica-validity-factor 10
cluster-migration-barrier 1
cluster-require-full-coverage no

# Performance
slowlog-log-slower-than 10000
slowlog-max-len 128
lazyfree-lazy-eviction yes
lazyfree-lazy-expire yes
lazyfree-lazy-server-del yes
replica-lazy-flush yes

# Security
requirepass ${REDIS_PASSWORD}
masterauth ${REDIS_PASSWORD}

# Limits
maxclients 50000
```

#### Cluster Sharding Strategy

**User ID Hash-Based Sharding:**
```javascript
// Sharding function
function getRedisNode(userId) {
  const hash = murmurhash3(userId);
  const shardId = hash % 200; // 200 shards per region
  return `redis-shard-${shardId}.${region}.maxbooster.com:6379`;
}
```

**Key Naming Convention:**
```
session:{userId}:{sessionId}
user:{userId}:profile
user:{userId}:preferences
rate_limit:{userId}:{endpoint}:{window}
cache:{resourceType}:{resourceId}
queue:{queueName}:{priority}:{jobId}
```

### 1.2 Required Environment Variables

**Application Configuration:**

```bash
# Redis Cluster Endpoints (per region)
REDIS_CLUSTER_AMERICAS="redis://redis-americas-primary.maxbooster.com:6379"
REDIS_CLUSTER_EMEA="redis://redis-emea-primary.maxbooster.com:6379"
REDIS_CLUSTER_APAC="redis://redis-apac-primary.maxbooster.com:6379"
REDIS_CLUSTER_CHINA="redis://redis-china-primary.maxbooster.com:6379"
REDIS_CLUSTER_AUSTRALIA="redis://redis-australia-primary.maxbooster.com:6379"

# Session Store (dedicated cluster)
REDIS_SESSION_STORE="redis://redis-session.maxbooster.com:6379"

# Authentication
REDIS_PASSWORD="<strong-password-from-secrets-manager>"
REDIS_TLS_ENABLED="true"
REDIS_TLS_CERT_PATH="/etc/ssl/redis/client.crt"
REDIS_TLS_KEY_PATH="/etc/ssl/redis/client.key"
REDIS_TLS_CA_PATH="/etc/ssl/redis/ca.crt"

# Connection Pooling
REDIS_POOL_MIN=10
REDIS_POOL_MAX=1000
REDIS_CONNECT_TIMEOUT=5000
REDIS_COMMAND_TIMEOUT=3000

# Sentinel Configuration (for failover)
REDIS_SENTINEL_HOSTS="sentinel-1:26379,sentinel-2:26379,sentinel-3:26379"
REDIS_SENTINEL_MASTER_NAME="maxbooster-master"

# Performance Tuning
REDIS_MAX_RETRIES=3
REDIS_RETRY_DELAY=100
REDIS_ENABLE_OFFLINE_QUEUE=true
REDIS_ENABLE_READY_CHECK=true

# Monitoring
REDIS_METRICS_ENABLED=true
REDIS_SLOW_LOG_THRESHOLD=100
```

**Infrastructure as Code (Terraform):**

```hcl
# terraform.tfvars
redis_cluster_size = 200
redis_node_type = "cache.r6g.4xlarge"  # 128GB RAM, 16 vCPUs
redis_engine_version = "7.0"
redis_parameter_group = "maxbooster-redis7-cluster"
redis_snapshot_retention = 7
redis_snapshot_window = "03:00-05:00"
redis_maintenance_window = "sun:05:00-sun:07:00"
redis_auto_minor_version_upgrade = true
```

### 1.3 Failover and Playbook Procedures

#### Automatic Failover (Redis Sentinel)

**Sentinel Configuration:**

```conf
# sentinel.conf
sentinel monitor maxbooster-master 10.0.1.10 6379 2
sentinel auth-pass maxbooster-master ${REDIS_PASSWORD}
sentinel down-after-milliseconds maxbooster-master 5000
sentinel parallel-syncs maxbooster-master 1
sentinel failover-timeout maxbooster-master 60000
sentinel deny-scripts-reconfig yes
```

**Failover Process:**
1. Sentinel detects master failure (5 second timeout)
2. Quorum agreement (2 out of 3 sentinels)
3. Promote replica to master (~2 seconds)
4. Reconfigure other replicas to follow new master
5. Update DNS/load balancer to point to new master
6. Application reconnects automatically (circuit breaker pattern)

**Total Failover Time:** 7-10 seconds (sub-minute RTO)

#### Manual Failover Playbook

**Scenario 1: Planned Maintenance (Zero Downtime)**

```bash
#!/bin/bash
# 1. Verify cluster health
redis-cli --cluster check redis-cluster.maxbooster.com:6379

# 2. Drain master node (migrate slots to replicas)
redis-cli --cluster reshard redis-cluster.maxbooster.com:6379 \
  --cluster-from <source-node-id> \
  --cluster-to <target-node-id> \
  --cluster-slots 16384 \
  --cluster-yes

# 3. Wait for replication to catch up
redis-cli -h <master> INFO replication | grep master_repl_offset
redis-cli -h <replica> INFO replication | grep slave_repl_offset

# 4. Promote replica
redis-cli -h <replica> CLUSTER FAILOVER TAKEOVER

# 5. Verify new topology
redis-cli --cluster check redis-cluster.maxbooster.com:6379

# 6. Perform maintenance on old master
systemctl stop redis-server
# ... maintenance ...
systemctl start redis-server

# 7. Re-add to cluster as replica
redis-cli --cluster add-node <old-master>:6379 redis-cluster.maxbooster.com:6379 --cluster-slave
```

**Scenario 2: Regional Outage (Failover to Secondary Region)**

```bash
#!/bin/bash
# 1. Detect regional outage
curl https://redis-americas.maxbooster.com:6379/health || echo "Primary down"

# 2. Update DNS to point to secondary region
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch file://failover-dns.json

# 3. Update application config (environment variable override)
kubectl set env deployment/maxbooster \
  REDIS_CLUSTER_PRIMARY=redis://redis-emea-primary.maxbooster.com:6379

# 4. Restart application pods with rolling update
kubectl rollout restart deployment/maxbooster

# 5. Monitor application health
kubectl rollout status deployment/maxbooster

# 6. Enable cross-region replication from EMEA back to Americas
redis-cli -h redis-emea-primary.maxbooster.com \
  CLUSTER REPLICATE <americas-master-id>
```

**Estimated Recovery Time:**
- DNS propagation: 60 seconds (TTL)
- Application restart: 120 seconds (rolling update)
- Total RTO: 3 minutes

**Scenario 3: Data Corruption Recovery**

```bash
#!/bin/bash
# 1. Stop writes to affected node
redis-cli -h <affected-node> CONFIG SET maxmemory-policy noeviction
redis-cli -h <affected-node> CONFIG REWRITE

# 2. Restore from latest snapshot
aws s3 cp s3://maxbooster-redis-backups/latest.rdb /var/lib/redis/dump.rdb

# 3. Restart Redis with restored data
systemctl restart redis-server

# 4. Verify data integrity
redis-cli --rdb /var/lib/redis/dump.rdb --rdb-check

# 5. Re-enable writes
redis-cli CONFIG SET maxmemory-policy allkeys-lru
redis-cli CONFIG REWRITE

# 6. Monitor replication lag
watch -n 1 'redis-cli INFO replication | grep offset'
```

### 1.4 Connection Pooling Settings

**Node.js Application (ioredis):**

```typescript
import Redis from 'ioredis';

const redisCluster = new Redis.Cluster(
  [
    { host: 'redis-shard-0.maxbooster.com', port: 6379 },
    { host: 'redis-shard-1.maxbooster.com', port: 6379 },
    // ... all 200 shards
  ],
  {
    // Connection Pool
    enableOfflineQueue: true,
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    retryDelayOnClusterDown: 300,
    
    // Pool Size
    clusterRetryStrategy: (times) => Math.min(100 * 2 ** times, 2000),
    reconnectOnError: (err) => {
      const targetError = 'READONLY';
      return err.message.includes(targetError);
    },
    
    // Performance
    enableReadyCheck: true,
    lazyConnect: false,
    keepAlive: 30000,
    
    // Timeouts
    connectTimeout: 10000,
    commandTimeout: 5000,
    
    // TLS
    tls: {
      ca: fs.readFileSync(process.env.REDIS_TLS_CA_PATH),
      cert: fs.readFileSync(process.env.REDIS_TLS_CERT_PATH),
      key: fs.readFileSync(process.env.REDIS_TLS_KEY_PATH),
    },
    
    // Authentication
    password: process.env.REDIS_PASSWORD,
    
    // Cluster Options
    redisOptions: {
      password: process.env.REDIS_PASSWORD,
      tls: {},
    },
    scaleReads: 'slave', // Read from replicas
    maxRedirections: 16,
  }
);

// Connection event handlers
redisCluster.on('connect', () => console.log('Redis cluster connected'));
redisCluster.on('ready', () => console.log('Redis cluster ready'));
redisCluster.on('error', (err) => console.error('Redis cluster error:', err));
redisCluster.on('close', () => console.log('Redis cluster closed'));
redisCluster.on('reconnecting', () => console.log('Redis cluster reconnecting'));
redisCluster.on('end', () => console.log('Redis cluster ended'));

export default redisCluster;
```

**Connection Pool Sizing Guidelines:**

| User Load | Connections per App Instance | Total App Instances | Total Connections |
|-----------|------------------------------|---------------------|-------------------|
| 10K users | 10 | 5 | 50 |
| 100K users | 25 | 20 | 500 |
| 1M users | 50 | 100 | 5,000 |
| 10M users | 100 | 500 | 50,000 |
| 100M users | 200 | 2,000 | 400,000 |
| 1B users | 500 | 10,000 | 5,000,000 |
| 10B users | 1,000 | 50,000 | 50,000,000 |

**Per-Node Limit:** 50,000 connections (configured via `maxclients`)

### 1.5 Observability Hooks and Monitoring

#### Metrics to Monitor

**Redis Server Metrics:**
```
- connected_clients: Current client connections
- used_memory: Memory usage in bytes
- used_memory_rss: RSS memory
- mem_fragmentation_ratio: Memory fragmentation
- total_commands_processed: Total commands executed
- instantaneous_ops_per_sec: Current ops/second
- keyspace_hits: Cache hit count
- keyspace_misses: Cache miss count
- evicted_keys: Number of evicted keys
- expired_keys: Number of expired keys
- cluster_state: ok/fail
- cluster_slots_assigned: Number of assigned slots
- cluster_slots_ok: Number of healthy slots
- replication_backlog_size: Replication backlog
- master_repl_offset: Master replication offset
- slave_repl_offset: Replica replication offset
```

**Application Metrics:**
```
- redis_command_duration_seconds: Command latency histogram
- redis_connection_pool_active: Active connections
- redis_connection_pool_idle: Idle connections
- redis_connection_errors_total: Connection errors
- redis_command_errors_total: Command errors
- redis_cache_hit_rate: Cache hit percentage
- redis_failover_count: Number of failovers
- redis_slow_commands_total: Slow commands (>100ms)
```

#### Prometheus Exporter Configuration

```yaml
# prometheus-redis-exporter.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: redis-exporter-config
data:
  config.yml: |
    redis:
      addr: redis://redis-cluster.maxbooster.com:6379
      password: ${REDIS_PASSWORD}
      tls:
        enabled: true
        ca_cert: /etc/ssl/redis/ca.crt
        client_cert: /etc/ssl/redis/client.crt
        client_key: /etc/ssl/redis/client.key
    metrics:
      - name: connected_clients
        type: gauge
      - name: used_memory
        type: gauge
      - name: instantaneous_ops_per_sec
        type: gauge
      - name: keyspace_hits
        type: counter
      - name: keyspace_misses
        type: counter
```

#### Grafana Dashboard

**Key Panels:**
1. **Operations per Second** (time series)
2. **Memory Usage** (gauge + time series)
3. **Cache Hit Rate** (gauge, target: >95%)
4. **Connection Pool Utilization** (heatmap)
5. **Replication Lag** (time series)
6. **Slow Commands** (table, threshold: 100ms)
7. **Cluster Health** (status indicator)
8. **Failover Events** (event log)

#### Alerting Rules

```yaml
# prometheus-alerts.yml
groups:
  - name: redis
    interval: 30s
    rules:
      - alert: RedisDown
        expr: up{job="redis"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Redis instance down: {{ $labels.instance }}"
          
      - alert: RedisHighMemoryUsage
        expr: redis_memory_used_bytes / redis_memory_max_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Redis memory usage above 90%"
          
      - alert: RedisLowCacheHitRate
        expr: rate(redis_keyspace_hits_total[5m]) / (rate(redis_keyspace_hits_total[5m]) + rate(redis_keyspace_misses_total[5m])) < 0.8
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "Redis cache hit rate below 80%"
          
      - alert: RedisReplicationLag
        expr: redis_master_repl_offset - redis_slave_repl_offset > 1000000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Redis replication lag detected"
          
      - alert: RedisClusterSlotsNotOK
        expr: redis_cluster_slots_ok < 16384
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Redis cluster has unhealthy slots"
```

### 1.6 Redis Rollout Checklist

**Phase 1: Development Environment (Week 1)**
- [ ] Deploy single Redis instance
- [ ] Configure application to use Redis sessions
- [ ] Test session persistence
- [ ] Test cache operations
- [ ] Run load tests (100 concurrent users)
- [ ] Verify metrics collection

**Phase 2: Staging Environment (Week 2-3)**
- [ ] Deploy Redis cluster (3 nodes)
- [ ] Configure Redis Sentinel (3 sentinels)
- [ ] Test automatic failover
- [ ] Load test with 10K concurrent users
- [ ] Verify data persistence (RDB + AOF)
- [ ] Test disaster recovery procedures

**Phase 3: Production Pilot (Week 4-5)**
- [ ] Deploy to single region (Americas)
- [ ] 50-node cluster with replication
- [ ] Route 5% of traffic to Redis-backed sessions
- [ ] Monitor performance metrics
- [ ] Validate cache hit rate >90%
- [ ] Test rolling updates

**Phase 4: Global Rollout (Week 6-12)**
- [ ] Deploy to EMEA region
- [ ] Deploy to APAC region
- [ ] Deploy to China region (localized)
- [ ] Deploy to Australia region
- [ ] Configure cross-region replication
- [ ] Enable CRDT conflict resolution
- [ ] Route 100% of traffic to Redis

**Phase 5: Scale to 10B Users (Month 4-12)**
- [ ] Scale to 200 nodes per region
- [ ] Deploy dedicated session clusters
- [ ] Implement geo-routing
- [ ] Optimize sharding strategy
- [ ] Enable compression for large values
- [ ] Implement Redis Streams for queues
- [ ] Run chaos engineering tests

---

## CDN Migration Plan

### 2.1 Asset Inventory

**Assets Requiring CDN:**

**Static Assets (High Priority):**
```
/client/src/assets/
├── images/
│   ├── logo.png (50KB, accessed 1M times/day)
│   ├── brand-icons/*.svg (5-20KB each)
│   └── backgrounds/*.jpg (200-500KB each)
├── fonts/
│   ├── inter-v12-latin-regular.woff2 (100KB)
│   └── roboto-mono-v22-latin-regular.woff2 (80KB)
└── audio/
    └── notification-sounds/*.mp3 (50-200KB each)
```

**Compiled JavaScript Bundles:**
```
/dist/assets/
├── index-6HgYzCRa.js (500KB, gzipped: 150KB)
├── vendor-libs.js (2MB, gzipped: 600KB)
└── *.chunk.js (50-200KB each)
```

**CSS Bundles:**
```
/dist/assets/
└── index-ddGiCwrg.css (200KB, gzipped: 40KB)
```

**User-Generated Content (Medium Priority):**
```
/uploads/
├── profile-pictures/*.jpg (100-500KB each)
├── track-artwork/*.jpg (300-800KB each)
├── audio-files/*.wav (5-50MB each, streaming via HLS)
└── video-content/*.mp4 (10-500MB each)
```

**Generated Content (Low Priority):**
```
/public/generated-content/
├── audio/*.wav (AI-generated stems)
├── images/*.png (AI-generated artwork)
└── videos/*.mp4 (AI-generated content)
```

**Total Asset Volume:**
- Static assets: ~50GB
- User uploads: ~500TB (at 1M users)
- Generated content: ~100TB (at 1M users)
- **Total at 10B users:** ~6 Petabytes

### 2.2 Cache Key Strategy

**CDN Cache Configuration:**

```
Cache-Control Headers:

Static Assets (immutable, versioned):
  Cache-Control: public, max-age=31536000, immutable
  Examples: /assets/index-[hash].js, /fonts/[name]-[hash].woff2

Static Assets (non-versioned):
  Cache-Control: public, max-age=86400, s-maxage=604800
  Examples: /logo.png, /favicon.ico

User Content (frequently accessed):
  Cache-Control: public, max-age=3600, s-maxage=86400
  Examples: /uploads/profile-pictures/[userId].jpg

User Content (large files):
  Cache-Control: public, max-age=7200, s-maxage=604800
  Examples: /uploads/tracks/[trackId].wav

API Responses (cacheable):
  Cache-Control: public, max-age=60, s-maxage=300
  Examples: GET /api/tracks/[trackId]/metadata

API Responses (private):
  Cache-Control: private, no-store
  Examples: GET /api/user/me, POST /api/auth/login
```

**Cache Key Components:**

```javascript
// CDN cache key format
`${method}:${path}:${queryParams}:${accept}:${acceptEncoding}:${deviceType}`

Examples:
GET:/api/tracks/123:format=json:application/json:gzip:desktop
GET:/uploads/artwork/456.jpg::image/webp:br:mobile
```

**Cache Purge Strategy:**

```javascript
// Purge on content update
async function purgeCache(resourceType, resourceId) {
  const patterns = {
    track: [
      `/uploads/tracks/${resourceId}.*`,
      `/api/tracks/${resourceId}*`,
      `/api/playlists/*/tracks/${resourceId}`
    ],
    user: [
      `/uploads/profile-pictures/${resourceId}.*`,
      `/api/users/${resourceId}*`,
      `/storefront/${resourceId}*`
    ],
    asset: [
      `/assets/${resourceId}.*`,
      `/dist/assets/${resourceId}.*`
    ]
  };
  
  await cdn.purge(patterns[resourceType]);
}
```

### 2.3 Purge Automation Setup

**Webhook-Based Purge System:**

```typescript
// server/services/cdnPurgeService.ts
import { CloudFront } from '@aws-sdk/client-cloudfront';

class CDNPurgeService {
  private cloudfront: CloudFront;
  private distributionId: string;
  
  constructor() {
    this.cloudfront = new CloudFront({ region: 'us-east-1' });
    this.distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID!;
  }
  
  async purgeByPattern(patterns: string[]): Promise<void> {
    const invalidation = await this.cloudfront.createInvalidation({
      DistributionId: this.distributionId,
      InvalidationBatch: {
        CallerReference: `purge-${Date.now()}`,
        Paths: {
          Quantity: patterns.length,
          Items: patterns
        }
      }
    });
    
    console.log('CDN purge initiated:', invalidation.Invalidation?.Id);
  }
  
  async purgeAll(): Promise<void> {
    await this.purgeByPattern(['/*']);
  }
  
  async purgeUserContent(userId: string): Promise<void> {
    await this.purgeByPattern([
      `/uploads/profile-pictures/${userId}*`,
      `/api/users/${userId}*`,
      `/storefront/${userId}*`
    ]);
  }
  
  async purgeTrack(trackId: string): Promise<void> {
    await this.purgeByPattern([
      `/uploads/tracks/${trackId}*`,
      `/api/tracks/${trackId}*`
    ]);
  }
}

export const cdnPurgeService = new CDNPurgeService();
```

**Database Trigger for Automatic Purging:**

```sql
-- Trigger on track updates
CREATE OR REPLACE FUNCTION purge_track_cdn()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('cdn_purge', json_build_object(
    'type', 'track',
    'id', NEW.id,
    'timestamp', NOW()
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_update_purge
AFTER UPDATE ON tracks
FOR EACH ROW
WHEN (OLD.* IS DISTINCT FROM NEW.*)
EXECUTE FUNCTION purge_track_cdn();
```

**Purge Queue Worker:**

```typescript
// server/workers/cdnPurgeWorker.ts
import { db } from '../db';
import { cdnPurgeService } from '../services/cdnPurgeService';

async function startPurgeWorker() {
  const client = await db.pool.connect();
  
  client.on('notification', async (msg) => {
    if (msg.channel === 'cdn_purge') {
      const data = JSON.parse(msg.payload!);
      
      try {
        switch (data.type) {
          case 'track':
            await cdnPurgeService.purgeTrack(data.id);
            break;
          case 'user':
            await cdnPurgeService.purgeUserContent(data.id);
            break;
        }
        
        console.log(`CDN purged for ${data.type} ${data.id}`);
      } catch (error) {
        console.error('CDN purge failed:', error);
      }
    }
  });
  
  await client.query('LISTEN cdn_purge');
  console.log('CDN purge worker started');
}

startPurgeWorker();
```

### 2.4 Regional Cutover Phases

**Phase 1: North America (Week 1-2)**

```bash
# 1. Deploy CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name maxbooster.com \
  --distribution-config file://cdn-config-na.json

# 2. Configure DNS CNAME
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123456 \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "cdn.maxbooster.com",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "d123456.cloudfront.net"}]
      }
    }]
  }'

# 3. Gradual traffic shift (via feature flag)
# Day 1: 10% traffic to CDN
# Day 2: 25% traffic to CDN
# Day 3: 50% traffic to CDN
# Day 4: 75% traffic to CDN
# Day 5: 100% traffic to CDN
```

**Rollout Schedule:**

| Region | Week | Users Affected | CDN POP Locations |
|--------|------|----------------|-------------------|
| North America | 1-2 | 40M | 15 POPs (US, Canada) |
| Europe | 3-4 | 30M | 20 POPs (UK, Germany, France, etc.) |
| Asia Pacific | 5-6 | 25M | 18 POPs (Tokyo, Singapore, Sydney) |
| South America | 7-8 | 3M | 5 POPs (São Paulo, Buenos Aires) |
| Africa | 9-10 | 2M | 3 POPs (Johannesburg, Lagos) |

**Total Deployment Time:** 10 weeks for global coverage

### 2.5 Performance Monitoring

**CDN Performance Metrics:**

```typescript
// server/monitoring/cdnMonitor.ts
interface CDNMetrics {
  hitRate: number;           // Target: >90%
  missRate: number;          // Target: <10%
  bytesSaved: number;        // Bytes served from cache
  averageLatency: number;    // Target: <50ms
  edgeResponseTime: number;  // Time to first byte
  originResponseTime: number;// Origin response time
  errorRate: number;         // Target: <0.1%
  bandwidth: number;         // GB/day
}

class CDNMonitor {
  async getMetrics(): Promise<CDNMetrics> {
    const cloudwatch = new CloudWatch({ region: 'us-east-1' });
    
    const metrics = await cloudwatch.getMetricStatistics({
      Namespace: 'AWS/CloudFront',
      MetricName: 'BytesDownloaded',
      Dimensions: [{ Name: 'DistributionId', Value: process.env.CLOUDFRONT_DISTRIBUTION_ID! }],
      StartTime: new Date(Date.now() - 3600000),
      EndTime: new Date(),
      Period: 300,
      Statistics: ['Sum', 'Average']
    });
    
    // Calculate hit rate
    const requests = metrics.Datapoints?.reduce((sum, dp) => sum + (dp.Sum || 0), 0) || 0;
    const hits = /* get from CloudFront logs */ 0;
    const hitRate = (hits / requests) * 100;
    
    return {
      hitRate,
      missRate: 100 - hitRate,
      bytesSaved: hits * averageBytesPerRequest,
      averageLatency: /* from RUM */ 45,
      edgeResponseTime: /* from CloudFront metrics */ 30,
      originResponseTime: /* from origin metrics */ 150,
      errorRate: /* 5xx errors / total */ 0.05,
      bandwidth: /* total bytes / day */ 500000000000
    };
  }
}
```

**Real User Monitoring (RUM):**

```typescript
// client/src/lib/rumMonitor.ts
class RUMMonitor {
  trackCDNPerformance() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource' && entry.name.includes('cdn.maxbooster.com')) {
          this.sendMetric({
            url: entry.name,
            duration: entry.duration,
            size: entry.transferSize,
            protocol: entry.nextHopProtocol,
            cached: entry.transferSize === 0
          });
        }
      }
    });
    
    observer.observe({ entryTypes: ['resource'] });
  }
  
  private sendMetric(data: any) {
    navigator.sendBeacon('/api/metrics/rum', JSON.stringify(data));
  }
}
```

**Performance SLOs:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| Cache Hit Rate | >90% | CloudFront logs |
| TTFB (First Byte) | <100ms | RUM (95th percentile) |
| Page Load Time | <2s | RUM (95th percentile) |
| Error Rate | <0.1% | CloudFront 4xx/5xx |
| Availability | 99.99% | Uptime monitoring |
| Bandwidth Cost | <$0.02/GB | CloudFront billing |

### 2.6 Rollback Procedures

**Scenario 1: CDN Performance Degradation**

```bash
#!/bin/bash
# 1. Detect issue (automated alert)
if [[ $(curl -s https://cdn.maxbooster.com/health | jq -r '.latency') -gt 200 ]]; then
  echo "CDN performance degraded, initiating rollback"
  
  # 2. Disable CDN via feature flag
  curl -X POST https://api.maxbooster.com/admin/features/cdn/disable \
    -H "Authorization: Bearer ${ADMIN_TOKEN}"
  
  # 3. Update DNS to bypass CDN
  aws route53 change-resource-record-sets \
    --hosted-zone-id Z123456 \
    --change-batch '{
      "Changes": [{
        "Action": "UPSERT",
        "ResourceRecordSet": {
          "Name": "assets.maxbooster.com",
          "Type": "CNAME",
          "TTL": 60,
          "ResourceRecords": [{"Value": "origin.maxbooster.com"}]
        }
      }]
    }'
  
  # 4. Notify engineering team
  curl -X POST https://slack.com/api/chat.postMessage \
    -H "Authorization: Bearer ${SLACK_TOKEN}" \
    -d '{"channel": "#incidents", "text": "CDN rollback initiated"}'
fi
```

**Scenario 2: CDN Cache Poisoning**

```bash
#!/bin/bash
# 1. Purge entire CDN cache
aws cloudfront create-invalidation \
  --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} \
  --paths "/*"

# 2. Temporarily disable caching
aws cloudfront update-distribution \
  --id ${CLOUDFRONT_DISTRIBUTION_ID} \
  --distribution-config '{
    "DefaultCacheBehavior": {
      "MinTTL": 0,
      "DefaultTTL": 0,
      "MaxTTL": 0
    }
  }'

# 3. Investigate and fix root cause
# ... manual investigation ...

# 4. Re-enable caching with correct headers
aws cloudfront update-distribution \
  --id ${CLOUDFRONT_DISTRIBUTION_ID} \
  --distribution-config file://cdn-config-production.json
```

**Rollback Decision Matrix:**

| Issue | Severity | Rollback Method | ETA |
|-------|----------|----------------|-----|
| High latency (>500ms) | P1 | DNS failover | 5 min |
| Error rate >1% | P1 | CDN bypass | 5 min |
| Cache poisoning | P0 | Full purge + disable | 2 min |
| Cost spike >2x | P2 | Throttle bandwidth | 10 min |
| Regional outage | P1 | Failover to backup CDN | 10 min |

---

## Scaling Architecture by Phase

### Phase 1: MVP (10K Users)

**Redis Infrastructure:**
- Single Redis instance (cache.r6g.large - 16GB RAM)
- No clustering, single region (Americas)
- AOF persistence enabled
- Manual backups daily
- Cost: $200/month

**CDN Infrastructure:**
- CloudFront free tier (1TB/month)
- North America only
- 1-year SSL cert
- Cost: $0-50/month

**Total Cost:** $250/month ($0.025 per user/month)

### Phase 2: Growth (100K Users)

**Redis Infrastructure:**
- 3-node Redis cluster (cache.r6g.xlarge - 32GB RAM each)
- Redis Sentinel for failover
- Multi-AZ deployment
- Automated backups every 6 hours
- Cost: $1,500/month

**CDN Infrastructure:**
- CloudFront standard tier (10TB/month)
- North America + Europe
- Multi-region failover
- Cost: $800/month

**Total Cost:** $2,300/month ($0.023 per user/month)

### Phase 3: Scale (1M Users)

**Redis Infrastructure:**
- 10-node Redis cluster (cache.r6g.2xlarge - 64GB RAM each)
- Cross-region replication (Americas + EMEA)
- Sentinel-based failover
- Point-in-time recovery
- Cost: $12,000/month

**CDN Infrastructure:**
- CloudFront enterprise tier (100TB/month)
- Global edge locations (50+ POPs)
- Lambda@Edge for dynamic content
- Cost: $6,000/month

**Total Cost:** $18,000/month ($0.018 per user/month)

### Phase 4: Enterprise (100M Users)

**Redis Infrastructure:**
- 200-node Redis cluster per region (5 regions)
- Total: 1,000 Redis nodes (cache.r6g.4xlarge - 128GB RAM each)
- Cross-region CRDT replication
- Automated failover and recovery
- Cost: $1,200,000/month

**CDN Infrastructure:**
- Multi-CDN strategy (CloudFront + Cloudflare + Fastly)
- 1 Petabyte/month bandwidth
- DDoS protection
- Real-time analytics
- Cost: $400,000/month

**Total Cost:** $1,600,000/month ($0.016 per user/month)

### Phase 5: Global Scale (10B Users)

**Redis Infrastructure:**
- 200 nodes per region × 5 regions = 1,000 master nodes
- 1,000 replica nodes (1:1 ratio)
- Total: 2,000 Redis instances (cache.r6gn.16xlarge - 512GB RAM each)
- Cross-region active-active replication
- Automated sharding and rebalancing
- Cost: $24,000,000/month

**CDN Infrastructure:**
- Multi-CDN with private edge network
- 10 Petabytes/month bandwidth
- Custom DNS resolution
- Global anycast network
- Cost: $8,000,000/month

**Total Cost:** $32,000,000/month ($0.0032 per user/month)

**Cost Scaling Summary:**

| Phase | Users | Redis Cost | CDN Cost | Total Cost | Per User/Month |
|-------|-------|------------|----------|------------|----------------|
| 1 | 10K | $200 | $50 | $250 | $0.025 |
| 2 | 100K | $1,500 | $800 | $2,300 | $0.023 |
| 3 | 1M | $12,000 | $6,000 | $18,000 | $0.018 |
| 4 | 100M | $1.2M | $400K | $1.6M | $0.016 |
| 5 | 10B | $24M | $8M | $32M | $0.0032 |

**Key Insights:**
- Cost per user decreases as scale increases (economies of scale)
- Redis is 75% of infrastructure cost at scale
- CDN cost is 25% of total (highly optimized with caching)
- At 10B users, infrastructure cost is $0.0032/user/month (~$0.04/year per user)

---

## Monitoring and Observability

### 4.1 Key Performance Indicators (KPIs)

**Redis KPIs:**
```yaml
Availability:
  Target: 99.99% uptime
  Measurement: Sentinel health checks + external monitoring
  
Performance:
  - P50 Latency: <5ms
  - P95 Latency: <10ms
  - P99 Latency: <20ms
  Measurement: Application-side instrumentation
  
Capacity:
  - Memory Usage: <80% of max
  - CPU Usage: <70% average
  - Network I/O: <60% of limit
  Measurement: CloudWatch metrics
  
Reliability:
  - Replication Lag: <100ms
  - Failover Time: <10 seconds
  - Data Loss: 0 (with AOF)
  Measurement: Custom metrics
```

**CDN KPIs:**
```yaml
Performance:
  - Cache Hit Rate: >90%
  - TTFB: <100ms (P95)
  - Error Rate: <0.1%
  Measurement: CloudFront logs + RUM
  
Cost:
  - Bandwidth Cost: <$0.02/GB
  - Cost per Request: <$0.0000001
  Measurement: AWS Cost Explorer
  
Coverage:
  - Geographic Coverage: 99% of users <100ms from edge
  - POP Availability: 100% operational
  Measurement: CloudFront edge locations
```

### 4.2 Dashboards

**Executive Dashboard (Business Metrics):**
- Total active users (real-time)
- Infrastructure cost per user
- Redis availability (99.99% SLA)
- CDN cost savings (% of origin bandwidth saved)
- Global latency heatmap

**Engineering Dashboard (Technical Metrics):**
- Redis cluster health (per region)
- Cache hit rate (Redis + CDN)
- Query latency (P50, P95, P99)
- Error rates (4xx, 5xx)
- Replication lag
- Connection pool utilization

**Operations Dashboard (Alerts & Incidents):**
- Active alerts
- Incident timeline
- Failover events
- Circuit breaker status
- Recent deployments
- Slow query log

### 4.3 Alerting Strategy

**Alert Severity Levels:**

```yaml
P0 - Critical (Page immediately):
  - Redis cluster down
  - CDN error rate >5%
  - Database unavailable
  - Automated failover triggered
  Response Time: <5 minutes
  
P1 - High (Page during business hours):
  - Redis memory >90%
  - CDN hit rate <70%
  - Replication lag >1 second
  - Slow queries >100ms (sustained)
  Response Time: <30 minutes
  
P2 - Medium (Ticket):
  - Redis memory >80%
  - CDN cost spike >20%
  - Connection pool exhaustion
  Response Time: <4 hours
  
P3 - Low (Monitor):
  - Redis memory >70%
  - CDN cache misses increasing
  - Minor performance degradation
  Response Time: <24 hours
```

---

## Disaster Recovery

### 5.1 Backup Strategy

**Redis Backups:**
```bash
# Automated daily backups
0 2 * * * redis-cli --rdb /backups/redis-$(date +\%Y\%m\%d).rdb

# S3 replication
0 3 * * * aws s3 sync /backups/ s3://maxbooster-redis-backups/

# Retention policy
- Daily backups: 7 days
- Weekly backups: 4 weeks
- Monthly backups: 12 months
```

**CDN Backups:**
- CloudFront configuration versioned in Git
- Lambda@Edge functions backed up to S3
- SSL certificates stored in AWS Secrets Manager

### 5.2 Recovery Time Objectives (RTO)

| Component | RTO | RPO | Recovery Procedure |
|-----------|-----|-----|-------------------|
| Redis Single Node | 2 minutes | 0 | Sentinel auto-failover |
| Redis Cluster | 5 minutes | 0 | Cluster auto-recovery |
| Redis Region | 10 minutes | 0 | Cross-region failover |
| CDN | 5 minutes | N/A | DNS failover to backup |
| Database | 15 minutes | 5 minutes | Restore from snapshot |

### 5.3 Chaos Engineering

**Regular Chaos Tests:**
```bash
# Kill random Redis node
chaos-test redis-node-failure --random

# Simulate network partition
chaos-test network-partition --duration 60s

# CDN POP failure
chaos-test cdn-pop-failure --region us-east-1

# Database failover
chaos-test db-failover --simulate

# Multi-region outage
chaos-test regional-outage --region americas
```

**Test Schedule:**
- Weekly: Single node failures
- Monthly: Regional failover
- Quarterly: Multi-region disaster recovery

---

## Appendix

### A. Cost Calculation Tools

```bash
# Redis cost calculator
./scripts/calculate-redis-cost.sh --users 10000000000 --regions 5

# CDN cost calculator  
./scripts/calculate-cdn-cost.sh --bandwidth 10PB --requests 1000000000000
```

### B. Terraform Modules

- `terraform/modules/redis-cluster/` - Redis cluster deployment
- `terraform/modules/cdn-distribution/` - CloudFront setup
- `terraform/modules/monitoring/` - Prometheus + Grafana

### C. Runbooks

- `docs/runbooks/redis-failover.md` - Redis failover procedures
- `docs/runbooks/cdn-rollback.md` - CDN rollback procedures
- `docs/runbooks/incident-response.md` - Incident response playbook

### D. Contact Information

**On-Call Rotation:**
- Primary: DevOps Team (pagerduty.com/maxbooster-devops)
- Secondary: Platform Engineering (pagerduty.com/maxbooster-platform)
- Escalation: VP Engineering

**Vendor Support:**
- AWS Support: Enterprise tier, 15-minute response SLA
- Redis Labs: Enterprise support
- CloudFlare: Business support

---

**Document Maintained By:** Platform Engineering Team  
**Review Cycle:** Quarterly  
**Next Review:** February 12, 2026
