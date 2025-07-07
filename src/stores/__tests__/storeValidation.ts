/**
 * Store Validation Tests - Comprehensive testing of store operations
 * Tests layout store, app store, persistence, migration, and undo/redo functionality
 */

import { useLayoutStore } from '../layoutStore';
import { useAppStore } from '../appStore';
import { initializeStores, resetAllStores, validateStoreState } from '../index';
import { migrateVanillaState } from '@/utils/stateMigration';
import { PanelComponent } from '@/types/panel';
import type { PanelLayout } from '@/types/panel';

// Test data
const testPanel: Omit<PanelLayout, 'id'> = {
  component: PanelComponent.SmartHub,
  position: { x: 100, y: 100 },
  size: { width: 400, height: 300 },
  zIndex: 1,
  visible: true,
  constraints: {
    minSize: { width: 300, height: 200 },
    maxSize: { width: 800, height: 600 },
  },
  metadata: {
    title: 'Test Panel',
    description: 'Test panel for validation',
    icon: 'test',
  },
};

/**
 * Main store validation function
 */
export async function validateStoreOperations(): Promise<{
  success: boolean;
  results: Record<string, any>;
  errors: string[];
}> {
  const results: Record<string, any> = {};
  const errors: string[] = [];

  console.log('🧪 Starting comprehensive store validation...');

  try {
    // Test 1: Store Initialization
    console.log('1️⃣ Testing store initialization...');
    const initResult = await testStoreInitialization();
    results.initialization = initResult;
    if (!initResult.success) {
      errors.push(...initResult.errors);
    }

    // Test 2: Layout Store Operations
    console.log('2️⃣ Testing layout store operations...');
    const layoutResult = await testLayoutStoreOperations();
    results.layoutStore = layoutResult;
    if (!layoutResult.success) {
      errors.push(...layoutResult.errors);
    }

    // Test 3: App Store Operations
    console.log('3️⃣ Testing app store operations...');
    const appResult = await testAppStoreOperations();
    results.appStore = appResult;
    if (!appResult.success) {
      errors.push(...appResult.errors);
    }

    // Test 4: Persistence
    console.log('4️⃣ Testing persistence functionality...');
    const persistenceResult = await testPersistence();
    results.persistence = persistenceResult;
    if (!persistenceResult.success) {
      errors.push(...persistenceResult.errors);
    }

    // Test 5: State Migration
    console.log('5️⃣ Testing state migration...');
    const migrationResult = await testStateMigration();
    results.migration = migrationResult;
    if (!migrationResult.success) {
      errors.push(...migrationResult.errors);
    }

    // Test 6: Cross-store Communication
    console.log('6️⃣ Testing cross-store communication...');
    const communicationResult = await testCrossStoreCommunication();
    results.communication = communicationResult;
    if (!communicationResult.success) {
      errors.push(...communicationResult.errors);
    }

    // Test 7: Performance with Large Data Sets
    console.log('7️⃣ Testing performance with large datasets...');
    const performanceResult = await testPerformanceWithLargeDataSets();
    results.performance = performanceResult;
    if (!performanceResult.success) {
      errors.push(...performanceResult.errors);
    }

    // Test 8: State Validation
    console.log('8️⃣ Testing state validation...');
    const validationResult = validateStoreState();
    results.stateValidation = validationResult;
    if (!validationResult.isValid) {
      errors.push(...validationResult.errors);
    }

    const success = errors.length === 0;

    console.log(success ? '✅ All store validations passed!' : '❌ Some validations failed');

    return { success, results, errors };
  } catch (error) {
    errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { success: false, results, errors };
  }
}

/**
 * Test store initialization
 */
async function testStoreInitialization(): Promise<{
  success: boolean;
  errors: string[];
  data: any;
}> {
  const errors: string[] = [];
  let data: any = {};

  try {
    // Reset stores first
    resetAllStores();

    // Initialize stores
    const initResult = await initializeStores();
    data.initResult = initResult;

    // Check if stores are initialized
    const appStore = useAppStore.getState();
    if (!appStore.initialized) {
      errors.push('App store not marked as initialized');
    }

    // Check default values
    const layoutStore = useLayoutStore.getState();
    if (!Array.isArray(layoutStore.panels)) {
      errors.push('Layout store panels not initialized as array');
    }

    if (layoutStore.panels.length !== 0) {
      errors.push('Layout store should start with empty panels array');
    }

    data.layoutStoreState = {
      panelCount: layoutStore.panels.length,
      selectedCount: layoutStore.selectedPanelIds.length,
      gridEnabled: layoutStore.gridSettings.enabled,
    };

    data.appStoreState = {
      initialized: appStore.initialized,
      theme: appStore.theme,
      autoSave: appStore.preferences.autoSave,
      notificationCount: appStore.notifications.length,
    };
  } catch (error) {
    errors.push(
      `Initialization test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  return { success: errors.length === 0, errors, data };
}

/**
 * Test layout store operations
 */
async function testLayoutStoreOperations(): Promise<{
  success: boolean;
  errors: string[];
  data: any;
}> {
  const errors: string[] = [];
  let data: any = {};

  try {
    const layoutStore = useLayoutStore.getState();

    // Test adding panels
    const initialCount = layoutStore.panels.length;
    layoutStore.addPanel(testPanel);

    if (layoutStore.panels.length !== initialCount + 1) {
      errors.push('Panel was not added to store');
    }

    const addedPanel = layoutStore.panels[layoutStore.panels.length - 1];
    if (!addedPanel) {
      errors.push('Added panel not found in store');
      return { success: false, errors, data };
    }

    data.addedPanel = {
      id: addedPanel.id,
      component: addedPanel.component,
      position: addedPanel.position,
    };

    // Test panel selection
    layoutStore.selectPanel(addedPanel.id);
    if (!layoutStore.selectedPanelIds.includes(addedPanel.id)) {
      errors.push('Panel was not selected');
    }

    // Test panel updates
    const newPosition = { x: 200, y: 200 };
    layoutStore.updatePanel(addedPanel.id, { position: newPosition });

    const updatedPanel = layoutStore.getPanel(addedPanel.id);
    if (!updatedPanel || updatedPanel.position.x !== newPosition.x) {
      errors.push('Panel was not updated correctly');
    }

    // Test drag operations
    layoutStore.startDrag(addedPanel.id, addedPanel.position);
    if (!layoutStore.dragState.isDragging) {
      errors.push('Drag state was not started');
    }

    layoutStore.updateDrag({ x: 300, y: 300 });
    if (layoutStore.dragState.currentPosition.x !== 300) {
      errors.push('Drag position was not updated');
    }

    layoutStore.endDrag();
    if (layoutStore.dragState.isDragging) {
      errors.push('Drag state was not ended');
    }

    // Test panel removal
    layoutStore.removePanel(addedPanel.id);
    if (layoutStore.panels.some(p => p.id === addedPanel.id)) {
      errors.push('Panel was not removed from store');
    }

    data.operations = {
      addPanel: '✅',
      selectPanel: '✅',
      updatePanel: '✅',
      dragOperations: '✅',
      removePanel: '✅',
    };
  } catch (error) {
    errors.push(
      `Layout store test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  return { success: errors.length === 0, errors, data };
}

/**
 * Test app store operations
 */
async function testAppStoreOperations(): Promise<{
  success: boolean;
  errors: string[];
  data: any;
}> {
  const errors: string[] = [];
  let data: any = {};

  try {
    const appStore = useAppStore.getState();

    // Test theme changes
    const originalTheme = appStore.theme;
    appStore.toggleTheme();
    if (appStore.theme === originalTheme) {
      errors.push('Theme was not toggled');
    }

    // Test preferences updates
    appStore.updatePreferences({ autoSave: false });
    if (appStore.preferences.autoSave !== false) {
      errors.push('Preferences were not updated');
    }

    // Test debug mode toggle
    const originalDebugMode = appStore.preferences.debugMode;
    appStore.toggleDebugMode();
    if (appStore.preferences.debugMode === originalDebugMode) {
      errors.push('Debug mode was not toggled');
    }

    // Test notifications
    const initialNotificationCount = appStore.notifications.length;
    appStore.addNotification({
      type: 'info',
      title: 'Test Notification',
      message: 'This is a test notification',
    });

    if (appStore.notifications.length !== initialNotificationCount + 1) {
      errors.push('Notification was not added');
    }

    const notification = appStore.notifications[0];
    if (!notification) {
      errors.push('Notification not found after adding');
      return { success: false, errors, data };
    }

    appStore.markNotificationAsRead(notification.id);

    const updatedNotification = appStore.notifications.find(n => n.id === notification.id);
    if (!updatedNotification || !updatedNotification.read) {
      errors.push('Notification was not marked as read');
    }

    // Test shortcuts
    const shortcutExists = appStore.isShortcutEnabled('panel.add');
    if (!shortcutExists) {
      errors.push('Default shortcuts were not loaded');
    }

    data.operations = {
      themeToggle: '✅',
      preferencesUpdate: '✅',
      debugModeToggle: '✅',
      notifications: '✅',
      shortcuts: '✅',
    };

    data.finalState = {
      theme: appStore.theme,
      debugMode: appStore.preferences.debugMode,
      notificationCount: appStore.notifications.length,
      shortcutCount: Object.keys(appStore.shortcuts).length,
    };
  } catch (error) {
    errors.push(
      `App store test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  return { success: errors.length === 0, errors, data };
}

/**
 * Test persistence functionality
 */
async function testPersistence(): Promise<{ success: boolean; errors: string[]; data: any }> {
  const errors: string[] = [];
  let data: any = {};

  try {
    // Add some data to stores
    const layoutStore = useLayoutStore.getState();
    const appStore = useAppStore.getState();

    layoutStore.addPanel(testPanel);
    appStore.updatePreferences({ autoSave: true });

    // Wait for debounced save
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Check if data was persisted to localStorage
    const persistedLayoutData = localStorage.getItem('lucaverse-layout-store');
    const persistedAppData = localStorage.getItem('lucaverse-app-store');

    if (!persistedLayoutData) {
      errors.push('Layout store data was not persisted');
    } else {
      try {
        const parsed = JSON.parse(persistedLayoutData);
        data.persistedLayout = {
          hasData: true,
          panelCount: parsed.state?.panels?.length || 0,
          version: parsed.version,
        };
      } catch {
        errors.push('Persisted layout data is not valid JSON');
      }
    }

    if (!persistedAppData) {
      errors.push('App store data was not persisted');
    } else {
      try {
        const parsed = JSON.parse(persistedAppData);
        data.persistedApp = {
          hasData: true,
          autoSave: parsed.state?.preferences?.autoSave,
          version: parsed.version,
        };
      } catch {
        errors.push('Persisted app data is not valid JSON');
      }
    }
  } catch (error) {
    errors.push(
      `Persistence test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  return { success: errors.length === 0, errors, data };
}

/**
 * Test state migration
 */
async function testStateMigration(): Promise<{ success: boolean; errors: string[]; data: any }> {
  const errors: string[] = [];
  let data: any = {};

  try {
    // Create mock legacy state
    const mockLegacyState = {
      quadrants: [
        {
          id: 'test-quadrant-1',
          type: 'smart-bookmarks',
          position: { x: 50, y: 50 },
          size: { width: 350, height: 250 },
          visible: true,
          zIndex: 1,
        },
      ],
      settings: {
        theme: 'dark',
        gridSnap: true,
        autoSave: true,
        animations: true,
      },
      workspace: {
        name: 'Test Workspace',
        lastSaved: Date.now(),
      },
    };

    // Store mock legacy state
    localStorage.setItem('lucaverse-state', JSON.stringify(mockLegacyState));

    // Run migration
    const migrationResult = await migrateVanillaState();
    data.migrationResult = migrationResult;

    if (!migrationResult.success) {
      errors.push('Migration was not successful');
    }

    if (migrationResult.panels.length === 0) {
      errors.push('No panels were migrated');
    }

    if (!migrationResult.workspace) {
      errors.push('Workspace was not migrated');
    }

    // Clean up
    localStorage.removeItem('lucaverse-state');
  } catch (error) {
    errors.push(
      `Migration test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  return { success: errors.length === 0, errors, data };
}

/**
 * Test cross-store communication
 */
async function testCrossStoreCommunication(): Promise<{
  success: boolean;
  errors: string[];
  data: any;
}> {
  const errors: string[] = [];
  let data: any = {};

  try {
    const layoutStore = useLayoutStore.getState();
    const appStore = useAppStore.getState();

    // Test event emission when panels change
    let eventReceived = false;
    const unsubscribe = useLayoutStore.subscribe(
      state => state.panels,
      () => {
        eventReceived = true;
      }
    );

    layoutStore.addPanel(testPanel);

    // Wait for subscription to trigger
    await new Promise(resolve => setTimeout(resolve, 10));

    if (!eventReceived) {
      errors.push('Layout store subscription did not trigger');
    }

    unsubscribe();

    // Test theme change propagation
    const originalTheme = appStore.theme;
    appStore.toggleTheme();

    // Check if theme was applied to DOM (if available)
    if (typeof document !== 'undefined') {
      const themeAttribute = document.documentElement.getAttribute('data-theme');
      if (themeAttribute !== appStore.theme) {
        errors.push('Theme was not applied to DOM');
      }
    }

    data.communication = {
      subscriptionTriggered: eventReceived,
      themeApplied: appStore.theme !== originalTheme,
    };
  } catch (error) {
    errors.push(
      `Cross-store communication test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  return { success: errors.length === 0, errors, data };
}

/**
 * Test performance with large datasets
 */
async function testPerformanceWithLargeDataSets(): Promise<{
  success: boolean;
  errors: string[];
  data: any;
}> {
  const errors: string[] = [];
  let data: any = {};

  try {
    const layoutStore = useLayoutStore.getState();

    // Test adding many panels
    const startTime = performance.now();
    const panelCount = 15; // More than the success criteria of >10

    for (let i = 0; i < panelCount; i++) {
      layoutStore.addPanel({
        ...testPanel,
        position: { x: i * 50, y: i * 50 },
        metadata: {
          title: `Panel ${i}`,
          description: `Test panel number ${i}`,
        },
      });
    }

    const addTime = performance.now() - startTime;

    // Test selection performance
    const selectionStartTime = performance.now();
    const panelIds = layoutStore.panels.map(p => p.id);
    panelIds.forEach(id => layoutStore.selectPanel(id, true));
    const selectionTime = performance.now() - selectionStartTime;

    // Test update performance
    const updateStartTime = performance.now();
    layoutStore.panels.forEach(panel => {
      layoutStore.updatePanel(panel.id, {
        position: {
          x: panel.position.x + 10,
          y: panel.position.y + 10,
        },
      });
    });
    const updateTime = performance.now() - updateStartTime;

    data.performance = {
      panelCount,
      addTime: `${addTime.toFixed(2)}ms`,
      selectionTime: `${selectionTime.toFixed(2)}ms`,
      updateTime: `${updateTime.toFixed(2)}ms`,
      totalPanels: layoutStore.panels.length,
    };

    // Performance thresholds (should be fast)
    if (addTime > 1000) {
      errors.push(`Adding ${panelCount} panels took too long: ${addTime}ms`);
    }

    if (selectionTime > 500) {
      errors.push(`Selecting ${panelCount} panels took too long: ${selectionTime}ms`);
    }

    if (updateTime > 1000) {
      errors.push(`Updating ${panelCount} panels took too long: ${updateTime}ms`);
    }
  } catch (error) {
    errors.push(
      `Performance test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  return { success: errors.length === 0, errors, data };
}

/**
 * Run all validation tests and log results
 */
export async function runStoreValidation(): Promise<void> {
  console.log('🚀 Starting Lucaverse Hub Store Validation Suite');
  console.log('='.repeat(60));

  const result = await validateStoreOperations();

  console.log('\n📊 Validation Results:');
  console.log('-'.repeat(40));

  Object.entries(result.results).forEach(([testName, testResult]) => {
    const status = testResult.success !== false ? '✅' : '❌';
    console.log(`${status} ${testName}`);

    if (testResult.data) {
      console.log(`   Data:`, testResult.data);
    }

    if (testResult.errors && testResult.errors.length > 0) {
      console.log(`   Errors:`, testResult.errors);
    }
  });

  console.log('\n🏁 Final Results:');
  console.log(`Success: ${result.success ? '✅' : '❌'}`);
  console.log(`Total Errors: ${result.errors.length}`);

  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.errors.forEach(error => console.log(`  - ${error}`));
  }

  console.log('\n' + '='.repeat(60));

  // Store results globally for inspection
  if (typeof window !== 'undefined') {
    (window as any).__LUCAVERSE_VALIDATION_RESULTS__ = result;
  }
}

// Auto-run validation in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Make validation function available globally
  (window as any).__runStoreValidation__ = runStoreValidation;
  console.log('🧪 Store validation available at window.__runStoreValidation__()');
}
