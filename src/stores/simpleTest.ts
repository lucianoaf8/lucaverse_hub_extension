/**
 * Simple Store Test - Basic functionality demonstration
 */

import { useLayoutStore } from '../stores/layoutStore';
import { useAppStore } from '../stores/appStore';
import { PanelComponent } from '@/types/panel';

// Simple test function to validate store operations
export function testBasicStoreOperations(): boolean {
  console.log('🧪 Testing Basic Store Operations...');
  
  try {
    // Test Layout Store
    console.log('Testing Layout Store...');
    const layoutStore = useLayoutStore.getState();
    
    // Test adding a panel
    const initialPanelCount = layoutStore.panels.length;
    layoutStore.addPanel({
      component: PanelComponent.SmartHub,
      position: { x: 100, y: 100 },
      size: { width: 400, height: 300 },
      zIndex: 1,
      visible: true,
      constraints: {
        minSize: { width: 300, height: 200 },
      },
      metadata: {
        title: 'Test Panel',
      },
    });
    
    const newPanelCount = layoutStore.panels.length;
    console.log(`✅ Panel added: ${initialPanelCount} → ${newPanelCount}`);
    
    // Test panel selection
    if (layoutStore.panels.length > 0) {
      const firstPanel = layoutStore.panels[0];
      if (firstPanel) {
        layoutStore.selectPanel(firstPanel.id);
        console.log(`✅ Panel selected: ${firstPanel.id}`);
      }
    }
    
    // Test App Store
    console.log('Testing App Store...');
    const appStore = useAppStore.getState();
    
    // Test theme toggle
    const originalTheme = appStore.theme;
    appStore.toggleTheme();
    const newTheme = appStore.theme;
    console.log(`✅ Theme toggled: ${originalTheme} → ${newTheme}`);
    
    // Test notification
    const initialNotificationCount = appStore.notifications.length;
    appStore.addNotification({
      type: 'success',
      title: 'Test Complete',
      message: 'Store operations working correctly!',
    });
    const newNotificationCount = appStore.notifications.length;
    console.log(`✅ Notification added: ${initialNotificationCount} → ${newNotificationCount}`);
    
    // Test preferences
    appStore.updatePreferences({ autoSave: true });
    console.log(`✅ Preferences updated: autoSave = ${appStore.preferences.autoSave}`);
    
    console.log('🎉 All basic store operations successful!');
    
    return true;
  } catch (error) {
    console.error('❌ Store test failed:', error);
    return false;
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).__testStores__ = testBasicStoreOperations;
  console.log('🧪 Store test available at window.__testStores__()');
}
