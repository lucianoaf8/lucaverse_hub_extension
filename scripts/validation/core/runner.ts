/**
 * Validation Suite Runner
 * Orchestrates all validation types and manages execution flow
 */

import { ValidationConfig, getConfig } from './config';
import { ValidationReporter, ValidationResult } from './reporter';

export interface ValidationOptions {
  mode: 'development' | 'ci' | 'production' | 'quick';
  scope: 'full' | 'quick' | 'custom';
  fix: boolean;
  watch: boolean;
  parallel: boolean;
  exclude: string[];
  include: string[];
}

export interface ValidatorModule {
  name: string;
  type: 'static' | 'runtime' | 'integration' | 'visual';
  validate(config: ValidationConfig, options: ValidationOptions): Promise<ValidationResult[]>;
  canFix?: boolean;
  dependencies?: string[];
}

export class ValidationRunner {
  private config: ValidationConfig;
  private reporter: ValidationReporter;
  private validators: Map<string, ValidatorModule> = new Map();

  constructor(options: ValidationOptions) {
    this.config = getConfig(options.mode);
    this.reporter = new ValidationReporter();
  }

  registerValidator(validator: ValidatorModule): void {
    this.validators.set(validator.name, validator);
  }

  async runValidation(options: ValidationOptions): Promise<ValidationReporter> {
    console.log(`🚀 Starting validation suite in ${options.mode} mode...`);
    console.log(`📋 Scope: ${options.scope} | Fix: ${options.fix} | Parallel: ${options.parallel}`);

    const startTime = Date.now();
    
    try {
      // Determine which validators to run
      const validatorsToRun = this.selectValidators(options);
      
      console.log(`🔧 Running ${validatorsToRun.length} validators...`);
      
      if (options.parallel) {
        await this.runValidatorsParallel(validatorsToRun, options);
      } else {
        await this.runValidatorsSequential(validatorsToRun, options);
      }

      const duration = Date.now() - startTime;
      console.log(`⏱️ Validation completed in ${(duration / 1000).toFixed(2)}s`);

      return this.reporter;
    } catch (error) {
      console.error('💥 Validation suite failed:', error);
      
      this.reporter.addResult({
        id: 'validation-runner-error',
        name: 'Validation Runner',
        type: 'static',
        status: 'fail',
        message: `Validation suite failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: Date.now() - startTime,
        severity: 'error',
      });

      return this.reporter;
    }
  }

  private selectValidators(options: ValidationOptions): ValidatorModule[] {
    console.log(`🔍 Selecting validators for scope: ${options.scope}`);
    console.log(`📝 Available validators: ${Array.from(this.validators.keys()).join(', ')}`);
    
    let validators = Array.from(this.validators.values());

    // Filter by scope
    if (options.scope === 'quick') {
      console.log('⚡ Using quick scope - filtering to essential validators');
      // Only run fast, essential validators
      validators = validators.filter(v => 
        v.name.includes('quick') || 
        v.type === 'static' ||
        v.name.includes('essential')
      );
    } else if (options.scope === 'custom') {
      console.log('🎯 Using custom scope');
      // Filter by include/exclude patterns
      if (options.include.length > 0) {
        console.log(`✅ Include patterns: ${options.include.join(', ')}`);
        validators = validators.filter(v =>
          options.include.some(pattern => v.name.includes(pattern))
        );
      }
      
      if (options.exclude.length > 0) {
        console.log(`❌ Exclude patterns: ${options.exclude.join(', ')}`);
        validators = validators.filter(v =>
          !options.exclude.some(pattern => v.name.includes(pattern))
        );
      }
    }

    console.log(`📊 Selected ${validators.length} validators: ${validators.map(v => v.name).join(', ')}`);

    // Sort by dependencies
    return this.sortValidatorsByDependencies(validators);
  }

  private sortValidatorsByDependencies(validators: ValidatorModule[]): ValidatorModule[] {
    const sorted: ValidatorModule[] = [];
    const remaining = [...validators];
    const visited = new Set<string>();

    while (remaining.length > 0) {
      const canRun = remaining.filter(v => 
        !v.dependencies || 
        v.dependencies.every(dep => visited.has(dep))
      );

      if (canRun.length === 0) {
        // Circular dependency or missing dependency
        console.warn('⚠️ Circular dependency detected, running remaining validators anyway');
        sorted.push(...remaining);
        break;
      }

      // Add validators that can run now
      canRun.forEach(validator => {
        sorted.push(validator);
        visited.add(validator.name);
        const index = remaining.indexOf(validator);
        remaining.splice(index, 1);
      });
    }

    return sorted;
  }

  private async runValidatorsSequential(
    validators: ValidatorModule[], 
    options: ValidationOptions
  ): Promise<void> {
    for (const validator of validators) {
      await this.runSingleValidator(validator, options);
    }
  }

  private async runValidatorsParallel(
    validators: ValidatorModule[], 
    options: ValidationOptions
  ): Promise<void> {
    // Group validators by type to avoid conflicts
    const groups = validators.reduce((acc, validator) => {
      if (!acc[validator.type]) {
        acc[validator.type] = [];
      }
      acc[validator.type].push(validator);
      return acc;
    }, {} as Record<string, ValidatorModule[]>);

    // Run each group in parallel, but run groups sequentially
    for (const [type, groupValidators] of Object.entries(groups)) {
      console.log(`🔄 Running ${type} validators in parallel...`);
      
      const promises = groupValidators.map(validator => 
        this.runSingleValidator(validator, options)
      );
      
      await Promise.all(promises);
    }
  }

  private async runSingleValidator(
    validator: ValidatorModule, 
    options: ValidationOptions
  ): Promise<void> {
    const startTime = Date.now();
    console.log(`  🔍 Running ${validator.name}...`);

    try {
      const results = await validator.validate(this.config, options);
      this.reporter.addResults(results);
      
      const duration = Date.now() - startTime;
      const passed = results.filter(r => r.status === 'pass').length;
      const failed = results.filter(r => r.status === 'fail').length;
      const warnings = results.filter(r => r.status === 'warning').length;
      
      console.log(`    ✅ ${passed} passed, ❌ ${failed} failed, ⚠️ ${warnings} warnings (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`    💥 ${validator.name} failed:`, error);
      
      this.reporter.addResult({
        id: `${validator.name}-error`,
        name: validator.name,
        type: validator.type,
        status: 'fail',
        message: `Validator failed: ${error instanceof Error ? error.message : String(error)}`,
        duration,
        severity: 'error',
      });
    }
  }

  async generateReports(formats: string[]): Promise<void> {
    console.log('📊 Generating reports...');

    for (const format of formats) {
      try {
        switch (format) {
          case 'console':
            await this.reporter.outputConsole();
            break;
          case 'json':
            await this.reporter.outputJson();
            break;
          case 'html':
            await this.reporter.outputHtml();
            break;
          case 'junit':
            await this.reporter.outputJunit();
            break;
          default:
            console.warn(`⚠️ Unknown report format: ${format}`);
        }
      } catch (error) {
        console.error(`❌ Failed to generate ${format} report:`, error);
      }
    }
  }

  async startWatchMode(options: ValidationOptions): Promise<void> {
    console.log('👀 Starting watch mode...');
    
    // For now, just run validation once
    // In a real implementation, you'd set up file watchers
    await this.runValidation(options);
    
    console.log('📁 Watching for file changes... (Press Ctrl+C to exit)');
    
    // Keep the process alive
    process.on('SIGINT', () => {
      console.log('\n👋 Stopping watch mode...');
      process.exit(0);
    });
  }

  getReporter(): ValidationReporter {
    return this.reporter;
  }

  getConfig(): ValidationConfig {
    return this.config;
  }

  // Utility methods for specific validation types
  async runStaticAnalysis(options: ValidationOptions): Promise<ValidationResult[]> {
    const staticValidators = Array.from(this.validators.values())
      .filter(v => v.type === 'static');
    
    const results: ValidationResult[] = [];
    
    for (const validator of staticValidators) {
      const validatorResults = await validator.validate(this.config, options);
      results.push(...validatorResults);
    }
    
    return results;
  }

  async runRuntimeChecks(options: ValidationOptions): Promise<ValidationResult[]> {
    const runtimeValidators = Array.from(this.validators.values())
      .filter(v => v.type === 'runtime');
    
    const results: ValidationResult[] = [];
    
    for (const validator of runtimeValidators) {
      const validatorResults = await validator.validate(this.config, options);
      results.push(...validatorResults);
    }
    
    return results;
  }

  async runIntegrationTests(options: ValidationOptions): Promise<ValidationResult[]> {
    const integrationValidators = Array.from(this.validators.values())
      .filter(v => v.type === 'integration');
    
    const results: ValidationResult[] = [];
    
    for (const validator of integrationValidators) {
      const validatorResults = await validator.validate(this.config, options);
      results.push(...validatorResults);
    }
    
    return results;
  }

  async runVisualTests(options: ValidationOptions): Promise<ValidationResult[]> {
    const visualValidators = Array.from(this.validators.values())
      .filter(v => v.type === 'visual');
    
    const results: ValidationResult[] = [];
    
    for (const validator of visualValidators) {
      const validatorResults = await validator.validate(this.config, options);
      results.push(...validatorResults);
    }
    
    return results;
  }
}

// Default validation runner instance
export function createValidationRunner(options: ValidationOptions): ValidationRunner {
  return new ValidationRunner(options);
}