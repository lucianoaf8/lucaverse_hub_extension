/**
 * Unified Entry Point for Lucaverse Hub
 * Handles all platforms: Web, Extension (popup, newtab, options), and Electron
 */

import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ExtensionPopup } from './components/ExtensionPopup';

// Import theme system
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeVariant } from './types/components';

// Platform detection
interface PlatformConfig {
  type: 'web' | 'extension-popup' | 'extension-newtab' | 'extension-options' | 'electron';
  defaultTheme: ThemeVariant;
  enableDebug: boolean;
}

/**
 * Detect the current platform and entry point
 */
function detectCurrentPlatform(): PlatformConfig {
  const isElectron = !!(window as any).__IS_ELECTRON__ || 
                     typeof (window as any).require !== 'undefined' ||
                     !!(window as any).electronAPI;

  const isExtension = !!(window as any).chrome?.runtime?.id ||
                      !!(window as any).__LUCAVERSE_PLATFORM__ === 'chrome-extension';

  const isPopup = window.location.pathname.includes('popup.html') ||
                  (window as any).__LUCAVERSE_POPUP__ === true;

  const isNewTab = window.location.pathname.includes('newtab.html') ||
                   (window as any).__LUCAVERSE_NEW_TAB__ === true;

  const isOptions = window.location.pathname.includes('options.html') ||
                    (window as any).__LUCAVERSE_OPTIONS__ === true;

  const isDev = import.meta.env.DEV;

  if (isElectron) {
    return {
      type: 'electron',
      defaultTheme: ThemeVariant.Dark,
      enableDebug: isDev,
    };
  }

  if (isExtension) {
    if (isPopup) {
      return {
        type: 'extension-popup',
        defaultTheme: ThemeVariant.Dark,
        enableDebug: isDev,
      };
    }

    if (isNewTab) {
      return {
        type: 'extension-newtab',
        defaultTheme: ThemeVariant.Dark,
        enableDebug: isDev,
      };
    }

    if (isOptions) {
      return {
        type: 'extension-options',
        defaultTheme: ThemeVariant.Dark,
        enableDebug: isDev,
      };
    }
  }

  // Default to web
  return {
    type: 'web',
    defaultTheme: ThemeVariant.Dark,
    enableDebug: isDev,
  };
}

/**
 * Initialize platform-specific features
 */
async function initializePlatformFeatures(config: PlatformConfig) {
  try {
    console.log(`🚀 Initializing Lucaverse Hub - Platform: ${config.type}`);

    // Set platform detection globals
    (window as any).__LUCAVERSE_PLATFORM_TYPE__ = config.type;
    (window as any).__LUCAVERSE_PLATFORM__ = config.type.startsWith('extension') ? 'chrome-extension' : config.type;

    // Extension-specific initialization
    if (config.type.startsWith('extension')) {
      if (config.type === 'extension-newtab') {
        // New tab specific setup
        const urlParams = new URLSearchParams(window.location.search);
        const panel = urlParams.get('panel');
        const workspace = urlParams.get('workspace');
        const template = urlParams.get('template');

        if (panel) (window as any).__LUCAVERSE_INITIAL_PANEL__ = panel;
        if (workspace) (window as any).__LUCAVERSE_INITIAL_WORKSPACE__ = workspace;
        if (template) (window as any).__LUCAVERSE_INITIAL_TEMPLATE__ = template;

        // Notify background that new tab opened
        try {
          await chrome.runtime.sendMessage({
            action: 'newTabOpened',
            data: {
              timestamp: Date.now(),
              parameters: { panel, workspace, template },
            },
          });
        } catch (error) {
          // Ignore errors if background is not available
          console.warn('Could not communicate with background script:', error);
        }
      }
    }

    // Theme debugging setup
    if (config.enableDebug) {
      setTimeout(() => {
        const rootElement = document.documentElement;
        const primaryColor = getComputedStyle(rootElement).getPropertyValue('--color-primary');
        console.log(`🎨 Theme debug [${config.type}] - Primary color:`, primaryColor);
        console.log(`🎨 Theme debug [${config.type}] - Data theme:`, rootElement.getAttribute('data-theme'));
        
        if (!primaryColor) {
          console.warn(`⚠️ Theme colors not applied on ${config.type}! Check ThemeProvider.`);
        } else {
          console.log(`✅ Theme system working on ${config.type}`);
        }
      }, 1000);
    }

    console.log(`✅ Platform initialization complete - ${config.type}`);
    return true;
  } catch (error) {
    console.error(`❌ Platform initialization failed for ${config.type}:`, error);
    return false;
  }
}

/**
 * Unified application entry point
 */
export async function initializeLucaverseHub() {
  const config = detectCurrentPlatform();
  
  try {
    // Initialize platform features
    await initializePlatformFeatures(config);

    // Get root element
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    // Create React root and render application
    const root = ReactDOM.createRoot(rootElement);
    
    // Render appropriate component based on platform
    const AppComponent = config.type === 'extension-popup' ? ExtensionPopup : App;
    
    root.render(
      <StrictMode>
        <ThemeProvider defaultTheme={config.defaultTheme}>
          <AppComponent />
        </ThemeProvider>
      </StrictMode>
    );

    console.log(`🎨 Rendered Lucaverse Hub with theme: ${config.defaultTheme}`);
    return true;

  } catch (error) {
    console.error('Failed to initialize Lucaverse Hub:', error);
    throw error;
  }
}

// Auto-initialize when this module is imported
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLucaverseHub);
  } else {
    initializeLucaverseHub();
  }
}

export default initializeLucaverseHub;