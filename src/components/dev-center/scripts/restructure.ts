#!/usr/bin/env node

/**
 * Dev Center File Structure Migration Script
 * 
 * This script migrates the existing dev center structure to the new organized layout.
 * It handles file moves, import updates, and ensures backward compatibility.
 */

import fs from 'fs';
import path from 'path';

interface MigrationMapping {
  from: string;
  to: string;
  updateImports?: boolean;
  isDirectory?: boolean;
}

// Define the migration mappings
const migrationMappings: MigrationMapping[] = [
  // Core files
  { from: 'config/workflows.ts', to: 'core/config/workflows.ts' },
  { from: 'types/workflow.types.ts', to: 'core/types/workflow.types.ts' },
  
  // State management
  { from: 'state/DevCenterState.ts', to: 'state/stores/DevCenterState.ts' },
  { from: 'state/selectors.ts', to: 'state/selectors/index.ts' },
  { from: 'state/synchronizer.ts', to: 'state/middleware/synchronizer.ts' },
  
  // Tools
  { from: 'tools/ThemeStudio', to: 'tools/theme-studio', isDirectory: true },
  { from: 'tools/ComponentWorkshop', to: 'tools/component-workshop', isDirectory: true },
  { from: 'tools/LayoutDesigner', to: 'tools/layout-designer', isDirectory: true },
  { from: 'tools/QualityGate', to: 'tools/quality-gate', isDirectory: true },
  { from: 'tools/StateDemo.tsx', to: 'tools/shared/components/StateDemo.tsx' },
  
  // Navigation
  { from: 'navigation/DevToolbar.tsx', to: 'navigation/components/DevToolbar.tsx' },
  { from: 'navigation/QuickActions.tsx', to: 'navigation/components/QuickActions.tsx' },
  
  // Integrations
  { from: 'integrations/ToolIntegrations.ts', to: 'integrations/managers/ToolIntegrations.ts' },
  { from: 'integrations/DataBridge.ts', to: 'integrations/bridges/DataBridge.ts' },
  
  // Infrastructure
  { from: 'utils/BundleAnalyzer.ts', to: 'infrastructure/monitoring/BundleAnalyzer.ts' },
  { from: 'utils/PerformanceMonitor.ts', to: 'infrastructure/monitoring/PerformanceMonitor.ts' },
  { from: 'utils/PreloadManager.ts', to: 'infrastructure/optimization/PreloadManager.ts' },
  
  // Pages
  { from: 'DevLanding.tsx', to: 'pages/DevLanding.tsx' },
  
  // Legacy components
  { from: 'DevNavigation.tsx', to: 'legacy/navigation/DevNavigation.tsx' },
  { from: 'ComponentLibrary.tsx', to: 'legacy/components/ComponentLibrary.tsx' },
  { from: 'ValidationRunner.tsx', to: 'legacy/components/ValidationRunner.tsx' },
  { from: 'ThemePlayground.tsx', to: 'legacy/components/ThemePlayground.tsx' },
  { from: 'AdvancedThemeHub.tsx', to: 'legacy/components/AdvancedThemeHub.tsx' },
  { from: 'ComponentTestingLab.tsx', to: 'legacy/components/ComponentTestingLab.tsx' },
  { from: 'LiveDashboardPreview.tsx', to: 'legacy/components/LiveDashboardPreview.tsx' },
  
  // Context
  { from: 'contexts/DevWorkflowContext.tsx', to: 'core/contexts/DevWorkflowContext.tsx' }
];

// Import mapping for updating references
const importMappings: Record<string, string> = {
  '../config/workflows': '../core/config/workflows',
  '../types/workflow.types': '../core/types/workflow.types',
  '../state/DevCenterState': '../state/stores/DevCenterState',
  '../state/selectors': '../state/selectors',
  '../state/synchronizer': '../state/middleware/synchronizer',
  '../utils/BundleAnalyzer': '../infrastructure/monitoring/BundleAnalyzer',
  '../utils/PerformanceMonitor': '../infrastructure/monitoring/PerformanceMonitor',
  '../utils/PreloadManager': '../infrastructure/optimization/PreloadManager',
  '../navigation/DevToolbar': '../navigation/components/DevToolbar',
  '../navigation/QuickActions': '../navigation/components/QuickActions',
  '../integrations/ToolIntegrations': '../integrations/managers/ToolIntegrations',
  '../integrations/DataBridge': '../integrations/bridges/DataBridge',
  '../contexts/DevWorkflowContext': '../core/contexts/DevWorkflowContext'
};

class DevCenterRestructure {
  private basePath: string;
  private dryRun: boolean;
  
  constructor(basePath: string, dryRun: boolean = false) {
    this.basePath = basePath;
    this.dryRun = dryRun;
  }
  
  async migrate() {
    console.log('🚀 Starting Dev Center restructure...');
    console.log(`Base path: ${this.basePath}`);
    console.log(`Dry run: ${this.dryRun ? 'Yes' : 'No'}`);
    
    // Step 1: Create new directory structure (already done)
    console.log('\n📁 Directory structure created');
    
    // Step 2: Move files to new locations
    console.log('\n📦 Moving files...');
    await this.moveFiles();
    
    // Step 3: Update import paths
    console.log('\n🔄 Updating import paths...');
    await this.updateImports();
    
    // Step 4: Create barrel exports
    console.log('\n📋 Creating barrel exports...');
    await this.createBarrelExports();
    
    // Step 5: Update external references
    console.log('\n🔗 Updating external references...');
    await this.updateExternalReferences();
    
    console.log('\n✅ Migration completed successfully!');
    
    if (this.dryRun) {
      console.log('\n⚠️  This was a dry run. No actual changes were made.');
    }
  }
  
  private async moveFiles() {
    for (const mapping of migrationMappings) {
      const fromPath = path.join(this.basePath, mapping.from);
      const toPath = path.join(this.basePath, mapping.to);
      
      if (fs.existsSync(fromPath)) {
        console.log(`  Moving: ${mapping.from} -> ${mapping.to}`);
        
        if (!this.dryRun) {
          // Ensure target directory exists
          const targetDir = path.dirname(toPath);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          
          // Move file or directory
          if (mapping.isDirectory) {
            this.moveDirectory(fromPath, toPath);
          } else {
            fs.renameSync(fromPath, toPath);
          }
        }
      } else {
        console.log(`  ⚠️  Source not found: ${mapping.from}`);
      }
    }
  }
  
  private moveDirectory(from: string, to: string) {
    if (!fs.existsSync(to)) {
      fs.mkdirSync(to, { recursive: true });
    }
    
    const items = fs.readdirSync(from);
    for (const item of items) {
      const srcPath = path.join(from, item);
      const destPath = path.join(to, item);
      
      if (fs.lstatSync(srcPath).isDirectory()) {
        this.moveDirectory(srcPath, destPath);
      } else {
        fs.renameSync(srcPath, destPath);
      }
    }
    
    // Remove empty source directory
    fs.rmdirSync(from);
  }
  
  private async updateImports() {
    const filesToUpdate = await this.findFilesToUpdate();
    
    for (const filePath of filesToUpdate) {
      console.log(`  Updating imports in: ${path.relative(this.basePath, filePath)}`);
      
      if (!this.dryRun) {
        const content = fs.readFileSync(filePath, 'utf8');
        const updatedContent = this.updateImportStatements(content);
        
        if (content !== updatedContent) {
          fs.writeFileSync(filePath, updatedContent);
        }
      }
    }
  }
  
  private async findFilesToUpdate(): Promise<string[]> {
    const files: string[] = [];
    
    const walkDir = (dir: string) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.lstatSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
          files.push(fullPath);
        }
      }
    };
    
    walkDir(this.basePath);
    return files;
  }
  
  private updateImportStatements(content: string): string {
    let updatedContent = content;
    
    // Update import statements
    for (const [oldPath, newPath] of Object.entries(importMappings)) {
      const importRegex = new RegExp(`from ['"]${oldPath.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}['"]`, 'g');
      const requireRegex = new RegExp(`require\\(['"]${oldPath.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}['"]\\)`, 'g');
      
      updatedContent = updatedContent.replace(importRegex, `from '${newPath}'`);
      updatedContent = updatedContent.replace(requireRegex, `require('${newPath}')`);
    }
    
    return updatedContent;
  }
  
  private async createBarrelExports() {
    const barrelExports = [
      {
        path: 'core/index.ts',
        content: `export * from './config/workflows';
export * from './types/workflow.types';
export * from './contexts/DevWorkflowContext';`
      },
      {
        path: 'state/index.ts',
        content: `export * from './stores/DevCenterState';
export * from './selectors';
export * from './middleware/synchronizer';`
      },
      {
        path: 'tools/index.ts',
        content: `export { default as ThemeStudio } from './theme-studio';
export { default as ComponentWorkshop } from './component-workshop';
export { default as LayoutDesigner } from './layout-designer';
export { default as QualityGate } from './quality-gate';`
      },
      {
        path: 'navigation/index.ts',
        content: `export { default as DevToolbar } from './components/DevToolbar';
export { default as QuickActions } from './components/QuickActions';`
      },
      {
        path: 'integrations/index.ts',
        content: `export * from './managers/ToolIntegrations';
export * from './bridges/DataBridge';`
      },
      {
        path: 'infrastructure/index.ts',
        content: `export * from './monitoring/BundleAnalyzer';
export * from './monitoring/PerformanceMonitor';
export * from './optimization/PreloadManager';`
      },
      {
        path: 'pages/index.ts',
        content: `export { default as DevLanding } from './DevLanding';`
      },
      {
        path: 'legacy/index.ts',
        content: `export { default as ComponentLibrary } from './components/ComponentLibrary';
export { default as ValidationRunner } from './components/ValidationRunner';
export { default as ThemePlayground } from './components/ThemePlayground';
export { default as AdvancedThemeHub } from './components/AdvancedThemeHub';
export { default as ComponentTestingLab } from './components/ComponentTestingLab';
export { default as LiveDashboardPreview } from './components/LiveDashboardPreview';
export { default as DevNavigation } from './navigation/DevNavigation';`
      },
      {
        path: 'index.ts',
        content: `// Dev Center Main Exports
export * from './core';
export * from './state';
export * from './tools';
export * from './navigation';
export * from './integrations';
export * from './infrastructure';
export * from './pages';

// Legacy exports for backward compatibility
export * from './legacy';`
      }
    ];
    
    for (const barrel of barrelExports) {
      const fullPath = path.join(this.basePath, barrel.path);
      console.log(`  Creating barrel export: ${barrel.path}`);
      
      if (!this.dryRun) {
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(fullPath, barrel.content);
      }
    }
  }
  
  private async updateExternalReferences() {
    // Update main DevCenter.tsx file
    const devCenterPath = path.join(this.basePath, '../../pages/DevCenter.tsx');
    
    if (fs.existsSync(devCenterPath)) {
      console.log('  Updating DevCenter.tsx imports');
      
      if (!this.dryRun) {
        const content = fs.readFileSync(devCenterPath, 'utf8');
        const updatedContent = this.updateDevCenterImports(content);
        fs.writeFileSync(devCenterPath, updatedContent);
      }
    }
    
    // Update any other external references
    const externalFiles = [
      '../../contexts/ThemeContext.tsx',
      '../../hooks/useTheme.ts',
      '../common/Layout.tsx'
    ];
    
    for (const relativeFile of externalFiles) {
      const fullPath = path.join(this.basePath, relativeFile);
      if (fs.existsSync(fullPath)) {
        console.log(`  Updating external file: ${relativeFile}`);
        
        if (!this.dryRun) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const updatedContent = this.updateImportStatements(content);
          
          if (content !== updatedContent) {
            fs.writeFileSync(fullPath, updatedContent);
          }
        }
      }
    }
  }
  
  private updateDevCenterImports(content: string): string {
    // Update specific imports in DevCenter.tsx
    const importUpdates = [
      { old: "import DevLanding from '../components/dev-center/DevLanding';", new: "import DevLanding from '../components/dev-center/pages/DevLanding';" },
      { old: "import { DevWorkflowProvider } from '../components/dev-center/contexts/DevWorkflowContext';", new: "import { DevWorkflowProvider } from '../components/dev-center/core/contexts/DevWorkflowContext';" },
      { old: "import DevToolbar from '../components/dev-center/navigation/DevToolbar';", new: "import DevToolbar from '../components/dev-center/navigation/components/DevToolbar';" },
      { old: "import QuickActions from '../components/dev-center/navigation/QuickActions';", new: "import QuickActions from '../components/dev-center/navigation/components/QuickActions';" },
      { old: "import { preloadManager } from '../components/dev-center/utils/PreloadManager';", new: "import { preloadManager } from '../components/dev-center/infrastructure/optimization/PreloadManager';" },
      { old: "import { bundleAnalyzer } from '../components/dev-center/utils/BundleAnalyzer';", new: "import { bundleAnalyzer } from '../components/dev-center/infrastructure/monitoring/BundleAnalyzer';" },
      { old: "import { performanceMonitor } from '../components/dev-center/utils/PerformanceMonitor';", new: "import { performanceMonitor } from '../components/dev-center/infrastructure/monitoring/PerformanceMonitor';" }
    ];
    
    let updatedContent = content;
    
    for (const update of importUpdates) {
      updatedContent = updatedContent.replace(update.old, update.new);
    }
    
    return updatedContent;
  }
}

// Export for programmatic usage
export default DevCenterRestructure;

// CLI usage
if (require.main === module) {
  const basePath = process.argv[2] || '/mnt/c/Projects/lucaverse/lucaverse-hub-react/src/components/dev-center';
  const dryRun = process.argv.includes('--dry-run');
  
  const restructure = new DevCenterRestructure(basePath, dryRun);
  restructure.migrate().catch(console.error);
}