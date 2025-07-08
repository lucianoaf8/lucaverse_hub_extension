/**
 * Multi-Platform Guideline Checker
 * Static analysis tool for enforcing cross-platform compatibility guidelines
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { ESLint } from 'eslint';
import { ValidationConfig, ValidationOptions } from '../core/config.js';
import { ValidationResult, ValidatorModule } from '../core/runner.js';

export interface GuidelineViolation {
  rule: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  file: string;
  line?: number;
  column?: number;
  suggestion?: string;
  fixable?: boolean;
}

export class GuidelineChecker {
  private config: ValidationConfig;
  private eslint: ESLint;

  constructor(config: ValidationConfig) {
    this.config = config;
    this.eslint = new ESLint({
      baseConfig: {
        parser: '@typescript-eslint/parser',
        parserOptions: {
          ecmaVersion: 2022,
          sourceType: 'module',
          ecmaFeatures: {
            jsx: true,
          },
        },
        plugins: ['@typescript-eslint', 'react', 'react-hooks'],
        rules: {
          // Load our custom rules
          'platform-compliance/no-direct-storage': 'error',
          'platform-compliance/no-platform-specific-apis': 'error',
          'platform-compliance/require-storage-adapter': 'warn',
          'platform-compliance/no-inline-styles': 'error',
          'platform-compliance/no-unsafe-dynamic-imports': 'warn',
          'platform-compliance/require-serializable-state': 'warn',
        },
      },
      rulePaths: [path.resolve('scripts/validation/static/eslint-rules')],
      useEslintrc: false,
    });
  }

  async validate(config: ValidationConfig, options: ValidationOptions): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const startTime = Date.now();

    try {
      // Get all TypeScript and JavaScript files
      const files = await this.getSourceFiles();
      
      console.log(`🔍 Checking ${files.length} files for guideline compliance...`);

      // Run ESLint checks
      const eslintResults = await this.runESLintChecks(files);
      results.push(...eslintResults);

      // Run custom static analysis
      const customResults = await this.runCustomChecks(files);
      results.push(...customResults);

      // Check for forbidden APIs
      const apiResults = await this.checkForbiddenApis(files);
      results.push(...apiResults);

      // Check serializable state patterns
      const stateResults = await this.checkSerializableState(files);
      results.push(...stateResults);

      // Check CSP compliance
      const cspResults = await this.checkCSPCompliance(files);
      results.push(...cspResults);

      const duration = Date.now() - startTime;
      console.log(`✅ Guideline checking completed in ${duration}ms`);

      return results;
    } catch (error) {
      return [{
        id: 'guideline-checker-error',
        name: 'Guideline Checker',
        type: 'static',
        status: 'fail',
        message: `Guideline checking failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: Date.now() - startTime,
        severity: 'error',
      }];
    }
  }

  private async getSourceFiles(): Promise<string[]> {
    const patterns = [
      'src/**/*.{ts,tsx,js,jsx}',
      '!src/**/*.test.{ts,tsx,js,jsx}',
      '!src/**/*.spec.{ts,tsx,js,jsx}',
      '!src/**/*.d.ts',
    ];

    const files: string[] = [];
    
    for (const pattern of patterns) {
      const matches = await glob(pattern);
      files.push(...matches);
    }

    return [...new Set(files)]; // Remove duplicates
  }

  private async runESLintChecks(files: string[]): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      const eslintResults = await this.eslint.lintFiles(files);

      for (const result of eslintResults) {
        for (const message of result.messages) {
          results.push({
            id: `eslint-${message.ruleId || 'unknown'}`,
            name: `ESLint: ${message.ruleId || 'Unknown Rule'}`,
            type: 'static',
            status: message.severity === 2 ? 'fail' : 'warning',
            message: message.message,
            file: result.filePath,
            line: message.line,
            column: message.column,
            duration: 0,
            severity: message.severity === 2 ? 'error' : 'warning',
            fixable: Boolean(message.fix),
            suggestion: message.suggestions?.[0]?.desc,
          });
        }
      }
    } catch (error) {
      results.push({
        id: 'eslint-error',
        name: 'ESLint Check',
        type: 'static',
        status: 'fail',
        message: `ESLint failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: 0,
        severity: 'error',
      });
    }

    return results;
  }

  private async runCustomChecks(files: string[]): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        
        // Check file structure compliance
        const structureResult = this.checkFileStructure(file, content);
        if (structureResult) {
          results.push(structureResult);
        }

        // Check import patterns
        const importResults = this.checkImportPatterns(file, content);
        results.push(...importResults);

        // Check export patterns
        const exportResults = this.checkExportPatterns(file, content);
        results.push(...exportResults);

      } catch (error) {
        results.push({
          id: `file-check-error-${path.basename(file)}`,
          name: 'File Check',
          type: 'static',
          status: 'fail',
          message: `Failed to check file: ${error instanceof Error ? error.message : String(error)}`,
          file,
          duration: 0,
          severity: 'error',
        });
      }
    }

    return results;
  }

  private checkFileStructure(file: string, content: string): ValidationResult | null {
    const fileName = path.basename(file);
    const fileType = this.determineFileType(file);

    // Check naming conventions
    const namingRule = this.config.static.architecture.fileNamingRules[fileType];
    if (namingRule && !namingRule.test(fileName)) {
      return {
        id: `naming-convention-${fileType}`,
        name: 'File Naming Convention',
        type: 'static',
        status: 'fail',
        message: `File name "${fileName}" doesn't match ${fileType} naming convention`,
        file,
        duration: 0,
        severity: 'warning',
        suggestion: `${fileType} files should match pattern: ${namingRule.source}`,
      };
    }

    return null;
  }

  private determineFileType(file: string): keyof typeof this.config.static.architecture.fileNamingRules {
    if (file.includes('/components/')) return 'components';
    if (file.includes('/hooks/') || path.basename(file).startsWith('use')) return 'hooks';
    if (file.includes('/utils/')) return 'utils';
    if (file.includes('/types/') || file.endsWith('.types.ts')) return 'types';
    return 'utils'; // default
  }

  private checkImportPatterns(file: string, content: string): ValidationResult[] {
    const results: ValidationResult[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const importMatch = line.match(/import\s+.+\s+from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        const importPath = importMatch[1];
        
        // Check for relative imports going up too many levels
        const upLevels = (importPath.match(/\.\.\//g) || []).length;
        if (upLevels > 2) {
          results.push({
            id: 'deep-relative-import',
            name: 'Deep Relative Import',
            type: 'static',
            status: 'warning',
            message: `Avoid deep relative imports: ${importPath}`,
            file,
            line: index + 1,
            duration: 0,
            severity: 'warning',
            suggestion: 'Use absolute imports or restructure your code',
          });
        }

        // Check for imports of test files
        if (importPath.includes('.test.') || importPath.includes('.spec.')) {
          results.push({
            id: 'test-file-import',
            name: 'Test File Import',
            type: 'static',
            status: 'fail',
            message: `Don't import test files: ${importPath}`,
            file,
            line: index + 1,
            duration: 0,
            severity: 'error',
          });
        }
      }
    });

    return results;
  }

  private checkExportPatterns(file: string, content: string): ValidationResult[] {
    const results: ValidationResult[] = [];
    const lines = content.split('\n');

    // Check for default exports in components
    if (file.includes('/components/') && file.endsWith('.tsx')) {
      const hasDefaultExport = content.includes('export default');
      if (!hasDefaultExport) {
        results.push({
          id: 'missing-default-export',
          name: 'Missing Default Export',
          type: 'static',
          status: 'warning',
          message: 'React components should have a default export',
          file,
          duration: 0,
          severity: 'warning',
          suggestion: 'Add "export default ComponentName" at the end of the file',
        });
      }
    }

    return results;
  }

  private async checkForbiddenApis(files: string[]): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const forbiddenApis = this.config.static.guidelines.forbiddenApis;

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          forbiddenApis.forEach(api => {
            if (line.includes(api) && !line.trimStart().startsWith('//')) {
              results.push({
                id: `forbidden-api-${api}`,
                name: 'Forbidden API Usage',
                type: 'static',
                status: 'fail',
                message: `Forbidden API usage: ${api}`,
                file,
                line: index + 1,
                duration: 0,
                severity: 'error',
                suggestion: this.getForbiddenApiSuggestion(api),
              });
            }
          });
        });
      } catch (error) {
        // File read error already handled in runCustomChecks
      }
    }

    return results;
  }

  private getForbiddenApiSuggestion(api: string): string {
    const suggestions: Record<string, string> = {
      'localStorage.setItem': 'Use storageAdapter.setItem() instead',
      'localStorage.getItem': 'Use storageAdapter.getItem() instead',
      'sessionStorage.setItem': 'Use storageAdapter.setItem() instead',
      'sessionStorage.getItem': 'Use storageAdapter.getItem() instead',
      'eval': 'Avoid eval() - use safer alternatives',
      'Function': 'Avoid Function constructor - use static functions',
      'window.open': 'Use browser extension APIs for opening windows',
      'document.write': 'Use DOM manipulation methods instead',
    };

    return suggestions[api] || `Replace ${api} with platform-compatible alternative`;
  }

  private async checkSerializableState(files: string[]): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        
        // Look for useState with non-serializable initial values
        const useStateRegex = /useState\s*\(\s*([^)]+)\s*\)/g;
        let match;
        
        while ((match = useStateRegex.exec(content)) !== null) {
          const initialValue = match[1].trim();
          
          // Check for function expressions
          if (initialValue.includes('=>') || initialValue.startsWith('function')) {
            const line = content.substring(0, match.index).split('\n').length;
            
            results.push({
              id: 'non-serializable-state',
              name: 'Non-Serializable State',
              type: 'static',
              status: 'warning',
              message: 'useState with function initializer may not be serializable',
              file,
              line,
              duration: 0,
              severity: 'warning',
              suggestion: 'Use primitive values or plain objects for state',
            });
          }
        }
      } catch (error) {
        // File read error already handled
      }
    }

    return results;
  }

  private async checkCSPCompliance(files: string[]): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          // Check for inline event handlers
          if (line.includes('onclick=') || line.includes('onload=') || line.includes('onerror=')) {
            results.push({
              id: 'inline-event-handler',
              name: 'Inline Event Handler',
              type: 'static',
              status: 'fail',
              message: 'Inline event handlers violate CSP',
              file,
              line: index + 1,
              duration: 0,
              severity: 'error',
              suggestion: 'Use React event handlers instead',
            });
          }

          // Check for inline scripts
          if (line.includes('<script>') && !line.includes('src=')) {
            results.push({
              id: 'inline-script',
              name: 'Inline Script',
              type: 'static',
              status: 'fail',
              message: 'Inline scripts violate CSP',
              file,
              line: index + 1,
              duration: 0,
              severity: 'error',
              suggestion: 'Move scripts to external files',
            });
          }
        });
      } catch (error) {
        // File read error already handled
      }
    }

    return results;
  }
}

export async function createGuidelineChecker(): Promise<ValidatorModule> {
  return {
    name: 'guideline-checker',
    type: 'static',
    async validate(config: ValidationConfig, options: ValidationOptions): Promise<ValidationResult[]> {
      const checker = new GuidelineChecker(config);
      return await checker.validate(config, options);
    },
    canFix: true,
    dependencies: [],
  };
}