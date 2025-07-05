/**
 * Jest setup file for testing environment configuration
 */

import '@testing-library/jest-dom';
import { configureTestEnvironment } from './utils/testUtils';

// Configure test environment
configureTestEnvironment();

// Mock console methods to reduce noise during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render is deprecated')) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
