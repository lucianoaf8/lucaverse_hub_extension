import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'
import manifest from './public/manifest.json'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  const isExtension = mode === 'extension'
  const isElectron = mode === 'electron'
  const isWeb = mode === 'web' || (!isExtension && !isElectron)

  const plugins = [react()]
  
  if (isExtension) {
    // Use the comprehensive manifest.json file
    plugins.push(crx({ 
      manifest: manifest as any,
      contentScripts: {
        matches: ['<all_urls>'],
        injectCss: true,
      },
    }))
  }

  // Add bundle analyzer for build mode
  if (command === 'build') {
    plugins.push(
      visualizer({
        filename: `dist/${mode}/bundle-analysis.html`,
        open: false,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap', // 'treemap', 'sunburst', 'network'
      })
    )
  }

  return {
    plugins,
    
    // Path resolution
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/components': path.resolve(__dirname, './src/components'),
        '@/stores': path.resolve(__dirname, './src/stores'),
        '@/hooks': path.resolve(__dirname, './src/hooks'),
        '@/utils': path.resolve(__dirname, './src/utils'),
        '@/types': path.resolve(__dirname, './src/types'),
        '@/platform': path.resolve(__dirname, './src/platform'),
      },
    },

    // Environment variables
    define: {
      __PLATFORM__: JSON.stringify(isExtension ? 'extension' : isElectron ? 'electron' : 'web'),
      __IS_EXTENSION__: JSON.stringify(isExtension),
      __IS_ELECTRON__: JSON.stringify(isElectron),
      __IS_WEB__: JSON.stringify(isWeb),
    },

    // Build configuration
    build: {
      outDir: `dist/${mode}`,
      emptyOutDir: true,
      rollupOptions: {
        input: isExtension ? {
          // Extension entry points
          popup: path.resolve(__dirname, 'popup.html'),
          options: path.resolve(__dirname, 'options.html'),
          newtab: path.resolve(__dirname, 'newtab.html'),
          background: path.resolve(__dirname, 'public/background.ts'),
          content: path.resolve(__dirname, 'src/content.ts'),
        } : isElectron ? {
          // Electron entry points
          main: path.resolve(__dirname, 'electron/main.ts'),
          preload: path.resolve(__dirname, 'electron/preload.ts'),
          renderer: path.resolve(__dirname, 'index.html'),
        } : {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          entryFileNames: isExtension ? '[name].js' : isElectron ? '[name].js' : 'assets/[name]-[hash].js',
          chunkFileNames: isExtension ? '[name].js' : isElectron ? '[name].js' : 'assets/[name]-[hash].js',
          assetFileNames: isExtension ? '[name].[ext]' : isElectron ? '[name].[ext]' : 'assets/[name]-[hash].[ext]',
          // Intelligent code splitting configuration
          manualChunks: (id) => {
            // Vendor libraries splitting
            if (id.includes('node_modules')) {
              // React ecosystem
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              // State management
              if (id.includes('zustand') || id.includes('immer')) {
                return 'vendor-state';
              }
              // Animation libraries
              if (id.includes('framer-motion') || id.includes('@dnd-kit')) {
                return 'vendor-animation';
              }
              // Utility libraries
              if (id.includes('nanoid') || id.includes('clsx') || id.includes('tailwind-merge')) {
                return 'vendor-utils';
              }
              // Testing utilities (dev only)
              if (id.includes('@testing-library') || id.includes('jest')) {
                return 'vendor-testing';
              }
              // All other vendor libraries
              return 'vendor-other';
            }
            
            // Panel component splitting
            if (id.includes('src/components/panels/')) {
              if (id.includes('SmartHub')) return 'panel-smarthub';
              if (id.includes('AIChat')) return 'panel-aichat';
              if (id.includes('TaskManager')) return 'panel-taskmanager';
              if (id.includes('Productivity')) return 'panel-productivity';
              return 'panel-shared';
            }
            
            // Platform-specific code splitting
            if (id.includes('src/platform/')) {
              if (id.includes('extension')) return isExtension ? 'platform-extension' : null;
              if (id.includes('electron')) return isElectron ? 'platform-electron' : null;
              if (id.includes('web')) return isWeb ? 'platform-web' : null;
              return 'platform-shared';
            }
            
            // Shared utilities
            if (id.includes('src/utils/') && !id.includes('__tests__')) {
              return 'utils-shared';
            }
            
            // Store modules
            if (id.includes('src/stores/')) {
              return 'stores-shared';
            }
            
            // Development tools (dev only)
            if (id.includes('src/components/debug/') || 
                id.includes('src/utils/devtools.ts') ||
                id.includes('src/utils/errorTracker.ts')) {
              return 'dev-tools';
            }
            
            // Return null for main application code
            return null;
          },
        },
        // Chunk size warnings and limits
        onwarn(warning, warn) {
          // Warn for chunks larger than 500KB
          if (warning.code === 'CIRCULAR_DEPENDENCY') {
            console.warn(`Circular dependency detected: ${warning.message}`);
          }
          warn(warning);
        },
        // Tree shaking optimization
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
        // External dependencies (for specific platforms)
        external: isElectron ? ['electron'] : [],
      },
      target: isExtension ? 'es2020' : isElectron ? 'node16' : 'es2022',
      minify: command === 'build' && !isElectron,
      sourcemap: (isExtension || isElectron) && command === 'serve',
      // Chunk size limits and warnings
      chunkSizeWarningLimit: isExtension ? 500 : isElectron ? 1000 : 800, // KB
      // Bundle analysis configuration
      reportCompressedSize: true,
      // Additional optimization settings
      assetsInlineLimit: isExtension ? 0 : 4096, // Don't inline assets in extensions
    },

    // Dev server configuration
    server: {
      port: 5173,
      host: true,
      open: !isExtension && !isElectron,
      hmr: {
        // Enable hot module reloading for development
        port: isExtension ? 24678 : isElectron ? 24679 : undefined,
      },
    },

    // CSS configuration with code splitting
    css: {
      postcss: './postcss.config.js',
      // CSS code splitting configuration
      codeSplit: !isExtension, // Enable CSS code splitting for web and electron
      preprocessorOptions: {
        // Component-specific CSS splitting
        css: {
          additionalData: `
            /* Critical CSS variables */
            :root {
              --primary-color: #3b82f6;
              --secondary-color: #8b5cf6;
              --background-color: #0f172a;
            }
          `
        }
      }
    },

    // Extension-specific optimizations
    optimizeDeps: {
      include: isExtension ? [
        'react',
        'react-dom',
        'zustand',
        'nanoid',
        'clsx',
      ] : undefined,
    },
  }
})
