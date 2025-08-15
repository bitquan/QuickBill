#!/usr/bin/env node

/**
 * Debug Test #10: Live Application Behavior Test
 * Tests the actual behavior of the live application using HTTP requests
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const zlib = require('zlib');

console.log('🌐 DEBUG TEST #10: Live Application Behavior Test');
console.log('='.repeat(50));

const CONFIG = {
  APP_URL: 'https://quickbill-app-b2467.web.app',
  TIMEOUT: 15000,
  USER_AGENT: 'QuickBill-Debug-Test/1.0',
  EXPECTED_PRICE: '$9.99',
  OLD_PRICE: '$4.99',
  NEW_PRICE_ID: 'price_1RwA92Dfc44028kidd3L70MD',
  OLD_PRICE_ID: 'price_1RvkbDDfc44028ki94G00DCn'
};

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': CONFIG.USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let chunks = [];
      
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      res.on('end', () => {
        let body = Buffer.concat(chunks);
        
        // Handle GZIP compression
        if (res.headers['content-encoding'] === 'gzip') {
          try {
            body = zlib.gunzipSync(body);
          } catch (error) {
            console.log('⚠️  Failed to decompress GZIP content');
          }
        } else if (res.headers['content-encoding'] === 'deflate') {
          try {
            body = zlib.inflateSync(body);
          } catch (error) {
            console.log('⚠️  Failed to decompress deflate content');
          }
        } else if (res.headers['content-encoding'] === 'br') {
          try {
            body = zlib.brotliDecompressSync(body);
          } catch (error) {
            console.log('⚠️  Failed to decompress brotli content');
          }
        }
        
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body.toString('utf8'),
          url: url
        });
      });
    });

    req.on('error', (error) => {
      reject({ error: error.message, url });
    });

    req.setTimeout(CONFIG.TIMEOUT, () => {
      req.destroy();
      reject({ error: 'Request timeout', url });
    });

    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testAppLoading() {
  console.log('🔍 Testing application loading...\n');

  try {
    const response = await makeRequest(CONFIG.APP_URL);
    
    const result = {
      accessible: response.status === 200,
      status: response.status,
      contentType: response.headers['content-type'],
      contentLength: response.body.length,
      isHTML: response.body.includes('<!DOCTYPE html>') || response.body.includes('<html'),
      isReactApp: response.body.includes('react') || response.body.includes('root'),
      hasViteManifest: response.body.includes('vite') || response.body.includes('manifest'),
      loadTime: Date.now()
    };

    console.log(result.accessible ? '✅' : '❌', `App loads (Status: ${result.status})`);
    console.log(result.isHTML ? '✅' : '❌', 'Returns HTML content');
    console.log(result.isReactApp ? '✅' : '❌', 'React app detected');
    console.log(`📄 Content length: ${result.contentLength} bytes`);
    console.log(`📋 Content type: ${result.contentType || 'unknown'}`);

    return { success: true, data: result, body: response.body };
  } catch (error) {
    console.log('❌ App loading failed:', error.error);
    return { success: false, error };
  }
}

async function testPricingContent(appBody) {
  console.log('\n💰 Testing pricing content...\n');

  const tests = {
    hasOldPrice: appBody.includes(CONFIG.OLD_PRICE) || appBody.includes('4.99'),
    hasNewPrice: appBody.includes(CONFIG.EXPECTED_PRICE) || appBody.includes('9.99'),
    hasOldPriceId: appBody.includes(CONFIG.OLD_PRICE_ID),
    hasNewPriceId: appBody.includes(CONFIG.NEW_PRICE_ID),
    hasUnlimitedText: appBody.toLowerCase().includes('unlimited') && appBody.toLowerCase().includes('free'),
    hasOldLimit: appBody.includes('3 invoices') || appBody.includes('3-invoice'),
    hasProMention: appBody.toLowerCase().includes('pro') && appBody.toLowerCase().includes('plan')
  };

  console.log(!tests.hasOldPrice ? '✅' : '❌', `Old $4.99 pricing removed`);
  console.log(tests.hasNewPrice ? '✅' : '❌', `New $9.99 pricing present`);
  console.log(!tests.hasOldPriceId ? '✅' : '❌', `Old Stripe price ID removed`);
  console.log(tests.hasNewPriceId ? '✅' : '❌', `New Stripe price ID present`);
  console.log(tests.hasUnlimitedText ? '✅' : '❌', `Unlimited free text present`);
  console.log(!tests.hasOldLimit ? '✅' : '❌', `Old 3-invoice limit removed`);
  console.log(tests.hasProMention ? '✅' : '❌', `Pro plan mentioned`);

  // Extract pricing contexts
  const priceMatches = appBody.match(/.{0,50}\$\d+\.\d+.{0,50}/g);
  if (priceMatches && priceMatches.length > 0) {
    console.log('\n📋 Price contexts found:');
    priceMatches.slice(0, 3).forEach(match => {
      console.log(`   "${match.trim()}"`);
    });
  }

  return tests;
}

async function testStaticAssets() {
  console.log('\n📁 Testing static assets...\n');

  const assetsToTest = [
    '/manifest.json',
    '/robots.txt',
    '/sitemap.xml',
    '/favicon.ico'
  ];

  const results = [];

  for (const asset of assetsToTest) {
    try {
      const response = await makeRequest(`${CONFIG.APP_URL}${asset}`);
      
      const result = {
        asset,
        accessible: response.status === 200,
        status: response.status,
        size: response.body.length
      };

      console.log(result.accessible ? '✅' : '⚠️', `${asset} (${result.status}, ${result.size} bytes)`);
      results.push(result);
    } catch (error) {
      console.log('❌', `${asset}: ${error.error}`);
      results.push({ asset, accessible: false, error: error.error });
    }
  }

  return results;
}

async function testPerformance() {
  console.log('\n⚡ Testing performance...\n');

  const startTime = Date.now();
  
  try {
    const response = await makeRequest(CONFIG.APP_URL);
    const loadTime = Date.now() - startTime;
    
    const performance = {
      loadTime,
      contentSize: response.body.length,
      hasGzip: response.headers['content-encoding'] === 'gzip',
      hasCache: !!response.headers['cache-control'],
      hasETag: !!response.headers['etag']
    };

    console.log(performance.loadTime < 3000 ? '✅' : '⚠️', `Load time: ${loadTime}ms`);
    console.log(performance.hasGzip ? '✅' : '⚠️', 'GZIP compression');
    console.log(performance.hasCache ? '✅' : '⚠️', 'Cache headers');
    console.log(performance.hasETag ? '✅' : '⚠️', 'ETag header');
    console.log(`📏 Content size: ${Math.round(performance.contentSize / 1024)}KB`);

    return performance;
  } catch (error) {
    console.log('❌ Performance test failed:', error.error);
    return { error: error.error };
  }
}

async function testMobileResponsiveness(appBody) {
  console.log('\n📱 Testing mobile responsiveness...\n');

  const mobileTests = {
    hasViewportMeta: appBody.includes('viewport') && appBody.includes('width=device-width'),
    hasResponsiveCSS: appBody.includes('responsive') || appBody.includes('mobile'),
    hasTouchIcons: appBody.includes('apple-touch-icon') || appBody.includes('touch-icon'),
    hasManifest: appBody.includes('manifest.json'),
    hasTailwindCSS: appBody.includes('tailwind') || appBody.includes('tw-'),
    hasMediaQueries: appBody.includes('@media') || appBody.includes('media-query')
  };

  console.log(mobileTests.hasViewportMeta ? '✅' : '❌', 'Viewport meta tag');
  console.log(mobileTests.hasManifest ? '✅' : '❌', 'Web app manifest');
  console.log(mobileTests.hasTouchIcons ? '✅' : '⚠️', 'Touch icons');
  console.log(mobileTests.hasTailwindCSS ? '✅' : '⚠️', 'TailwindCSS detected');

  return mobileTests;
}

async function testSEOFeatures(appBody) {
  console.log('\n🔍 Testing SEO features...\n');

  const seoTests = {
    hasTitle: appBody.includes('<title>') && !appBody.includes('<title></title>'),
    hasDescription: appBody.includes('name="description"') || appBody.includes('property="og:description"'),
    hasKeywords: appBody.includes('name="keywords"'),
    hasOGTags: appBody.includes('property="og:'),
    hasTwitterCards: appBody.includes('name="twitter:'),
    hasCanonical: appBody.includes('rel="canonical"'),
    hasStructuredData: appBody.includes('application/ld+json') || appBody.includes('schema.org')
  };

  console.log(seoTests.hasTitle ? '✅' : '❌', 'Page title');
  console.log(seoTests.hasDescription ? '✅' : '❌', 'Meta description');
  console.log(seoTests.hasOGTags ? '✅' : '⚠️', 'Open Graph tags');
  console.log(seoTests.hasTwitterCards ? '✅' : '⚠️', 'Twitter cards');
  console.log(seoTests.hasCanonical ? '✅' : '⚠️', 'Canonical URL');
  console.log(seoTests.hasStructuredData ? '✅' : '⚠️', 'Structured data');

  // Extract title and description
  const titleMatch = appBody.match(/<title>([^<]+)<\/title>/);
  const descMatch = appBody.match(/name="description".*?content="([^"]+)"/);

  if (titleMatch) {
    console.log(`📄 Title: "${titleMatch[1]}"`);
  }
  if (descMatch) {
    console.log(`📝 Description: "${descMatch[1].substring(0, 80)}..."`);
  }

  return seoTests;
}

async function runLiveAppTest() {
  console.log(`🌐 Testing live application: ${CONFIG.APP_URL}\n`);

  // Test 1: App Loading
  const loadTest = await testAppLoading();
  if (!loadTest.success) {
    console.log('\n❌ Cannot continue - app is not accessible');
    return;
  }

  const appBody = loadTest.body;

  // Test 2: Pricing Content
  const pricingTest = await testPricingContent(appBody);

  // Test 3: Static Assets
  const assetsTest = await testStaticAssets();

  // Test 4: Performance
  const performanceTest = await testPerformance();

  // Test 5: Mobile Responsiveness
  const mobileTest = await testMobileResponsiveness(appBody);

  // Test 6: SEO Features
  const seoTest = await testSEOFeatures(appBody);

  // Generate comprehensive report
  console.log('\n📊 COMPREHENSIVE LIVE APP SUMMARY:');
  console.log('='.repeat(40));

  const allChecks = [
    // Core functionality
    { name: 'App loads successfully', passed: loadTest.success },
    { name: 'Returns HTML content', passed: loadTest.data.isHTML },
    { name: 'React app working', passed: loadTest.data.isReactApp },
    
    // Pricing checks
    { name: 'Old pricing removed', passed: !pricingTest.hasOldPrice },
    { name: 'New pricing present', passed: pricingTest.hasNewPrice },
    { name: 'Old price ID removed', passed: !pricingTest.hasOldPriceId },
    { name: 'New price ID present', passed: pricingTest.hasNewPriceId },
    { name: 'Unlimited text present', passed: pricingTest.hasUnlimitedText },
    { name: 'Old limits removed', passed: !pricingTest.hasOldLimit },
    
    // Technical checks
    { name: 'Good performance', passed: !performanceTest.error && performanceTest.loadTime < 5000 },
    { name: 'Mobile responsive', passed: mobileTest.hasViewportMeta },
    { name: 'SEO optimized', passed: seoTest.hasTitle && seoTest.hasDescription }
  ];

  const passed = allChecks.filter(c => c.passed).length;
  const total = allChecks.length;
  const successRate = Math.round((passed / total) * 100);

  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`📈 Success Rate: ${successRate}%`);

  // Category breakdown
  console.log('\n📋 Category Breakdown:');
  
  const coreChecks = allChecks.slice(0, 3);
  const pricingChecks = allChecks.slice(3, 9);
  const techChecks = allChecks.slice(9);

  const corePassed = coreChecks.filter(c => c.passed).length;
  const pricingPassed = pricingChecks.filter(c => c.passed).length;
  const techPassed = techChecks.filter(c => c.passed).length;

  console.log(`   🔧 Core functionality: ${corePassed}/${coreChecks.length} (${Math.round(corePassed/coreChecks.length*100)}%)`);
  console.log(`   💰 Pricing model: ${pricingPassed}/${pricingChecks.length} (${Math.round(pricingPassed/pricingChecks.length*100)}%)`);
  console.log(`   ⚡ Technical features: ${techPassed}/${techChecks.length} (${Math.round(techPassed/techChecks.length*100)}%)`);

  // Final recommendations
  console.log('\n🎯 FINAL RECOMMENDATIONS:');
  
  if (successRate >= 90) {
    console.log('🎉 EXCELLENT! Your QuickBill app is live and working perfectly!');
    console.log('   ✅ New $9.99 pricing is active');
    console.log('   ✅ Unlimited free invoices are available');
    console.log('   ✅ All systems operational');
  } else if (successRate >= 75) {
    console.log('✅ GOOD! Your app is mostly working, but some issues detected:');
    allChecks.filter(c => !c.passed).forEach(check => {
      console.log(`   - ${check.name} failed`);
    });
  } else if (successRate >= 50) {
    console.log('⚠️  PARTIAL! Your app loads but has significant issues:');
    allChecks.filter(c => !c.passed).forEach(check => {
      console.log(`   - ${check.name} failed`);
    });
    console.log('\n💡 Priority fixes needed:');
    if (!pricingTest.hasNewPrice) console.log('   1. Deploy updated pricing to production');
    if (pricingTest.hasOldPrice) console.log('   2. Remove old $4.99 references');
    if (!pricingTest.hasNewPriceId) console.log('   3. Update Stripe price ID');
  } else {
    console.log('❌ CRITICAL! Major issues detected:');
    allChecks.filter(c => !c.passed).forEach(check => {
      console.log(`   - ${check.name} failed`);
    });
    console.log('\n🚨 Immediate actions required:');
    console.log('   1. Run: npm run build');
    console.log('   2. Run: npm run deploy');
    console.log('   3. Wait 5-10 minutes for deployment');
    console.log('   4. Run this test again');
  }

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    url: CONFIG.APP_URL,
    summary: { passed, total, successRate },
    tests: {
      loading: loadTest,
      pricing: pricingTest,
      assets: assetsTest,
      performance: performanceTest,
      mobile: mobileTest,
      seo: seoTest
    },
    checks: allChecks
  };

  try {
    fs.writeFileSync('live-app-test-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to: live-app-test-report.json');
  } catch (error) {
    console.log('\n⚠️  Could not save report file');
  }
}

runLiveAppTest();
