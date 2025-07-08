#!/usr/bin/env node

/**
 * Validation Suite CLI
 * Command-line interface for running validation checks
 */

import { program } from 'commander';
import { fileURLToPath } from 'url';
import path from 'path';
import { ValidationRunner, ValidationOptions } from './core/runner';
import { getConfig } from './core/config';

// Import validators
import { createArchitectureValidator } from './static/architecture-validator';
import { createGuidelineChecker } from './static/guideline-checker';
import { createThemeValidator } from './static/theme-validator';
import { createAccessibilityChecker } from './static/accessibility-checker';
import { createHealthMonitor } from './runtime/health-monitor';
import { createPerformanceTracker } from './runtime/performance-tracker';

async function main() {
  console.log('🚀 Starting Validation CLI...');
  console.log('📁 Working directory:', process.cwd());
  console.log('📝 Arguments:', process.argv);
  
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

  console.log('⚙️ Parsing command line arguments...');
  program.parse();

  const options = program.opts();
  console.log('🔧 Options parsed:', options);
  
  const validationOptions: ValidationOptions = {
    mode: options.mode as ValidationOptions['mode'],
    scope: options.scope as ValidationOptions['scope'],
    fix: options.fix,
    watch: options.watch,
    parallel: options.parallel,
    exclude: options.exclude ? options.exclude.split(',') : [],
    include: options.include ? options.include.split(',') : [],
  };

  console.log('🎯 Validation options:', validationOptions);

  try {
    console.log('🏗️ Creating validation runner...');
    // Create validation runner
    const runner = new ValidationRunner(validationOptions);

    console.log('📋 Registering validators...');
    // Register validators
    await registerValidators(runner);

    if (options.watch) {
      console.log('👀 Starting watch mode...');
      await runner.startWatchMode(validationOptions);
    } else {
      console.log('🚀 Running validation...');
      // Run validation
      const reporter = await runner.runValidation(validationOptions);

      console.log('📊 Generating reports...');
      // Generate reports
      const reportFormats = options.report.split(',');
      console.log('📄 Report formats:', reportFormats);
      await runner.generateReports(reportFormats);

      console.log('✅ Validation completed successfully');
      // Exit with appropriate code
      const exitCode = reporter.getExitCode();
      console.log('🚪 Exiting with code:', exitCode);
      process.exit(exitCode);
    }
  } catch (error) {
    console.error('💥 Validation failed with error:', error);
    console.error('📚 Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    process.exit(1);
  }
}

async function registerValidators(runner: ValidationRunner): Promise<void> {
  console.log('🔧 Registering validators...');

  try {
    // Register static validators
    console.log('📐 Creating architecture validator...');
    const architectureValidator = await createArchitectureValidator();
    runner.registerValidator(architectureValidator);
    console.log('✅ Architecture validator registered');

    console.log('📋 Creating guideline checker...');
    const guidelineChecker = await createGuidelineChecker();
    runner.registerValidator(guidelineChecker);
    console.log('✅ Guideline checker registered');

    console.log('🎨 Creating theme validator...');
    const themeValidator = await createThemeValidator();
    runner.registerValidator(themeValidator);
    console.log('✅ Theme validator registered');

    console.log('♿ Creating accessibility checker...');
    const accessibilityChecker = await createAccessibilityChecker();
    runner.registerValidator(accessibilityChecker);
    console.log('✅ Accessibility checker registered');

    // Register runtime validators
    console.log('🏥 Creating health monitor...');
    const healthMonitor = await createHealthMonitor();
    runner.registerValidator(healthMonitor);
    console.log('✅ Health monitor registered');

    console.log('⚡ Creating performance tracker...');
    const performanceTracker = await createPerformanceTracker();
    runner.registerValidator(performanceTracker);
    console.log('✅ Performance tracker registered');

    console.log('✅ All validators registered successfully');
  } catch (error) {
    console.error('❌ Failed to register validators:', error);
    console.error('📚 Error details:', error instanceof Error ? error.stack : 'No additional details');
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
async function bootstrap() {
  try {
    console.log('🔥 BOOTSTRAP: Starting CLI bootstrap...');
    console.log('🔥 BOOTSTRAP: Node version:', process.version);
    console.log('🔥 BOOTSTRAP: Platform:', process.platform);
    console.log('🔥 BOOTSTRAP: Working directory:', process.cwd());
    console.log('🔥 BOOTSTRAP: Script path:', import.meta.url);
    console.log('🔥 BOOTSTRAP: Process argv[1]:', process.argv[1]);
    
    await main();
  } catch (error) {
    console.error('💥 BOOTSTRAP FAILED:', error);
    console.error('💥 BOOTSTRAP ERROR STACK:', error instanceof Error ? error.stack : 'No stack');
    console.error('💥 BOOTSTRAP ERROR TYPE:', typeof error);
    process.exit(1);
  }
}

const scriptPath = fileURLToPath(import.meta.url);
const argvPath = path.resolve(process.argv[1]);

if (scriptPath === argvPath) {
  bootstrap();
}

export { main };
