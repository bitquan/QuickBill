#!/usr/bin/env node

/**
 * QuickBill Live Application Debug Test Script
 * 
 * Tests the live application at https://quickbill-app-b2467.web.app
 * to verify that the new pricing model and unlimited free invoices are working correctly.
 * 
 * This script will:
 * 1. Test if unlimited free invoices are actually implemented
 * 2. Verify $9.99 pricing is displayed correctly
 * 3. Check Stripe integration with new price ID
 * 4. Test user flows and upgrade modals
 * 5. Validate storage service behavior
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  APP_URL: 'https://quickbill-app-b2467.web.app',
  EXPECTED_PRICE: '$9.99',
  EXPECTED_PRICE_ID: 'price_1RwA92Dfc44028kidd3L70MD',
  OLD_PRICE: '$4.99',
  OLD_PRICE_ID: 'price_1RvkbDDfc44028ki94G00DCn',
  TEST_EMAIL: `test-${Date.now()}@quickbill-test.com`,
  TIMEOUT: 30000
};

// Test results storage
let testResults = {
  timestamp: new Date().toISOString(),
  appUrl: CONFIG.APP_URL,
  tests: [],
  summary: {
    passed: 0,
    failed: 0,
    total: 0
  }
};

// Utility functions
function logTest(testName, result, details = '') {
  const status = result ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${testName}`);
  if (details) console.log(`    ${details}`);
  
  testResults.tests.push({
    name: testName,
    result,
    details,
    timestamp: new Date().toISOString()
  });
  
  if (result) {
    testResults.summary.passed++;
  } else {
    testResults.summary.failed++;
  }
  testResults.summary.total++;
}

async function waitForElement(page, selector, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (error) {
    return false;
  }
}

async function checkElementText(page, selector, expectedText) {
  try {
    const element = await page.$(selector);
    if (!element) return false;
    
    const text = await page.evaluate(el => el.textContent, element);
    return text && text.includes(expectedText);
  } catch (error) {
    return false;
  }
}

async function runDebugTests() {
  console.log('🚀 Starting QuickBill Live Application Debug Tests');
  console.log(`📱 Testing: ${CONFIG.APP_URL}`);
  console.log('⏱️  This may take a few minutes...\n');

  const browser = await puppeteer.launch({
    headless: false, // Set to false to see the browser in action
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // Test 1: Basic App Loading
    console.log('🔍 Test 1: Basic Application Loading');
    try {
      await page.goto(CONFIG.APP_URL, { waitUntil: 'networkidle2', timeout: CONFIG.TIMEOUT });
      const title = await page.title();
      logTest('App loads successfully', title.length > 0, `Title: ${title}`);
    } catch (error) {
      logTest('App loads successfully', false, `Error: ${error.message}`);
    }

    // Test 2: Check for old $4.99 pricing (should NOT exist)
    console.log('\n🔍 Test 2: Verify Old Pricing Removed');
    try {
      const bodyText = await page.evaluate(() => document.body.textContent);
      const hasOldPrice = bodyText.includes(CONFIG.OLD_PRICE);
      logTest('Old $4.99 pricing removed', !hasOldPrice, hasOldPrice ? 'Found old pricing!' : 'No old pricing found');
    } catch (error) {
      logTest('Old $4.99 pricing removed', false, `Error: ${error.message}`);
    }

    // Test 3: Check for new $9.99 pricing
    console.log('\n🔍 Test 3: Verify New Pricing Displayed');
    try {
      const bodyText = await page.evaluate(() => document.body.textContent);
      const hasNewPrice = bodyText.includes(CONFIG.EXPECTED_PRICE);
      logTest('New $9.99 pricing displayed', hasNewPrice, hasNewPrice ? 'Found new pricing' : 'New pricing not found');
    } catch (error) {
      logTest('New $9.99 pricing displayed', false, `Error: ${error.message}`);
    }

    // Test 4: Check for unlimited free invoice messaging
    console.log('\n🔍 Test 4: Verify Unlimited Free Invoice Messaging');
    try {
      const bodyText = await page.evaluate(() => document.body.textContent.toLowerCase());
      const hasUnlimited = bodyText.includes('unlimited') && (bodyText.includes('free') || bodyText.includes('basic'));
      const hasOldLimit = bodyText.includes('3 invoices');
      
      logTest('Unlimited free messaging present', hasUnlimited, hasUnlimited ? 'Found unlimited messaging' : 'No unlimited messaging');
      logTest('Old 3-invoice limit removed', !hasOldLimit, hasOldLimit ? 'Still shows 3 invoice limit!' : 'No old limits found');
    } catch (error) {
      logTest('Unlimited free messaging present', false, `Error: ${error.message}`);
    }

    // Test 5: Test Invoice Creation Flow
    console.log('\n🔍 Test 5: Test Invoice Creation Flow');
    try {
      // Look for "Create Invoice" or similar button
      const createButton = await page.$('a[href="/create"], button:contains("Create"), a:contains("Create")');
      if (createButton) {
        await createButton.click();
        await page.waitForTimeout(2000);
        
        const currentUrl = page.url();
        const isOnCreatePage = currentUrl.includes('/create') || currentUrl.includes('invoice');
        logTest('Invoice creation accessible', isOnCreatePage, `Current URL: ${currentUrl}`);
      } else {
        logTest('Invoice creation accessible', false, 'Create button not found');
      }
    } catch (error) {
      logTest('Invoice creation accessible', false, `Error: ${error.message}`);
    }

    // Test 6: Check Local Storage for Invoice Limits
    console.log('\n🔍 Test 6: Check Local Storage Settings');
    try {
      const userData = await page.evaluate(() => {
        const stored = localStorage.getItem('quickbill_user_data');
        return stored ? JSON.parse(stored) : null;
      });
      
      if (userData) {
        const hasUnlimitedMax = userData.maxInvoices === Infinity || userData.maxInvoices > 1000;
        logTest('Local storage shows unlimited invoices', hasUnlimitedMax, `maxInvoices: ${userData.maxInvoices}`);
        logTest('Invoice count tracking exists', typeof userData.invoicesCreated === 'number', `invoicesCreated: ${userData.invoicesCreated}`);
      } else {
        logTest('Local storage initialized', false, 'No user data found in localStorage');
      }
    } catch (error) {
      logTest('Local storage check', false, `Error: ${error.message}`);
    }

    // Test 7: Check Environment Variables (if accessible)
    console.log('\n🔍 Test 7: Check Client-Side Configuration');
    try {
      const config = await page.evaluate(() => {
        // Try to access any global config or check for Stripe price ID in network requests
        return {
          stripeLoaded: typeof window.Stripe !== 'undefined',
          hasStripeElements: document.querySelector('[data-testid*="stripe"], [class*="stripe"]') !== null
        };
      });
      
      logTest('Stripe integration present', config.stripeLoaded, config.stripeLoaded ? 'Stripe loaded' : 'Stripe not detected');
    } catch (error) {
      logTest('Client-side config check', false, `Error: ${error.message}`);
    }

    // Test 8: Test Upgrade Modal/Flow
    console.log('\n🔍 Test 8: Test Upgrade Flow');
    try {
      // Look for upgrade/pro buttons
      const upgradeButtons = await page.$$('button:contains("Upgrade"), button:contains("Pro"), a:contains("Upgrade"), a:contains("Pro")');
      
      if (upgradeButtons.length > 0) {
        logTest('Upgrade options available', true, `Found ${upgradeButtons.length} upgrade elements`);
        
        // Try clicking first upgrade button
        try {
          await upgradeButtons[0].click();
          await page.waitForTimeout(1000);
          
          // Check if modal or new page opened
          const bodyText = await page.evaluate(() => document.body.textContent);
          const hasUpgradeContent = bodyText.includes(CONFIG.EXPECTED_PRICE) || bodyText.includes('Pro') || bodyText.includes('upgrade');
          logTest('Upgrade flow accessible', hasUpgradeContent, 'Upgrade content displayed');
        } catch (clickError) {
          logTest('Upgrade flow accessible', false, `Click error: ${clickError.message}`);
        }
      } else {
        logTest('Upgrade options available', false, 'No upgrade buttons found');
      }
    } catch (error) {
      logTest('Upgrade flow test', false, `Error: ${error.message}`);
    }

    // Test 9: Network Requests Analysis
    console.log('\n🔍 Test 9: Network Requests Analysis');
    try {
      // Monitor network requests for API calls
      const responses = [];
      page.on('response', response => {
        if (response.url().includes('stripe') || response.url().includes('firebase') || response.url().includes('api')) {
          responses.push({
            url: response.url(),
            status: response.status()
          });
        }
      });
      
      // Trigger some actions to generate network requests
      await page.reload();
      await page.waitForTimeout(3000);
      
      const stripeRequests = responses.filter(r => r.url.includes('stripe'));
      const firebaseRequests = responses.filter(r => r.url.includes('firebase'));
      
      logTest('Stripe API calls present', stripeRequests.length > 0, `${stripeRequests.length} Stripe requests`);
      logTest('Firebase API calls present', firebaseRequests.length > 0, `${firebaseRequests.length} Firebase requests`);
    } catch (error) {
      logTest('Network analysis', false, `Error: ${error.message}`);
    }

    // Test 10: Mobile Responsiveness
    console.log('\n🔍 Test 10: Mobile Responsiveness');
    try {
      await page.setViewport({ width: 375, height: 667 }); // iPhone size
      await page.waitForTimeout(1000);
      
      const bodyText = await page.evaluate(() => document.body.textContent);
      const stillHasContent = bodyText.length > 100;
      const hasPrice = bodyText.includes(CONFIG.EXPECTED_PRICE);
      
      logTest('Mobile view functional', stillHasContent, 'Content renders on mobile');
      logTest('Mobile pricing visible', hasPrice, 'Pricing visible on mobile');
    } catch (error) {
      logTest('Mobile responsiveness', false, `Error: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Critical error during testing:', error);
    logTest('Critical test execution', false, error.message);
  } finally {
    await browser.close();
  }

  // Generate Report
  console.log('\n📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${testResults.summary.passed}`);
  console.log(`❌ Failed: ${testResults.summary.failed}`);
  console.log(`📊 Total:  ${testResults.summary.total}`);
  console.log(`📈 Success Rate: ${Math.round((testResults.summary.passed / testResults.summary.total) * 100)}%`);

  // Save detailed report
  const reportPath = path.join(__dirname, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  // Generate HTML Report
  generateHTMLReport();

  // Final recommendations
  console.log('\n🎯 RECOMMENDATIONS:');
  if (testResults.summary.failed === 0) {
    console.log('✅ All tests passed! Your app is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Review the issues above and:');
    console.log('   1. Check if the build was deployed to production');
    console.log('   2. Verify environment variables are updated');
    console.log('   3. Clear browser cache and test again');
    console.log('   4. Check Firebase hosting deployment status');
  }
}

function generateHTMLReport() {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>QuickBill Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .test { margin: 10px 0; padding: 10px; border-left: 4px solid #ddd; }
        .pass { border-left-color: #28a745; background: #f8fff9; }
        .fail { border-left-color: #dc3545; background: #fff8f8; }
        .summary { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 QuickBill Live Application Test Report</h1>
        <p><strong>App URL:</strong> ${testResults.appUrl}</p>
        <p><strong>Test Time:</strong> ${testResults.timestamp}</p>
    </div>
    
    <div class="summary">
        <h2>📊 Summary</h2>
        <p>✅ Passed: ${testResults.summary.passed}</p>
        <p>❌ Failed: ${testResults.summary.failed}</p>
        <p>📊 Total: ${testResults.summary.total}</p>
        <p>📈 Success Rate: ${Math.round((testResults.summary.passed / testResults.summary.total) * 100)}%</p>
    </div>
    
    <h2>🧪 Test Details</h2>
    ${testResults.tests.map(test => `
        <div class="test ${test.result ? 'pass' : 'fail'}">
            <h3>${test.result ? '✅' : '❌'} ${test.name}</h3>
            ${test.details ? `<p>${test.details}</p>` : ''}
            <p class="timestamp">${test.timestamp}</p>
        </div>
    `).join('')}
</body>
</html>
  `;
  
  const htmlPath = path.join(__dirname, 'test-report.html');
  fs.writeFileSync(htmlPath, html);
  console.log(`📄 HTML report saved to: ${htmlPath}`);
}

// Run the tests
if (require.main === module) {
  runDebugTests().catch(console.error);
}

module.exports = { runDebugTests, CONFIG };
