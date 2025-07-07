import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

/**
 * Chrome Extension New Tab Override
 * Replaces Chrome's default new tab with Lucaverse Hub dashboard
 */

// Initialize extension context for new tab
const initializeNewTab = async () => {
  try {
    // Set platform detection for extension mode
    (window as any).__LUCAVERSE_PLATFORM__ = 'chrome-extension';
    (window as any).__LUCAVERSE_NEW_TAB__ = true;

    // Get URL parameters to determine initial view
    const urlParams = new URLSearchParams(window.location.search);
    const panel = urlParams.get('panel');
    const workspace = urlParams.get('workspace');
    const template = urlParams.get('template');

    // Set initial state based on URL parameters
    if (panel) {
      (window as any).__LUCAVERSE_INITIAL_PANEL__ = panel;
    }
    if (workspace) {
      (window as any).__LUCAVERSE_INITIAL_WORKSPACE__ = workspace;
    }
    if (template) {
      (window as any).__LUCAVERSE_INITIAL_TEMPLATE__ = template;
    }

    // Notify background that new tab opened
    chrome.runtime
      .sendMessage({
        action: 'newTabOpened',
        data: {
          timestamp: Date.now(),
          parameters: { panel, workspace, template },
        },
      })
      .catch(() => {
        // Ignore errors if background is not available
      });

    console.log('Lucaverse Hub new tab initialized');
  } catch (error) {
    console.error('New tab initialization failed:', error);
  }
};

// Initialize before rendering
initializeNewTab().then(() => {
  // Render the main app
  const root = ReactDOM.createRoot(document.getElementById('root')!);
  root.render(<App />);
});
