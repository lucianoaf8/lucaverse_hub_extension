/**
 * ESLint Rules for Multi-Platform Compliance
 * Custom rules to enforce cross-platform compatibility guidelines
 */

module.exports = {
  rules: {
    'no-direct-storage': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow direct usage of localStorage/sessionStorage',
          category: 'Possible Errors',
          recommended: true,
        },
        fixable: 'code',
        schema: [],
        messages: {
          directStorage: 'Use storage adapter instead of direct {{storage}} access',
          suggestion: 'Import and use the storage adapter from utils/storage',
        },
      },
      create(context) {
        return {
          MemberExpression(node) {
            if (
              node.object &&
              node.object.type === 'Identifier' &&
              (node.object.name === 'localStorage' || node.object.name === 'sessionStorage')
            ) {
              context.report({
                node,
                messageId: 'directStorage',
                data: {
                  storage: node.object.name,
                },
                suggest: [
                  {
                    messageId: 'suggestion',
                    fix(fixer) {
                      // Simple fix: comment out the line
                      return fixer.insertTextBefore(node, '/* TODO: Replace with storage adapter */ ');
                    },
                  },
                ],
              });
            }
          },
        };
      },
    },

    'no-platform-specific-apis': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow platform-specific APIs that may not work in extensions',
          category: 'Possible Errors',
          recommended: true,
        },
        schema: [
          {
            type: 'object',
            properties: {
              forbiddenApis: {
                type: 'array',
                items: { type: 'string' },
              },
            },
            additionalProperties: false,
          },
        ],
        messages: {
          forbiddenApi: '{{api}} is not compatible with browser extensions',
          evalUsage: 'eval() and Function() constructor are blocked by CSP in extensions',
          windowOpen: 'window.open() may be blocked in extensions, use browser APIs instead',
        },
      },
      create(context) {
        const options = context.options[0] || {};
        const forbiddenApis = options.forbiddenApis || [
          'eval',
          'Function',
          'window.open',
          'document.write',
          'alert',
          'confirm',
          'prompt',
        ];

        return {
          CallExpression(node) {
            let apiName = '';
            
            if (node.callee.type === 'Identifier') {
              apiName = node.callee.name;
            } else if (
              node.callee.type === 'MemberExpression' &&
              node.callee.object &&
              node.callee.property
            ) {
              if (node.callee.object.type === 'Identifier' && node.callee.property.type === 'Identifier') {
                apiName = `${node.callee.object.name}.${node.callee.property.name}`;
              }
            }

            if (forbiddenApis.includes(apiName)) {
              let messageId = 'forbiddenApi';
              
              if (apiName === 'eval' || apiName === 'Function') {
                messageId = 'evalUsage';
              } else if (apiName === 'window.open') {
                messageId = 'windowOpen';
              }

              context.report({
                node,
                messageId,
                data: { api: apiName },
              });
            }
          },

          NewExpression(node) {
            if (node.callee.type === 'Identifier' && node.callee.name === 'Function') {
              context.report({
                node,
                messageId: 'evalUsage',
              });
            }
          },
        };
      },
    },

    'require-storage-adapter': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Require usage of storage adapter pattern for data persistence',
          category: 'Best Practices',
          recommended: true,
        },
        schema: [],
        messages: {
          missingAdapter: 'Storage operations should use the storage adapter pattern',
          importAdapter: 'Import storage adapter: import { storageAdapter } from "utils/storage"',
        },
      },
      create(context) {
        let hasStorageAdapterImport = false;
        let usesStorageOperations = false;

        return {
          ImportDeclaration(node) {
            if (
              node.source.value.includes('storage') &&
              node.specifiers.some(spec => 
                spec.type === 'ImportSpecifier' && 
                spec.imported.name === 'storageAdapter'
              )
            ) {
              hasStorageAdapterImport = true;
            }
          },

          CallExpression(node) {
            // Check for storage-related method calls
            if (
              node.callee.type === 'MemberExpression' &&
              node.callee.property &&
              node.callee.property.type === 'Identifier'
            ) {
              const methodName = node.callee.property.name;
              if (['getItem', 'setItem', 'removeItem', 'clear'].includes(methodName)) {
                usesStorageOperations = true;
              }
            }
          },

          'Program:exit'() {
            if (usesStorageOperations && !hasStorageAdapterImport) {
              context.report({
                loc: { line: 1, column: 0 },
                messageId: 'missingAdapter',
                suggest: [
                  {
                    messageId: 'importAdapter',
                    fix(fixer) {
                      return fixer.insertTextAfterRange([0, 0], 'import { storageAdapter } from "utils/storage";\n');
                    },
                  },
                ],
              });
            }
          },
        };
      },
    },

    'no-inline-styles': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow inline styles that violate CSP',
          category: 'Security',
          recommended: true,
        },
        schema: [],
        messages: {
          inlineStyle: 'Inline styles violate Content Security Policy in extensions',
          useClasses: 'Use CSS classes or CSS-in-JS libraries instead',
        },
      },
      create(context) {
        return {
          JSXAttribute(node) {
            if (
              node.name &&
              node.name.type === 'JSXIdentifier' &&
              node.name.name === 'style' &&
              node.value &&
              node.value.type === 'JSXExpressionContainer'
            ) {
              // Check if it's an object literal (inline styles)
              if (node.value.expression.type === 'ObjectExpression') {
                context.report({
                  node,
                  messageId: 'inlineStyle',
                  suggest: [
                    {
                      messageId: 'useClasses',
                      fix(fixer) {
                        return fixer.replaceText(node, 'className="your-css-class"');
                      },
                    },
                  ],
                });
              }
            }
          },
        };
      },
    },

    'no-unsafe-dynamic-imports': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow dynamic imports that may not work in all environments',
          category: 'Possible Errors',
          recommended: true,
        },
        schema: [],
        messages: {
          unsafeDynamicImport: 'Dynamic imports with variables may not work in all bundlers',
          useStaticImport: 'Use static imports or predefined dynamic import patterns',
        },
      },
      create(context) {
        return {
          ImportExpression(node) {
            // Check if the import source is not a literal
            if (node.source.type !== 'Literal' && node.source.type !== 'TemplateLiteral') {
              context.report({
                node,
                messageId: 'unsafeDynamicImport',
                suggest: [
                  {
                    messageId: 'useStaticImport',
                  },
                ],
              });
            }
          },
        };
      },
    },

    'require-serializable-state': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Ensure state objects are serializable for cross-platform compatibility',
          category: 'Best Practices',
          recommended: true,
        },
        schema: [],
        messages: {
          nonSerializableState: 'State should only contain serializable values',
          avoidFunctions: 'Avoid functions, classes, or complex objects in state',
        },
      },
      create(context) {
        function checkForNonSerializableValues(node) {
          if (!node) return false;

          switch (node.type) {
            case 'FunctionExpression':
            case 'ArrowFunctionExpression':
            case 'ClassExpression':
              return true;
            case 'ObjectExpression':
              return node.properties.some(prop => {
                if (prop.type === 'Property' && prop.value) {
                  return checkForNonSerializableValues(prop.value);
                }
                return false;
              });
            case 'ArrayExpression':
              return node.elements.some(element => 
                element && checkForNonSerializableValues(element)
              );
            default:
              return false;
          }
        }

        return {
          CallExpression(node) {
            // Check useState calls
            if (
              node.callee.type === 'Identifier' &&
              node.callee.name === 'useState' &&
              node.arguments.length > 0
            ) {
              if (checkForNonSerializableValues(node.arguments[0])) {
                context.report({
                  node: node.arguments[0],
                  messageId: 'nonSerializableState',
                  suggest: [
                    {
                      messageId: 'avoidFunctions',
                    },
                  ],
                });
              }
            }
          },
        };
      },
    },
  },
};