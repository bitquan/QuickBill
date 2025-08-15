#!/usr/bin/env node

/**
 * Debug Test #1: Settings Configuration Check
 * Tests if all settings files exist and contain correct configurations
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 DEBUG TEST #1: Settings Configuration Check');
console.log('='.repeat(50));

const SETTINGS_FILES = [
  { path: 'package.json', required: true },
  { path: 'vite.config.ts', required: true },
  { path: 'firebase.json', required: true },
  { path: 'firestore.rules', required: true },
  { path: 'src/config/firebase.ts', required: false },
  { path: 'src/config/stripe.ts', required: false },
  { path: '.env', required: false },
  { path: '.env.local', required: false },
  { path: 'vercel.json', required: true }
];

const CRITICAL_CONFIGS = {
  'package.json': ['name', 'version', 'scripts'],
  'firebase.json': ['hosting', 'firestore'],
  'vite.config.ts': ['build', 'define']
};

function checkFileExists(filePath) {
  try {
    return fs.existsSync(path.join(process.cwd(), filePath));
  } catch (error) {
    return false;
  }
}

function readFileContent(filePath) {
  try {
    return fs.readFileSync(path.join(process.cwd(), filePath), 'utf8');
  } catch (error) {
    return null;
  }
}

function checkConfigContent(filePath, content) {
  const results = [];
  const requiredKeys = CRITICAL_CONFIGS[filePath];
  
  if (!requiredKeys) return results;

  try {
    if (filePath.endsWith('.json')) {
      const config = JSON.parse(content);
      requiredKeys.forEach(key => {
        const exists = config.hasOwnProperty(key);
        results.push({
          key,
          exists,
          value: exists ? typeof config[key] : 'missing'
        });
      });
    } else if (filePath.endsWith('.ts')) {
      requiredKeys.forEach(key => {
        const exists = content.includes(key);
        results.push({
          key,
          exists,
          value: exists ? 'found' : 'missing'
        });
      });
    }
  } catch (error) {
    results.push({ key: 'parse_error', exists: false, value: error.message });
  }

  return results;
}

function runSettingsCheck() {
  console.log('📁 Checking configuration files...\n');
  
  let totalTests = 0;
  let passedTests = 0;
  const issues = [];

  SETTINGS_FILES.forEach(file => {
    totalTests++;
    const exists = checkFileExists(file.path);
    
    console.log(
      exists ? '✅' : (file.required ? '❌' : '⚠️'),
      `${file.path} ${exists ? 'EXISTS' : 'MISSING'}`
    );

    if (exists) {
      passedTests++;
      const content = readFileContent(file.path);
      
      if (content) {
        const configChecks = checkConfigContent(file.path, content);
        
        configChecks.forEach(check => {
          totalTests++;
          if (check.exists) {
            passedTests++;
            console.log(`    ✅ ${check.key}: ${check.value}`);
          } else {
            console.log(`    ❌ ${check.key}: ${check.value}`);
            issues.push(`${file.path}: Missing ${check.key}`);
          }
        });
      }
    } else if (file.required) {
      issues.push(`Required file missing: ${file.path}`);
    }
    
    console.log();
  });

  // Check for pricing configuration
  console.log('💰 Checking pricing configuration...');
  const packageContent = readFileContent('package.json');
  if (packageContent) {
    const hasPriceId = packageContent.includes('price_1RwA92Dfc44028kidd3L70MD');
    const hasOldPriceId = packageContent.includes('price_1RvkbDDfc44028ki94G00DCn');
    
    console.log(hasPriceId ? '✅' : '❌', 'New Stripe price ID configured');
    console.log(!hasOldPriceId ? '✅' : '❌', 'Old Stripe price ID removed');
    
    if (!hasPriceId) issues.push('New Stripe price ID not found in package.json');
    if (hasOldPriceId) issues.push('Old Stripe price ID still present');
  }

  console.log('\n📊 RESULTS:');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`📈 Success Rate: ${Math.round((passedTests/totalTests)*100)}%`);

  if (issues.length > 0) {
    console.log('\n🚨 ISSUES FOUND:');
    issues.forEach(issue => console.log(`   - ${issue}`));
  } else {
    console.log('\n🎉 All configuration checks passed!');
  }
}

runSettingsCheck();
