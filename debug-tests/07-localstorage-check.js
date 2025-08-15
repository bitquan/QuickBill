#!/usr/bin/env node

/**
 * Debug Test #7: Local Storage Check
 * Tests how the app handles local storage for user data and invoices
 */

const fs = require('fs');

console.log('💾 DEBUG TEST #7: Local Storage Check');
console.log('='.repeat(50));

function findLocalStorageUsage() {
  const directories = ['src'];
  const results = [];

  function searchDirectory(dir) {
    if (!fs.existsSync(dir)) return;

    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      items.forEach(item => {
        if (item.isDirectory()) {
          searchDirectory(`${dir}/${item.name}`);
        } else if (item.name.endsWith('.ts') || item.name.endsWith('.tsx') || 
                  item.name.endsWith('.js') || item.name.endsWith('.jsx')) {
          
          const filePath = `${dir}/${item.name}`;
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            if (content.includes('localStorage') || content.includes('storage')) {
              const analysis = {
                file: filePath,
                content,
                localStorage: {
                  getItem: (content.match(/localStorage\.getItem/g) || []).length,
                  setItem: (content.match(/localStorage\.setItem/g) || []).length,
                  removeItem: (content.match(/localStorage\.removeItem/g) || []).length,
                  clear: (content.match(/localStorage\.clear/g) || []).length
                },
                storageKeys: [],
                hasUserData: content.includes('userData') || content.includes('user_data'),
                hasInvoiceData: content.includes('invoice') && content.includes('storage'),
                hasMaxInvoices: content.includes('maxInvoices'),
                hasInfinityHandling: content.includes('Infinity')
              };

              // Find storage keys
              const keyMatches = content.match(/localStorage\.(?:getItem|setItem|removeItem)\(['"`]([^'"`]+)['"`]\)/g);
              if (keyMatches) {
                analysis.storageKeys = keyMatches.map(match => {
                  const keyMatch = match.match(/['"`]([^'"`]+)['"`]/);
                  return keyMatch ? keyMatch[1] : null;
                }).filter(Boolean);
              }

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

  searchDirectory('src');
  return results;
}

function analyzeStorageStructure(storageFiles) {
  const analysis = {
    totalFiles: storageFiles.length,
    operations: {
      reads: 0,
      writes: 0,
      deletes: 0,
      clears: 0
    },
    allKeys: new Set(),
    userDataHandling: [],
    invoiceHandling: [],
    migrationLogic: []
  };

  storageFiles.forEach(file => {
    analysis.operations.reads += file.localStorage.getItem;
    analysis.operations.writes += file.localStorage.setItem;
    analysis.operations.deletes += file.localStorage.removeItem;
    analysis.operations.clears += file.localStorage.clear;

    file.storageKeys.forEach(key => analysis.allKeys.add(key));

    if (file.hasUserData) {
      analysis.userDataHandling.push(file.file);
    }

    if (file.hasInvoiceData) {
      analysis.invoiceHandling.push(file.file);
    }

    // Check for migration logic
    if (file.content.includes('migrate') || file.content.includes('version') || 
        file.content.includes('upgrade') && file.content.includes('storage')) {
      analysis.migrationLogic.push(file.file);
    }
  });

  return analysis;
}

function testStorageDefaults() {
  const storageService = 'src/services/storage.ts';
  
  if (!fs.existsSync(storageService)) {
    return { exists: false };
  }

  try {
    const content = fs.readFileSync(storageService, 'utf8');
    
    const test = {
      exists: true,
      content,
      defaultUserData: null,
      maxInvoicesDefault: null,
      hasInfinityDefault: false,
      hasVersioning: false,
      hasMigration: false
    };

    // Find default user data structure
    const defaultMatch = content.match(/(?:defaultUser|userData.*?=|return.*?)[\s\S]*?\{[\s\S]*?\}/);
    if (defaultMatch) {
      test.defaultUserData = defaultMatch[0];
    }

    // Find maxInvoices default
    const maxInvoicesMatch = content.match(/maxInvoices[:\s]*([^,\n}]+)/);
    if (maxInvoicesMatch) {
      test.maxInvoicesDefault = maxInvoicesMatch[1].trim();
      test.hasInfinityDefault = test.maxInvoicesDefault.includes('Infinity');
    }

    // Check for versioning
    test.hasVersioning = content.includes('version') && content.includes('storage');
    test.hasMigration = content.includes('migrate') || content.includes('upgrade');

    return test;
  } catch (error) {
    return { exists: true, error: error.message };
  }
}

function checkStorageCompatibility() {
  const checks = {
    browserSupport: true,
    quotaHandling: false,
    errorHandling: false,
    typeChecking: false,
    jsonParsing: false
  };

  // This would need to run in browser, so we'll check for patterns in code
  const storageFiles = findLocalStorageUsage();
  
  storageFiles.forEach(file => {
    const content = file.content;
    
    if (content.includes('try') && content.includes('catch') && content.includes('localStorage')) {
      checks.errorHandling = true;
    }
    
    if (content.includes('JSON.parse') || content.includes('JSON.stringify')) {
      checks.jsonParsing = true;
    }
    
    if (content.includes('typeof') || content.includes('instanceof')) {
      checks.typeChecking = true;
    }
    
    if (content.includes('quota') || content.includes('QUOTA_EXCEEDED')) {
      checks.quotaHandling = true;
    }
  });

  return checks;
}

function runLocalStorageCheck() {
  console.log('🔍 Scanning for localStorage usage...\n');

  const storageFiles = findLocalStorageUsage();
  
  if (storageFiles.length === 0) {
    console.log('⚠️  No localStorage usage found');
    console.log('   This might indicate the app doesn\'t persist data locally');
    return;
  }

  console.log(`✅ Found localStorage usage in ${storageFiles.length} file(s)`);

  // Analyze storage structure
  const analysis = analyzeStorageStructure(storageFiles);
  
  console.log(`\n📊 Storage Operations Analysis:`);
  console.log(`   📖 Read operations: ${analysis.operations.reads}`);
  console.log(`   ✏️  Write operations: ${analysis.operations.writes}`);
  console.log(`   🗑️  Delete operations: ${analysis.operations.deletes}`);
  console.log(`   🧹 Clear operations: ${analysis.operations.clears}`);

  console.log(`\n🔑 Storage Keys Found (${analysis.allKeys.size}):`);
  [...analysis.allKeys].forEach(key => {
    console.log(`   - ${key}`);
  });

  // Check specific functionality
  console.log(`\n🔍 Functionality Check:`);
  console.log(analysis.userDataHandling.length > 0 ? '✅' : '❌', `User data handling (${analysis.userDataHandling.length} files)`);
  console.log(analysis.invoiceHandling.length > 0 ? '✅' : '❌', `Invoice data handling (${analysis.invoiceHandling.length} files)`);
  console.log(analysis.migrationLogic.length > 0 ? '✅' : '⚠️', `Migration logic (${analysis.migrationLogic.length} files)`);

  // Test storage defaults
  console.log('\n🔧 Testing Storage Service Defaults...');
  const storageTest = testStorageDefaults();
  
  if (!storageTest.exists) {
    console.log('❌ Storage service not found');
  } else if (storageTest.error) {
    console.log('❌ Error reading storage service:', storageTest.error);
  } else {
    console.log('✅ Storage service found');
    console.log(storageTest.maxInvoicesDefault ? '✅' : '❌', `maxInvoices default: ${storageTest.maxInvoicesDefault || 'NOT SET'}`);
    console.log(storageTest.hasInfinityDefault ? '✅' : '❌', 'Uses Infinity for unlimited invoices');
    console.log(storageTest.hasVersioning ? '✅' : '⚠️', 'Has version management');
    console.log(storageTest.hasMigration ? '✅' : '⚠️', 'Has migration logic');
  }

  // Check compatibility features
  console.log('\n🛡️  Storage Compatibility Check...');
  const compatibility = checkStorageCompatibility();
  
  console.log(compatibility.errorHandling ? '✅' : '❌', 'Error handling (try/catch)');
  console.log(compatibility.jsonParsing ? '✅' : '❌', 'JSON serialization');
  console.log(compatibility.typeChecking ? '✅' : '⚠️', 'Type checking');
  console.log(compatibility.quotaHandling ? '✅' : '⚠️', 'Storage quota handling');

  // Test for unlimited invoice logic in storage
  console.log('\n🔄 Testing Unlimited Invoice Storage Logic...');
  
  let hasUnlimitedLogic = false;
  let hasOldLimitLogic = false;
  
  storageFiles.forEach(file => {
    if (file.hasMaxInvoices) {
      console.log(`📄 ${file.file.replace('src/', '')}`);
      
      if (file.hasInfinityHandling) {
        hasUnlimitedLogic = true;
        console.log('   ✅ Contains Infinity handling');
      }
      
      if (file.content.includes('maxInvoices: 3') || 
          (file.content.includes('3') && file.content.includes('invoice') && file.content.includes('limit'))) {
        hasOldLimitLogic = true;
        console.log('   ❌ Contains old 3-invoice limit');
      }
      
      // Check specific storage patterns
      if (file.content.includes('getRemainingInvoices')) {
        const infinityCheck = file.content.includes('Infinity') && file.content.includes('remaining');
        console.log(infinityCheck ? '   ✅' : '   ❌', 'Remaining invoices handles Infinity');
      }
    }
  });

  // Generate storage test simulation
  console.log('\n🧪 Storage Logic Simulation:');
  console.log('   Testing what would happen with new user...');
  
  if (storageTest.hasInfinityDefault) {
    console.log('   ✅ New user would get unlimited invoices (Infinity)');
    console.log('   ✅ getRemainingInvoices() would return Infinity');
    console.log('   ✅ User can create invoices without limits');
  } else if (storageTest.maxInvoicesDefault === '3') {
    console.log('   ❌ New user would still get 3-invoice limit');
    console.log('   ❌ Old logic still active');
  } else {
    console.log(`   ⚠️  New user would get: ${storageTest.maxInvoicesDefault}`);
  }

  // Summary
  console.log('\n📊 LOCAL STORAGE SUMMARY:');
  const checks = [
    { name: 'Storage implementation found', passed: storageFiles.length > 0 },
    { name: 'User data handling', passed: analysis.userDataHandling.length > 0 },
    { name: 'Unlimited logic present', passed: hasUnlimitedLogic },
    { name: 'Old limits removed', passed: !hasOldLimitLogic },
    { name: 'Error handling', passed: compatibility.errorHandling },
    { name: 'Infinity default set', passed: storageTest.hasInfinityDefault }
  ];

  const passed = checks.filter(c => c.passed).length;
  console.log(`✅ Passed: ${passed}/${checks.length}`);
  console.log(`📈 Success Rate: ${Math.round((passed/checks.length)*100)}%`);

  if (passed === checks.length) {
    console.log('\n🎉 Local storage is properly configured for unlimited invoices!');
  } else {
    console.log('\n🚨 Local storage issues detected:');
    checks.filter(c => !c.passed).forEach(check => {
      console.log(`   - ${check.name}`);
    });
    
    console.log('\n💡 What this means for users:');
    if (!storageTest.hasInfinityDefault) {
      console.log('   - New users may still see invoice limits');
      console.log('   - Existing users may need to clear storage or wait for migration');
    }
    if (hasOldLimitLogic) {
      console.log('   - Some components may still enforce old 3-invoice limit');
    }
  }
}

runLocalStorageCheck();
