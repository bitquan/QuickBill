#!/usr/bin/env node

/**
 * QuickBill Simple Debug Test Script
 * 
 * A lightweight test script that checks your live application
 * for the new pricing model without requiring additional dependencies.
 */

const https = require('https');
const fs = require('fs');

const CONFIG = {
  APP_URL: 'https://quickbill-app-b2467.web.app',
  EXPECTED_PRICE: '$9.99',
  OLD_PRICE: '$4.99',
  EXPECTED_PRICE_ID: 'price_1RwA92Dfc44028kidd3L70MD',
  OLD_PRICE_ID: 'price_1RvkbDDfc44028ki94G00DCn'
};

console.log('🔍 QuickBill Simple Debug Test');
console.log('================================\n');

async function testWebsite() {
  return new Promise((resolve, reject) => {
    const url = new URL(CONFIG.APP_URL);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'GET',
      headers: {
        'User-Agent': 'QuickBill-Debug-Test/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function runSimpleTests() {
  console.log('📱 Testing:', CONFIG.APP_URL);
  console.log('⏱️  Fetching application...\n');

  try {
    const response = await testWebsite();
    
    // Test 1: App loads successfully
    const appLoads = response.status === 200;
    console.log(appLoads ? '✅ PASS' : '❌ FAIL', 'App loads successfully');
    console.log(`    Status: ${response.status}\n`);

    if (!appLoads) {
      console.log('❌ Cannot continue tests - app not loading');
      return;
    }

    const bodyText = response.body.toLowerCase();

    // Test 2: Check for old pricing (should NOT exist)
    const hasOldPrice = bodyText.includes('$4.99') || bodyText.includes('4.99');
    console.log(!hasOldPrice ? '✅ PASS' : '❌ FAIL', 'Old $4.99 pricing removed');
    if (hasOldPrice) console.log('    ⚠️  Found old pricing references!\n');
    else console.log('    No old pricing found\n');

    // Test 3: Check for new pricing
    const hasNewPrice = bodyText.includes('$9.99') || bodyText.includes('9.99');
    console.log(hasNewPrice ? '✅ PASS' : '❌ FAIL', 'New $9.99 pricing present');
    if (!hasNewPrice) console.log('    ⚠️  New pricing not found!\n');
    else console.log('    New pricing detected\n');

    // Test 4: Check for old price ID (should NOT exist)
    const hasOldPriceId = bodyText.includes(CONFIG.OLD_PRICE_ID);
    console.log(!hasOldPriceId ? '✅ PASS' : '❌ FAIL', 'Old Stripe price ID removed');
    if (hasOldPriceId) console.log('    ⚠️  Found old price ID!\n');
    else console.log('    Old price ID not found\n');

    // Test 5: Check for new price ID
    const hasNewPriceId = bodyText.includes(CONFIG.EXPECTED_PRICE_ID);
    console.log(hasNewPriceId ? '✅ PASS' : '❌ FAIL', 'New Stripe price ID present');
    if (!hasNewPriceId) console.log('    ⚠️  New price ID not found!\n');
    else console.log('    New price ID detected\n');

    // Test 6: Check for unlimited messaging
    const hasUnlimited = bodyText.includes('unlimited') && bodyText.includes('free');
    console.log(hasUnlimited ? '✅ PASS' : '❌ FAIL', 'Unlimited free messaging present');
    if (!hasUnlimited) console.log('    ⚠️  Unlimited messaging not found!\n');
    else console.log('    Unlimited messaging detected\n');

    // Test 7: Check for old 3-invoice limit (should NOT exist)
    const hasOldLimit = bodyText.includes('3 invoices');
    console.log(!hasOldLimit ? '✅ PASS' : '❌ FAIL', 'Old 3-invoice limit removed');
    if (hasOldLimit) console.log('    ⚠️  Still shows 3 invoice limit!\n');
    else console.log('    No old limits found\n');

    // Test 8: Basic React app check
    const isReactApp = bodyText.includes('react') || bodyText.includes('root') || bodyText.includes('app');
    console.log(isReactApp ? '✅ PASS' : '❌ FAIL', 'React app detected');
    console.log('    App appears to be properly built\n');

    // Summary
    console.log('📊 SUMMARY');
    console.log('='.repeat(30));
    
    const tests = [
      { name: 'App loads', result: appLoads },
      { name: 'Old pricing removed', result: !hasOldPrice },
      { name: 'New pricing present', result: hasNewPrice },
      { name: 'Old price ID removed', result: !hasOldPriceId },
      { name: 'New price ID present', result: hasNewPriceId },
      { name: 'Unlimited messaging', result: hasUnlimited },
      { name: 'Old limits removed', result: !hasOldLimit },
      { name: 'React app working', result: isReactApp }
    ];

    const passed = tests.filter(t => t.result).length;
    const total = tests.length;
    const successRate = Math.round((passed / total) * 100);

    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`📈 Success Rate: ${successRate}%\n`);

    // Recommendations
    console.log('🎯 RECOMMENDATIONS:');
    if (successRate === 100) {
      console.log('✅ Perfect! All tests passed. Your new pricing model is live!');
    } else if (successRate >= 75) {
      console.log('⚠️  Most tests passed, but some issues detected:');
      tests.filter(t => !t.result).forEach(test => {
        console.log(`   - ${test.name} failed`);
      });
      console.log('\n💡 Check if the latest build was deployed to production.');
    } else {
      console.log('❌ Multiple issues detected. The new pricing may not be fully deployed.');
      console.log('   1. Run: npm run build');
      console.log('   2. Run: npm run deploy');
      console.log('   3. Wait 5-10 minutes for deployment');
      console.log('   4. Run this test again');
    }

  } catch (error) {
    console.log('❌ FAIL', 'Unable to test application');
    console.log(`    Error: ${error.message}`);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('   1. Check if the URL is correct');
    console.log('   2. Verify internet connection');
    console.log('   3. Check if the app is deployed');
  }
}

// Run the simple tests
runSimpleTests();
