/**
 * Chrome Extension Validation Script
 * Tests extension functionality and API integration
 */

// Extension API Test Functions
const testExtensionAPIs = async () => {
  console.log('🔍 Starting Chrome Extension API Tests...\n');
  
  const results = {
    storage: false,
    tabs: false,
    messaging: false,
    notifications: false,
    permissions: false,
    manifest: false
  };

  // Test 1: Storage API
  console.log('📦 Testing Storage API...');
  try {
    await chrome.storage.local.set({ testKey: 'testValue' });
    const result = await chrome.storage.local.get('testKey');
    results.storage = result.testKey === 'testValue';
    await chrome.storage.local.remove('testKey');
    console.log(`✅ Storage test: ${results.storage ? 'PASSED' : 'FAILED'}`);
  } catch (error) {
    console.error('❌ Storage test FAILED:', error);
    results.storage = false;
  }

  // Test 2: Tabs API
  console.log('🗂️ Testing Tabs API...');
  try {
    const tabs = await chrome.tabs.query({ active: true });
    results.tabs = Array.isArray(tabs) && tabs.length > 0;
    console.log(`✅ Tabs test: ${results.tabs ? 'PASSED' : 'FAILED'}`);
    console.log(`   Active tabs found: ${tabs.length}`);
  } catch (error) {
    console.error('❌ Tabs test FAILED:', error);
    results.tabs = false;
  }

  // Test 3: Background Communication
  console.log('📡 Testing Background Communication...');
  try {
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'ping' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
    
    results.messaging = response && response.success;
    console.log(`✅ Background communication: ${results.messaging ? 'PASSED' : 'FAILED'}`);
    console.log(`   Response:`, response);
  } catch (error) {
    console.error('❌ Background communication FAILED:', error);
    results.messaging = false;
  }

  // Test 4: Notifications API
  console.log('🔔 Testing Notifications API...');
  try {
    const notificationId = await chrome.notifications.create('test-notification', {
      type: 'basic',
      iconUrl: 'icons/icon-48.png',
      title: 'Extension Test',
      message: 'Testing notification functionality'
    });
    
    results.notifications = !!notificationId;
    console.log(`✅ Notifications test: ${results.notifications ? 'PASSED' : 'FAILED'}`);
    
    // Clean up test notification
    if (notificationId) {
      setTimeout(() => chrome.notifications.clear(notificationId), 3000);
    }
  } catch (error) {
    console.error('❌ Notifications test FAILED:', error);
    results.notifications = false;
  }

  // Test 5: Permissions Check
  console.log('🔐 Testing Permissions...');
  try {
    const requiredPermissions = ['storage', 'tabs', 'activeTab', 'notifications'];
    const permissionResults = await Promise.all(
      requiredPermissions.map(permission => 
        chrome.permissions.contains({ permissions: [permission] })
      )
    );
    
    results.permissions = permissionResults.every(result => result);
    console.log(`✅ Permissions test: ${results.permissions ? 'PASSED' : 'FAILED'}`);
    
    requiredPermissions.forEach((permission, index) => {
      console.log(`   ${permission}: ${permissionResults[index] ? '✅' : '❌'}`);
    });
  } catch (error) {
    console.error('❌ Permissions test FAILED:', error);
    results.permissions = false;
  }

  // Test 6: Manifest Validation
  console.log('📋 Testing Manifest...');
  try {
    const manifest = chrome.runtime.getManifest();
    results.manifest = manifest.manifest_version === 3 && 
                      manifest.name === 'Lucaverse Hub - Productivity Dashboard';
    
    console.log(`✅ Manifest test: ${results.manifest ? 'PASSED' : 'FAILED'}`);
    console.log(`   Manifest version: ${manifest.manifest_version}`);
    console.log(`   Extension name: ${manifest.name}`);
    console.log(`   Extension version: ${manifest.version}`);
  } catch (error) {
    console.error('❌ Manifest test FAILED:', error);
    results.manifest = false;
  }

  return results;
};

// Storage Performance Test
const testStoragePerformance = async () => {
  console.log('\n⚡ Testing Storage Performance...');
  
  const testData = Array.from({ length: 100 }, (_, i) => ({
    id: `test-item-${i}`,
    data: `Sample data for item ${i}`,
    timestamp: Date.now(),
    metadata: {
      index: i,
      category: i % 3 === 0 ? 'category-a' : i % 3 === 1 ? 'category-b' : 'category-c'
    }
  }));

  try {
    // Write performance test
    const writeStart = performance.now();
    await chrome.storage.local.set({ 'performance-test-data': testData });
    const writeTime = performance.now() - writeStart;
    
    // Read performance test
    const readStart = performance.now();
    const result = await chrome.storage.local.get('performance-test-data');
    const readTime = performance.now() - readStart;
    
    // Storage usage test
    const bytesInUse = await chrome.storage.local.getBytesInUse();
    
    console.log(`✅ Storage Performance Results:`);
    console.log(`   Write time: ${writeTime.toFixed(2)}ms`);
    console.log(`   Read time: ${readTime.toFixed(2)}ms`);
    console.log(`   Data integrity: ${result['performance-test-data'].length === 100 ? '✅' : '❌'}`);
    console.log(`   Storage usage: ${(bytesInUse / 1024).toFixed(2)} KB`);
    
    // Cleanup
    await chrome.storage.local.remove('performance-test-data');
    
    return {
      writeTime,
      readTime,
      bytesInUse,
      dataIntegrity: result['performance-test-data'].length === 100
    };
  } catch (error) {
    console.error('❌ Storage performance test FAILED:', error);
    return null;
  }
};

// Extension Context Detection
const detectExtensionContext = () => {
  console.log('\n🔍 Detecting Extension Context...');
  
  const context = {
    isExtension: !!chrome.runtime.id,
    isPopup: window.location.pathname.includes('popup.html'),
    isOptions: window.location.pathname.includes('options.html'),
    isNewTab: window.location.pathname.includes('newtab.html'),
    isBackground: false,
    isContent: !chrome.extension.getViews
  };
  
  try {
    context.isBackground = chrome.extension.getBackgroundPage() === window;
  } catch (error) {
    // Not background context
  }
  
  const contextType = context.isPopup ? 'popup' : 
                     context.isOptions ? 'options' : 
                     context.isNewTab ? 'newtab' : 
                     context.isBackground ? 'background' : 
                     context.isContent ? 'content' : 'unknown';
  
  console.log(`✅ Extension context: ${contextType}`);
  console.log(`   Extension ID: ${chrome.runtime.id}`);
  console.log(`   Current URL: ${window.location.href}`);
  
  return { ...context, contextType };
};

// Main validation function
const validateExtension = async () => {
  console.log('🚀 Chrome Extension Validation Starting...\n');
  console.log('=' * 50);
  
  const startTime = performance.now();
  
  try {
    // Detect context
    const context = detectExtensionContext();
    
    // Run API tests
    const apiResults = await testExtensionAPIs();
    
    // Run performance tests
    const performanceResults = await testStoragePerformance();
    
    // Calculate overall score
    const totalTests = Object.keys(apiResults).length;
    const passedTests = Object.values(apiResults).filter(Boolean).length;
    const successRate = (passedTests / totalTests) * 100;
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    // Final report
    console.log('\n' + '=' * 50);
    console.log('📊 VALIDATION SUMMARY');
    console.log('=' * 50);
    console.log(`✅ Tests passed: ${passedTests}/${totalTests} (${successRate.toFixed(1)}%)`);
    console.log(`⏱️ Total time: ${totalTime.toFixed(2)}ms`);
    console.log(`🔧 Context: ${context.contextType}`);
    
    if (successRate === 100) {
      console.log('🎉 ALL TESTS PASSED - Extension is ready for use!');
    } else if (successRate >= 80) {
      console.log('⚠️ Most tests passed - Minor issues detected');
    } else {
      console.log('❌ Multiple tests failed - Extension needs attention');
    }
    
    // Return detailed results
    return {
      success: successRate === 100,
      successRate,
      context,
      apiResults,
      performanceResults,
      totalTime,
      recommendations: generateRecommendations(apiResults, performanceResults)
    };
    
  } catch (error) {
    console.error('💥 Validation failed with error:', error);
    return {
      success: false,
      error: error.message,
      timestamp: Date.now()
    };
  }
};

// Generate recommendations based on test results
const generateRecommendations = (apiResults, performanceResults) => {
  const recommendations = [];
  
  if (!apiResults.storage) {
    recommendations.push('Storage API failed - Check manifest permissions for "storage"');
  }
  
  if (!apiResults.tabs) {
    recommendations.push('Tabs API failed - Check manifest permissions for "tabs" and "activeTab"');
  }
  
  if (!apiResults.messaging) {
    recommendations.push('Background messaging failed - Ensure background service worker is active');
  }
  
  if (!apiResults.notifications) {
    recommendations.push('Notifications failed - Check manifest permissions for "notifications"');
  }
  
  if (!apiResults.permissions) {
    recommendations.push('Missing permissions - Review and update manifest.json permissions');
  }
  
  if (!apiResults.manifest) {
    recommendations.push('Manifest validation failed - Check manifest.json format and content');
  }
  
  if (performanceResults && performanceResults.writeTime > 100) {
    recommendations.push('Storage write performance is slow - Consider data optimization');
  }
  
  if (performanceResults && performanceResults.bytesInUse > 1024 * 1024) {
    recommendations.push('Storage usage is high - Consider implementing cleanup routines');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('All tests passed - Extension is working perfectly! 🎉');
  }
  
  return recommendations;
};

// Auto-run validation if this script is loaded directly
if (typeof window !== 'undefined' && window.location) {
  // Wait a moment for extension to initialize
  setTimeout(() => {
    validateExtension().then(results => {
      console.log('\n🏁 Validation complete. Results available in window.__EXTENSION_VALIDATION__');
      window.__EXTENSION_VALIDATION__ = results;
    });
  }, 1000);
}

// Export for programmatic use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateExtension,
    testExtensionAPIs,
    testStoragePerformance,
    detectExtensionContext
  };
}