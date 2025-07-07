#!/usr/bin/env node

/**
 * Quick Health Check Script
 * A faster version that doesn't hang on long-running processes
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Running quick health check...\n');

// Check 1: Theme system
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
  
  console.log(`  - applyThemeToDocument exists: ${hasApplyFunction ? '✅' : '❌'}`);
  console.log(`  - Called in main.tsx: ${isCalledInMain ? '✅' : '❌'}`);
  console.log(`  - Called in App.tsx: ${isCalledInApp ? '✅' : '❌'}`);
  
  if (!isCalledInMain && !isCalledInApp) {
    console.log('  ⚠️  Theme system not integrated!\n');
  }
} catch (error) {
  console.log('  ❌ Error checking theme system\n');
}

// Check 2: Hardcoded colors
console.log('🎨 Checking for hardcoded colors...');
try {
  const srcFiles = execSync('find src -name "*.tsx" -o -name "*.ts" -o -name "*.css" 2>/dev/null', { encoding: 'utf8' });
  const files = srcFiles.trim().split('\n').filter(Boolean);
  
  let hardcodedCount = 0;
  const colorPattern = /#[0-9a-fA-F]{3,6}\b|rgba?\([^)]+\)/g;
  
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const matches = content.match(colorPattern);
      if (matches) {
        hardcodedCount += matches.length;
      }
    } catch (e) {
      // Ignore read errors
    }
  });
  
  console.log(`  - Found ${hardcodedCount} hardcoded color values\n`);
} catch (error) {
  console.log('  ❌ Error checking for hardcoded colors\n');
}

// Check 3: TypeScript
console.log('🔧 Checking TypeScript...');
try {
  execSync('npx tsc --noEmit 2>&1', { stdio: 'pipe' });
  console.log('  ✅ TypeScript compilation successful\n');
} catch (error) {
  const errorOutput = error.stdout ? error.stdout.toString() : '';
  const errorCount = (errorOutput.match(/error TS/g) || []).length;
  console.log(`  ❌ TypeScript has ${errorCount} errors\n`);
}

// Check 4: Dependencies
console.log('📦 Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  const depCount = Object.keys(packageJson.dependencies || {}).length;
  const devDepCount = Object.keys(packageJson.devDependencies || {}).length;
  
  console.log(`  - Dependencies: ${depCount}`);
  console.log(`  - Dev dependencies: ${devDepCount}`);
  
  // Check if node_modules exists
  const nodeModulesExists = fs.existsSync(path.join(__dirname, '../node_modules'));
  console.log(`  - node_modules exists: ${nodeModulesExists ? '✅' : '❌'}\n`);
} catch (error) {
  console.log('  ❌ Error checking dependencies\n');
}

// Check 5: Environment setup
console.log('🔐 Checking environment setup...');
const envExampleExists = fs.existsSync(path.join(__dirname, '../.env.example'));
const envExists = fs.existsSync(path.join(__dirname, '../.env'));
console.log(`  - .env.example exists: ${envExampleExists ? '✅' : '❌'}`);
console.log(`  - .env exists: ${envExists ? '✅' : '❌'}\n`);

console.log('✅ Quick health check complete!');