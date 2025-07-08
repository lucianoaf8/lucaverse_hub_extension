/**
 * Multi-Platform Guideline Checker
 * Static analysis tool for enforcing cross-platform compatibility guidelines
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { ESLint } from 'eslint';
import { ValidationConfig, ValidationOptions } from '../core/config';
import { ValidationResult, ValidatorModule } from '../core/runner';

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
      useEslintrc: true,
      overrideConfig: {
        rules: {
          // Standard ESLint rules
          '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
          'react/react-in-jsx-scope': 'off',
          'react/prop-types': 'off',
        },
      },
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

    // Only apply naming rules to files in specific directories
    const shouldCheckNaming = this.shouldApplyNamingRule(file, fileType);
    
    if (!shouldCheckNaming) {
      return null; // Skip naming validation for files outside target directories
    }

    // Check naming conventions
    const namingRule = this.config.static.architecture.fileNamingRules[fileType];
    if (namingRule && !namingRule.test(fileName)) {
      return {
        id: `naming-convention-${fileType}`,
        name: 'File Naming Violation',
        type: 'static',
        status: 'warning',
        message: `File "${fileName}" doesn't match ${fileType} naming convention`,
        file,
        duration: 0,
        severity: 'warning',
        suggestion: `${fileType} files should match: ${namingRule.source}`,
      };
    }

    return null;
  }

  private shouldApplyNamingRule(file: string, fileType: string): boolean {
    // Only apply naming rules to files in specific directories
    switch (fileType) {
      case 'utils':
        return file.includes('/utils/');
      case 'components':
        return file.includes('/components/');
      case 'hooks':
        return file.includes('/hooks/');
      case 'types':
        return file.includes('/types/');
      default:
        return false; // Don't apply naming rules to other files
    }
  }

  private determineFileType(file: string): keyof typeof this.config.static.architecture.fileNamingRules {
    const fileName = path.basename(file);
    
    // Check for utils first (most specific)
    if (file.includes('/utils/')) {
      return 'utils';
    }
    
    // Check for React components (.tsx files or PascalCase .ts files in components/)
    if (file.includes('/components/')) {
      return 'components';
    }
    
    // Check for hooks (files starting with 'use' or in hooks directory)
    if (file.includes('/hooks/') || fileName.startsWith('use')) {
      return 'hooks';
    }
    
    // Check for types
    if (file.includes('/types/') || fileName.endsWith('.types.ts') || fileName.includes('types')) {
      return 'types';
    }
    
    // For root level files, classify based on naming pattern
    if (/^[A-Z]/.test(fileName) && fileName.endsWith('.tsx')) {
      return 'components';
    }
    
    if (fileName.startsWith('use') && fileName.endsWith('.ts')) {
      return 'hooks';
    }
    
    // Return components as default to avoid false positives for root-level files
    return 'components';
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
            if (line.trimStart().startsWith('//')) return; // Skip comments
            
            let found = false;
            
            // Special handling for Function constructor
            if (api === 'Function') {
              // Only flag actual Function constructor calls, not type references
              if (/\bnew\s+Function\s*\(/.test(line) || /\bFunction\s*\(/.test(line)) {
                // But exclude type definitions
                if (!line.includes('interface') && !line.includes('type') && !line.includes('TranslateFunction') && !line.includes('FunctionComponent')) {
                  found = true;
                }
              }
            } else {
              // For other APIs, use simple includes check
              found = line.includes(api);
              
              // Special handling for localStorage/sessionStorage in storage adapters
              if ((api.includes('localStorage') || api.includes('sessionStorage')) && 
                  file.includes('storageAdapter')) {
                found = false; // Allow usage in storage adapter itself
              }
            }
            
            if (found) {
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