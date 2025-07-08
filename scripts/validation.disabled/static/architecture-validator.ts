/**
 * Architecture Compliance Monitor
 * Validates project structure, dependencies, and architectural patterns
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { ValidationConfig, ValidationOptions } from '../core/config';
import { ValidationResult, ValidatorModule } from '../core/runner';

export interface DependencyNode {
  file: string;
  imports: string[];
  exports: string[];
  dependencies: Set<string>;
  dependents: Set<string>;
}

export interface CircularDependency {
  cycle: string[];
  severity: 'warning' | 'error';
}

export interface ArchitectureViolation {
  type: 'dependency' | 'naming' | 'structure' | 'export' | 'circular';
  severity: 'error' | 'warning' | 'info';
  message: string;
  file: string;
  suggestion?: string;
}

export class ArchitectureValidator {
  private config: ValidationConfig;
  private dependencyGraph: Map<string, DependencyNode> = new Map();
  private projectRoot: string;

  constructor(config: ValidationConfig) {
    this.config = config;
    this.projectRoot = process.cwd();
  }

  async validate(config: ValidationConfig, options: ValidationOptions): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const startTime = Date.now();

    try {
      console.log('🏗️ Validating architecture compliance...');

      // Build dependency graph
      await this.buildDependencyGraph();

      // Validate import structure
      const importResults = await this.validateImportStructure();
      results.push(...importResults);

      // Validate file naming conventions
      const namingResults = await this.validateFileNaming();
      results.push(...namingResults);

      // Validate export patterns
      const exportResults = await this.validateExportPatterns();
      results.push(...exportResults);

      // Detect circular dependencies
      const circularResults = await this.detectCircularDependencies();
      results.push(...circularResults);

      // Validate component structure
      const componentResults = await this.validateComponentStructure();
      results.push(...componentResults);

      // Validate directory structure
      const directoryResults = await this.validateDirectoryStructure();
      results.push(...directoryResults);

      // Generate dependency metrics
      const metricsResults = await this.generateDependencyMetrics();
      results.push(...metricsResults);

      const duration = Date.now() - startTime;
      console.log(`✅ Architecture validation completed in ${duration}ms`);

      return results;
    } catch (error) {
      return [{
        id: 'architecture-validator-error',
        name: 'Architecture Validator',
        type: 'static',
        status: 'fail',
        message: `Architecture validation failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: Date.now() - startTime,
        severity: 'error',
      }];
    }
  }

  private async buildDependencyGraph(): Promise<void> {
    const sourceFiles = await glob('src/**/*.{ts,tsx,js,jsx}');
    
    // First pass: collect all files and their imports/exports
    for (const file of sourceFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const node = await this.analyzeFile(file, content);
        this.dependencyGraph.set(file, node);
      } catch (error) {
        console.warn(`Failed to analyze file ${file}:`, error);
      }
    }

    // Second pass: build dependency relationships
    for (const [file, node] of this.dependencyGraph.entries()) {
      node.imports.forEach(importPath => {
        const resolvedPath = this.resolveImportPath(file, importPath);
        if (resolvedPath && this.dependencyGraph.has(resolvedPath)) {
          node.dependencies.add(resolvedPath);
          const dependentNode = this.dependencyGraph.get(resolvedPath);
          if (dependentNode) {
            dependentNode.dependents.add(file);
          }
        }
      });
    }
  }

  private async analyzeFile(file: string, content: string): Promise<DependencyNode> {
    const imports: string[] = [];
    const exports: string[] = [];

    // Extract imports
    const importRegex = /(?:import\s+.*?\s+from\s+['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\))/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1] || match[2];
      if (importPath && !importPath.startsWith('.') && !importPath.startsWith('/')) {
        // Skip external packages
        continue;
      }
      imports.push(importPath);
    }

    // Extract exports
    const exportRegex = /export\s+(?:default\s+)?(?:(?:const|let|var|function|class|interface|type)\s+)?(\w+)/g;
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }

    // Check for default exports
    if (content.includes('export default')) {
      exports.push('default');
    }

    return {
      file,
      imports,
      exports,
      dependencies: new Set(),
      dependents: new Set(),
    };
  }

  private resolveImportPath(fromFile: string, importPath: string): string | null {
    if (!importPath.startsWith('.')) {
      return null; // External package
    }

    const fromDir = path.dirname(fromFile);
    let resolvedPath = path.resolve(fromDir, importPath);

    // Try different extensions
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    
    for (const ext of extensions) {
      const withExt = resolvedPath + ext;
      if (this.dependencyGraph.has(withExt)) {
        return withExt;
      }
    }

    // Try index files
    for (const ext of extensions) {
      const indexPath = path.join(resolvedPath, `index${ext}`);
      if (this.dependencyGraph.has(indexPath)) {
        return indexPath;
      }
    }

    return null;
  }

  private async validateImportStructure(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const allowedImports = this.config.static.architecture.allowedImports;

    for (const [file, node] of this.dependencyGraph.entries()) {
      // Check if file is in a restricted directory
      for (const [pattern, allowedPatterns] of Object.entries(allowedImports)) {
        if (this.matchesPattern(file, pattern)) {
          // Check each import against allowed patterns
          for (const importPath of node.imports) {
            const resolvedPath = this.resolveImportPath(file, importPath);
            if (!resolvedPath) continue;

            const isAllowed = allowedPatterns.some(allowedPattern =>
              this.matchesPattern(resolvedPath, allowedPattern)
            );

            if (!isAllowed) {
              results.push({
                id: `forbidden-import-${path.basename(file)}`,
                name: 'Forbidden Import',
                type: 'static',
                status: 'fail',
                message: `File in ${pattern} cannot import from ${resolvedPath}`,
                file,
                duration: 0,
                severity: 'error',
                suggestion: `Move import to an allowed location or restructure code`,
                details: {
                  import: importPath,
                  resolved: resolvedPath,
                  allowedPatterns,
                },
              });
            }
          }
        }
      }

      // Check for deep relative imports
      for (const importPath of node.imports) {
        const upLevels = (importPath.match(/\.\.\//g) || []).length;
        if (upLevels > 2) {
          results.push({
            id: `deep-relative-import-${path.basename(file)}`,
            name: 'Deep Relative Import',
            type: 'static',
            status: 'warning',
            message: `Import path goes up ${upLevels} levels: ${importPath}`,
            file,
            duration: 0,
            severity: 'warning',
            suggestion: 'Consider using absolute imports or restructuring directories',
          });
        }
      }

      // Check for forbidden patterns
      const forbiddenPatterns = this.config.static.architecture.forbiddenPatterns;
      for (const pattern of forbiddenPatterns) {
        if (this.matchesPattern(file, pattern)) {
          results.push({
            id: `forbidden-pattern-${path.basename(file)}`,
            name: 'Forbidden File Pattern',
            type: 'static',
            status: 'fail',
            message: `File matches forbidden pattern: ${pattern}`,
            file,
            duration: 0,
            severity: 'error',
            suggestion: 'Move or rename file to follow project conventions',
          });
        }
      }
    }

    return results;
  }

  private matchesPattern(filePath: string, pattern: string): boolean {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\./g, '\\.');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(filePath);
  }

  private async validateFileNaming(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const namingRules = this.config.static.architecture.fileNamingRules;

    for (const [file] of this.dependencyGraph.entries()) {
      const fileName = path.basename(file);
      const fileType = this.determineFileType(file);
      const rule = namingRules[fileType];

      if (rule && !rule.test(fileName)) {
        results.push({
          id: `naming-violation-${fileType}-${fileName}`,
          name: 'File Naming Violation',
          type: 'static',
          status: 'warning',
          message: `File "${fileName}" doesn't match ${fileType} naming convention`,
          file,
          duration: 0,
          severity: 'warning',
          suggestion: `${fileType} files should match: ${rule.source}`,
        });
      }
    }

    return results;
  }

  private determineFileType(file: string): keyof typeof this.config.static.architecture.fileNamingRules {
    if (file.includes('/components/')) return 'components';
    if (file.includes('/hooks/') || path.basename(file).startsWith('use')) return 'hooks';
    if (file.includes('/utils/')) return 'utils';
    if (file.includes('/types/') || file.endsWith('.types.ts')) return 'types';
    return 'utils'; // default
  }

  private async validateExportPatterns(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const requiredExports = this.config.static.architecture.requiredExports;

    for (const [file, node] of this.dependencyGraph.entries()) {
      // Check required exports for file patterns
      for (const [pattern, required] of Object.entries(requiredExports)) {
        if (this.matchesPattern(file, pattern)) {
          for (const requiredExport of required) {
            if (requiredExport === 'default') {
              if (!node.exports.includes('default')) {
                results.push({
                  id: `missing-default-export-${path.basename(file)}`,
                  name: 'Missing Default Export',
                  type: 'static',
                  status: 'warning',
                  message: `File matching ${pattern} should have a default export`,
                  file,
                  duration: 0,
                  severity: 'warning',
                  suggestion: 'Add default export to the file',
                });
              }
            } else if (requiredExport.startsWith('use')) {
              // Check for hook exports
              const hasHookExport = node.exports.some(exp => exp.startsWith('use'));
              if (!hasHookExport) {
                results.push({
                  id: `missing-hook-export-${path.basename(file)}`,
                  name: 'Missing Hook Export',
                  type: 'static',
                  status: 'warning',
                  message: `Hook file should export functions starting with "use"`,
                  file,
                  duration: 0,
                  severity: 'warning',
                  suggestion: 'Export hook functions with "use" prefix',
                });
              }
            }
          }
        }
      }

      // Check for mixed export styles (default + named in components)
      if (file.includes('/components/') && 
          node.exports.includes('default') && 
          node.exports.length > 1) {
        results.push({
          id: `mixed-exports-${path.basename(file)}`,
          name: 'Mixed Export Style',
          type: 'static',
          status: 'warning',
          message: 'Component has both default and named exports',
          file,
          duration: 0,
          severity: 'warning',
          suggestion: 'Prefer default export only for React components',
        });
      }
    }

    return results;
  }

  private async detectCircularDependencies(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycles: CircularDependency[] = [];

    const dfs = (file: string, path: string[]): void => {
      if (recursionStack.has(file)) {
        // Found a cycle
        const cycleStart = path.indexOf(file);
        const cycle = path.slice(cycleStart).concat(file);
        cycles.push({
          cycle,
          severity: cycle.length > 5 ? 'error' : 'warning',
        });
        return;
      }

      if (visited.has(file)) {
        return;
      }

      visited.add(file);
      recursionStack.add(file);

      const node = this.dependencyGraph.get(file);
      if (node) {
        for (const dependency of node.dependencies) {
          dfs(dependency, [...path, file]);
        }
      }

      recursionStack.delete(file);
    };

    // Check each file for cycles
    for (const file of this.dependencyGraph.keys()) {
      if (!visited.has(file)) {
        dfs(file, []);
      }
    }

    // Convert cycles to results
    for (const cycle of cycles) {
      results.push({
        id: `circular-dependency-${cycle.cycle.length}`,
        name: 'Circular Dependency',
        type: 'static',
        status: 'fail',
        message: `Circular dependency detected: ${cycle.cycle.map(f => path.basename(f)).join(' → ')}`,
        duration: 0,
        severity: cycle.severity,
        suggestion: 'Refactor to remove circular dependencies by extracting shared code',
        details: {
          cycle: cycle.cycle,
          length: cycle.cycle.length,
        },
      });
    }

    return results;
  }

  private async validateComponentStructure(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const componentFiles = await glob('src/components/**/*.{ts,tsx}');

    for (const file of componentFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        
        // Check component file structure
        const hasDefaultExport = content.includes('export default');
        const hasNamedExports = /export\s+(?:const|function|class)/.test(content);
        const isIndexFile = path.basename(file) === 'index.ts' || path.basename(file) === 'index.tsx';

        if (!isIndexFile && !hasDefaultExport && file.endsWith('.tsx')) {
          results.push({
            id: `component-no-default-export-${path.basename(file)}`,
            name: 'Component No Default Export',
            type: 'static',
            status: 'warning',
            message: 'React component file should have default export',
            file,
            duration: 0,
            severity: 'warning',
            suggestion: 'Export component as default',
          });
        }

        // Check for proper component naming
        const fileName = path.basename(file, path.extname(file));
        const componentNameRegex = /(?:function|const)\s+(\w+)/g;
        let match;
        let hasMatchingName = false;

        while ((match = componentNameRegex.exec(content)) !== null) {
          if (match[1] === fileName) {
            hasMatchingName = true;
            break;
          }
        }

        if (!isIndexFile && !hasMatchingName && file.endsWith('.tsx')) {
          results.push({
            id: `component-name-mismatch-${fileName}`,
            name: 'Component Name Mismatch',
            type: 'static',
            status: 'warning',
            message: `Component name should match file name: ${fileName}`,
            file,
            duration: 0,
            severity: 'warning',
            suggestion: `Rename component to ${fileName} or rename file`,
          });
        }

        // Check for component organization
        const componentCount = (content.match(/(?:function|const)\s+\w+.*?(?:React\.FC|JSX\.Element|\(\s*\)\s*=>)/g) || []).length;
        if (componentCount > 1 && !isIndexFile) {
          results.push({
            id: `multiple-components-${fileName}`,
            name: 'Multiple Components in File',
            type: 'static',
            status: 'warning',
            message: `File contains ${componentCount} components`,
            file,
            duration: 0,
            severity: 'warning',
            suggestion: 'Split into separate files or create index file',
          });
        }
      } catch (error) {
        // File read error handled elsewhere
      }
    }

    return results;
  }

  private async validateDirectoryStructure(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    // Expected directory structure
    const expectedDirectories = [
      'src/components',
      'src/contexts',
      'src/utils',
      'src/types',
      'src/config',
    ];

    for (const dir of expectedDirectories) {
      try {
        const stats = await fs.stat(dir);
        if (!stats.isDirectory()) {
          results.push({
            id: `missing-directory-${dir.replace('/', '-')}`,
            name: 'Missing Directory',
            type: 'static',
            status: 'warning',
            message: `Expected directory not found: ${dir}`,
            duration: 0,
            severity: 'warning',
            suggestion: `Create directory: ${dir}`,
          });
        }
      } catch (error) {
        results.push({
          id: `missing-directory-${dir.replace('/', '-')}`,
          name: 'Missing Directory',
          type: 'static',
          status: 'warning',
          message: `Expected directory not found: ${dir}`,
          duration: 0,
          severity: 'warning',
          suggestion: `Create directory: ${dir}`,
        });
      }
    }

    // Check for deep nesting
    const allFiles = await glob('src/**/*.{ts,tsx,js,jsx}');
    for (const file of allFiles) {
      const depth = file.split('/').length - 2; // -2 for 'src' and filename
      if (depth > 4) {
        results.push({
          id: `deep-nesting-${path.basename(file)}`,
          name: 'Deep Directory Nesting',
          type: 'static',
          status: 'warning',
          message: `File is nested ${depth} levels deep`,
          file,
          duration: 0,
          severity: 'warning',
          suggestion: 'Consider flattening directory structure',
        });
      }
    }

    return results;
  }

  private async generateDependencyMetrics(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    // Calculate metrics
    let totalFiles = this.dependencyGraph.size;
    let totalDependencies = 0;
    let maxDependencies = 0;
    let maxDependents = 0;
    let filesWithHighDependencies = 0;
    let filesWithHighDependents = 0;

    for (const [file, node] of this.dependencyGraph.entries()) {
      const depCount = node.dependencies.size;
      const depentCount = node.dependents.size;
      
      totalDependencies += depCount;
      maxDependencies = Math.max(maxDependencies, depCount);
      maxDependents = Math.max(maxDependents, depentCount);
      
      if (depCount > 10) {
        filesWithHighDependencies++;
        results.push({
          id: `high-dependencies-${path.basename(file)}`,
          name: 'High Dependency Count',
          type: 'static',
          status: 'warning',
          message: `File has ${depCount} dependencies`,
          file,
          duration: 0,
          severity: 'warning',
          suggestion: 'Consider breaking down into smaller modules',
        });
      }
      
      if (depentCount > 15) {
        filesWithHighDependents++;
        results.push({
          id: `high-dependents-${path.basename(file)}`,
          name: 'High Dependent Count',
          type: 'static',
          status: 'warning',
          message: `File has ${depentCount} dependents`,
          file,
          duration: 0,
          severity: 'warning',
          suggestion: 'Consider if this file has too many responsibilities',
        });
      }
    }

    const avgDependencies = totalDependencies / totalFiles;

    // Generate summary metrics
    results.push({
      id: 'dependency-metrics-summary',
      name: 'Dependency Metrics Summary',
      type: 'static',
      status: 'pass',
      message: `Architecture metrics: ${totalFiles} files, avg ${avgDependencies.toFixed(1)} deps/file`,
      duration: 0,
      severity: 'info',
      details: {
        totalFiles,
        totalDependencies,
        avgDependencies,
        maxDependencies,
        maxDependents,
        filesWithHighDependencies,
        filesWithHighDependents,
      },
    });

    return results;
  }
}

export async function createArchitectureValidator(): Promise<ValidatorModule> {
  return {
    name: 'architecture-validator',
    type: 'static',
    async validate(config: ValidationConfig, options: ValidationOptions): Promise<ValidationResult[]> {
      const validator = new ArchitectureValidator(config);
      return await validator.validate(config, options);
    },
    canFix: false,
    dependencies: [],
  };
}