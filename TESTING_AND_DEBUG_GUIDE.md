# Testing and Debug Guide

This document provides comprehensive instructions for testing and debugging the Lucaverse Hub React application. The project includes extensive testing infrastructure and debugging tools implemented in Tasks 17-19.

## Table of Contents

- [Quick Start](#quick-start)
- [Development Tools](#development-tools)
- [Testing Infrastructure](#testing-infrastructure)
- [Extension Testing](#extension-testing)
- [Debugging Features](#debugging-features)
- [Performance Testing](#performance-testing)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test categories
npm run test:panels          # Panel operations
npm run test:dragdrop        # Drag and drop functionality
npm run test:resize          # Panel resize functionality
npm run test:integration     # Integration tests
npm run test:extension       # Chrome extension tests
npm run test:devtools        # Development tools validation
```

### Development Mode

```bash
# Start development server
npm run dev

# Start with extension mode
npm run dev:extension

# Start with electron mode
npm run dev:electron
```

## Development Tools

### Debug Panel

The debug panel provides real-time insights into the application state and performance.

#### Accessing the Debug Panel

1. **Keyboard Shortcut:** `Ctrl + Shift + D`
2. **Console Command:** `window.__DEV_SHORTCUTS__.toggleDebugPanel()`
3. **Programmatic:** Set `showDebugPanel` state to `true`

#### Debug Panel Features

- **State Tab:** Real-time view of Zustand store states
- **Performance Tab:** Render times, memory usage, and FPS monitoring
- **Layout Tab:** Grid overlay, panel bounds visualization
- **Actions Tab:** Quick state manipulation and reset functions
- **Errors Tab:** Error tracking and logging
- **Memory Tab:** Memory usage analysis and leak detection

### Development Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl + Shift + D` | Toggle Debug Panel | Show/hide the development debug panel |
| `Ctrl + Shift + R` | Reset Layout | Clear all panels and reset layout |
| `Ctrl + Shift + G` | Toggle Grid | Show/hide layout grid overlay |
| `Ctrl + Shift + I` | Inspect State | Log detailed state analysis to console |
| `Ctrl + Shift + S` | Save State Snapshot | Export current state to JSON file |
| `Ctrl + Shift + M` | Generate Mock Data | Create test panels and notifications |
| `Ctrl + Shift + E` | Simulate Error | Trigger test error for error handling |
| `Ctrl + Shift + P` | Performance Test | Run performance benchmarks |
| `Ctrl + Shift + T` | Toggle Theme | Switch between light and dark themes |

### Console Commands

Open browser console and use these commands:

```javascript
// State Management
inspectState()                    // Analyze current state
resetState('layout')             // Reset layout store
resetState('app')                // Reset app store  
resetState('all')                // Reset all stores
exportState()                    // Export all state data

// Mock Data Generation
mockData()                       // Generate default mock data
mockData({ panels: 5, notifications: 3 })  // Custom mock data
mockPanels(10)                   // Generate 10 mock panels
mockNotifications(5)             // Generate 5 mock notifications

// Theme Controls
darkTheme()                      // Switch to dark theme
lightTheme()                     // Switch to light theme
toggleTheme()                    // Toggle current theme

// Error Testing
simulateError()                  // Simulate render error
simulateError('state')           // Simulate state error
simulateError('network')         // Simulate network error
simulateError('critical')        // Simulate critical error

// Performance Testing
perfTest()                       // Run performance test (5 seconds)
perfTest(10000)                  // Run performance test (10 seconds)
perfMetrics()                    // Get current performance metrics

// Help
help()                          // Show available commands
shortcuts()                     // Show keyboard shortcuts
```

## Testing Infrastructure

### Test Categories

#### 1. Panel Operations Tests
```bash
npm run test:panels
```
- Panel creation and deletion
- Memory leak detection
- Panel validation and constraints
- Panel duplication and state management

#### 2. Drag & Drop Tests
```bash
npm run test:dragdrop
```
- Basic drag operations
- Constraint validation (viewport boundaries, collision detection)
- Grid snapping functionality
- Multi-panel selection and group dragging
- Performance testing with many panels

#### 3. Resize Functionality Tests
```bash
npm run test:resize
```
- 8-directional resize handles
- Size constraint enforcement (min/max)
- Aspect ratio locking
- Viewport boundary constraints
- Resize performance optimization

#### 4. State Persistence Tests
```bash
npm run test:persistence
```
- Cross-session state persistence
- Platform compatibility (web/extension/electron)
- State synchronization across tabs
- Data corruption recovery

#### 5. Integration Tests
```bash
npm run test:integration
```
- Complete user workflows
- Component interaction validation
- Error recovery and graceful degradation
- Performance and responsiveness testing

### Manual Testing

#### Feature Parity Validation
```bash
npm run test:features
```
Then open http://localhost:5173 and run:
```javascript
window.__runTests__()
```

This provides an interactive testing interface to validate:
- SmartHub functionality
- AIChat capabilities  
- TaskManager features
- Productivity tools
- Layout system behavior

#### Migration Testing
```bash
npm run test:migration
```
Tests the state migration system from vanilla JavaScript to React.

## Extension Testing

### Chrome Extension Validation

```bash
npm run test:extension
```

Tests include:
- **Manifest V3 Compliance:** Schema validation, permission usage
- **Storage Quota Handling:** 10MB local, 100KB sync limits
- **CSP Compliance:** No unsafe-eval or inline scripts
- **API Functionality:** Runtime, storage, notifications, tabs
- **Performance:** Startup time, memory usage
- **Security:** Input sanitization, secure protocols

### Manual Extension Testing

1. **Build Extension:**
   ```bash
   npm run build:extension
   ```

2. **Load in Chrome:**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `dist/extension` folder

3. **Test Functionality:**
   - Verify popup opens correctly
   - Test storage operations
   - Check notifications
   - Validate permissions

### Extension Performance Testing

```bash
# Monitor startup time and memory usage
npm run test:performance
```

Performance targets:
- Startup time: < 1 second
- Memory usage: < 50MB
- Background script idle: Yes

## Debugging Features

### Error Tracking

The application includes comprehensive error tracking:

#### Error Categories
- **Render Errors:** Component rendering failures
- **State Errors:** Store operation failures  
- **API Errors:** Network and API call failures
- **Validation Errors:** Data validation failures
- **Permission Errors:** Chrome extension permission issues

#### Error Recovery
- Automatic error boundary with fallback UI
- State reset capabilities
- Component remounting
- Graceful degradation

#### Error Reporting
```javascript
// Access global error tracker
window.__ERROR_TRACKER__.getStatistics()
window.__ERROR_TRACKER__.generateErrorReport()
window.__ERROR_TRACKER__.exportErrors()
```

### Performance Monitoring

#### Real-time Metrics
- Component render times
- Memory usage tracking
- Frame rate monitoring
- Drag/drop responsiveness
- State update performance

#### Performance Commands
```javascript
// Access global performance monitor  
window.__PERFORMANCE_MONITOR__.getMetrics()
window.__PERFORMANCE_MONITOR__.generateReport()
window.__PERFORMANCE_MONITOR__.detectMemoryLeaks()
```

### State Inspection

#### Store DevTools
- **Zustand DevTools:** Time-travel debugging, action tracking
- **React DevTools:** Component tree inspection
- **Custom State Inspector:** Anomaly detection, validation

#### State Analysis
```javascript
// Access state inspector
window.__STORE_DEVTOOLS__.tracker.getAllMetrics()
window.__STORE_DEVTOOLS__.inspectState('layout')
window.__STORE_DEVTOOLS__.createDiffer()
```

## Performance Testing

### Benchmarking

```bash
# Run comprehensive performance tests
npm run test:performance
```

Performance benchmarks include:
- Panel creation/deletion speed
- Drag operation responsiveness  
- Memory usage optimization
- State update performance
- Render time optimization

### Performance Targets

| Metric | Target | Critical |
|--------|--------|----------|
| Panel render time | < 50ms | < 100ms |
| State update time | < 5ms | < 10ms |
| Memory growth rate | < 10MB/min | < 50MB/min |
| Frame rate | > 30 FPS | > 15 FPS |
| Startup time | < 1s | < 3s |

### Memory Testing

```javascript
// Check for memory leaks
const monitor = new PerformanceMonitor();
monitor.detectMemoryLeaks();

// Stress test with rapid operations
for (let i = 0; i < 100; i++) {
  // Perform operations
}
// Check memory growth
```

## Troubleshooting

### Common Issues

#### 1. Tests Not Running
```bash
# Check Node.js version (requires >= 18)
node --version

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Jest configuration
npm run test -- --verbose
```

#### 2. Extension Not Loading
```bash
# Rebuild extension
npm run build:extension

# Check manifest.json validity
npm run test:extension

# Verify Chrome version (requires Chrome 88+)
```

#### 3. Performance Issues
```bash
# Run performance diagnostics
npm run test:performance

# Check memory usage
window.__PERFORMANCE_MONITOR__.getMetrics()

# Enable debug mode
localStorage.setItem('debug', 'true')
```

#### 4. State Persistence Issues
```bash
# Test state migration
npm run test:migration

# Check localStorage quota
window.__ERROR_TRACKER__.detectMemoryLeaks()

# Reset state
resetState('all')
```

### Debug Logs

Enable detailed logging:
```javascript
// Enable debug mode
localStorage.setItem('debugMode', 'true');

// Enable performance logging
localStorage.setItem('performanceLogging', 'true');

// Enable state logging
localStorage.setItem('stateLogging', 'true');
```

### Getting Help

1. **Check Console:** Look for error messages and warnings
2. **Run Diagnostics:** Use `npm run test:all` for comprehensive testing
3. **Enable Debug Mode:** Use keyboard shortcut `Ctrl + Shift + D`
4. **Export State:** Use `exportState()` to capture current state
5. **Performance Report:** Use `perfMetrics()` to analyze performance

### Reporting Issues

When reporting issues, include:
1. Error messages from console
2. State export (`exportState()`)
3. Performance metrics (`perfMetrics()`)
4. Steps to reproduce
5. Browser/platform information

## Advanced Features

### Custom Test Utilities

```javascript
// Create custom test scenarios
import { renderWithProviders, generateMockPanels } from './src/__tests__/utils/testUtils';

// Test with mock data
const mockPanels = generateMockPanels(10, 'TaskManager');
// Use in tests
```

### Extension Development

```javascript
// Test Chrome APIs
const chrome = extensionTestUtils.createMockChromeAPIs();
await chrome.storage.local.set({ test: 'data' });

// Validate manifest
const validation = validateManifestV3(manifest);
console.log(validation.errors);
```

### Performance Optimization

```javascript
// Monitor specific operations
const monitor = new PerformanceMonitor();
monitor.trackComponentRender('MyComponent', renderTime);
monitor.trackDragOperation(startTime, endTime);
```

This guide provides comprehensive coverage of all testing and debugging capabilities. For additional help, check the console commands or enable debug mode for detailed logging.