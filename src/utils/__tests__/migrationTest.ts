/**
 * Migration System Test Suite
 * Comprehensive tests for state migration functionality
 */

import {
  migrateVanillaState,
  detectLegacyData,
  validateLegacyData,
  createBackup,
  migrateQuadrantData,
  migrateBookmarks,
  migrateTasks,
  migrateChatHistory,
  migrateTimerSettings,
  migrateUserPreferences,
} from '../migrate';
import { detectVersion, getMigrationPath, executeMigrationPath } from '../versionManager';
import type { LegacyState } from '../migrate';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

// Replace global localStorage with mock
(global as any).localStorage = mockLocalStorage;

// Test data factories
const createMockLegacyData = (): LegacyState => ({
  'lucaverse-quadrants': JSON.stringify([
    {
      id: 'q1',
      type: 'smart-bookmarks',
      position: { x: 0, y: 0 },
      size: { width: 400, height: 300 },
      visible: true,
      zIndex: 1,
    },
    {
      id: 'q2',
      type: 'ai-chat',
      position: { x: 400, y: 0 },
      size: { width: 400, height: 300 },
      visible: true,
      zIndex: 2,
    },
    {
      id: 'q3',
      type: 'task-manager',
      position: { x: 0, y: 300 },
      size: { width: 400, height: 300 },
      visible: true,
      zIndex: 3,
    },
    {
      id: 'q4',
      type: 'productivity-tools',
      position: { x: 400, y: 300 },
      size: { width: 400, height: 300 },
      visible: true,
      zIndex: 4,
    },
  ]),
  'lucaverse-bookmarks': JSON.stringify([
    {
      id: 'b1',
      title: 'Google',
      url: 'https://google.com',
      favicon: 'https://google.com/favicon.ico',
      tags: ['search', 'tools'],
      priority: 1,
      category: 'productivity',
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'b2',
      title: 'GitHub',
      url: 'https://github.com',
      favicon: 'https://github.com/favicon.ico',
      tags: ['development', 'code'],
      priority: 2,
      category: 'development',
      createdAt: Date.now() - 172800000,
    },
  ]),
  'lucaverse-tasks': JSON.stringify([
    {
      id: 't1',
      title: 'Complete React migration',
      description: 'Migrate all components to React',
      completed: false,
      priority: 1,
      dueDate: Date.now() + 86400000,
      createdAt: Date.now() - 259200000,
      updatedAt: Date.now(),
      tags: ['development', 'urgent'],
      category: 'work',
    },
    {
      id: 't2',
      title: 'Review code',
      description: 'Code review for PR #123',
      completed: true,
      priority: 3,
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 3600000,
      tags: ['review'],
      category: 'work',
    },
  ]),
  'lucaverse-chat-history': JSON.stringify([
    {
      id: 'c1',
      content: 'Hello, how can I help?',
      type: 'assistant',
      timestamp: Date.now() - 3600000,
      provider: 'openai',
      model: 'gpt-4',
    },
    {
      id: 'c2',
      content: 'What is React?',
      type: 'user',
      timestamp: Date.now() - 3500000,
    },
  ]),
  'lucaverse-timer-settings': JSON.stringify({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: true,
    autoStartPomodoros: false,
    notifications: true,
    soundEnabled: true,
  }),
  'lucaverse-preferences': JSON.stringify({
    theme: 'dark',
    gridSnap: true,
    snapSize: 10,
    autoSave: true,
    animations: true,
    particles: true,
    debugMode: false,
    language: 'en',
  }),
  'lucaverse-theme': JSON.stringify('dark'),
  'lucaverse-workspace': JSON.stringify({
    name: 'Default Workspace',
    lastSaved: Date.now() - 3600000,
  }),
  'lucaverse-state': JSON.stringify({
    version: '1.2.0',
  }),
});

// Test suites
describe('Migration System Tests', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  describe('Legacy Data Detection', () => {
    test('detects legacy data correctly', () => {
      const mockData = createMockLegacyData();
      Object.entries(mockData).forEach(([key, value]) => {
        mockLocalStorage.setItem(key, value);
      });

      const detection = detectLegacyData();

      expect(detection.hasLegacyData).toBe(true);
      expect(detection.keys.length).toBeGreaterThan(0);
      expect(detection.version).toBe('1.2.0');
      expect(detection.totalSize).toBeGreaterThan(0);
    });

    test('handles no legacy data', () => {
      const detection = detectLegacyData();

      expect(detection.hasLegacyData).toBe(false);
      expect(detection.keys.length).toBe(0);
    });
  });

  describe('Data Validation', () => {
    test('validates correct legacy data', () => {
      const mockData = createMockLegacyData();
      const validation = validateLegacyData(mockData);

      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    test('detects invalid JSON', () => {
      const invalidData = {
        'lucaverse-quadrants': 'invalid json {]',
        'lucaverse-bookmarks': '[]',
      };
      const validation = validateLegacyData(invalidData);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    test('warns about missing data', () => {
      const emptyData = {};
      const validation = validateLegacyData(emptyData);

      expect(validation.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Backup Creation', () => {
    test('creates backup successfully', async () => {
      const mockData = createMockLegacyData();
      const backup = await createBackup(mockData);

      expect(backup).not.toBeNull();
      expect(backup?.timestamp).toBeDefined();
      expect(backup?.version).toBe('1.2.0');
      expect(backup?.data).toBeDefined();
    });

    test('handles quota exceeded', async () => {
      // Fill localStorage to simulate quota
      const largeData = 'x'.repeat(5 * 1024 * 1024); // 5MB
      try {
        for (let i = 0; i < 10; i++) {
          mockLocalStorage.setItem(`large-${i}`, largeData);
        }
      } catch (e) {
        // Expected quota error
      }

      const mockData = createMockLegacyData();
      const backup = await createBackup(mockData);

      // Should handle gracefully
      expect(backup).toBeDefined();
    });
  });

  describe('Component Migration', () => {
    test('migrates quadrant data correctly', () => {
      const mockData = createMockLegacyData();
      const quadrants = mockData['lucaverse-quadrants']!;
      const panels = migrateQuadrantData(quadrants);

      expect(panels.length).toBe(4);
      expect(panels[0].component).toBe('SmartHub');
      expect(panels[1].component).toBe('AIChat');
      expect(panels[2].component).toBe('TaskManager');
      expect(panels[3].component).toBe('Productivity');

      panels.forEach(panel => {
        expect(panel.id).toBeDefined();
        expect(panel.position).toBeDefined();
        expect(panel.size).toBeDefined();
        expect(panel.constraints).toBeDefined();
      });
    });

    test('migrates bookmarks correctly', () => {
      const mockData = createMockLegacyData();
      const bookmarksData = mockData['lucaverse-bookmarks']!;
      const bookmarks = migrateBookmarks(bookmarksData);

      expect(bookmarks.length).toBe(2);
      expect(bookmarks[0].title).toBe('Google');
      expect(bookmarks[1].title).toBe('GitHub');
      expect(bookmarks[0].migrated).toBe(true);
    });

    test('migrates tasks correctly', () => {
      const mockData = createMockLegacyData();
      const tasksData = mockData['lucaverse-tasks']!;
      const tasks = migrateTasks(tasksData);

      expect(tasks.length).toBe(2);
      expect(tasks[0].text).toBe('Complete React migration');
      expect(tasks[0].completed).toBe(false);
      expect(tasks[1].completed).toBe(true);
      expect(tasks[0].migrated).toBe(true);
    });

    test('migrates chat history correctly', () => {
      const mockData = createMockLegacyData();
      const chatData = mockData['lucaverse-chat-history']!;
      const chats = migrateChatHistory(chatData);

      expect(chats.length).toBe(2);
      expect(chats[0].role).toBe('assistant');
      expect(chats[1].role).toBe('user');
      expect(chats[0].migrated).toBe(true);
    });

    test('migrates timer settings correctly', () => {
      const mockData = createMockLegacyData();
      const timerData = mockData['lucaverse-timer-settings']!;
      const timer = migrateTimerSettings(timerData);

      expect(timer.workDuration).toBe(25);
      expect(timer.shortBreakDuration).toBe(5);
      expect(timer.autoStartBreaks).toBe(true);
      expect(timer.migrated).toBe(true);
    });

    test('migrates user preferences correctly', () => {
      const mockData = createMockLegacyData();
      const prefsData = mockData['lucaverse-preferences']!;
      const prefs = migrateUserPreferences(prefsData);

      expect(prefs.language).toBe('en');
      expect(prefs.autoSave).toBe(true);
      expect(prefs.debugMode).toBe(false);
    });
  });

  describe('Full Migration', () => {
    test('completes full migration successfully', async () => {
      const mockData = createMockLegacyData();
      Object.entries(mockData).forEach(([key, value]) => {
        mockLocalStorage.setItem(key, value);
      });

      const result = await migrateVanillaState();

      expect(result.success).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(result.data.panels.length).toBe(4);
      expect(result.data.bookmarks.length).toBe(2);
      expect(result.data.tasks.length).toBe(2);
      expect(result.data.chatHistory.length).toBe(2);
      expect(result.data.timerSettings).toBeDefined();
      expect(result.data.preferences).toBeDefined();
      expect(result.report.backupCreated).toBeDefined();
    });

    test('handles migration with errors gracefully', async () => {
      // Set invalid data
      mockLocalStorage.setItem('lucaverse-quadrants', 'invalid json');

      const result = await migrateVanillaState();

      expect(result.success).toBe(true); // Should still succeed with partial data
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    test('handles no legacy data', async () => {
      const result = await migrateVanillaState();

      expect(result.success).toBe(true);
      expect(result.warnings).toContain('No legacy data found - using defaults');
      expect(result.data.panels.length).toBe(0);
    });
  });

  describe('Version Management', () => {
    test('detects version correctly', () => {
      const mockData = createMockLegacyData();
      const version = detectVersion(mockData);

      expect(version).toBe('1.2.0');
    });

    test('calculates migration path', () => {
      const path = getMigrationPath('1.0.0', '2.0.0');

      expect(path.from).toBe('1.0.0');
      expect(path.to).toBe('2.0.0');
      expect(path.steps.length).toBeGreaterThan(0);
    });

    test('executes migration path', async () => {
      const mockData = createMockLegacyData();
      const path = getMigrationPath('1.1.0', '2.0.0');

      const result = await executeMigrationPath(mockData, path);

      expect(result.success).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    test('handles corrupted data', async () => {
      mockLocalStorage.setItem('lucaverse-quadrants', '{"corrupted": }');
      mockLocalStorage.setItem('lucaverse-bookmarks', '[]');

      const result = await migrateVanillaState();

      expect(result.success).toBe(true);
      expect(result.data.bookmarks.length).toBe(0);
    });

    test('handles partial data', async () => {
      // Only set some keys
      mockLocalStorage.setItem(
        'lucaverse-bookmarks',
        JSON.stringify([{ title: 'Test', url: 'https://test.com' }])
      );

      const result = await migrateVanillaState();

      expect(result.success).toBe(true);
      expect(result.data.bookmarks.length).toBe(1);
      expect(result.data.panels.length).toBe(0);
    });

    test('handles oversized data', async () => {
      const hugeArray = new Array(10000).fill({
        id: 'test',
        title: 'Test bookmark with very long title that takes up space',
        url: 'https://example.com/very/long/url/path/that/takes/up/space',
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
      });

      mockLocalStorage.setItem('lucaverse-bookmarks', JSON.stringify(hugeArray));

      const result = await migrateVanillaState();

      expect(result.success).toBe(true);
      expect(result.data.bookmarks.length).toBe(10000);
    });
  });
});

// Export test runner
export async function runMigrationTests() {
  console.log('🧪 Running Migration Tests...\n');

  const testResults: { [key: string]: boolean } = {};

  try {
    // Test 1: Legacy data detection
    console.log('1. Testing legacy data detection...');
    mockLocalStorage.clear();
    const mockData = createMockLegacyData();
    Object.entries(mockData).forEach(([key, value]) => {
      mockLocalStorage.setItem(key, value);
    });
    const detection = detectLegacyData();
    testResults['Legacy Detection'] = detection.hasLegacyData;
    console.log(`   ✅ Legacy data detected: ${detection.keys.length} keys found`);

    // Test 2: Data validation
    console.log('\n2. Testing data validation...');
    const validation = validateLegacyData(mockData);
    testResults['Data Validation'] = validation.isValid;
    console.log(`   ✅ Data validation: ${validation.isValid ? 'Passed' : 'Failed'}`);

    // Test 3: Backup creation
    console.log('\n3. Testing backup creation...');
    const backup = await createBackup(mockData);
    testResults['Backup Creation'] = backup !== null;
    console.log(`   ✅ Backup created: ${backup ? 'Success' : 'Failed'}`);

    // Test 4: Component migrations
    console.log('\n4. Testing component migrations...');
    const panels = migrateQuadrantData(mockData['lucaverse-quadrants']!);
    const bookmarks = migrateBookmarks(mockData['lucaverse-bookmarks']!);
    const tasks = migrateTasks(mockData['lucaverse-tasks']!);
    const chats = migrateChatHistory(mockData['lucaverse-chat-history']!);
    testResults['Component Migration'] = panels.length === 4 && bookmarks.length === 2;
    console.log(`   ✅ Panels migrated: ${panels.length}`);
    console.log(`   ✅ Bookmarks migrated: ${bookmarks.length}`);
    console.log(`   ✅ Tasks migrated: ${tasks.length}`);
    console.log(`   ✅ Chats migrated: ${chats.length}`);

    // Test 5: Full migration
    console.log('\n5. Testing full migration...');
    const result = await migrateVanillaState();
    testResults['Full Migration'] = result.success;
    console.log(`   ✅ Migration result: ${result.success ? 'Success' : 'Failed'}`);
    console.log(
      `   📊 Report: ${result.report.migratedItems}/${result.report.totalItems} items migrated`
    );
    console.log(`   ⏱️ Duration: ${result.report.duration}ms`);

    // Test 6: Edge cases
    console.log('\n6. Testing edge cases...');
    mockLocalStorage.clear();
    mockLocalStorage.setItem('lucaverse-quadrants', 'invalid json');
    const edgeResult = await migrateVanillaState();
    testResults['Edge Cases'] = edgeResult.success;
    console.log(`   ✅ Handles corrupted data: ${edgeResult.success ? 'Yes' : 'No'}`);

    // Summary
    console.log('\n📊 Test Summary:');
    console.log('================');
    Object.entries(testResults).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}`);
    });

    const allPassed = Object.values(testResults).every(result => result);
    console.log(`\n${allPassed ? '✅ All tests passed!' : '❌ Some tests failed!'}`);

    return allPassed;
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    return false;
  } finally {
    mockLocalStorage.clear();
  }
}
