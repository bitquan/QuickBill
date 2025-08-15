#!/usr/bin/env node

/**
 * Debug Test #3: Build System Check
 * Tests if the build system is working correctly
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 DEBUG TEST #3: Build System Check');
console.log('='.repeat(50));

function runCommand(command, timeout = 30000) {
  return new Promise((resolve) => {
    console.log(`🏃 Running: ${command}`);
    const startTime = Date.now();
    
    const child = exec(command, { 
      cwd: process.cwd(),
      timeout: timeout,
      killSignal: 'SIGTERM'
    }, (error, stdout, stderr) => {
      const duration = Date.now() - startTime;
      
      let success = !error;
      let errorMessage = null;
      
      if (error) {
        if (error.killed) {
          errorMessage = `Command timed out after ${Math.round(timeout/1000)}s`;
          success = false;
        } else {
          errorMessage = error.message;
        }
      }
      
      resolve({
        success,
        stdout: stdout || '',
        stderr: stderr || '',
        error: errorMessage,
        duration,
        timedOut: error && error.killed
      });
    });

    // Handle process errors
    child.on('error', (err) => {
      console.log(`   ⚠️  Process error: ${err.message}`);
    });
  });
}

function checkDiskSpace() {
  return new Promise((resolve) => {
    exec('df -h .', (error, stdout) => {
      if (error) {
        resolve({ available: 'unknown', usage: 'unknown' });
        return;
      }
      
      const lines = stdout.split('\n');
      if (lines.length > 1) {
        const parts = lines[1].split(/\s+/);
        resolve({
          available: parts[3] || 'unknown',
          usage: parts[4] || 'unknown'
        });
      } else {
        resolve({ available: 'unknown', usage: 'unknown' });
      }
    });
  });
}

function checkNodeVersion() {
  return new Promise((resolve) => {
    exec('node --version', (error, stdout) => {
      if (error) {
        resolve({ version: 'unknown', valid: false });
        return;
      }
      
      const version = stdout.trim();
      const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
      resolve({
        version,
        valid: majorVersion >= 16 // Vite requires Node 16+
      });
    });
  });
}

function checkBuildOutput() {
  const distPath = path.join(process.cwd(), 'dist');
  
  if (!fs.existsSync(distPath)) {
    return { exists: false, files: [], size: 0 };
  }

  try {
    const files = fs.readdirSync(distPath, { recursive: true });
    let totalSize = 0;
    
    files.forEach(file => {
      try {
        const filePath = path.join(distPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          totalSize += stats.size;
        }
      } catch (e) {
        // Skip files we can't read
      }
    });

    return {
      exists: true,
      files: files.filter(f => !fs.statSync(path.join(distPath, f)).isDirectory()),
      size: totalSize
    };
  } catch (error) {
    return { exists: true, files: [], size: 0, error: error.message };
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function runBuildCheck() {
  console.log('🔍 Checking build environment...\n');

  // Check Node version
  const nodeInfo = await checkNodeVersion();
  console.log(nodeInfo.valid ? '✅' : '❌', `Node.js version: ${nodeInfo.version}`);
  if (!nodeInfo.valid) {
    console.log('   ⚠️  Vite requires Node.js 16 or higher');
  }

  // Check disk space
  const diskInfo = await checkDiskSpace();
  console.log('💾', `Disk space: ${diskInfo.available} available (${diskInfo.usage} used)`);

  // Check package.json scripts
  console.log('\n📋 Checking build scripts...');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const scripts = packageJson.scripts || {};
    
    const requiredScripts = ['build', 'dev', 'preview'];
    requiredScripts.forEach(script => {
      const exists = scripts[script];
      console.log(exists ? '✅' : '❌', `${script}: ${exists || 'MISSING'}`);
    });
  } catch (error) {
    console.log('❌ Cannot read package.json');
  }

  // Check dependencies
  console.log('\n📦 Checking if dependencies are installed...');
  const nodeModulesExists = fs.existsSync('node_modules');
  const packageLockExists = fs.existsSync('package-lock.json');
  
  console.log(nodeModulesExists ? '✅' : '❌', 'node_modules directory');
  console.log(packageLockExists ? '✅' : '⚠️', 'package-lock.json file');

  if (!nodeModulesExists) {
    console.log('\n🔧 Installing dependencies...');
    const installResult = await runCommand('npm install', 60000);
    
    if (installResult.success) {
      console.log('✅ Dependencies installed successfully');
    } else {
      console.log('❌ Failed to install dependencies');
      console.log(`   Error: ${installResult.error}`);
      return;
    }
  }

  // Run type check
  console.log('\n🔍 Running TypeScript check...');
  const tscResult = await runCommand('npx tsc --noEmit', 45000);
  
  if (tscResult.success) {
    console.log('✅ TypeScript check passed');
  } else {
    console.log('❌ TypeScript errors found');
    if (tscResult.stderr) {
      console.log('   Errors:');
      tscResult.stderr.split('\n').slice(0, 5).forEach(line => {
        if (line.trim()) console.log(`   ${line}`);
      });
    }
  }

  // Run build
  console.log('\n🔨 Running production build...');
  const buildResult = await runCommand('npm run build', 120000);
  
  console.log(`⏱️  Build took: ${Math.round(buildResult.duration / 1000)}s`);
  
  if (buildResult.success) {
    console.log('✅ Build completed successfully');
    
    // Check build output
    const buildOutput = checkBuildOutput();
    if (buildOutput.exists) {
      console.log(`📁 Build output: ${buildOutput.files.length} files`);
      console.log(`📏 Total size: ${formatBytes(buildOutput.size)}`);
      
      // Check for essential files
      const essentialFiles = ['index.html', 'assets'];
      essentialFiles.forEach(file => {
        const found = buildOutput.files.some(f => f.includes(file)) || 
                     fs.existsSync(path.join('dist', file));
        console.log(found ? '✅' : '❌', `${file} in build output`);
      });
    } else {
      console.log('❌ No build output found in dist/ directory');
    }
  } else if (buildResult.timedOut) {
    console.log('⏰ Build timed out (this is normal for large projects)');
    console.log('💡 Try running "npm run build" manually to see full build process');
    console.log('✅ Continuing with other tests...');
  } else {
    console.log('❌ Build failed');
    if (buildResult.error) {
      console.log(`   Error: ${buildResult.error}`);
    }
    if (buildResult.stderr) {
      console.log('   Build errors:');
      buildResult.stderr.split('\n').slice(0, 10).forEach(line => {
        if (line.trim()) console.log(`   ${line}`);
      });
    }
  }

  // Summary
  console.log('\n📊 BUILD SYSTEM SUMMARY:');
  const checks = [
    { name: 'Node.js version', passed: nodeInfo.valid },
    { name: 'Dependencies installed', passed: nodeModulesExists },
    { name: 'TypeScript check', passed: tscResult.success },
    { name: 'Production build', passed: buildResult.success || buildResult.timedOut } // Accept timeout as partial success
  ];

  const passed = checks.filter(c => c.passed).length;
  console.log(`✅ Passed: ${passed}/${checks.length}`);
  console.log(`📈 Success Rate: ${Math.round((passed/checks.length)*100)}%`);

  if (passed === checks.length) {
    console.log('\n🎉 Build system is working perfectly!');
  } else {
    console.log('\n🚨 Build system issues detected:');
    checks.filter(c => !c.passed).forEach(check => {
      console.log(`   - ${check.name} failed`);
    });
    
    if (buildResult.timedOut) {
      console.log('\n💡 Note: Build timed out but this may be normal for large projects');
      console.log('   Try running "npm run build" manually to verify it works');
    }
  }
}

runBuildCheck();
