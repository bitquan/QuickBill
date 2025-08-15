#!/usr/bin/env node

/**
 * Debug Test #6: Invoice Logic Check
 * Tests the unlimited invoice logic in the code
 */

const fs = require('fs');
const path = require('path');

console.log('📄 DEBUG TEST #6: Invoice Logic Check');
console.log('='.repeat(50));

function findStorageService() {
  const possiblePaths = [
    'src/services/storage.ts',
    'src/services/storage.js',
    'src/utils/storage.ts',
    'src/utils/storage.js',
    'src/core/storage.ts',
    'src/core/storage.js'
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        return { path: filePath, content, error: null };
      } catch (error) {
        return { path: filePath, content: null, error: error.message };
      }
    }
  }

  return null;
}

function analyzeStorageService(content) {
  const analysis = {
    hasGetUserData: false,
    hasGetRemainingInvoices: false,
    hasMaxInvoices: false,
    hasInfinityCheck: false,
    defaultMaxInvoices: null,
    infinityReferences: [],
    numberLimits: [],
    functions: []
  };

  // Find function definitions
  const functionMatches = content.match(/(?:function\s+|const\s+|export\s+(?:const\s+|function\s+))(\w+)/g);
  if (functionMatches) {
    analysis.functions = functionMatches.map(match => match.replace(/^.*?(\w+)$/, '$1'));
  }

  // Check for specific functions
  analysis.hasGetUserData = content.includes('getUserData');
  analysis.hasGetRemainingInvoices = content.includes('getRemainingInvoices') || content.includes('remaining');
  analysis.hasMaxInvoices = content.includes('maxInvoices');

  // Find Infinity references
  const infinityMatches = content.match(/Infinity/g);
  if (infinityMatches) {
    analysis.hasInfinityCheck = true;
    analysis.infinityReferences = infinityMatches;
  }

  // Find number limits
  const numberMatches = content.match(/maxInvoices[:\s]*(\d+)/g);
  if (numberMatches) {
    analysis.numberLimits = numberMatches;
  }

  // Find default maxInvoices value
  const defaultMatch = content.match(/maxInvoices[:\s]*([^,\n}]+)/);
  if (defaultMatch) {
    analysis.defaultMaxInvoices = defaultMatch[1].trim();
  }

  return analysis;
}

function findInvoiceComponents() {
  const directories = ['src/components', 'src/pages', 'src/screens'];
  const results = [];

  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      items.forEach(item => {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.isFile() && 
                  (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) && 
                  (item.name.toLowerCase().includes('invoice') || 
                   item.name.toLowerCase().includes('upgrade') ||
                   item.name.toLowerCase().includes('limit'))) {
          
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            
            const analysis = {
              file: fullPath,
              hasInvoiceLimit: content.includes('invoice') && (content.includes('limit') || content.includes('remaining')),
              hasUpgradeLogic: content.includes('upgrade') || content.includes('pro'),
              hasMaxInvoices: content.includes('maxInvoices'),
              hasInfinityCheck: content.includes('Infinity'),
              hasThreeLimit: content.includes('3') && content.includes('invoice'),
              limitReferences: []
            };

            // Find limit references
            const limitMatches = content.match(/\b(?:limit|remaining|max).*?(?:invoice|bill)/gi);
            if (limitMatches) {
              analysis.limitReferences = [...new Set(limitMatches)];
            }

            if (analysis.hasInvoiceLimit || analysis.hasUpgradeLogic || analysis.hasMaxInvoices) {
              results.push(analysis);
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
  return results;
}

function checkTypeScriptTypes() {
  const typeFiles = [
    'src/types/user.ts',
    'src/types/invoice.ts',
    'src/types/storage.ts',
    'src/types/index.ts'
  ];

  const results = [];

  typeFiles.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        const analysis = {
          file,
          hasUserType: content.includes('User') || content.includes('UserData'),
          hasInvoiceType: content.includes('Invoice'),
          hasMaxInvoicesProperty: content.includes('maxInvoices'),
          maxInvoicesType: null
        };

        // Find maxInvoices type definition
        const typeMatch = content.match(/maxInvoices[:\s]*([^;,\n}]+)/);
        if (typeMatch) {
          analysis.maxInvoicesType = typeMatch[1].trim();
        }

        results.push(analysis);
      } catch (error) {
        results.push({ file, error: error.message });
      }
    }
  });

  return results;
}

function testInvoiceLogic() {
  console.log('🔍 Searching for storage service...\n');

  const storageService = findStorageService();
  
  if (!storageService) {
    console.log('❌ No storage service found');
    console.log('   Expected locations: src/services/storage.ts, src/utils/storage.ts');
    return { storageFound: false };
  }

  console.log('✅ Storage service found:', storageService.path);

  if (storageService.error) {
    console.log('❌ Error reading storage service:', storageService.error);
    return { storageFound: true, readable: false };
  }

  // Analyze storage service
  console.log('\n🔧 Analyzing storage service logic...');
  const analysis = analyzeStorageService(storageService.content);

  console.log(analysis.hasGetUserData ? '✅' : '❌', 'getUserData function found');
  console.log(analysis.hasGetRemainingInvoices ? '✅' : '❌', 'Remaining invoices logic found');
  console.log(analysis.hasMaxInvoices ? '✅' : '❌', 'maxInvoices property found');
  console.log(analysis.hasInfinityCheck ? '✅' : '❌', 'Infinity references found');

  if (analysis.defaultMaxInvoices) {
    console.log(`📊 Default maxInvoices: ${analysis.defaultMaxInvoices}`);
    
    if (analysis.defaultMaxInvoices.includes('Infinity')) {
      console.log('✅ Unlimited invoices correctly implemented');
    } else if (analysis.defaultMaxInvoices.includes('3')) {
      console.log('❌ Still using old 3-invoice limit');
    } else {
      console.log('⚠️  Using custom limit:', analysis.defaultMaxInvoices);
    }
  }

  console.log(`🔢 Infinity references: ${analysis.infinityReferences.length}`);
  console.log(`📋 Functions found: ${analysis.functions.length}`);

  // Check invoice components
  console.log('\n📱 Checking invoice-related components...');
  const components = findInvoiceComponents();

  if (components.length === 0) {
    console.log('⚠️  No invoice-related components found');
  } else {
    console.log(`✅ Found ${components.length} invoice-related component(s)`);
    
    let componentsWithOldLogic = 0;
    let componentsWithNewLogic = 0;

    components.forEach(comp => {
      console.log(`\n   📄 ${comp.file.replace('src/', '')}`);
      console.log(`      Has limit logic: ${comp.hasInvoiceLimit ? 'Yes' : 'No'}`);
      console.log(`      Has upgrade logic: ${comp.hasUpgradeLogic ? 'Yes' : 'No'}`);
      console.log(`      Uses Infinity: ${comp.hasInfinityCheck ? 'Yes' : 'No'}`);
      console.log(`      Has 3-limit: ${comp.hasThreeLimit ? 'Yes' : 'No'}`);

      if (comp.hasThreeLimit) {
        componentsWithOldLogic++;
        console.log('      ⚠️  May contain old 3-invoice limit logic');
      }

      if (comp.hasInfinityCheck) {
        componentsWithNewLogic++;
        console.log('      ✅ Contains unlimited logic');
      }

      if (comp.limitReferences.length > 0) {
        console.log(`      References: ${comp.limitReferences.slice(0, 3).join(', ')}`);
      }
    });

    console.log(`\n   📊 Component Summary:`);
    console.log(`   ${componentsWithOldLogic === 0 ? '✅' : '❌'} Components with old logic: ${componentsWithOldLogic}`);
    console.log(`   ${componentsWithNewLogic > 0 ? '✅' : '❌'} Components with new logic: ${componentsWithNewLogic}`);
  }

  // Check TypeScript types
  console.log('\n🔷 Checking TypeScript type definitions...');
  const types = checkTypeScriptTypes();

  types.forEach(type => {
    if (type.error) {
      console.log(`❌ ${type.file}: ${type.error}`);
    } else if (type.hasMaxInvoicesProperty) {
      console.log(`✅ ${type.file}: maxInvoices property found`);
      if (type.maxInvoicesType) {
        console.log(`   Type: ${type.maxInvoicesType}`);
        
        if (type.maxInvoicesType.includes('number')) {
          console.log('   ✅ Allows numeric values (including Infinity)');
        } else {
          console.log('   ⚠️  May not support Infinity values');
        }
      }
    }
  });

  // Summary
  console.log('\n📊 INVOICE LOGIC SUMMARY:');
  const checks = [
    { name: 'Storage service exists', passed: !!storageService },
    { name: 'Has unlimited logic', passed: analysis.hasInfinityCheck },
    { name: 'Default is unlimited', passed: analysis.defaultMaxInvoices && analysis.defaultMaxInvoices.includes('Infinity') },
    { name: 'Components updated', passed: components.length === 0 || components.every(c => !c.hasThreeLimit) },
    { name: 'Has invoice functions', passed: analysis.hasGetUserData && analysis.hasMaxInvoices }
  ];

  const passed = checks.filter(c => c.passed).length;
  console.log(`✅ Passed: ${passed}/${checks.length}`);
  console.log(`📈 Success Rate: ${Math.round((passed/checks.length)*100)}%`);

  if (passed === checks.length) {
    console.log('\n🎉 Invoice logic is correctly implemented for unlimited invoices!');
  } else {
    console.log('\n🚨 Invoice logic issues detected:');
    checks.filter(c => !c.passed).forEach(check => {
      console.log(`   - ${check.name}`);
    });
    
    console.log('\n💡 Recommendations:');
    if (!analysis.hasInfinityCheck) {
      console.log('   - Update storage service to use Infinity for maxInvoices');
    }
    if (components.some(c => c.hasThreeLimit)) {
      console.log('   - Remove old 3-invoice limit references from components');
    }
  }

  return {
    storageFound: true,
    readable: true,
    analysis,
    components,
    types
  };
}

testInvoiceLogic();
