#!/usr/bin/env node

/**
 * Debug Test #2: Environment Variables Check
 * Tests if all required environment variables are set correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🌍 DEBUG TEST #2: Environment Variables Check');
console.log('='.repeat(50));

const REQUIRED_ENV_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_STRIPE_PUBLISHABLE_KEY'
];

const OPTIONAL_ENV_VARS = [
  'VITE_FIREBASE_MEASUREMENT_ID',
  'VITE_EMAILJS_SERVICE_ID',
  'VITE_EMAILJS_TEMPLATE_ID',
  'VITE_EMAILJS_PUBLIC_KEY'
];

function loadEnvFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) return null;
    
    const content = fs.readFileSync(fullPath, 'utf8');
    const vars = {};
    
    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#') && line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        vars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    });
    
    return vars;
  } catch (error) {
    return null;
  }
}

function checkProcessEnv() {
  const processVars = {};
  REQUIRED_ENV_VARS.concat(OPTIONAL_ENV_VARS).forEach(varName => {
    if (process.env[varName]) {
      processVars[varName] = process.env[varName];
    }
  });
  return processVars;
}

function validateEnvVar(name, value) {
  const checks = {
    valid: true,
    issues: []
  };

  if (!value || value.trim() === '') {
    checks.valid = false;
    checks.issues.push('Empty or missing');
    return checks;
  }

  // Specific validations
  if (name.includes('FIREBASE_API_KEY')) {
    if (!value.startsWith('AIza') || value.length < 20) {
      checks.valid = false;
      checks.issues.push('Invalid Firebase API key format');
    }
  }

  if (name.includes('FIREBASE_PROJECT_ID')) {
    if (!/^[a-z0-9-]+$/.test(value)) {
      checks.valid = false;
      checks.issues.push('Invalid Firebase project ID format');
    }
  }

  if (name.includes('STRIPE_PUBLISHABLE_KEY')) {
    if (!value.startsWith('pk_') || value.length < 20) {
      checks.valid = false;
      checks.issues.push('Invalid Stripe publishable key format');
    }
  }

  if (name.includes('FIREBASE_AUTH_DOMAIN')) {
    if (!value.includes('.firebaseapp.com') && !value.includes('.web.app')) {
      checks.valid = false;
      checks.issues.push('Invalid Firebase auth domain');
    }
  }

  return checks;
}

function runEnvCheck() {
  console.log('📁 Checking environment files...\n');

  // Check for .env files
  const envFiles = ['.env', '.env.local', '.env.production'];
  const foundEnvFiles = [];
  
  envFiles.forEach(file => {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    console.log(exists ? '✅' : '⚠️', `${file} ${exists ? 'EXISTS' : 'NOT FOUND'}`);
    if (exists) foundEnvFiles.push(file);
  });

  // Load environment variables
  const allEnvVars = {};
  
  // From files
  foundEnvFiles.forEach(file => {
    const vars = loadEnvFile(file);
    if (vars) {
      Object.assign(allEnvVars, vars);
      console.log(`📄 Loaded ${Object.keys(vars).length} variables from ${file}`);
    }
  });

  // From process
  const processVars = checkProcessEnv();
  Object.assign(allEnvVars, processVars);
  
  console.log(`🔄 Found ${Object.keys(processVars).length} variables in process.env\n`);

  // Test required variables
  console.log('🔑 Testing REQUIRED environment variables...');
  let requiredPassed = 0;
  
  REQUIRED_ENV_VARS.forEach(varName => {
    const value = allEnvVars[varName];
    const validation = validateEnvVar(varName, value);
    
    if (validation.valid) {
      requiredPassed++;
      console.log(`✅ ${varName}: VALID`);
    } else {
      console.log(`❌ ${varName}: ${validation.issues.join(', ')}`);
    }
  });

  // Test optional variables
  console.log('\n🔧 Testing OPTIONAL environment variables...');
  let optionalPassed = 0;
  
  OPTIONAL_ENV_VARS.forEach(varName => {
    const value = allEnvVars[varName];
    
    if (value) {
      const validation = validateEnvVar(varName, value);
      if (validation.valid) {
        optionalPassed++;
        console.log(`✅ ${varName}: VALID`);
      } else {
        console.log(`⚠️ ${varName}: ${validation.issues.join(', ')}`);
      }
    } else {
      console.log(`⚠️ ${varName}: NOT SET`);
    }
  });

  // Summary
  console.log('\n📊 SUMMARY:');
  console.log(`✅ Required vars: ${requiredPassed}/${REQUIRED_ENV_VARS.length}`);
  console.log(`🔧 Optional vars: ${optionalPassed}/${OPTIONAL_ENV_VARS.length}`);
  
  const requiredRate = Math.round((requiredPassed / REQUIRED_ENV_VARS.length) * 100);
  console.log(`📈 Required Success Rate: ${requiredRate}%`);

  if (requiredRate === 100) {
    console.log('\n🎉 All required environment variables are properly configured!');
  } else {
    console.log('\n🚨 Some required environment variables are missing or invalid!');
    console.log('💡 Check your .env files and ensure all Firebase/Stripe keys are set.');
  }

  // Check for common issues
  console.log('\n🔍 SECURITY CHECK:');
  const hasTestKeys = Object.values(allEnvVars).some(val => 
    val && (val.includes('test') || val.includes('demo') || val.includes('example'))
  );
  
  if (hasTestKeys) {
    console.log('⚠️  Warning: Found test/demo keys - make sure you\'re using production keys!');
  } else {
    console.log('✅ No obvious test keys detected');
  }
}

runEnvCheck();
