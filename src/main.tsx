import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Import theme system
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { ThemeVariant } from './types/components';

// Import platform abstraction and testing
import { getPlatformAPI, detectPlatform, platformDev, initializePlatform } from './platform';
import { testPlatformAPIs } from './platform/__tests__/platformValidation.ts';

// Platform-specific initialization
const initializeApp = async () => {
  try {
    // Initialize platform abstraction
    const factory = initializePlatform({
      autoInitialize: true,
      debugMode: import.meta.env.DEV,
    });

    const platformAPI = await getPlatformAPI();
    const detection = detectPlatform();

    console.log('🚀 Lucaverse Hub Platform Initialized');
    console.log('Platform:', detection.type);
    console.log('Confidence:', `${(detection.confidence * 100).toFixed(1)}%`);

    if (detection.warnings.length > 0) {
      console.warn('Platform warnings:', detection.warnings);
    }

    // Platform-specific initialization
    if (__IS_EXTENSION__) {
      console.log('🔧 Chrome Extension mode active');
    } else if (__IS_ELECTRON__) {
      console.log('🖥️ Electron desktop mode active');
    } else {
      console.log('🌐 Web browser mode active');
    }

    // Make platform testing functions globally available
    (window as any).testPlatformAPIs = testPlatformAPIs;
    (window as any).platformAPI = platformAPI;
    (window as any).platformDev = platformDev;
    (window as any).detectPlatform = detectPlatform;

    // Quick platform info function
    (window as any).platformInfo = () => {
      platformDev.logInfo();
      console.log('Available commands:');
      console.log('• testPlatformAPIs() - Run comprehensive platform tests');
      console.log('• platformAPI - Direct access to platform API');
      console.log('• platformDev.logInfo() - Show detailed platform info');
      console.log('• detectPlatform() - Get platform detection results');
    };

    console.log('🧪 Testing functions available:');
    console.log('• testPlatformAPIs() - Run platform validation tests');
    console.log('• platformInfo() - Show all available commands');
  } catch (error) {
    console.error('❌ Platform initialization failed:', error);

    // Fallback initialization without platform abstraction
    if (__IS_EXTENSION__) {
      console.log('Fallback: Chrome Extension mode');
    } else if (__IS_ELECTRON__) {
      console.log('Fallback: Electron mode');
    } else {
      console.log('Fallback: Web mode');
    }
  }
};

// Initialize the application
initializeApp()
  .then(() => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <ThemeProvider defaultTheme={ThemeVariant.Dark}>
          <App />
        </ThemeProvider>
      </StrictMode>
    );
  })
  .catch(error => {
    console.error('Application initialization failed:', error);

    // Emergency fallback render with theme provider
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <ThemeProvider defaultTheme={ThemeVariant.Dark}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100vh',
              backgroundColor: 'var(--color-background, #1a1a1a)',
              color: 'var(--color-text, white)',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h1>Lucaverse Hub</h1>
              <p>Initialization error occurred. Check console for details.</p>
              <p style={{ fontSize: '0.8em', opacity: 0.7 }}>
                Error: {error instanceof Error ? error.message : 'Unknown error'}
              </p>
            </div>
          </div>
        </ThemeProvider>
      </StrictMode>
    );
  });
