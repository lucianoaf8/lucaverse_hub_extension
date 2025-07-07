/**
 * Test Utilities for Core Functionality Testing Suite
 * Custom testing utilities, mock providers, and test environment configuration
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { DragDropProvider } from '../../components/providers/DragDropProvider';
import { useLayoutStore } from '../../stores/layoutStore';
import { useAppStore } from '../../stores/appStore';

// Mock platform APIs for testing
export const mockPlatformAPIs = {
  storage: {
    get: jest.fn().mockResolvedValue({}),
    set: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
  },
  notifications: {
    create: jest.fn().mockResolvedValue('notification-id'),
    clear: jest.fn().mockResolvedValue(undefined),
  },
  system: {
    getInfo: jest.fn().mockResolvedValue({
      platform: 'web',
      version: '1.0.0',
    }),
  },
};

// Mock Chrome APIs for extension testing
export const mockChromeAPIs = {
  storage: {
    local: {
      get: jest.fn().mockImplementation((keys, callback) => {
        callback && callback({});
        return Promise.resolve({});
      }),
      set: jest.fn().mockImplementation((items, callback) => {
        callback && callback();
        return Promise.resolve();
      }),
      remove: jest.fn().mockImplementation((keys, callback) => {
        callback && callback();
        return Promise.resolve();
      }),
      clear: jest.fn().mockImplementation(callback => {
        callback && callback();
        return Promise.resolve();
      }),
    },
    sync: {
      get: jest.fn().mockImplementation((keys, callback) => {
        callback && callback({});
        return Promise.resolve({});
      }),
      set: jest.fn().mockImplementation((items, callback) => {
        callback && callback();
        return Promise.resolve();
      }),
    },
  },
  runtime: {
    id: 'test-extension-id',
    getManifest: jest.fn().mockReturnValue({
      manifest_version: 3,
      name: 'Test Extension',
    }),
    sendMessage: jest.fn().mockImplementation((message, callback) => {
      callback && callback({ success: true });
      return Promise.resolve({ success: true });
    }),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
  },
  tabs: {
    create: jest.fn().mockImplementation((createProperties, callback) => {
      const tab = { id: 1, url: createProperties.url };
      callback && callback(tab);
      return Promise.resolve(tab);
    }),
    query: jest.fn().mockImplementation((queryInfo, callback) => {
      const tabs = [{ id: 1, url: 'http://localhost:3000', active: true }];
      callback && callback(tabs);
      return Promise.resolve(tabs);
    }),
  },
  notifications: {
    create: jest.fn().mockImplementation((id, options, callback) => {
      callback && callback(id);
      return Promise.resolve(id);
    }),
    clear: jest.fn().mockImplementation((id, callback) => {
      callback && callback(true);
      return Promise.resolve(true);
    }),
  },
};

// Setup global mocks
export const setupGlobalMocks = () => {
  // Mock Chrome APIs
  (global as any).chrome = mockChromeAPIs;

  // Mock ResizeObserver
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock requestAnimationFrame
  global.requestAnimationFrame = jest.fn().mockImplementation(cb => {
    return setTimeout(cb, 16);
  });

  // Mock cancelAnimationFrame
  global.cancelAnimationFrame = jest.fn().mockImplementation(id => {
    clearTimeout(id);
  });

  // Mock performance.now
  if (!global.performance) {
    global.performance = {
      now: jest.fn(() => Date.now()),
      mark: jest.fn(),
      measure: jest.fn(),
      getEntriesByType: jest.fn(() => []),
    } as any;
  }

  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn().mockReturnValue(null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn().mockReturnValue(null),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Test providers wrapper
interface TestProvidersProps {
  children: React.ReactNode;
  initialLayoutState?: Partial<Parameters<typeof useLayoutStore.getState>[0]>;
  initialAppState?: Partial<Parameters<typeof useAppStore.getState>[0]>;
}

export const TestProviders: React.FC<TestProvidersProps> = ({
  children,
  initialLayoutState,
  initialAppState,
}) => {
  // Reset stores to clean state before each test
  React.useEffect(() => {
    const layoutStore = useLayoutStore.getState();
    const appStore = useAppStore.getState();

    // Reset layout store
    layoutStore.resetLayout();

    // Apply initial state if provided
    if (initialLayoutState) {
      // Apply any initial layout state modifications
    }

    if (initialAppState) {
      // Apply any initial app state modifications
    }
  }, [initialLayoutState, initialAppState]);

  return <DragDropProvider>{children}</DragDropProvider>;
};

// Custom render function with providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options: RenderOptions & {
    initialLayoutState?: Partial<Parameters<typeof useLayoutStore.getState>[0]>;
    initialAppState?: Partial<Parameters<typeof useAppStore.getState>[0]>;
  } = {}
) => {
  const { initialLayoutState, initialAppState, ...renderOptions } = options;

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TestProviders initialLayoutState={initialLayoutState} initialAppState={initialAppState}>
      {children}
    </TestProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock data generators
export const generateMockPanel = (overrides = {}) => ({
  id: `panel-${Math.random().toString(36).substr(2, 9)}`,
  component: 'SmartHub' as any,
  position: { x: 100, y: 100 },
  size: { width: 300, height: 200 },
  zIndex: 1,
  visible: true,
  title: 'Mock Panel',
  ...overrides,
});

export const generateMockPanels = (count: number, componentType?: string) => {
  return Array.from({ length: count }, (_, index) =>
    generateMockPanel({
      id: `mock-panel-${index}`,
      component: componentType || ['SmartHub', 'AIChat', 'TaskManager', 'Productivity'][index % 4],
      position: { x: index * 50, y: index * 30 },
      title: `Mock Panel ${index + 1}`,
    })
  );
};

export const generateMockTask = (overrides = {}) => ({
  id: `task-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Mock Task',
  description: 'This is a mock task for testing',
  completed: false,
  priority: 'medium' as const,
  category: 'general',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});

export const generateMockBookmark = (overrides = {}) => ({
  id: `bookmark-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Mock Bookmark',
  url: 'https://example.com',
  category: 'development',
  tags: ['test', 'mock'],
  createdAt: Date.now(),
  ...overrides,
});

export const generateMockChatMessage = (overrides = {}) => ({
  id: `message-${Math.random().toString(36).substr(2, 9)}`,
  content: 'This is a mock chat message',
  role: 'user' as const,
  timestamp: Date.now(),
  provider: 'openai',
  ...overrides,
});

// Test utilities for drag and drop
export const createMockDragEvent = (dataTransfer = {}) => {
  const event = new Event('drag', { bubbles: true });
  (event as any).dataTransfer = {
    getData: jest.fn(),
    setData: jest.fn(),
    clearData: jest.fn(),
    files: [],
    types: [],
    effectAllowed: 'all',
    dropEffect: 'none',
    ...dataTransfer,
  };
  return event;
};

export const createMockDropEvent = (clientX = 0, clientY = 0, dataTransfer = {}) => {
  const event = new Event('drop', { bubbles: true });
  (event as any).clientX = clientX;
  (event as any).clientY = clientY;
  (event as any).dataTransfer = {
    getData: jest.fn(),
    setData: jest.fn(),
    clearData: jest.fn(),
    files: [],
    types: [],
    effectAllowed: 'all',
    dropEffect: 'none',
    ...dataTransfer,
  };
  return event;
};

// Test utilities for resize operations
export const createMockResizeEvent = (target: Element, newWidth: number, newHeight: number) => {
  const event = new Event('resize', { bubbles: true });
  Object.defineProperty(target, 'offsetWidth', { value: newWidth, configurable: true });
  Object.defineProperty(target, 'offsetHeight', { value: newHeight, configurable: true });
  return event;
};

// Performance testing utilities
export const measureRenderTime = async (renderFn: () => void): Promise<number> => {
  const start = performance.now();
  renderFn();
  await new Promise(resolve => setTimeout(resolve, 0)); // Allow render to complete
  const end = performance.now();
  return end - start;
};

export const measureMemoryUsage = (): number => {
  if (typeof (performance as any).memory !== 'undefined') {
    return (performance as any).memory.usedJSHeapSize;
  }
  return 0;
};

// Accessibility testing utilities
export const checkAccessibility = (element: Element) => {
  const results = {
    hasAriaLabels: element.querySelectorAll('[aria-label]').length > 0,
    hasRoles: element.querySelectorAll('[role]').length > 0,
    hasFocusableElements: element.querySelectorAll('[tabindex]').length > 0,
    hasAltText: Array.from(element.querySelectorAll('img')).every(img => img.hasAttribute('alt')),
    hasFormLabels: Array.from(element.querySelectorAll('input')).every(
      input =>
        input.hasAttribute('aria-label') ||
        input.hasAttribute('aria-labelledby') ||
        element.querySelector(`label[for="${input.id}"]`)
    ),
  };

  return {
    score: Object.values(results).filter(Boolean).length / Object.keys(results).length,
    details: results,
  };
};

// Visual regression testing utilities
export const captureElementSnapshot = (element: Element): string => {
  // In a real implementation, this would capture a visual snapshot
  // For testing purposes, we'll return element structure info
  return JSON.stringify({
    tagName: element.tagName,
    className: element.className,
    childElementCount: element.childElementCount,
    textContent: element.textContent?.slice(0, 100),
  });
};

// Cross-platform testing utilities
export const mockPlatform = (platform: 'web' | 'extension' | 'electron') => {
  switch (platform) {
    case 'extension':
      (global as any).chrome = mockChromeAPIs;
      delete (global as any).require;
      break;
    case 'electron':
      (global as any).require = jest.fn();
      delete (global as any).chrome;
      break;
    case 'web':
    default:
      delete (global as any).chrome;
      delete (global as any).require;
      break;
  }
};

// Cleanup utilities
export const cleanupAfterTest = () => {
  // Reset stores
  useLayoutStore.getState().resetLayout();
  useAppStore.getState().clearAllNotifications();

  // Clear timers
  jest.clearAllTimers();

  // Clear mocks
  jest.clearAllMocks();
};

// Test environment configuration
export const configureTestEnvironment = () => {
  setupGlobalMocks();

  // Set test mode flag
  process.env.NODE_ENV = 'test';

  // Configure Jest environment
  jest.setTimeout(10000); // 10 second timeout for async tests
};

// Export everything needed for testing
export * from '@testing-library/react';
export * from '@testing-library/user-event';
export { default as userEvent } from '@testing-library/user-event';
