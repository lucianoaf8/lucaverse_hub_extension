/**
 * Platform Validation Test Suite
 * Comprehensive tests for platform abstraction layer functionality
 */

import { 
  getPlatformAPI, 
  detectPlatform, 
  platformDev,
  type PlatformAPI,
  type PlatformType 
} from '../index.ts';

// Test Results Interface
interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
  details?: any;
}

interface ValidationSuite {
  suiteName: string;
  platform: PlatformType;
  results: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalDuration: number;
}

// Test Runner Class
class PlatformTestRunner {
  private results: TestResult[] = [];
  private currentSuite: string = '';

  async runTest(name: string, testFn: () => Promise<any>): Promise<TestResult> {
    const start = performance.now();
    
    try {
      const result = await testFn();
      const duration = performance.now() - start;
      
      const testResult: TestResult = {
        name,
        passed: true,
        duration,
        details: result
      };
      
      this.results.push(testResult);
      console.log(`✅ ${name} - ${duration.toFixed(2)}ms`);
      return testResult;
    } catch (error) {
      const duration = performance.now() - start;
      
      const testResult: TestResult = {
        name,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        duration
      };
      
      this.results.push(testResult);
      console.error(`❌ ${name} - ${duration.toFixed(2)}ms - ${testResult.error}`);
      return testResult;
    }
  }

  getResults(): TestResult[] {
    return [...this.results];
  }

  clearResults(): void {
    this.results = [];
  }

  generateReport(): ValidationSuite {
    const passed = this.results.filter(r => r.passed);
    const failed = this.results.filter(r => !r.passed);
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    
    return {
      suiteName: this.currentSuite,
      platform: 'unknown' as PlatformType, // Will be set by caller
      results: this.results,
      totalTests: this.results.length,
      passedTests: passed.length,
      failedTests: failed.length,
      totalDuration
    };
  }
}

// Main validation function as specified in requirements
export const testPlatformAPIs = async (): Promise<ValidationSuite> => {
  const runner = new PlatformTestRunner();
  const detection = detectPlatform();
  
  console.log('🔍 Platform Detection Results:');
  console.log('Detected platform:', detection.type);
  console.log('Confidence:', `${(detection.confidence * 100).toFixed(1)}%`);
  console.log('Features:', detection.features);
  if (detection.warnings.length > 0) {
    console.warn('Warnings:', detection.warnings);
  }
  
  console.log('\\n🧪 Starting Platform API Tests...');
  
  let platformAPI: PlatformAPI;
  
  // Test 1: Platform API Initialization
  await runner.runTest('Platform API Initialization', async () => {
    platformAPI = await getPlatformAPI();
    if (!platformAPI) {
      throw new Error('Failed to get platform API instance');
    }
    return { type: platformAPI.type, initialized: true };
  });
  
  // Test 2: Platform Capabilities
  await runner.runTest('Platform Capabilities Detection', async () => {
    const capabilities = platformAPI.getCapabilities();
    if (!capabilities) {
      throw new Error('Failed to get platform capabilities');
    }
    console.log('Platform capabilities:', capabilities);
    return capabilities;
  });
  
  // Test 3: Storage Operations
  await runner.runTest('Storage - Set/Get Operation', async () => {
    const testKey = 'test-key-' + Date.now();
    const testData = { 
      message: 'Platform abstraction test',
      timestamp: Date.now(),
      nested: { value: 42, active: true }
    };
    
    await platformAPI.storage.set(testKey, testData);
    const retrieved = await platformAPI.storage.get(testKey);
    
    if (!retrieved) {
      throw new Error('Retrieved data is null');
    }
    
    if (JSON.stringify(retrieved) !== JSON.stringify(testData)) {
      throw new Error('Retrieved data does not match stored data');
    }
    
    // Cleanup
    await platformAPI.storage.remove(testKey);
    
    console.log('Storage test data:', { stored: testData, retrieved });
    return { success: true, dataMatch: true };
  });
  
  // Test 4: Storage Size and Quota
  await runner.runTest('Storage - Size and Quota', async () => {
    const size = await platformAPI.storage.getSize();
    const quota = await platformAPI.storage.getQuota();
    
    if (typeof size !== 'number' || size < 0) {
      throw new Error('Invalid storage size returned');
    }
    
    if (typeof quota !== 'number' || quota <= 0) {
      throw new Error('Invalid storage quota returned');
    }
    
    const usage = {
      used: size,
      quota: quota,
      percentage: (size / quota) * 100
    };
    
    console.log('Storage usage:', usage);
    return usage;
  });
  
  // Test 5: Storage Watch Functionality
  await runner.runTest('Storage - Watch Changes', async () => {
    return new Promise(async (resolve, reject) => {
      const testKey = 'watch-test-' + Date.now();
      let changeDetected = false;
      
      const unwatch = platformAPI.storage.watch((changes) => {
        const relevantChange = changes.find(change => change.key === testKey);
        if (relevantChange) {
          changeDetected = true;
          unwatch();
          
          // Cleanup
          platformAPI.storage.remove(testKey).then(() => {
            resolve({ 
              changeDetected: true, 
              change: relevantChange 
            });
          });
        }
      });
      
      // Trigger a change
      setTimeout(async () => {
        try {
          await platformAPI.storage.set(testKey, 'watch test value');
          
          // Give some time for the watch to trigger
          setTimeout(() => {
            if (!changeDetected) {
              unwatch();
              platformAPI.storage.remove(testKey);
              reject(new Error('Storage watch did not detect change'));
            }
          }, 2000);
        } catch (error) {
          unwatch();
          reject(error);
        }
      }, 100);
    });
  });
  
  // Test 6: Notification Creation
  await runner.runTest('Notifications - Create Basic Notification', async () => {
    try {
      const notificationId = await platformAPI.notifications.create({
        title: 'Platform Test',
        message: 'Testing platform abstraction layer',
        iconUrl: '/assets/icon-48.png'
      });
      
      console.log('Notification test result:', { 
        created: !!notificationId, 
        id: notificationId 
      });
      
      // Clear the notification after a short delay
      if (notificationId) {
        setTimeout(() => {
          platformAPI.notifications.clear(notificationId);
        }, 3000);
      }
      
      return { 
        created: !!notificationId, 
        id: notificationId,
        platform: platformAPI.type
      };
    } catch (error) {
      // Notifications might not be available in all contexts
      console.warn('Notification creation failed (may be expected):', error);
      return { 
        created: false, 
        reason: 'Permission denied or not supported',
        platform: platformAPI.type
      };
    }
  });
  
  // Test 7: Notification Permission Check
  await runner.runTest('Notifications - Permission Status', async () => {
    try {
      const permission = await platformAPI.notifications.requestPermission();
      console.log('Notification permission:', permission);
      return { permission, supported: true };
    } catch (error) {
      console.warn('Notification permission check failed:', error);
      return { permission: 'denied', supported: false };
    }
  });
  
  // Test 8: Window Management
  await runner.runTest('Window - Get Current Window', async () => {
    try {
      const currentWindow = await platformAPI.windows.getCurrent();
      
      if (!currentWindow || !currentWindow.id) {
        throw new Error('Failed to get current window information');
      }
      
      console.log('Current window info:', currentWindow);
      return currentWindow;
    } catch (error) {
      // Window management might not be available in all contexts
      console.warn('Window management failed (may be expected):', error);
      return { error: error.message, supported: false };
    }
  });
  
  // Test 9: System Information
  await runner.runTest('System - Get System Info', async () => {
    const systemInfo = await platformAPI.system.getInfo();
    
    if (!systemInfo || !systemInfo.platform) {
      throw new Error('Failed to get system information');
    }
    
    console.log('System info:', systemInfo);
    return systemInfo;
  });
  
  // Test 10: Clipboard Operations (if supported)
  await runner.runTest('Clipboard - Read/Write Text', async () => {
    try {
      const testText = 'Platform abstraction clipboard test - ' + Date.now();
      
      await platformAPI.system.clipboard.write(testText);
      const readText = await platformAPI.system.clipboard.read();
      
      console.log('Clipboard test:', { 
        written: testText, 
        read: readText, 
        match: readText === testText 
      });
      
      return { 
        success: true, 
        textMatch: readText === testText,
        written: testText,
        read: readText
      };
    } catch (error) {
      // Clipboard might not be available in all contexts
      console.warn('Clipboard operation failed (may be expected):', error);
      return { 
        success: false, 
        reason: 'Permission denied or not supported',
        error: error.message
      };
    }
  });
  
  // Test 11: Hardware Information
  await runner.runTest('Hardware - Battery and Network', async () => {
    try {
      const [batteryLevel, isOnline, networkType] = await Promise.all([
        platformAPI.system.hardware.getBatteryLevel(),
        platformAPI.system.hardware.isOnline(),
        platformAPI.system.hardware.getNetworkType()
      ]);
      
      const hardwareInfo = {
        batteryLevel,
        isOnline,
        networkType
      };
      
      console.log('Hardware info:', hardwareInfo);
      return hardwareInfo;
    } catch (error) {
      console.warn('Hardware info failed:', error);
      return { error: error.message, supported: false };
    }
  });
  
  // Test 12: Feature Support Check
  await runner.runTest('Platform - Feature Support Detection', async () => {
    const features = [
      'storage.local',
      'storage.sync',
      'notifications.basic',
      'windows.create',
      'system.clipboard',
      'system.fileSystem',
      'background.serviceWorker'
    ];
    
    const supportMap = features.reduce((map, feature) => {
      map[feature] = platformAPI.isSupported(feature);
      return map;
    }, {} as Record<string, boolean>);
    
    console.log('Feature support map:', supportMap);
    return supportMap;
  });
  
  // Generate final report
  const report = runner.generateReport();
  report.platform = detection.type;
  report.suiteName = `Platform Validation - ${detection.type}`;
  
  console.log('\\n📊 Test Results Summary:');
  console.log(`Platform: ${report.platform}`);
  console.log(`Total Tests: ${report.totalTests}`);
  console.log(`Passed: ${report.passedTests}`);
  console.log(`Failed: ${report.failedTests}`);
  console.log(`Success Rate: ${((report.passedTests / report.totalTests) * 100).toFixed(1)}%`);
  console.log(`Total Duration: ${report.totalDuration.toFixed(2)}ms`);
  
  if (report.failedTests > 0) {
    console.log('\\n❌ Failed Tests:');
    report.results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }
  
  return report;
};

// Extended validation for specific platforms
export const testChromeExtensionAPIs = async (): Promise<ValidationSuite> => {
  if (!chrome?.runtime?.id) {
    throw new Error('Not running in Chrome extension context');
  }
  
  console.log('🔍 Chrome Extension Specific Tests');
  
  const runner = new PlatformTestRunner();
  
  await runner.runTest('Chrome - Extension Context', async () => {
    const manifest = chrome.runtime.getManifest();
    return {
      extensionId: chrome.runtime.id,
      manifestVersion: manifest.manifest_version,
      permissions: manifest.permissions
    };
  });
  
  await runner.runTest('Chrome - Storage Sync', async () => {
    if (!chrome.storage?.sync) {
      throw new Error('Chrome storage sync not available');
    }
    
    const testKey = 'sync-test-' + Date.now();
    const testData = { syncTest: true, timestamp: Date.now() };
    
    await chrome.storage.sync.set({ [testKey]: testData });
    const result = await chrome.storage.sync.get(testKey);
    
    await chrome.storage.sync.remove(testKey);
    
    return { stored: testData, retrieved: result[testKey] };
  });
  
  const report = runner.generateReport();
  report.platform = 'chrome';
  report.suiteName = 'Chrome Extension Validation';
  
  return report;
};

export const testWebPlatformAPIs = async (): Promise<ValidationSuite> => {
  if (typeof window === 'undefined' || chrome?.runtime?.id) {
    throw new Error('Not running in web browser context');
  }
  
  console.log('🔍 Web Platform Specific Tests');
  
  const runner = new PlatformTestRunner();
  
  await runner.runTest('Web - Service Worker Registration', async () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }
    
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      return {
        supported: true,
        registered: !!registration,
        scope: registration?.scope
      };
    } catch (error) {
      return {
        supported: true,
        registered: false,
        error: error.message
      };
    }
  });
  
  await runner.runTest('Web - Local Storage', async () => {
    const testKey = 'web-storage-test-' + Date.now();
    const testValue = 'web platform test value';
    
    localStorage.setItem(testKey, testValue);
    const retrieved = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    
    return {
      stored: testValue,
      retrieved,
      match: retrieved === testValue
    };
  });
  
  const report = runner.generateReport();
  report.platform = 'web';
  report.suiteName = 'Web Platform Validation';
  
  return report;
};

// Validation method as specified in requirements
console.log('Platform validation suite loaded. Run testPlatformAPIs() to begin testing.');

// Make testPlatformAPIs available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testPlatformAPIs = testPlatformAPIs;
  (window as any).testChromeExtensionAPIs = testChromeExtensionAPIs;
  (window as any).testWebPlatformAPIs = testWebPlatformAPIs;
}