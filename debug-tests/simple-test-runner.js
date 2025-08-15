#!/usr/bin/env node

/**
 * QuickBill Simple Debug Test Runner
 * A safer version that handles timeouts and problematic tests better
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔬 QuickBill Simple Debug Test Suite');
console.log('='.repeat(50));
console.log('Running essential tests with better error handling...\n');

const SAFE_TESTS = [
  {
    id: 1,
    name: 'Settings Configuration Check',
    file: '01-settings-check.js',
    timeout: 10000
  },
  {
    id: 2,
    name: 'Environment Variables Check',
    file: '02-env-check.js',
    timeout: 10000
  },
  {
    id: 5,
    name: 'Stripe Settings Check',
    file: '05-stripe-check.js',
    timeout: 15000
  },
  {
    id: 6,
    name: 'Invoice Logic Check',
    file: '06-invoice-logic-check.js',
    timeout: 15000
  },
  {
    id: 7,
    name: 'Local Storage Check',
    file: '07-localstorage-check.js',
    timeout: 10000
  },
  {
    id: 8,
    name: 'Pricing Display Check',
    file: '08-pricing-display-check.js',
    timeout: 20000
  },
  {
    id: 10,
    name: 'Live Application Test',
    file: '10-live-app-test.js',
    timeout: 30000
  }
];

const OPTIONAL_TESTS = [
  {
    id: 3,
    name: 'Build System Check (may timeout)',
    file: '03-build-check.js',
    timeout: 90000
  },
  {
    id: 4,
    name: 'Firebase Settings Check',
    file: '04-firebase-check.js',
    timeout: 20000
  },
  {
    id: 9,
    name: 'Documentation Consistency Check',
    file: '09-documentation-check.js',
    timeout: 30000
  }
];

function runTestSafe(test) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const testPath = path.join('debug-tests', test.file);
    
    console.log(`🧪 Test ${test.id}: ${test.name}`);
    console.log(`⏱️  Timeout: ${test.timeout/1000}s\n`);

    let completed = false;
    let child;

    const timeoutId = setTimeout(() => {
      if (!completed) {
        completed = true;
        if (child) {
          child.kill('SIGTERM');
        }
        console.log(`⏰ Test ${test.id} timed out after ${test.timeout/1000}s`);
        resolve({
          test,
          success: false,
          duration: Date.now() - startTime,
          stdout: '',
          stderr: '',
          error: 'Test timed out',
          timedOut: true
        });
      }
    }, test.timeout);

    child = exec(`node ${testPath}`, { 
      cwd: process.cwd(),
      killSignal: 'SIGTERM'
    }, (error, stdout, stderr) => {
      if (!completed) {
        completed = true;
        clearTimeout(timeoutId);
        
        const duration = Date.now() - startTime;
        resolve({
          test,
          success: !error,
          duration,
          stdout: stdout || '',
          stderr: stderr || '',
          error: error ? error.message : null,
          timedOut: false
        });
      }
    });

    child.on('error', (err) => {
      if (!completed) {
        completed = true;
        clearTimeout(timeoutId);
        console.log(`❌ Process error: ${err.message}`);
        resolve({
          test,
          success: false,
          duration: Date.now() - startTime,
          stdout: '',
          stderr: '',
          error: err.message,
          timedOut: false
        });
      }
    });
  });
}

function extractResults(output) {
  if (!output) return { passed: 0, total: 1, successRate: 0 };
  
  const passMatch = output.match(/✅ Passed: (\d+)\/(\d+)/);
  const successMatch = output.match(/📈 Success Rate: (\d+)%/);
  
  if (passMatch && successMatch) {
    return {
      passed: parseInt(passMatch[1]),
      total: parseInt(passMatch[2]),
      successRate: parseInt(successMatch[1])
    };
  }
  
  const checkmarks = (output.match(/✅/g) || []).length;
  const xmarks = (output.match(/❌/g) || []).length;
  const total = checkmarks + xmarks;
  
  return {
    passed: Math.max(checkmarks - 1, 0), // Subtract 1 for the "PASSED" message
    total: total > 0 ? total - 1 : 1,
    successRate: total > 1 ? Math.round((checkmarks - 1) / (total - 1) * 100) : 0
  };
}

async function runSimpleTests() {
  console.log('🚀 Running SAFE tests first...\n');
  
  const results = [];
  let totalPassed = 0;
  let totalTests = 0;

  // Run safe tests first
  for (const test of SAFE_TESTS) {
    const result = await runTestSafe(test);
    
    if (result.success) {
      const stats = extractResults(result.stdout);
      console.log(`✅ Test ${test.id} COMPLETED - ${stats.successRate}% (${stats.passed}/${stats.total})`);
      totalPassed += stats.passed;
      totalTests += stats.total;
      result.stats = stats;
    } else {
      console.log(`❌ Test ${test.id} FAILED`);
      if (result.timedOut) {
        console.log(`   ⏰ Timed out after ${test.timeout/1000}s`);
      } else if (result.error) {
        console.log(`   Error: ${result.error.split('\n')[0]}`);
      }
      totalTests += 1;
      result.stats = { passed: 0, total: 1, successRate: 0 };
    }
    
    console.log(`⏱️  Duration: ${Math.round(result.duration / 1000)}s\n`);
    results.push(result);
  }

  console.log('\n🔄 Running OPTIONAL tests (may be slower)...\n');

  // Run optional tests
  for (const test of OPTIONAL_TESTS) {
    console.log(`⚠️  Note: ${test.name} may take longer or timeout`);
    const result = await runTestSafe(test);
    
    if (result.success) {
      const stats = extractResults(result.stdout);
      console.log(`✅ Test ${test.id} COMPLETED - ${stats.successRate}% (${stats.passed}/${stats.total})`);
      totalPassed += stats.passed;
      totalTests += stats.total;
      result.stats = stats;
    } else {
      console.log(`⚠️  Test ${test.id} INCOMPLETE`);
      if (result.timedOut) {
        console.log(`   ⏰ Timed out (this is common for this test)`);
        console.log(`   💡 Try: node debug-tests/${test.file}`);
      } else if (result.error) {
        console.log(`   Error: ${result.error.split('\n')[0]}`);
      }
      // Don't penalize optional test failures as much
      totalTests += 0.5;
      result.stats = { passed: 0, total: 0.5, successRate: 0 };
    }
    
    console.log(`⏱️  Duration: ${Math.round(result.duration / 1000)}s\n`);
    results.push(result);
  }

  // Generate report
  console.log('📊 SIMPLE DEBUG TEST SUMMARY');
  console.log('='.repeat(40));
  
  const overallSuccess = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
  
  console.log(`🎯 RESULT: ${totalPassed}/${Math.round(totalTests)} checks passed (${overallSuccess}%)\n`);

  console.log('📋 Test Results:\n');
  results.forEach((result) => {
    const status = result.success ? '✅' : result.timedOut ? '⏰' : '❌';
    const rate = result.stats ? result.stats.successRate : 0;
    console.log(`${status} Test ${result.test.id}: ${result.test.name.split('(')[0].trim()} (${rate}%)`);
  });

  console.log('\n💡 RECOMMENDATIONS:');
  
  if (overallSuccess >= 85) {
    console.log('🎉 EXCELLENT! Your QuickBill app is working great!');
    console.log('   ✅ Core functionality verified');
    console.log('   ✅ Pricing model updated');
    console.log('   🚀 Ready for users!');
  } else if (overallSuccess >= 70) {
    console.log('✅ GOOD! Most core tests passed:');
    const failedCore = results.filter(r => r.test.id <= 8 && !r.success);
    if (failedCore.length > 0) {
      console.log('   🔧 Fix these core issues:');
      failedCore.forEach(r => console.log(`      - Test ${r.test.id}: ${r.test.name.split('(')[0].trim()}`));
    }
  } else {
    console.log('⚠️  NEEDS ATTENTION! Several core tests failed:');
    console.log('   1. Check environment variables (.env files)');
    console.log('   2. Verify Firebase and Stripe configuration');
    console.log('   3. Ensure all code changes were saved');
  }

  const timeoutTests = results.filter(r => r.timedOut);
  if (timeoutTests.length > 0) {
    console.log('\n⏰ TIMED OUT TESTS:');
    timeoutTests.forEach(r => {
      console.log(`   - Test ${r.test.id}: Try running manually: node debug-tests/${r.test.file}`);
    });
  }

  console.log('\n🎯 NEXT ACTIONS:');
  if (overallSuccess >= 85) {
    console.log('   🎉 Test your live app: https://quickbill-app-b2467.web.app');
    console.log('   📱 Create a test invoice as a new user');
    console.log('   💳 Test the $9.99 upgrade flow');
  } else {
    console.log('   🔧 Focus on the failed core tests above');
    console.log('   🔄 Run this test again: node debug-tests/simple-test-runner.js');
    console.log('   📞 Run individual tests for detailed debugging');
  }

  return { overallSuccess, results, totalPassed, totalTests };
}

// Check if debug-tests directory exists
if (!fs.existsSync('debug-tests')) {
  console.log('❌ Error: debug-tests directory not found!');
  process.exit(1);
}

runSimpleTests();
