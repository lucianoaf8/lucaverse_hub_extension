#!/usr/bin/env node

/**
 * Health Check Script for Phase 1 Implementation
 * Runs basic functionality tests to ensure project stability
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Running health check...\n');

const results = {
  dependencies: false,
  devServer: false,
  typeScript: false,
  tests: false,
  themeSystem: false,
  builds: {
    web: false,
    extension: false,
    electron: false
  }
};

// Check 1: Dependencies
console.log('📦 Checking dependencies...');
try {
  execSync('npm list --depth=0', { stdio: 'ignore' });
  results.dependencies = true;
  console.log('✅ Dependencies are installed correctly\n');
} catch (error) {
  console.log('❌ Dependency issues detected\n');
}

// Check 2: TypeScript compilation
console.log('🔧 Checking TypeScript compilation...');
try {
  execSync('npx tsc --noEmit', { stdio: 'ignore' });
  results.typeScript = true;
  console.log('✅ TypeScript compilation successful\n');
} catch (error) {
  console.log('❌ TypeScript compilation errors\n');
}

// Check 3: Dev server
console.log('🌐 Checking development server...');
try {
  // Start dev server in background
  const devProcess = require('child_process').spawn('npm', ['run', 'dev'], {
    detached: true,
    stdio: 'ignore'
  });
  
  // Wait for server to start
  setTimeout(() => {
    try {
      execSync('curl -s http://localhost:5173 > /dev/null');
      results.devServer = true;
      console.log('✅ Development server starts successfully\n');
    } catch (error) {
      console.log('❌ Development server failed to start\n');
    } finally {
      // Kill the dev server
      try {
        process.kill(-devProcess.pid);
      } catch (e) {
        // Ignore errors
      }
    }
  }, 5000);
} catch (error) {
  console.log('❌ Failed to start development server\n');
}

// Check 4: Theme system
console.log('🎨 Checking theme system...');
const themeFilePath = path.join(__dirname, '../src/config/theme.ts');
const mainFilePath = path.join(__dirname, '../src/main.tsx');
const appFilePath = path.join(__dirname, '../src/App.tsx');

try {
  const themeContent = fs.readFileSync(themeFilePath, 'utf8');
  const mainContent = fs.readFileSync(mainFilePath, 'utf8');
  const appContent = fs.readFileSync(appFilePath, 'utf8');
  
  const hasApplyFunction = themeContent.includes('applyThemeToDocument');
  const isCalledInMain = mainContent.includes('applyThemeToDocument');
  const isCalledInApp = appContent.includes('applyThemeToDocument');
  
  if (hasApplyFunction && (isCalledInMain || isCalledInApp)) {
    results.themeSystem = true;
    console.log('✅ Theme system is properly integrated\n');
  } else {
    console.log('❌ Theme system exists but applyThemeToDocument is not called\n');
  }
} catch (error) {
  console.log('❌ Error checking theme system\n');
}

// Check 5: Test suite
console.log('🧪 Checking test suite...');
try {
  execSync('npm run test -- --passWithNoTests', { stdio: 'ignore' });
  results.tests = true;
  console.log('✅ Test suite runs successfully\n');
} catch (error) {
  console.log('❌ Test suite has issues\n');
}

// Check 6: Build processes
console.log('🏗️  Checking build processes...');

// Web build
try {
  console.log('  - Checking web build...');
  execSync('npm run build:web', { stdio: 'ignore' });
  results.builds.web = true;
  console.log('  ✅ Web build successful');
} catch (error) {
  console.log('  ❌ Web build failed');
}

// Extension build
try {
  console.log('  - Checking extension build...');
  execSync('npm run build:extension', { stdio: 'ignore' });
  results.builds.extension = true;
  console.log('  ✅ Extension build successful');
} catch (error) {
  console.log('  ❌ Extension build failed');
}

// Electron build
try {
  console.log('  - Checking electron build...');
  execSync('npm run build:electron', { stdio: 'ignore' });
  results.builds.electron = true;
  console.log('  ✅ Electron build successful');
} catch (error) {
  console.log('  ❌ Electron build failed');
}

// Final summary
console.log('\n📊 Health Check Summary:');
console.log('========================');
console.log(`Dependencies:     ${results.dependencies ? '✅' : '❌'}`);
console.log(`TypeScript:       ${results.typeScript ? '✅' : '❌'}`);
console.log(`Dev Server:       ${results.devServer ? '✅' : '❌'}`);
console.log(`Theme System:     ${results.themeSystem ? '✅' : '❌'}`);
console.log(`Tests:            ${results.tests ? '✅' : '❌'}`);
console.log(`Build (Web):      ${results.builds.web ? '✅' : '❌'}`);
console.log(`Build (Ext):      ${results.builds.extension ? '✅' : '❌'}`);
console.log(`Build (Electron): ${results.builds.electron ? '✅' : '❌'}`);

// Calculate overall health
const totalChecks = 8;
const passedChecks = Object.values(results).flat().filter(Boolean).length;
const healthPercentage = Math.round((passedChecks / totalChecks) * 100);

console.log(`\nOverall Health: ${healthPercentage}% (${passedChecks}/${totalChecks} checks passed)`);

if (healthPercentage === 100) {
  console.log('\n✅ Health check complete - All systems operational!');
  process.exit(0);
} else {
  console.log('\n⚠️  Health check complete - Some issues detected');
  process.exit(1);
}