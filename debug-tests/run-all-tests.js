#!/usr/bin/env node

/**
 * QuickBill Master Debug Test Runner
 * Runs all 10 specialized debug tests to comprehensively check your app
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔬 QuickBill Master Debug Test Suite');
console.log('='.repeat(50));
console.log('Running 10 specialized tests to verify your settings and functionality...\n');

const DEBUG_TESTS = [
  {
    id: 1,
    name: 'Settings Configuration Check',
    file: '01-settings-check.js',
    description: 'Verifies all config files exist and contain correct settings'
  },
  {
    id: 2,
    name: 'Environment Variables Check',
    file: '02-env-check.js',
    description: 'Tests Firebase and Stripe environment variables'
  },
  {
    id: 3,
    name: 'Build System Check',
    file: '03-build-check.js',
    description: 'Ensures the build system works and dependencies are correct'
  },
  {
    id: 4,
    name: 'Firebase Settings Check',
    file: '04-firebase-check.js',
    description: 'Tests Firebase configuration and connectivity'
  },
  {
    id: 5,
    name: 'Stripe Settings Check',
    file: '05-stripe-check.js',
    description: 'Verifies Stripe pricing and payment configuration'
  },
  {
    id: 6,
    name: 'Invoice Logic Check',
    file: '06-invoice-logic-check.js',
    description: 'Tests unlimited invoice logic in the codebase'
  },
  {
    id: 7,
    name: 'Local Storage Check',
    file: '07-localstorage-check.js',
    description: 'Checks how the app handles user data and invoice storage'
  },
  {
    id: 8,
    name: 'Pricing Display Check',
    file: '08-pricing-display-check.js',
    description: 'Verifies all UI components show correct $9.99 pricing'
  },
  {
    id: 9,
    name: 'Documentation Consistency Check',
    file: '09-documentation-check.js',
    description: 'Ensures all docs reflect the new pricing model'
  },
  {
    id: 10,
    name: 'Live Application Test',
    file: '10-live-app-test.js',
    description: 'Tests the actual live application behavior'
  }
];

function runTest(test) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const testPath = path.join('debug-tests', test.file);
    
    console.log(`🧪 Test ${test.id}: ${test.name}`);
    console.log(`📝 ${test.description}`);
    console.log(`🏃 Running: node ${testPath}\n`);

    // Set timeout based on test type
    const timeout = test.id === 3 ? 180000 : test.id === 10 ? 60000 : 30000; // 3min for build, 1min for live test, 30s for others
    
    const child = exec(`node ${testPath}`, { 
      cwd: process.cwd(),
      timeout: timeout,
      killSignal: 'SIGTERM'
    }, (error, stdout, stderr) => {
      const duration = Date.now() - startTime;
      
      let success = !error;
      let errorMessage = null;
      
      if (error) {
        if (error.killed && error.signal === 'SIGTERM') {
          errorMessage = `Test timed out after ${Math.round(timeout/1000)}s`;
        } else {
          errorMessage = error.message;
        }
      }
      
      resolve({
        test,
        success,
        duration,
        stdout: stdout || '',
        stderr: stderr || '',
        error: errorMessage,
        timedOut: error && error.killed
      });
    });

    // Handle process errors
    child.on('error', (err) => {
      console.log(`   ⚠️  Process error: ${err.message}`);
    });
  });
}

function extractTestResults(output) {
  // Try to extract pass/fail statistics from test output
  const passMatch = output.match(/✅ Passed: (\d+)\/(\d+)/);
  const successMatch = output.match(/📈 Success Rate: (\d+)%/);
  
  if (passMatch && successMatch) {
    return {
      passed: parseInt(passMatch[1]),
      total: parseInt(passMatch[2]),
      successRate: parseInt(successMatch[1])
    };
  }
  
  // Fallback: count ✅ and ❌ symbols
  const checkmarks = (output.match(/✅/g) || []).length;
  const xmarks = (output.match(/❌/g) || []).length;
  const total = checkmarks + xmarks;
  
  return {
    passed: checkmarks,
    total: total > 0 ? total : 1,
    successRate: total > 0 ? Math.round((checkmarks / total) * 100) : 0
  };
}

async function runAllTests() {
  const results = [];
  let totalPassed = 0;
  let totalTests = 0;

  for (const test of DEBUG_TESTS) {
    try {
      const result = await runTest(test);
      
      if (result.success) {
        const stats = extractTestResults(result.stdout);
        console.log(`✅ Test ${test.id} COMPLETED - ${stats.successRate}% success (${stats.passed}/${stats.total})`);
        totalPassed += stats.passed;
        totalTests += stats.total;
        result.stats = stats;
      } else {
        console.log(`❌ Test ${test.id} FAILED`);
        if (result.timedOut) {
          console.log(`   ⏰ Test timed out - this test takes too long`);
          console.log(`   💡 Try running individual test: node debug-tests/${test.file}`);
        } else if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
        if (result.stderr && !result.timedOut) {
          const firstError = result.stderr.split('\n')[0];
          if (firstError.trim()) {
            console.log(`   Details: ${firstError}`);
          }
        }
        totalTests += 1; // Count as 1 failed test
        result.stats = { passed: 0, total: 1, successRate: 0 };
      }
      
      console.log(`⏱️  Duration: ${Math.round(result.duration / 1000)}s\n`);
      console.log('-'.repeat(50) + '\n');
      
      results.push(result);
    } catch (error) {
      console.log(`💥 Test ${test.id} CRASHED: ${error.message}\n`);
      results.push({
        test,
        success: false,
        error: error.message,
        stats: { passed: 0, total: 1, successRate: 0 }
      });
      totalTests += 1;
    }
  }

  // Generate final report
  console.log('📊 MASTER DEBUG TEST SUMMARY');
  console.log('='.repeat(50));
  
  const overallSuccess = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
  
  console.log(`🎯 OVERALL RESULT: ${totalPassed}/${totalTests} checks passed (${overallSuccess}%)\n`);

  // Category breakdown
  console.log('📋 Test Results by Category:\n');
  
  results.forEach((result, index) => {
    const test = result.test;
    const status = result.success ? '✅' : '❌';
    const rate = result.stats ? result.stats.successRate : 0;
    
    console.log(`${status} Test ${test.id}: ${test.name} (${rate}%)`);
  });

  // Priority issues
  console.log('\n🚨 PRIORITY ISSUES DETECTED:');
  const failedTests = results.filter(r => !r.success || (r.stats && r.stats.successRate < 75));
  
  if (failedTests.length === 0) {
    console.log('🎉 No critical issues detected! Your QuickBill app is ready to go!');
  } else {
    failedTests.forEach(result => {
      console.log(`   ❌ ${result.test.name}: ${result.stats ? result.stats.successRate : 0}% success`);
    });
  }

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  
  if (overallSuccess >= 90) {
    console.log('🎉 EXCELLENT! Your QuickBill app is fully configured and working!');
    console.log('   ✅ All settings are correct');
    console.log('   ✅ New $9.99 pricing is active'); 
    console.log('   ✅ Unlimited free invoices are working');
    console.log('   🚀 Ready for users!');
  } else if (overallSuccess >= 75) {
    console.log('✅ GOOD! Most tests passed, but some fine-tuning needed:');
    
    if (results[2] && results[2].stats.successRate < 90) {
      console.log('   🔧 Run: npm run build (to fix build issues)');
    }
    if (results[9] && results[9].stats.successRate < 90) {
      console.log('   🌐 Check your live deployment');
    }
    console.log('   📝 Review failed tests above for specific fixes');
  } else if (overallSuccess >= 50) {
    console.log('⚠️  PARTIAL SUCCESS! Several issues need attention:');
    console.log('   1. Review environment variables (.env files)');
    console.log('   2. Check Firebase and Stripe configuration'); 
    console.log('   3. Run: npm run build && npm run deploy');
    console.log('   4. Re-run tests after fixes');
  } else {
    console.log('❌ CRITICAL ISSUES! Major problems detected:');
    console.log('   🚨 IMMEDIATE ACTIONS REQUIRED:');
    console.log('   1. Check if all config files exist');
    console.log('   2. Verify environment variables are set');
    console.log('   3. Run: npm install && npm run build');
    console.log('   4. Check Firebase and Stripe setup');
    console.log('   5. Deploy to production: npm run deploy');
  }

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalPassed,
      totalTests,
      overallSuccess,
      testsRun: results.length
    },
    results: results.map(r => ({
      testId: r.test.id,
      testName: r.test.name,
      success: r.success,
      duration: r.duration,
      stats: r.stats,
      error: r.error
    }))
  };

  try {
    fs.writeFileSync('debug-test-master-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to: debug-test-master-report.json');
  } catch (error) {
    console.log('\n⚠️  Could not save master report');
  }

  console.log('\n🎯 NEXT STEPS:');
  if (overallSuccess >= 90) {
    console.log('   🎉 Your app is ready! Share it with users!');
    console.log('   📱 Test creating invoices as a new user');
    console.log('   💳 Test the upgrade flow to Pro');
  } else {
    console.log('   🔧 Fix the issues identified above');
    console.log('   🔄 Run: node debug-tests/run-all-tests.js (to retest)');
    console.log('   📞 Check individual test logs for specific fixes');
  }
}

// Check if debug-tests directory exists
if (!fs.existsSync('debug-tests')) {
  console.log('❌ Error: debug-tests directory not found!');
  console.log('   Make sure all debug test files were created properly.');
  process.exit(1);
}

runAllTests();
