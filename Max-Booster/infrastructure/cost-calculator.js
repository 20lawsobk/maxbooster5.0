#!/usr/bin/env node

/**
 * Max Booster - Infrastructure Cost Calculator
 * 
 * Calculates estimated monthly costs for different scale levels
 * Usage: node cost-calculator.js <concurrent-users>
 */

const COST_MODELS = {
  // Phase 0: Current (10K users)
  phase0: {
    users: 10000,
    compute: 0, // Replit free tier
    database: 0, // Neon free tier
    redis: 0, // Memory store
    storage: 0,
    cdn: 0,
    monitoring: 0,
    total: 50, // Estimated Replit Pro
  },

  // Phase 1: 100K users
  phase1: {
    users: 100000,
    compute: 300, // 3x t3.medium @ $100/month
    database: 250, // RDS t3.medium Multi-AZ + 2 replicas
    redis: 100, // ElastiCache t3.medium 3-node cluster
    storage: 50, // S3 + transfer
    cdn: 100, // CloudFront
    monitoring: 50, // CloudWatch basic
    loadBalancer: 20, // ALB
    total: 870,
  },

  // Phase 2: 1M users
  phase2: {
    users: 1000000,
    compute: 2000, // 20x t3.medium
    database: 1500, // RDS r5.xlarge Multi-AZ + 5 replicas
    redis: 500, // ElastiCache r5.large cluster
    storage: 300, // S3 + increased transfer
    cdn: 800, // CloudFront with high traffic
    monitoring: 200, // CloudWatch + DataDog starter
    loadBalancer: 50, // 2x ALB
    nat: 100, // NAT Gateways
    backup: 150, // Enhanced backups
    total: 5600,
  },

  // Phase 3: 10M users
  phase3: {
    users: 10000000,
    compute: 15000, // 200x t3.xlarge (Kubernetes)
    database: 8000, // RDS r5.4xlarge + 20 shards/replicas
    redis: 3000, // ElastiCache r5.2xlarge cluster (20 nodes)
    storage: 2000, // S3 (heavy usage)
    cdn: 5000, // CloudFront global distribution
    monitoring: 1500, // DataDog Pro + custom metrics
    loadBalancer: 200, // Multiple ALBs
    nat: 300, // NAT Gateways across regions
    backup: 1000, // Multi-region backups
    kafka: 2000, // Message queue infrastructure
    kubernetes: 1000, // EKS/GKE management fees
    total: 39000,
  },

  // Phase 4: 100M users
  phase4: {
    users: 100000000,
    compute: 80000, // 1000x pods (Kubernetes auto-scaling)
    database: 50000, // 100 sharded databases
    redis: 20000, // 100-node Redis cluster
    storage: 15000, // S3 (massive usage)
    cdn: 30000, // CloudFront + edge locations
    monitoring: 10000, // DataDog Enterprise + observability
    loadBalancer: 1000, // Global load balancers
    nat: 500, // NAT Gateways
    backup: 5000, // Multi-region, multi-cloud backups
    kafka: 10000, // Kafka/Pulsar (50+ brokers)
    kubernetes: 5000, // Multi-cluster management
    waf: 2000, // Web Application Firewall
    ddos: 3000, // DDoS protection
    total: 231500,
  },
};

function calculateCost(users) {
  // Find appropriate phase
  let phase;
  if (users <= 10000) phase = COST_MODELS.phase0;
  else if (users <= 100000) phase = COST_MODELS.phase1;
  else if (users <= 1000000) phase = COST_MODELS.phase2;
  else if (users <= 10000000) phase = COST_MODELS.phase3;
  else phase = COST_MODELS.phase4;

  // Linear interpolation for in-between values
  const scaleFactor = users / phase.users;
  const estimatedTotal = Math.round(phase.total * scaleFactor);

  return {
    users,
    phase: getPhaseNumber(users),
    breakdown: phase,
    estimatedMonthly: estimatedTotal,
    estimatedYearly: estimatedTotal * 12,
    costPerUser: (estimatedTotal / users).toFixed(4),
  };
}

function getPhaseNumber(users) {
  if (users <= 10000) return 0;
  if (users <= 100000) return 1;
  if (users <= 1000000) return 2;
  if (users <= 10000000) return 3;
  return 4;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function printCostBreakdown(cost) {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         MAX BOOSTER - INFRASTRUCTURE COST ESTIMATE         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log(`🎯 Target Capacity: ${cost.users.toLocaleString()} concurrent users`);
  console.log(`📊 Phase: ${cost.phase} (${getPhaseDescription(cost.phase)})`);
  console.log('');

  console.log('💰 COST BREAKDOWN:');
  console.log('─'.repeat(60));

  const breakdown = cost.breakdown;
  const components = Object.entries(breakdown).filter(
    ([key, _]) => key !== 'users' && key !== 'total'
  );

  components.forEach(([component, cost]) => {
    if (cost > 0) {
      const bar = '█'.repeat(Math.min(Math.floor(cost / 1000), 40));
      console.log(
        `${component.padEnd(20)} ${formatCurrency(cost).padStart(12)}  ${bar}`
      );
    }
  });

  console.log('─'.repeat(60));
  console.log(
    `${'TOTAL'.padEnd(20)} ${formatCurrency(breakdown.total).padStart(12)}`
  );
  console.log('');

  console.log('📈 SUMMARY:');
  console.log(`   Monthly Cost:      ${formatCurrency(cost.estimatedMonthly)}`);
  console.log(`   Yearly Cost:       ${formatCurrency(cost.estimatedYearly)}`);
  console.log(`   Cost per User:     ${formatCurrency(parseFloat(cost.costPerUser))}/month`);
  console.log('');

  // Add recommendations
  printRecommendations(cost.phase, cost.users);
}

function getPhaseDescription(phase) {
  const descriptions = {
    0: 'Current State',
    1: 'Foundation - Multi-Instance Deployment',
    2: 'Regional Expansion',
    3: 'Hyperscale - Multi-Region',
    4: 'Global Scale',
  };
  return descriptions[phase] || 'Unknown';
}

function printRecommendations(phase, users) {
  console.log('💡 RECOMMENDATIONS:');
  console.log('─'.repeat(60));

  if (phase === 0) {
    console.log('✅ Current infrastructure is adequate');
    console.log('⚠️  Begin implementing Phase 1 code changes (Redis, S3, Job Queues)');
    console.log('📝 Review SCALABILITY_READINESS_PLAN.md for next steps');
  } else if (phase === 1) {
    console.log('✅ Deploy infrastructure using terraform/main.tf');
    console.log('✅ Implement horizontal scaling (2-3 instances)');
    console.log('✅ Set up database read replicas');
    console.log('✅ Migrate to S3 for file storage');
  } else if (phase === 2) {
    console.log('✅ Deploy multi-region infrastructure');
    console.log('✅ Implement database sharding strategy');
    console.log('✅ Set up CDN for static assets');
    console.log('✅ Implement advanced monitoring (DataDog/NewRelic)');
  } else if (phase === 3) {
    console.log('✅ Migrate to Kubernetes for container orchestration');
    console.log('✅ Implement 100+ database shards');
    console.log('✅ Deploy Kafka for event streaming');
    console.log('✅ Set up advanced observability');
  } else {
    console.log('✅ Global multi-cloud deployment recommended');
    console.log('✅ Implement advanced DDoS protection');
    console.log('✅ Consider microservices decomposition');
    console.log('✅ Hire dedicated DevOps/SRE team (50+ engineers)');
  }

  console.log('');
}

function printComparison() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║              SCALING COST COMPARISON TABLE                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log(
    '┌─────────┬────────────────┬──────────────┬──────────────┬──────────────┐'
  );
  console.log(
    '│ Phase   │ Concurrent     │ Monthly Cost │ Yearly Cost  │ Cost/User    │'
  );
  console.log(
    '│         │ Users          │              │              │              │'
  );
  console.log(
    '├─────────┼────────────────┼──────────────┼──────────────┼──────────────┤'
  );

  Object.entries(COST_MODELS).forEach(([phase, data]) => {
    const phaseNum = phase.replace('phase', '');
    const users = data.users.toLocaleString().padStart(14);
    const monthly = formatCurrency(data.total).padStart(12);
    const yearly = formatCurrency(data.total * 12).padStart(12);
    const perUser = formatCurrency(data.total / data.users).padStart(12);

    console.log(
      `│ ${phaseNum.padEnd(7)} │ ${users} │ ${monthly} │ ${yearly} │ ${perUser} │`
    );
  });

  console.log(
    '└─────────┴────────────────┴──────────────┴──────────────┴──────────────┘'
  );
  console.log('');
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log('Usage: node cost-calculator.js <concurrent-users>');
    console.log('       node cost-calculator.js --compare  (show comparison table)');
    console.log('');
    console.log('Examples:');
    console.log('  node cost-calculator.js 10000');
    console.log('  node cost-calculator.js 1000000');
    console.log('  node cost-calculator.js 100000000');
    console.log('  node cost-calculator.js --compare');
    process.exit(0);
  }

  if (args[0] === '--compare') {
    printComparison();
    process.exit(0);
  }

  const users = parseInt(args[0], 10);

  if (isNaN(users) || users <= 0) {
    console.error('Error: Please provide a valid number of concurrent users');
    process.exit(1);
  }

  if (users > 1000000000) {
    console.error(
      'Warning: 1 billion+ concurrent users exceeds realistic infrastructure capabilities'
    );
    console.log(
      'Calculating estimate anyway... (This would require a custom hyperscale solution)\n'
    );
  }

  const cost = calculateCost(users);
  printCostBreakdown(cost);
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { calculateCost, COST_MODELS };
