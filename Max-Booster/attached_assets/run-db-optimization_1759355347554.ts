#!/usr/bin/env tsx

import DatabaseOptimizer from '../database/optimize-database';

async function main() {
  console.log('🎯 Max Booster Database Optimization Script');
  console.log('==========================================\n');

  const optimizer = new DatabaseOptimizer();

  try {
    // Step 1: Execute optimization
    await optimizer.executeOptimization();

    // Step 2: Validate results
    console.log('\n');
    const isValid = await optimizer.validateOptimizations();
    
    if (isValid) {
      console.log('\n✅ All critical indexes validated successfully!');
    } else {
      console.log('\n❌ Some critical indexes are missing. Please review the results above.');
    }

    // Step 3: Analyze performance
    await optimizer.analyzeQueryPerformance();

    console.log('\n🎉 Database optimization process completed!');
    console.log('\n📈 Your Max Booster platform is now optimized for:');
    console.log('   • High-performance user queries');
    console.log('   • Lightning-fast analytics dashboards');
    console.log('   • Efficient distribution system');
    console.log('   • Rapid search capabilities');
    console.log('   • Scalable financial reporting');

  } catch (error) {
    console.error('❌ Database optimization failed:', error);
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  main().then(() => {
    console.log('\n✨ Optimization complete. Exiting...');
    process.exit(0);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default main;