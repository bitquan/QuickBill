#!/usr/bin/env node

/**
 * Debug Test #4: Firebase Settings Check
 * Tests Firebase configuration and connection
 */

const https = require('https');
const fs = require('fs');

console.log('🔥 DEBUG TEST #4: Firebase Settings Check');
console.log('='.repeat(50));

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

function loadFirebaseConfig() {
  try {
    // Try to load from various sources
    const sources = [
      'src/config/firebase.ts',
      'src/config/firebase.js',
      'firebase.json'
    ];

    for (const source of sources) {
      if (fs.existsSync(source)) {
        const content = fs.readFileSync(source, 'utf8');
        
        if (source.endsWith('.json')) {
          const config = JSON.parse(content);
          // Check if it has project info in hosting config
          if (config.hosting && config.hosting.site) {
            return {
              source,
              config: {
                projectId: config.hosting.site.split('-').slice(0, -1).join('-') || config.hosting.site,
                hosting: config.hosting
              }
            };
          }
          return { source, config };
        } else {
          // Extract config from TypeScript/JavaScript file
          const projectIdMatch = content.match(/projectId[:\s]*import\.meta\.env\.VITE_FIREBASE_PROJECT_ID/);
          const authDomainMatch = content.match(/authDomain[:\s]*import\.meta\.env\.VITE_FIREBASE_AUTH_DOMAIN/);
          const apiKeyMatch = content.match(/apiKey[:\s]*import\.meta\.env\.VITE_FIREBASE_API_KEY/);
          
          // Also check for direct values
          const directProjectId = content.match(/projectId[:\s]*['"`]([^'"`]+)['"`]/);
          const directAuthDomain = content.match(/authDomain[:\s]*['"`]([^'"`]+)['"`]/);
          const directApiKey = content.match(/apiKey[:\s]*['"`]([^'"`]+)['"`]/);
          
          if (projectIdMatch || directProjectId) {
            return {
              source,
              config: {
                projectId: directProjectId ? directProjectId[1] : 'From Environment Variable',
                authDomain: directAuthDomain ? directAuthDomain[1] : (authDomainMatch ? 'From Environment Variable' : null),
                apiKey: directApiKey ? directApiKey[1] : (apiKeyMatch ? 'From Environment Variable' : null),
                usesEnvVars: !!(projectIdMatch || authDomainMatch || apiKeyMatch)
              }
            };
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    return { error: error.message };
  }
}

async function testFirebaseProject(projectId) {
  try {
    const options = {
      hostname: `${projectId}.firebaseapp.com`,
      port: 443,
      path: '/',
      method: 'GET',
      headers: { 'User-Agent': 'QuickBill-Debug/1.0' }
    };

    const result = await makeRequest(options);
    return {
      accessible: result.status < 400,
      status: result.status,
      hosted: result.data.includes('<!DOCTYPE html>') || result.data.includes('<html')
    };
  } catch (error) {
    return {
      accessible: false,
      error: error.message
    };
  }
}

async function testFirestore(projectId) {
  try {
    const options = {
      hostname: 'firestore.googleapis.com',
      port: 443,
      path: `/v1/projects/${projectId}/databases/(default)/documents`,
      method: 'GET',
      headers: { 'User-Agent': 'QuickBill-Debug/1.0' }
    };

    const result = await makeRequest(options);
    return {
      accessible: result.status === 200 || result.status === 401, // 401 is normal without auth
      status: result.status,
      configured: result.status !== 404
    };
  } catch (error) {
    return {
      accessible: false,
      error: error.message
    };
  }
}

async function checkFirestoreRules() {
  try {
    if (!fs.existsSync('firestore.rules')) {
      return { exists: false };
    }

    const rules = fs.readFileSync('firestore.rules', 'utf8');
    
    // Check for basic security patterns
    const hasAuth = rules.includes('request.auth');
    const hasUserCheck = rules.includes('request.auth.uid');
    const allowsRead = rules.includes('allow read');
    const allowsWrite = rules.includes('allow write');
    const hasValidation = rules.includes('resource.data') || rules.includes('request.resource.data');

    return {
      exists: true,
      content: rules,
      security: {
        hasAuth,
        hasUserCheck,
        allowsRead,
        allowsWrite,
        hasValidation
      }
    };
  } catch (error) {
    return { exists: true, error: error.message };
  }
}

function checkFirebaseHosting() {
  try {
    if (!fs.existsSync('firebase.json')) {
      return { configured: false, reason: 'No firebase.json found' };
    }

    const config = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
    const hosting = config.hosting;

    if (!hosting) {
      return { configured: false, reason: 'No hosting config in firebase.json' };
    }

    return {
      configured: true,
      public: hosting.public || 'dist',
      rewrites: hosting.rewrites || [],
      headers: hosting.headers || [],
      redirects: hosting.redirects || []
    };
  } catch (error) {
    return { configured: false, error: error.message };
  }
}

async function runFirebaseCheck() {
  console.log('🔍 Loading Firebase configuration...\n');

  const configResult = loadFirebaseConfig();
  
  if (!configResult) {
    console.log('❌ No Firebase configuration found');
    console.log('   Expected files: firebase.json, src/config/firebase.ts');
    return;
  }

  if (configResult.error) {
    console.log('❌ Error loading Firebase config:', configResult.error);
    return;
  }

  console.log('✅ Firebase config loaded from:', configResult.source);
  
  const config = configResult.config;
  
  // Basic config validation
  console.log('\n🔧 Validating configuration...');
  
  const projectId = config.projectId || config.firestore?.projectId;
  const authDomain = config.authDomain;
  const apiKey = config.apiKey;

  console.log(projectId ? '✅' : '❌', `Project ID: ${projectId || 'MISSING'}`);
  console.log(authDomain ? '✅' : '⚠️', `Auth Domain: ${authDomain || 'NOT SET'}`);
  console.log(apiKey ? '✅' : '⚠️', `API Key: ${apiKey ? 'SET' : 'NOT SET'}`);

  if (!projectId) {
    console.log('\n❌ Cannot continue without Project ID');
    return;
  }

  // Test Firebase project
  console.log('\n🔥 Testing Firebase project connectivity...');
  const projectTest = await testFirebaseProject(projectId);
  
  if (projectTest.accessible) {
    console.log('✅ Firebase project is accessible');
    console.log(`   Status: ${projectTest.status}`);
    if (projectTest.hosted) {
      console.log('✅ Firebase hosting is working');
    } else {
      console.log('⚠️  Firebase hosting may not be configured');
    }
  } else {
    console.log('❌ Firebase project not accessible');
    if (projectTest.error) {
      console.log(`   Error: ${projectTest.error}`);
    }
  }

  // Test Firestore
  console.log('\n🗄️  Testing Firestore database...');
  const firestoreTest = await testFirestore(projectId);
  
  if (firestoreTest.accessible) {
    console.log('✅ Firestore database is accessible');
    console.log(`   Status: ${firestoreTest.status}`);
  } else {
    console.log('❌ Firestore database not accessible');
    if (firestoreTest.error) {
      console.log(`   Error: ${firestoreTest.error}`);
    }
  }

  // Check Firestore rules
  console.log('\n🔒 Checking Firestore security rules...');
  const rulesCheck = checkFirestoreRules();
  
  if (rulesCheck.exists) {
    console.log('✅ Firestore rules file exists');
    
    if (rulesCheck.security) {
      const sec = rulesCheck.security;
      console.log(sec.hasAuth ? '✅' : '⚠️', 'Authentication checks');
      console.log(sec.hasUserCheck ? '✅' : '⚠️', 'User ID validation');
      console.log(sec.allowsRead ? '✅' : '❌', 'Read permissions');
      console.log(sec.allowsWrite ? '✅' : '❌', 'Write permissions');
      console.log(sec.hasValidation ? '✅' : '⚠️', 'Data validation');
    }
  } else {
    console.log('❌ No firestore.rules file found');
  }

  // Check hosting configuration
  console.log('\n🌐 Checking Firebase hosting configuration...');
  const hostingCheck = checkFirebaseHosting();
  
  if (hostingCheck.configured) {
    console.log('✅ Firebase hosting configured');
    console.log(`   Public directory: ${hostingCheck.public}`);
    console.log(`   Rewrites: ${hostingCheck.rewrites.length} rules`);
    console.log(`   Headers: ${hostingCheck.headers.length} rules`);
  } else {
    console.log('❌ Firebase hosting not configured');
    if (hostingCheck.reason) {
      console.log(`   Reason: ${hostingCheck.reason}`);
    }
  }

  // Summary
  console.log('\n📊 FIREBASE SUMMARY:');
  const checks = [
    { name: 'Config loaded', passed: !!configResult && !configResult.error },
    { name: 'Project accessible', passed: projectTest.accessible },
    { name: 'Firestore accessible', passed: firestoreTest.accessible },
    { name: 'Security rules exist', passed: rulesCheck.exists },
    { name: 'Hosting configured', passed: hostingCheck.configured }
  ];

  const passed = checks.filter(c => c.passed).length;
  console.log(`✅ Passed: ${passed}/${checks.length}`);
  console.log(`📈 Success Rate: ${Math.round((passed/checks.length)*100)}%`);

  if (passed === checks.length) {
    console.log('\n🎉 Firebase is fully configured and working!');
  } else {
    console.log('\n🚨 Firebase configuration issues:');
    checks.filter(c => !c.passed).forEach(check => {
      console.log(`   - ${check.name}`);
    });
  }
}

runFirebaseCheck();
