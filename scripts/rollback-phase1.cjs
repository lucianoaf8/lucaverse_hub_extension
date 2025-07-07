#!/usr/bin/env node

/**
 * Rollback Script for Phase 1 Changes
 * Quickly reverts all Phase 1 modifications and restores to baseline
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Phase 1 Rollback Script\n');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
  try {
    log(`\n📍 ${description}...`, 'blue');
    const output = execSync(command, { encoding: 'utf8' });
    log(`✅ ${description} - Success`, 'green');
    return { success: true, output };
  } catch (error) {
    log(`❌ ${description} - Failed`, 'red');
    log(`Error: ${error.message}`, 'red');
    return { success: false, error };
  }
}

async function rollback() {
  log('Starting Phase 1 rollback process...', 'yellow');
  
  // Step 1: Check current branch
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  log(`Current branch: ${currentBranch}`, 'blue');
  
  // Step 2: Check for uncommitted changes
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      log('\n⚠️  Uncommitted changes detected!', 'yellow');
      log('Please commit or stash your changes before rollback.', 'yellow');
      
      // Offer to stash changes
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      return new Promise((resolve) => {
        readline.question('\nDo you want to stash current changes? (y/n): ', (answer) => {
          readline.close();
          if (answer.toLowerCase() === 'y') {
            execCommand('git stash push -m "Pre-rollback stash"', 'Stashing changes');
          } else {
            log('Rollback cancelled.', 'red');
            process.exit(1);
          }
          resolve();
        });
      });
    }
  } catch (error) {
    log('Error checking git status', 'red');
  }
  
  // Step 3: Check if baseline branch exists
  const baselineBranch = 'baseline/pre-phase1-fixes';
  try {
    execSync(`git rev-parse --verify ${baselineBranch}`, { stdio: 'ignore' });
    log(`✅ Baseline branch '${baselineBranch}' found`, 'green');
  } catch (error) {
    log(`❌ Baseline branch '${baselineBranch}' not found!`, 'red');
    log('Cannot perform rollback without baseline branch.', 'red');
    process.exit(1);
  }
  
  // Step 4: Create backup of current state
  const backupBranch = `backup/phase1-rollback-${Date.now()}`;
  execCommand(`git checkout -b ${backupBranch}`, `Creating backup branch '${backupBranch}'`);
  
  // Step 5: Switch to baseline branch
  const checkoutResult = execCommand(`git checkout ${baselineBranch}`, `Switching to baseline branch`);
  if (!checkoutResult.success) {
    log('Failed to switch to baseline branch!', 'red');
    process.exit(1);
  }
  
  // Step 6: Clean up node_modules and reinstall
  log('\n🧹 Cleaning up dependencies...', 'yellow');
  
  // Remove node_modules
  const nodeModulesPath = path.join(__dirname, '../node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    execCommand('rm -rf node_modules', 'Removing node_modules');
  }
  
  // Remove package-lock.json to ensure clean install
  const lockPath = path.join(__dirname, '../package-lock.json');
  if (fs.existsSync(lockPath)) {
    execCommand('rm package-lock.json', 'Removing package-lock.json');
  }
  
  // Reinstall dependencies
  execCommand('npm install', 'Reinstalling dependencies');
  
  // Step 7: Run health check
  log('\n🔍 Running health check after rollback...', 'yellow');
  const healthCheckPath = path.join(__dirname, 'health-check.js');
  
  if (fs.existsSync(healthCheckPath)) {
    try {
      execSync(`node ${healthCheckPath}`, { stdio: 'inherit' });
    } catch (error) {
      log('\n⚠️  Health check reported issues (this may be expected)', 'yellow');
    }
  } else {
    log('Health check script not found', 'yellow');
  }
  
  // Step 8: Summary
  log('\n📊 Rollback Summary:', 'blue');
  log('====================', 'blue');
  log(`✅ Rolled back to baseline: ${baselineBranch}`, 'green');
  log(`✅ Current state backed up to: ${backupBranch}`, 'green');
  log(`✅ Dependencies reinstalled`, 'green');
  
  log('\n📝 Next Steps:', 'yellow');
  log('1. Verify application functionality with: npm run dev', 'yellow');
  log('2. Review the rollback and ensure everything works as expected', 'yellow');
  log(`3. If you need to return to your previous work: git checkout ${backupBranch}`, 'yellow');
  log('4. To delete the backup branch later: git branch -D ' + backupBranch, 'yellow');
  
  log('\n✅ Rollback completed successfully!', 'green');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});

// Run rollback
rollback().catch((error) => {
  log(`\n❌ Rollback failed: ${error.message}`, 'red');
  process.exit(1);
});