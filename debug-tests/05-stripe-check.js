#!/usr/bin/env node

/**
 * Debug Test #5: Stripe Settings Check
 * Tests Stripe configuration and pricing
 */

const https = require('https');
const fs = require('fs');

console.log('💳 DEBUG TEST #5: Stripe Settings Check');
console.log('='.repeat(50));

const EXPECTED_PRICE_ID = 'price_1RwA92Dfc44028kidd3L70MD';
const OLD_PRICE_ID = 'price_1RvkbDDfc44028ki94G00DCn';
const EXPECTED_AMOUNT = 999; // $9.99 in cents

function findStripeConfig() {
  const sources = [
    'src/config/stripe.ts',
    'src/config/stripe.js',
    'src/services/stripe.ts',
    'src/services/stripe.js'
  ];

  const results = [];

  sources.forEach(source => {
    if (fs.existsSync(source)) {
      try {
        const content = fs.readFileSync(source, 'utf8');
        
        // Extract Stripe configuration
        const publishableKeyMatch = content.match(/pk_[a-zA-Z0-9_]+/g);
        const priceIdMatches = content.match(/price_[a-zA-Z0-9]+/g);
        
        results.push({
          file: source,
          content,
          publishableKeys: publishableKeyMatch || [],
          priceIds: priceIdMatches || [],
          hasOldPriceId: content.includes(OLD_PRICE_ID),
          hasNewPriceId: content.includes(EXPECTED_PRICE_ID)
        });
      } catch (error) {
        results.push({
          file: source,
          error: error.message
        });
      }
    }
  });

  return results;
}

function checkEnvStripeKeys() {
  const envFiles = ['.env', '.env.local', '.env.production'];
  const keys = {};

  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach(line => {
          if (line.includes('STRIPE') && line.includes('=')) {
            const [key, value] = line.split('=');
            keys[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
          }
        });
      } catch (error) {
        // Skip unreadable files
      }
    }
  });

  return keys;
}

function validateStripeKey(key, type) {
  const validation = { valid: true, issues: [] };

  if (!key) {
    validation.valid = false;
    validation.issues.push('Missing or empty');
    return validation;
  }

  if (type === 'publishable') {
    if (!key.startsWith('pk_')) {
      validation.valid = false;
      validation.issues.push('Must start with pk_');
    }
    
    if (key.includes('test')) {
      validation.issues.push('Using test key (not production)');
    }
    
    if (key.length < 20) {
      validation.valid = false;
      validation.issues.push('Key too short');
    }
  }

  if (type === 'secret') {
    if (!key.startsWith('sk_')) {
      validation.valid = false;
      validation.issues.push('Must start with sk_');
    }
    
    if (key.includes('test')) {
      validation.issues.push('Using test key (not production)');
    }
  }

  return validation;
}

async function testStripePriceId(priceId, publishableKey) {
  if (!publishableKey || !publishableKey.startsWith('pk_')) {
    return { error: 'No valid publishable key provided' };
  }

  try {
    // We can't directly test Stripe API without secret key,
    // but we can validate the price ID format
    const validation = {
      format: priceId.startsWith('price_') && priceId.length > 10,
      isNew: priceId === EXPECTED_PRICE_ID,
      isOld: priceId === OLD_PRICE_ID
    };

    return validation;
  } catch (error) {
    return { error: error.message };
  }
}

function searchForPricingInComponents() {
  const componentDirs = ['src/components', 'src/pages', 'src/screens'];
  const results = [];

  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      items.forEach(item => {
        const fullPath = `${dir}/${item.name}`;
        
        if (item.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.isFile() && (item.name.endsWith('.tsx') || item.name.endsWith('.ts') || item.name.endsWith('.jsx') || item.name.endsWith('.js'))) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            
            const pricing = {
              file: fullPath,
              hasOldPrice: content.includes('$4.99') || content.includes('4.99'),
              hasNewPrice: content.includes('$9.99') || content.includes('9.99'),
              hasOldPriceId: content.includes(OLD_PRICE_ID),
              hasNewPriceId: content.includes(EXPECTED_PRICE_ID),
              priceReferences: []
            };

            // Find all price references
            const priceMatches = content.match(/\$\d+\.\d+|\d+\.\d+|\bprice_[a-zA-Z0-9]+/g);
            if (priceMatches) {
              pricing.priceReferences = [...new Set(priceMatches)];
            }

            if (pricing.hasOldPrice || pricing.hasNewPrice || pricing.hasOldPriceId || pricing.hasNewPriceId || pricing.priceReferences.length > 0) {
              results.push(pricing);
            }
          } catch (error) {
            // Skip unreadable files
          }
        }
      });
    } catch (error) {
      // Skip unreadable directories
    }
  }

  componentDirs.forEach(dir => scanDirectory(dir));
  return results;
}

async function runStripeCheck() {
  console.log('🔍 Searching for Stripe configuration...\n');

  // Find Stripe config files
  const stripeConfigs = findStripeConfig();
  
  if (stripeConfigs.length === 0) {
    console.log('⚠️  No Stripe configuration files found');
  } else {
    console.log(`✅ Found ${stripeConfigs.length} Stripe configuration file(s)`);
    
    stripeConfigs.forEach(config => {
      console.log(`📁 ${config.file}`);
      
      if (config.error) {
        console.log(`   ❌ Error: ${config.error}`);
        return;
      }

      console.log(`   🔑 Publishable keys: ${config.publishableKeys.length}`);
      console.log(`   💰 Price IDs: ${config.priceIds.length}`);
      console.log(config.hasNewPriceId ? '   ✅' : '   ❌', 'Has new price ID');
      console.log(!config.hasOldPriceId ? '   ✅' : '   ⚠️', 'Old price ID removed');
    });
  }

  // Check environment variables
  console.log('\n🌍 Checking environment variables...');
  const envKeys = checkEnvStripeKeys();
  
  const publishableKey = envKeys.VITE_STRIPE_PUBLISHABLE_KEY || envKeys.STRIPE_PUBLISHABLE_KEY;
  const secretKey = envKeys.STRIPE_SECRET_KEY;

  if (publishableKey) {
    const pubValidation = validateStripeKey(publishableKey, 'publishable');
    console.log(pubValidation.valid ? '✅' : '❌', 'Publishable key');
    if (pubValidation.issues.length > 0) {
      pubValidation.issues.forEach(issue => console.log(`     - ${issue}`));
    }
  } else {
    console.log('❌ No publishable key found in environment');
  }

  if (secretKey) {
    const secValidation = validateStripeKey(secretKey, 'secret');
    console.log(secValidation.valid ? '✅' : '❌', 'Secret key');
    if (secValidation.issues.length > 0) {
      secValidation.issues.forEach(issue => console.log(`     - ${issue}`));
    }
  } else {
    console.log('⚠️  No secret key found (may be in server environment)');
  }

  // Test price IDs from config
  console.log('\n💰 Testing price IDs...');
  
  const allPriceIds = new Set();
  stripeConfigs.forEach(config => {
    if (config.priceIds) {
      config.priceIds.forEach(id => allPriceIds.add(id));
    }
  });

  if (allPriceIds.size === 0) {
    console.log('❌ No price IDs found in configuration');
  } else {
    for (const priceId of allPriceIds) {
      const test = await testStripePriceId(priceId, publishableKey);
      
      if (test.error) {
        console.log('❌', `${priceId}: ${test.error}`);
      } else {
        console.log(test.format ? '✅' : '❌', `${priceId}: Format ${test.format ? 'valid' : 'invalid'}`);
        
        if (test.isNew) {
          console.log('   🎯 This is the new $9.99 price ID');
        } else if (test.isOld) {
          console.log('   ⚠️  This is the old $4.99 price ID');
        }
      }
    }
  }

  // Check components for pricing
  console.log('\n🔍 Scanning components for pricing...');
  const componentPricing = searchForPricingInComponents();
  
  if (componentPricing.length === 0) {
    console.log('⚠️  No pricing references found in components');
  } else {
    console.log(`📱 Found pricing in ${componentPricing.length} component(s)`);
    
    let oldPriceCount = 0;
    let newPriceCount = 0;
    let oldPriceIdCount = 0;
    let newPriceIdCount = 0;

    componentPricing.forEach(comp => {
      if (comp.hasOldPrice) oldPriceCount++;
      if (comp.hasNewPrice) newPriceCount++;
      if (comp.hasOldPriceId) oldPriceIdCount++;
      if (comp.hasNewPriceId) newPriceIdCount++;
      
      console.log(`   📄 ${comp.file.replace('src/', '')}`);
      if (comp.priceReferences.length > 0) {
        console.log(`      Prices: ${comp.priceReferences.join(', ')}`);
      }
    });

    console.log(`\n   📊 Summary:`);
    console.log(`   ${oldPriceCount === 0 ? '✅' : '❌'} Old $4.99 references: ${oldPriceCount}`);
    console.log(`   ${newPriceCount > 0 ? '✅' : '❌'} New $9.99 references: ${newPriceCount}`);
    console.log(`   ${oldPriceIdCount === 0 ? '✅' : '❌'} Old price IDs: ${oldPriceIdCount}`);
    console.log(`   ${newPriceIdCount > 0 ? '✅' : '❌'} New price IDs: ${newPriceIdCount}`);
  }

  // Summary
  console.log('\n📊 STRIPE SUMMARY:');
  const checks = [
    { name: 'Config files found', passed: stripeConfigs.length > 0 },
    { name: 'Publishable key valid', passed: !!publishableKey && validateStripeKey(publishableKey, 'publishable').valid },
    { name: 'New price ID present', passed: allPriceIds.has(EXPECTED_PRICE_ID) },
    { name: 'Old price ID removed', passed: !allPriceIds.has(OLD_PRICE_ID) },
    { name: 'Component pricing updated', passed: componentPricing.length > 0 && componentPricing.every(c => !c.hasOldPrice) }
  ];

  const passed = checks.filter(c => c.passed).length;
  console.log(`✅ Passed: ${passed}/${checks.length}`);
  console.log(`📈 Success Rate: ${Math.round((passed/checks.length)*100)}%`);

  if (passed === checks.length) {
    console.log('\n🎉 Stripe is fully configured with new pricing!');
  } else {
    console.log('\n🚨 Stripe configuration issues:');
    checks.filter(c => !c.passed).forEach(check => {
      console.log(`   - ${check.name}`);
    });
  }
}

runStripeCheck();
