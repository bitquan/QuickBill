#!/usr/bin/env node

/**
 * Debug Test #8: Component Pricing Display Check
 * Tests if all components show the correct $9.99 pricing
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 DEBUG TEST #8: Component Pricing Display Check');
console.log('='.repeat(50));

const EXPECTED_PRICE = '$9.99';
const OLD_PRICE = '$4.99';
const PRICE_PATTERNS = [
  /\$\d+\.\d+/g,           // $X.XX format
  /\d+\.\d+/g,             // X.XX format
  /\$\d+\/month/g,         // $X/month format
  /\d+\s*dollars?/g,       // X dollars format
  /price.*\d+/gi           // price: X format
];

function findUIComponents() {
  const directories = [
    'src/components',
    'src/pages', 
    'src/screens',
    'src/ui'
  ];
  
  const components = [];

  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      items.forEach(item => {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.isFile() && (item.name.endsWith('.tsx') || item.name.endsWith('.jsx'))) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Check if component might contain pricing
            const hasPricing = content.includes('$') || 
                             content.includes('price') || 
                             content.includes('cost') ||
                             content.includes('upgrade') ||
                             content.includes('pro') ||
                             content.includes('billing') ||
                             content.includes('subscription');

            if (hasPricing) {
              components.push({
                file: fullPath,
                content,
                name: path.basename(item.name, path.extname(item.name))
              });
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

  directories.forEach(dir => scanDirectory(dir));
  return components;
}

function analyzePricingInComponent(component) {
  const analysis = {
    file: component.file,
    name: component.name,
    allPrices: [],
    hasOldPrice: false,
    hasNewPrice: false,
    hasCorrectPrice: false,
    priceContexts: [],
    issues: []
  };

  // Find all price patterns
  PRICE_PATTERNS.forEach(pattern => {
    const matches = component.content.match(pattern);
    if (matches) {
      analysis.allPrices.push(...matches);
    }
  });

  // Remove duplicates and filter out non-prices
  analysis.allPrices = [...new Set(analysis.allPrices)]
    .filter(price => {
      // Filter out obviously non-price numbers
      return !(/^\d+$/.test(price) && parseInt(price) > 2030) && // Not years
             !(/^\d+\.\d+$/.test(price) && parseFloat(price) > 100); // Not large numbers
    });

  // Check for specific prices
  analysis.hasOldPrice = component.content.includes(OLD_PRICE) || 
                        component.content.includes('4.99');
  analysis.hasNewPrice = component.content.includes(EXPECTED_PRICE) || 
                        component.content.includes('9.99');

  // Find price contexts (surrounding text)
  analysis.allPrices.forEach(price => {
    const regex = new RegExp(`.{0,50}${price.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.{0,50}`, 'gi');
    const contexts = component.content.match(regex);
    if (contexts) {
      analysis.priceContexts.push(...contexts.map(ctx => ({ price, context: ctx.trim() })));
    }
  });

  // Determine if pricing is correct
  if (analysis.hasOldPrice) {
    analysis.issues.push('Contains old $4.99 pricing');
  }

  if (analysis.allPrices.some(p => p.includes('9.99') || p.includes('$9.99'))) {
    analysis.hasCorrectPrice = true;
  }

  // Check for hardcoded vs dynamic pricing
  const hasVariable = component.content.includes('price') && 
                     (component.content.includes('{') || component.content.includes('${'));
  
  if (!hasVariable && analysis.allPrices.length > 0) {
    analysis.issues.push('Uses hardcoded prices (should be dynamic)');
  }

  return analysis;
}

function checkUpgradeComponents() {
  const upgradeFiles = [
    'src/components/UpgradeModal.tsx',
    'src/components/EnhancedUpgradeModal.tsx',
    'src/components/UpgradeDialog.tsx',
    'src/components/PricingCard.tsx',
    'src/components/BillingComponent.tsx',
    'src/pages/Billing.tsx',
    'src/pages/Pricing.tsx'
  ];

  const results = [];

  upgradeFiles.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        const analysis = {
          file,
          exists: true,
          hasStripeIntegration: content.includes('stripe') || content.includes('Stripe'),
          hasPriceId: content.includes('price_'),
          hasCorrectPriceId: content.includes('price_1RwA92Dfc44028kidd3L70MD'),
          hasOldPriceId: content.includes('price_1RvkbDDfc44028ki94G00DCn'),
          pricing: analyzePricingInComponent({ file, content, name: path.basename(file) })
        };

        results.push(analysis);
      } catch (error) {
        results.push({ file, exists: true, error: error.message });
      }
    } else {
      results.push({ file, exists: false });
    }
  });

  return results;
}

function checkFeatureComparisons() {
  const content = [];
  
  // Look for feature comparison text
  const featureFiles = [
    'src/components/FeatureComparison.tsx',
    'src/components/PlanComparison.tsx',
    'src/pages/Features.tsx'
  ];

  featureFiles.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        const fileContent = fs.readFileSync(file, 'utf8');
        
        const features = {
          file,
          hasFreePlan: fileContent.toLowerCase().includes('free'),
          hasProPlan: fileContent.toLowerCase().includes('pro'),
          hasUnlimitedText: fileContent.toLowerCase().includes('unlimited'),
          hasLimitText: fileContent.includes('3') && fileContent.toLowerCase().includes('invoice'),
          features: []
        };

        // Extract feature mentions
        const featureMatches = fileContent.match(/(?:✓|✗|check|cross).*?(?:invoice|feature|unlimited|limit)/gi);
        if (featureMatches) {
          features.features = featureMatches.map(f => f.trim());
        }

        content.push(features);
      } catch (error) {
        content.push({ file, error: error.message });
      }
    }
  });

  return content;
}

function runPricingDisplayCheck() {
  console.log('🔍 Scanning UI components for pricing...\n');

  const components = findUIComponents();
  
  if (components.length === 0) {
    console.log('⚠️  No UI components with pricing found');
    return;
  }

  console.log(`✅ Found ${components.length} components with potential pricing`);

  // Analyze each component
  const analyses = components.map(analyzePricingInComponent);
  
  // Summary stats
  const stats = {
    totalWithPricing: analyses.filter(a => a.allPrices.length > 0).length,
    withOldPricing: analyses.filter(a => a.hasOldPrice).length,
    withNewPricing: analyses.filter(a => a.hasNewPrice).length,
    withCorrectPricing: analyses.filter(a => a.hasCorrectPrice).length,
    withIssues: analyses.filter(a => a.issues.length > 0).length
  };

  console.log(`\n📊 Pricing Analysis Summary:`);
  console.log(`   💰 Components with pricing: ${stats.totalWithPricing}`);
  console.log(`   ${stats.withOldPricing === 0 ? '✅' : '❌'} Components with old $4.99: ${stats.withOldPricing}`);
  console.log(`   ${stats.withNewPricing > 0 ? '✅' : '❌'} Components with new $9.99: ${stats.withNewPricing}`);
  console.log(`   ${stats.withCorrectPricing === stats.totalWithPricing ? '✅' : '⚠️'} Components with correct pricing: ${stats.withCorrectPricing}`);

  // Detail report
  console.log(`\n🔍 Detailed Component Analysis:`);
  
  analyses.filter(a => a.allPrices.length > 0).forEach(analysis => {
    console.log(`\n   📄 ${analysis.name} (${analysis.file.replace('src/', '')})`);
    console.log(`      Prices found: ${analysis.allPrices.join(', ')}`);
    
    if (analysis.hasOldPrice) {
      console.log(`      ❌ Contains old pricing`);
    }
    
    if (analysis.hasNewPrice) {
      console.log(`      ✅ Contains new pricing`);
    }
    
    if (analysis.issues.length > 0) {
      analysis.issues.forEach(issue => {
        console.log(`      ⚠️  ${issue}`);
      });
    }

    // Show price contexts
    if (analysis.priceContexts.length > 0) {
      console.log(`      Context: "${analysis.priceContexts[0].context.substring(0, 80)}..."`);
    }
  });

  // Check specific upgrade components
  console.log(`\n🚀 Checking Critical Upgrade Components:`);
  const upgradeChecks = checkUpgradeComponents();
  
  upgradeChecks.forEach(check => {
    if (!check.exists) {
      console.log(`   ⚠️  ${path.basename(check.file)}: NOT FOUND`);
    } else if (check.error) {
      console.log(`   ❌ ${path.basename(check.file)}: ERROR - ${check.error}`);
    } else {
      console.log(`   📄 ${path.basename(check.file)}:`);
      console.log(`      ${check.hasStripeIntegration ? '✅' : '❌'} Stripe integration`);
      console.log(`      ${check.hasCorrectPriceId ? '✅' : '❌'} Correct price ID`);
      console.log(`      ${!check.hasOldPriceId ? '✅' : '❌'} Old price ID removed`);
      
      if (check.pricing.hasCorrectPrice) {
        console.log(`      ✅ Shows $9.99 pricing`);
      } else if (check.pricing.hasOldPrice) {
        console.log(`      ❌ Still shows $4.99 pricing`);
      } else {
        console.log(`      ⚠️  Pricing unclear`);
      }
    }
  });

  // Check feature comparisons
  console.log(`\n📋 Checking Feature Descriptions:`);
  const featureChecks = checkFeatureComparisons();
  
  if (featureChecks.length === 0) {
    console.log(`   ⚠️  No feature comparison components found`);
  } else {
    featureChecks.forEach(feature => {
      if (feature.error) {
        console.log(`   ❌ ${path.basename(feature.file)}: ${feature.error}`);
      } else {
        console.log(`   📄 ${path.basename(feature.file)}:`);
        console.log(`      ${feature.hasFreePlan ? '✅' : '⚠️'} Mentions free plan`);
        console.log(`      ${feature.hasProPlan ? '✅' : '⚠️'} Mentions pro plan`);
        console.log(`      ${feature.hasUnlimitedText ? '✅' : '❌'} Mentions unlimited`);
        console.log(`      ${!feature.hasLimitText ? '✅' : '❌'} Old 3-invoice limit removed`);
        
        if (feature.features.length > 0) {
          console.log(`      Features: ${feature.features.slice(0, 2).join(', ')}...`);
        }
      }
    });
  }

  // Final recommendations
  console.log(`\n📊 PRICING DISPLAY SUMMARY:`);
  const checks = [
    { name: 'Components found', passed: components.length > 0 },
    { name: 'No old pricing', passed: stats.withOldPricing === 0 },
    { name: 'Has new pricing', passed: stats.withNewPricing > 0 },
    { name: 'Upgrade components work', passed: upgradeChecks.some(u => u.hasCorrectPriceId) },
    { name: 'Feature descriptions updated', passed: featureChecks.some(f => f.hasUnlimitedText) }
  ];

  const passed = checks.filter(c => c.passed).length;
  console.log(`✅ Passed: ${passed}/${checks.length}`);
  console.log(`📈 Success Rate: ${Math.round((passed/checks.length)*100)}%`);

  if (passed === checks.length) {
    console.log('\n🎉 All pricing displays are correctly updated to $9.99!');
  } else {
    console.log('\n🚨 Pricing display issues detected:');
    checks.filter(c => !c.passed).forEach(check => {
      console.log(`   - ${check.name}`);
    });
    
    console.log('\n💡 Recommendations:');
    if (stats.withOldPricing > 0) {
      console.log('   - Update components still showing $4.99 pricing');
    }
    if (stats.withNewPricing === 0) {
      console.log('   - Add $9.99 pricing display to components');
    }
    if (!upgradeChecks.some(u => u.hasCorrectPriceId)) {
      console.log('   - Update Stripe price IDs in upgrade components');
    }
  }
}

runPricingDisplayCheck();
