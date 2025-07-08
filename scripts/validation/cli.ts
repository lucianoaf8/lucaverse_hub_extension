#!/usr/bin/env node

/**
 * Validation Suite CLI
 * Command-line interface for running validation checks
 */

import { program } from 'commander';
import { ValidationRunner, ValidationOptions } from './core/runner.js';
import { getConfig } from './core/config.js';

// Import validators
import { createArchitectureValidator } from './static/architecture-validator.js';
import { createGuidelineChecker } from './static/guideline-checker.js';
import { createThemeValidator } from './static/theme-validator.js';
import { createAccessibilityChecker } from './static/accessibility-checker.js';
import { createHealthMonitor } from './runtime/health-monitor.js';
import { createPerformanceTracker } from './runtime/performance-tracker.js';

async function main() {
  program
    .name('validate')
    .description('Comprehensive validation suite for multi-platform applications')
    .version('1.0.0');

  program
    .option('-m, --mode <mode>', 'validation mode', 'development')
    .option('-s, --scope <scope>', 'validation scope', 'full')
    .option('-f, --fix', 'attempt to fix issues automatically', false)
    .option('-w, --watch', 'watch for file changes', false)
    .option('-p, --parallel', 'run validators in parallel', true)
    .option('-r, --report <formats>', 'report formats (comma-separated)', 'console,html')
    .option('--exclude <patterns>', 'exclude validators matching patterns', '')
    .option('--include <patterns>', 'include only validators matching patterns', '')
    .option('--config <path>', 'path to custom config file')
    .option('--silent', 'suppress console output', false);

  program.parse();

  const options = program.opts();
  
  const validationOptions: ValidationOptions = {
    mode: options.mode as ValidationOptions['mode'],
    scope: options.scope as ValidationOptions['scope'],
    fix: options.fix,
    watch: options.watch,
    parallel: options.parallel,
    exclude: options.exclude ? options.exclude.split(',') : [],
    include: options.include ? options.include.split(',') : [],
  };

  try {
    // Create validation runner
    const runner = new ValidationRunner(validationOptions);

    // Register validators
    await registerValidators(runner);

    if (options.watch) {
      await runner.startWatchMode(validationOptions);
    } else {
      // Run validation
      const reporter = await runner.runValidation(validationOptions);

      // Generate reports
      const reportFormats = options.report.split(',');
      await runner.generateReports(reportFormats);

      // Exit with appropriate code
      process.exit(reporter.getExitCode());
    }
  } catch (error) {
    console.error('💥 Validation failed:', error);
    process.exit(1);
  }
}

async function registerValidators(runner: ValidationRunner): Promise<void> {
  console.log('🔧 Registering validators...');

  try {
    // Register static validators
    const architectureValidator = await createArchitectureValidator();
    runner.registerValidator(architectureValidator);

    const guidelineChecker = await createGuidelineChecker();
    runner.registerValidator(guidelineChecker);

    const themeValidator = await createThemeValidator();
    runner.registerValidator(themeValidator);

    const accessibilityChecker = await createAccessibilityChecker();
    runner.registerValidator(accessibilityChecker);

    // Register runtime validators
    const healthMonitor = await createHealthMonitor();
    runner.registerValidator(healthMonitor);

    const performanceTracker = await createPerformanceTracker();
    runner.registerValidator(performanceTracker);

    console.log('✅ All validators registered successfully');
  } catch (error) {
    console.error('❌ Failed to register validators:', error);
    throw error;
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled rejection:', reason);
  process.exit(1);
});

// Run the CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('💥 CLI failed:', error);
    process.exit(1);
  });
}

export { main };