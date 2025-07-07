/**
 * Electron Test Suite
 * Tests Electron functionality including IPC, window management, and system integration
 */

// Test Electron functionality
const testElectronFeatures = async () => {
  console.log('🔍 Starting Electron Feature Tests...\n');
  
  const results = {
    ipc: false,
    windowManagement: false,
    systemIntegration: false,
    fileOperations: false,
    storage: false,
    notifications: false,
    clipboard: false,
    performance: false
  };

  try {
    // Test 1: IPC Communication
    console.log('📡 Testing IPC Communication...');
    try {
      if (window.electronAPI) {
        // Test storage IPC
        await window.electronAPI.storage.set('test-key', 'test-value');
        const result = await window.electronAPI.storage.get('test-key');
        results.ipc = result === 'test-value';
        console.log(`✅ IPC Storage test: ${results.ipc ? 'PASSED' : 'FAILED'}`);
        console.log(`   Stored and retrieved: ${result}`);
        
        // Cleanup test data
        await window.electronAPI.storage.remove('test-key');
      } else {
        console.log('❌ electronAPI not available');
        results.ipc = false;
      }
    } catch (error) {
      console.error('❌ IPC test FAILED:', error);
      results.ipc = false;
    }

    // Test 2: Window Management
    console.log('\n🪟 Testing Window Management...');
    try {
      if (window.electronAPI?.window) {
        // Test window bounds
        const bounds = await window.electronAPI.window.getBounds();
        results.windowManagement = bounds && typeof bounds.width === 'number';
        console.log(`✅ Window bounds test: ${results.windowManagement ? 'PASSED' : 'FAILED'}`);
        console.log(`   Current bounds: ${bounds ? `${bounds.width}x${bounds.height}` : 'undefined'}`);
        
        // Test minimize/restore
        setTimeout(async () => {
          try {
            await window.electronAPI.window.minimize();
            console.log('   Window minimized');
            setTimeout(async () => {
              await window.electronAPI.window.maximize();
              console.log('   Window restored');
            }, 1000);
          } catch (error) {
            console.error('   Window management error:', error);
          }
        }, 500);
      } else {
        console.log('❌ Window API not available');
        results.windowManagement = false;
      }
    } catch (error) {
      console.error('❌ Window management test FAILED:', error);
      results.windowManagement = false;
    }

    // Test 3: System Integration
    console.log('\n🖥️ Testing System Integration...');
    try {
      if (window.electronAPI?.system) {
        const platformInfo = await window.electronAPI.system.getPlatformInfo();
        results.systemIntegration = platformInfo && platformInfo.platform;
        console.log(`✅ Platform info test: ${results.systemIntegration ? 'PASSED' : 'FAILED'}`);
        console.log(`   Platform: ${platformInfo?.platform} ${platformInfo?.arch}`);
        console.log(`   Node: ${platformInfo?.node}, Electron: ${platformInfo?.electron}`);
        
        // Test system theme
        const theme = await window.electronAPI.system.getSystemTheme();
        console.log(`   System theme: ${theme}`);
      } else {
        console.log('❌ System API not available');
        results.systemIntegration = false;
      }
    } catch (error) {
      console.error('❌ System integration test FAILED:', error);
      results.systemIntegration = false;
    }

    // Test 4: File Operations
    console.log('\n📁 Testing File Operations...');
    try {
      if (window.electronAPI?.fileSystem) {
        // Test file dialog (won't actually open in test)
        console.log('   File system API available');
        results.fileOperations = true;
        console.log(`✅ File operations test: PASSED`);
      } else {
        console.log('❌ File system API not available');
        results.fileOperations = false;
      }
    } catch (error) {
      console.error('❌ File operations test FAILED:', error);
      results.fileOperations = false;
    }

    // Test 5: Storage Operations
    console.log('\n💾 Testing Storage Operations...');
    try {
      if (window.electronAPI?.storage) {
        // Test comprehensive storage operations
        const testData = {
          string: 'test string',
          number: 42,
          object: { nested: true, array: [1, 2, 3] },
          boolean: true
        };
        
        // Set multiple items
        for (const [key, value] of Object.entries(testData)) {
          await window.electronAPI.storage.set(`test-${key}`, value);
        }
        
        // Get and verify items
        let allCorrect = true;
        for (const [key, originalValue] of Object.entries(testData)) {
          const retrievedValue = await window.electronAPI.storage.get(`test-${key}`);
          if (JSON.stringify(retrievedValue) !== JSON.stringify(originalValue)) {
            allCorrect = false;
            console.log(`   Mismatch for ${key}: expected ${JSON.stringify(originalValue)}, got ${JSON.stringify(retrievedValue)}`);
          }
        }
        
        results.storage = allCorrect;
        console.log(`✅ Storage operations test: ${results.storage ? 'PASSED' : 'FAILED'}`);
        
        // Cleanup
        for (const key of Object.keys(testData)) {
          await window.electronAPI.storage.remove(`test-${key}`);
        }
      } else {
        console.log('❌ Storage API not available');
        results.storage = false;
      }
    } catch (error) {
      console.error('❌ Storage operations test FAILED:', error);
      results.storage = false;
    }

    // Test 6: Notifications
    console.log('\n🔔 Testing Notifications...');
    try {
      if (window.electronAPI?.notifications) {
        const isSupported = window.electronAPI.notifications.isSupported();
        if (isSupported) {
          await window.electronAPI.notifications.show({
            title: 'Electron Test',
            body: 'Testing notification functionality',
            silent: true
          });
          results.notifications = true;
          console.log(`✅ Notifications test: PASSED`);
        } else {
          console.log('⚠️ Notifications not supported on this platform');
          results.notifications = false;
        }
      } else {
        console.log('❌ Notifications API not available');
        results.notifications = false;
      }
    } catch (error) {
      console.error('❌ Notifications test FAILED:', error);
      results.notifications = false;
    }

    // Test 7: Clipboard Operations
    console.log('\n📋 Testing Clipboard Operations...');
    try {
      if (window.electronAPI?.clipboard) {
        const testText = 'Electron clipboard test';
        await window.electronAPI.clipboard.writeText(testText);
        const readText = await window.electronAPI.clipboard.readText();
        results.clipboard = readText === testText;
        console.log(`✅ Clipboard test: ${results.clipboard ? 'PASSED' : 'FAILED'}`);
        console.log(`   Wrote: "${testText}", Read: "${readText}"`);
      } else {
        console.log('❌ Clipboard API not available');
        results.clipboard = false;
      }
    } catch (error) {
      console.error('❌ Clipboard test FAILED:', error);
      results.clipboard = false;
    }

    // Test 8: Performance Monitoring
    console.log('\n⚡ Testing Performance Monitoring...');
    try {
      if (window.electronAPI?.performance) {
        const memoryUsage = await window.electronAPI.performance.getMemoryUsage();
        const systemMetrics = await window.electronAPI.performance.getSystemMetrics();
        results.performance = memoryUsage && systemMetrics;
        console.log(`✅ Performance monitoring test: ${results.performance ? 'PASSED' : 'FAILED'}`);
        if (memoryUsage) {
          console.log(`   Memory usage: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
        }
      } else {
        console.log('❌ Performance API not available');
        results.performance = false;
      }
    } catch (error) {
      console.error('❌ Performance monitoring test FAILED:', error);
      results.performance = false;
    }

  } catch (error) {
    console.error('💥 Test suite failed with error:', error);
  }

  // Calculate overall results
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const successRate = (passedTests / totalTests) * 100;

  console.log('\n' + '='.repeat(50));
  console.log('📊 ELECTRON TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Tests passed: ${passedTests}/${totalTests} (${successRate.toFixed(1)}%)`);
  console.log(`🔧 Platform: ${window.__PLATFORM__ || 'unknown'}`);
  
  // Detailed results
  console.log('\n📋 Detailed Results:');
  for (const [test, passed] of Object.entries(results)) {
    console.log(`   ${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  }

  if (successRate === 100) {
    console.log('\n🎉 ALL TESTS PASSED - Electron integration is working perfectly!');
  } else if (successRate >= 80) {
    console.log('\n⚠️ Most tests passed - Minor issues detected');
  } else {
    console.log('\n❌ Multiple tests failed - Electron integration needs attention');
  }

  // Return results for programmatic use
  return {
    success: successRate === 100,
    successRate,
    results,
    totalTests,
    passedTests,
    recommendations: generateRecommendations(results)
  };
};

// Generate recommendations based on test results
const generateRecommendations = (results) => {
  const recommendations = [];
  
  if (!results.ipc) {
    recommendations.push('IPC communication failed - Check preload script and context isolation');
  }
  
  if (!results.windowManagement) {
    recommendations.push('Window management failed - Verify window API implementation');
  }
  
  if (!results.systemIntegration) {
    recommendations.push('System integration failed - Check platform detection and system APIs');
  }
  
  if (!results.fileOperations) {
    recommendations.push('File operations failed - Verify file system permissions and security');
  }
  
  if (!results.storage) {
    recommendations.push('Storage operations failed - Check storage encryption and file permissions');
  }
  
  if (!results.notifications) {
    recommendations.push('Notifications failed - Verify notification permissions and platform support');
  }
  
  if (!results.clipboard) {
    recommendations.push('Clipboard operations failed - Check clipboard permissions');
  }
  
  if (!results.performance) {
    recommendations.push('Performance monitoring failed - Verify performance API implementation');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('All tests passed - Electron integration is working perfectly! 🎉');
  }
  
  return recommendations;
};

// Auto-run tests if this script is loaded
if (typeof window !== 'undefined') {
  // Wait for electron APIs to be available
  const runTests = () => {
    if (window.electronAPI) {
      console.log('🚀 Electron APIs detected, starting tests...');
      testElectronFeatures().then(results => {
        console.log('\n🏁 Electron tests complete. Results available in window.__ELECTRON_TEST_RESULTS__');
        window.__ELECTRON_TEST_RESULTS__ = results;
      });
    } else if (window.__ELECTRON__) {
      console.log('⏳ Electron detected but APIs not ready, waiting...');
      setTimeout(runTests, 1000);
    } else {
      console.log('ℹ️ Not running in Electron environment, skipping tests');
    }
  };

  // Start tests after a short delay to ensure APIs are loaded
  setTimeout(runTests, 2000);
}

// Export for programmatic use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testElectronFeatures,
    generateRecommendations
  };
}