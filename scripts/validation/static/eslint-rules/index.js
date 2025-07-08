/**
 * ESLint Plugin for Platform Compliance
 * Entry point for custom ESLint rules
 */

const rules = require('./platform-compliance.js').rules;

module.exports = {
  rules,
  configs: {
    recommended: {
      rules: {
        'platform-compliance/no-direct-storage': 'error',
        'platform-compliance/no-platform-specific-apis': 'error',
        'platform-compliance/require-storage-adapter': 'warn',
        'platform-compliance/no-inline-styles': 'error',
        'platform-compliance/no-unsafe-dynamic-imports': 'warn',
        'platform-compliance/require-serializable-state': 'warn',
      },
    },
  },
};