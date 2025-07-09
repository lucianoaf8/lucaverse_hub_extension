import { defineConfig } from 'vite';
import { resolve } from 'path';

// Vite configuration optimized for Dev Center code splitting
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core Dev Center landing chunk (critical)
          'dev-center-core': [
            './src/components/dev-center/DevLanding.tsx',
            './src/components/dev-center/navigation/DevToolbar.tsx',
            './src/components/dev-center/navigation/QuickActions.tsx',
            './src/components/dev-center/contexts/DevWorkflowContext.tsx',
            './src/components/dev-center/config/workflows.ts',
            './src/components/dev-center/types/workflow.types.ts'
          ],
          
          // Theme Studio workflow chunk
          'dev-center-theme': [
            './src/components/dev-center/tools/ThemeStudio',
            './src/components/dev-center/tools/ThemeStudio/ColorHarmony.tsx',
            './src/components/dev-center/tools/ThemeStudio/Typography.tsx',
            './src/components/dev-center/tools/ThemeStudio/SpacingEffects.tsx',
            './src/components/dev-center/tools/ThemeStudio/ThemeExport.tsx'
          ],
          
          // Component Workshop workflow chunk
          'dev-center-component': [
            './src/components/dev-center/tools/ComponentWorkshop',
            './src/components/dev-center/tools/ComponentWorkshop/TestStates.tsx',
            './src/components/dev-center/tools/ComponentWorkshop/BuildComponent.tsx',
            './src/components/dev-center/tools/ComponentWorkshop/ComponentExport.tsx'
          ],
          
          // Layout Designer workflow chunk
          'dev-center-layout': [
            './src/components/dev-center/tools/LayoutDesigner',
            './src/components/dev-center/tools/LayoutDesigner/StructureDesign.tsx',
            './src/components/dev-center/tools/LayoutDesigner/ResponsiveDesign.tsx',
            './src/components/dev-center/tools/LayoutDesigner/LayoutPreview.tsx'
          ],
          
          // Quality Gate workflow chunk
          'dev-center-performance': [
            './src/components/dev-center/tools/QualityGate',
            './src/components/dev-center/tools/QualityGate/MeasureBaseline.tsx',
            './src/components/dev-center/tools/QualityGate/AnalyzeIssues.tsx',
            './src/components/dev-center/tools/QualityGate/OptimizePerformance.tsx'
          ],
          
          // Development utilities (low priority)
          'dev-center-utils': [
            './src/components/dev-center/utils/PreloadManager.ts',
            './src/components/dev-center/utils/BundleAnalyzer.ts',
            './src/components/dev-center/utils/PerformanceMonitor.ts'
          ],
          
          // Legacy components (separate chunk for compatibility)
          'dev-center-legacy': [
            './src/components/dev-center/ComponentLibrary.tsx',
            './src/components/dev-center/ValidationRunner.tsx',
            './src/components/dev-center/ThemePlayground.tsx',
            './src/components/dev-center/AdvancedThemeHub.tsx',
            './src/components/dev-center/ComponentTestingLab.tsx',
            './src/components/dev-center/LiveDashboardPreview.tsx'
          ]
        },
        
        // Optimize chunk loading strategy
        chunkFileNames: (chunkInfo) => {
          // Use descriptive names for dev center chunks
          if (chunkInfo.name?.startsWith('dev-center-')) {
            return `dev-center/[name]-[hash].js`;
          }
          return `chunks/[name]-[hash].js`;
        },
        
        // Ensure proper asset naming
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return `dev-center/[name]-[hash].css`;
          }
          return `assets/[name]-[hash].[ext]`;
        }
      }
    },
    
    // Optimize build performance
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug']
      }
    },
    
    // Set bundle size warnings
    chunkSizeWarningLimit: 500 // 500KB chunks
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@dev-center': resolve(__dirname, './src/components/dev-center')
    }
  },
  
  // Development server optimization
  server: {
    port: 5666,
    host: true,
    open: '/dev-center'
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      '@dnd-kit/core',
      '@dnd-kit/sortable'
    ],
    exclude: [
      // Exclude dev center modules from pre-bundling to allow proper code splitting
      './src/components/dev-center/tools/ThemeStudio',
      './src/components/dev-center/tools/ComponentWorkshop',
      './src/components/dev-center/tools/LayoutDesigner',
      './src/components/dev-center/tools/QualityGate'
    ]
  }
});