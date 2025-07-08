/**
 * Accessibility Checker
 * Validates accessibility compliance across the application
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { ValidationConfig, ValidationOptions } from '../core/config';
import { ValidationResult, ValidatorModule } from '../core/runner';

export interface AccessibilityIssue {
  type: 'semantic' | 'aria' | 'keyboard' | 'color' | 'structure';
  severity: 'error' | 'warning' | 'info';
  wcagLevel: 'A' | 'AA' | 'AAA';
  guideline: string;
  message: string;
  file?: string;
  line?: number;
  suggestion?: string;
}

export class AccessibilityChecker {
  private config: ValidationConfig;

  constructor(config: ValidationConfig) {
    this.config = config;
  }

  async validate(config: ValidationConfig, options: ValidationOptions): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const startTime = Date.now();

    try {
      console.log('♿ Validating accessibility compliance...');

      // Skip if accessibility validation is disabled
      if (!config.accessibility?.enabled) {
        console.log('♿ Accessibility validation disabled');
        return [{
          id: 'accessibility-disabled',
          name: 'Accessibility Validation Disabled',
          type: 'static',
          status: 'pass',
          message: 'Accessibility validation disabled via config',
          duration: Date.now() - startTime,
          severity: 'info',
        }];
      }

      // Check for missing alt text (if enabled)
      if (config.accessibility.rules['missing-alt-text']) {
        const altTextResults = await this.validateAltText();
        results.push(...altTextResults);
      }

      // Check for missing form labels (if enabled)
      if (config.accessibility.rules['missing-form-labels']) {
        const formResults = await this.validateFormAccessibility();
        results.push(...formResults);
      }

      // Check color contrast (if enabled)
      if (config.accessibility.rules['color-contrast']) {
        const contrastResults = await this.validateColorContrast();
        results.push(...contrastResults);
      }

      // Check heading structure (if enabled)
      if (config.accessibility.rules['heading-structure']) {
        const headingResults = await this.validateHeadingStructure();
        results.push(...headingResults);
      }

      // Check ARIA error states (if enabled - kept disabled by default)
      if (config.accessibility.rules['aria-error-states']) {
        const ariaResults = await this.validateARIAUsage();
        results.push(...ariaResults);
      }

      // Check keyboard handlers (if enabled - kept disabled by default)
      if (config.accessibility.rules['keyboard-handlers']) {
        const keyboardResults = await this.validateKeyboardNavigation();
        results.push(...keyboardResults);
      }

      // Check focus management (if enabled - kept disabled by default)
      if (config.accessibility.rules['focus-styles']) {
        const focusResults = await this.validateFocusManagement();
        results.push(...focusResults);
      }

      // Check media accessibility (always run this as it's generally useful)
      const mediaResults = await this.validateMediaAccessibility();
      results.push(...mediaResults);

      const duration = Date.now() - startTime;
      console.log(`✅ Accessibility validation completed in ${duration}ms`);

      return results;
    } catch (error) {
      return [{
        id: 'accessibility-checker-error',
        name: 'Accessibility Checker',
        type: 'static',
        status: 'fail',
        message: `Accessibility validation failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: Date.now() - startTime,
        severity: 'error',
      }];
    }
  }

  private async validateAltText(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const jsxFiles = await glob('src/**/*.{jsx,tsx}');

    for (const file of jsxFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          // Check for images without alt text
          const imgRegex = /<img\s+[^>]*(?:src\s*=\s*[^>\s]+)[^>]*>/gi;
          const imgMatches = line.match(imgRegex);
          
          if (imgMatches) {
            imgMatches.forEach(img => {
              if (!img.includes('alt=')) {
                results.push({
                  id: `missing-alt-text-${path.basename(file)}-${index}`,
                  name: 'Missing Alt Text',
                  type: 'static',
                  status: 'fail',
                  message: 'Image missing alt attribute',
                  file,
                  line: index + 1,
                  duration: 0,
                  severity: 'error',
                  suggestion: 'Add alt attribute to describe the image content',
                  details: {
                    wcagLevel: 'A',
                    guideline: 'WCAG 1.1.1 Non-text Content',
                  },
                });
              }
            });
          }
        });
      } catch (error) {
        // File read error handled elsewhere
      }
    }

    return results;
  }

  private async validateColorContrast(): Promise<ValidationResult[]> {
    // This would integrate with theme validation for color contrast
    // For now, return empty as theme validator handles this
    return [];
  }

  private async validateHeadingStructure(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const htmlFiles = await glob('src/**/*.{jsx,tsx,html}');

    for (const file of htmlFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          // Check for proper heading hierarchy - but not deep headings (that's disabled)
          const headingRegex = /<h([1-6])/gi;
          const headingMatches = [...line.matchAll(headingRegex)];
          
          if (headingMatches.length > 0) {
            // Only flag h1 tags that are not the first heading
            headingMatches.forEach(match => {
              const level = parseInt(match[1]);
              if (level === 1 && content.indexOf('<h1') !== content.indexOf(match[0])) {
                results.push({
                  id: `multiple-h1-${path.basename(file)}-${index}`,
                  name: 'Multiple H1 Elements',
                  type: 'static',
                  status: 'warning',
                  message: 'Page should have only one h1 element',
                  file,
                  line: index + 1,
                  duration: 0,
                  severity: 'warning',
                  suggestion: 'Use h2-h6 for subsequent headings',
                });
              }
            });
          }
        });
      } catch (error) {
        // File read error handled elsewhere
      }
    }

    return results;
  }

  private async validateJSXAccessibility(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const jsxFiles = await glob('src/**/*.{jsx,tsx}');

    for (const file of jsxFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          // Check for images without alt text
          const imgRegex = /<img\s+[^>]*(?:src\s*=\s*[^>\s]+)[^>]*>/gi;
          const imgMatches = line.match(imgRegex);
          
          if (imgMatches) {
            imgMatches.forEach(img => {
              if (!img.includes('alt=')) {
                results.push({
                  id: `missing-alt-text-${path.basename(file)}-${index}`,
                  name: 'Missing Alt Text',
                  type: 'static',
                  status: 'fail',
                  message: 'Image missing alt attribute',
                  file,
                  line: index + 1,
                  duration: 0,
                  severity: 'error',
                  suggestion: 'Add alt attribute to describe the image content',
                  details: {
                    wcagLevel: 'A',
                    guideline: 'WCAG 1.1.1 Non-text Content',
                  },
                });
              } else if (img.includes('alt=""') && !img.includes('decorative')) {
                results.push({
                  id: `empty-alt-text-${path.basename(file)}-${index}`,
                  name: 'Empty Alt Text',
                  type: 'static',
                  status: 'warning',
                  message: 'Image has empty alt text - ensure it\'s decorative',
                  file,
                  line: index + 1,
                  duration: 0,
                  severity: 'warning',
                  suggestion: 'Use descriptive alt text or add role="presentation" for decorative images',
                });
              }
            });
          }

          // Check for buttons without accessible names
          const isDevComponent = file.includes('/dev-center/') || 
                                file.includes('/pages/ThemeDemo') ||
                                file.includes('/ComponentLibrary');
          
          if (!isDevComponent) {
            const buttonRegex = /<button\s+[^>]*>/gi;
            const buttonMatches = line.match(buttonRegex);
            
            if (buttonMatches) {
              buttonMatches.forEach(button => {
                if (!button.includes('aria-label') && !button.includes('aria-labelledby') && 
                    !line.includes('</button>')) {
                  results.push({
                    id: `button-no-accessible-name-${path.basename(file)}-${index}`,
                    name: 'Button Without Accessible Name',
                    type: 'static',
                    status: 'warning',
                    message: 'Button may not have accessible name',
                    file,
                    line: index + 1,
                    duration: 0,
                    severity: 'warning',
                    suggestion: 'Ensure button has visible text or aria-label',
                    details: {
                      wcagLevel: 'A',
                      guideline: 'WCAG 4.1.2 Name, Role, Value',
                    },
                  });
                }
              });
            }
          }

          // Check for interactive elements without keyboard support
          const interactiveRegex = /<(div|span)\s+[^>]*onclick/gi;
          const interactiveMatches = line.match(interactiveRegex);
          
          if (interactiveMatches) {
            results.push({
              id: `non-keyboard-interactive-${path.basename(file)}-${index}`,
              name: 'Non-Keyboard Interactive Element',
              type: 'static',
              status: 'fail',
              message: 'Interactive element may not be keyboard accessible',
              file,
              line: index + 1,
              duration: 0,
              severity: 'error',
              suggestion: 'Use button, link, or add tabIndex and onKeyDown handlers',
              details: {
                wcagLevel: 'A',
                guideline: 'WCAG 2.1.1 Keyboard',
              },
            });
          }
        });
      } catch (error) {
        // File read error handled elsewhere
      }
    }

    return results;
  }

  private async validateSemanticHTML(config?: ValidationConfig): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const htmlFiles = await glob('src/**/*.{jsx,tsx,html}');

    for (const file of htmlFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          // Check for div overuse where semantic elements would be better
          const divRegex = /<div\s+[^>]*(?:className\s*=\s*[^>]*(?:header|nav|main|footer|section|article))/gi;
          const divMatches = line.match(divRegex);
          
          if (divMatches) {
            results.push({
              id: `semantic-element-opportunity-${path.basename(file)}-${index}`,
              name: 'Semantic Element Opportunity',
              type: 'static',
              status: 'warning',
              message: 'Consider using semantic HTML element instead of div',
              file,
              line: index + 1,
              duration: 0,
              severity: 'warning',
              suggestion: 'Use <header>, <nav>, <main>, <section>, <article>, or <footer>',
              details: {
                wcagLevel: 'AA',
                guideline: 'WCAG 1.3.1 Info and Relationships',
              },
            });
          }

          // Check for proper heading hierarchy
          const headingRegex = /<h([1-6])/gi;
          const headingMatches = [...line.matchAll(headingRegex)];
          
          if (headingMatches.length > 0) {
            headingMatches.forEach(match => {
              const level = parseInt(match[1]);
              // This is a simplified check - real implementation would track heading levels
              const isDevComponent = file.includes('/dev-center/') || 
                                    file.includes('/pages/ThemeDemo') ||
                                    file.includes('/ComponentLibrary');
              
              // Skip deep heading warnings if surgically disabled
              if (level > 3 && !isDevComponent && !config?.surgicalDisable?.deepHeadings) {
                results.push({
                  id: `deep-heading-level-${path.basename(file)}-${index}`,
                  name: 'Deep Heading Level',
                  type: 'static',
                  status: 'warning',
                  message: `Heading level h${level} may be too deep`,
                  file,
                  line: index + 1,
                  duration: 0,
                  severity: 'warning',
                  suggestion: 'Consider restructuring content with fewer heading levels',
                });
              }
            });
          }

          // Check for lists that should use list elements
          const listLikeRegex = /<div\s+[^>]*>\s*[-*•]\s*[^<]+<\/div>/gi;
          const listMatches = line.match(listLikeRegex);
          
          if (listMatches) {
            results.push({
              id: `list-structure-opportunity-${path.basename(file)}-${index}`,
              name: 'List Structure Opportunity',
              type: 'static',
              status: 'warning',
              message: 'Content appears to be a list but doesn\'t use list elements',
              file,
              line: index + 1,
              duration: 0,
              severity: 'warning',
              suggestion: 'Use <ul>/<ol> and <li> elements for list content',
              details: {
                wcagLevel: 'A',
                guideline: 'WCAG 1.3.1 Info and Relationships',
              },
            });
          }
        });
      } catch (error) {
        // File read error handled elsewhere
      }
    }

    return results;
  }

  private async validateARIAUsage(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const componentFiles = await glob('src/**/*.{jsx,tsx}');

    for (const file of componentFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          // Check for invalid ARIA attributes
          const ariaRegex = /aria-([a-z]+(?:-[a-z]+)*)/gi;
          const ariaMatches = [...line.matchAll(ariaRegex)];
          
          const validAriaAttributes = [
            'label', 'labelledby', 'describedby', 'hidden', 'expanded', 
            'controls', 'owns', 'activedescendant', 'live', 'atomic',
            'relevant', 'dropeffect', 'grabbed', 'level', 'multiline',
            'multiselectable', 'orientation', 'readonly', 'required',
            'selected', 'sort', 'valuemax', 'valuemin', 'valuenow',
            'valuetext', 'pressed', 'checked', 'disabled', 'invalid'
          ];

          ariaMatches.forEach(match => {
            const attribute = match[1];
            if (!validAriaAttributes.includes(attribute)) {
              results.push({
                id: `invalid-aria-${attribute}-${path.basename(file)}-${index}`,
                name: 'Invalid ARIA Attribute',
                type: 'static',
                status: 'warning',
                message: `Unknown ARIA attribute: aria-${attribute}`,
                file,
                line: index + 1,
                duration: 0,
                severity: 'warning',
                suggestion: 'Check ARIA specification for valid attributes',
              });
            }
          });

          // Check for redundant ARIA
          if (line.includes('<button') && line.includes('role="button"')) {
            results.push({
              id: `redundant-aria-button-${path.basename(file)}-${index}`,
              name: 'Redundant ARIA Role',
              type: 'static',
              status: 'warning',
              message: 'Button element has redundant role="button"',
              file,
              line: index + 1,
              duration: 0,
              severity: 'warning',
              suggestion: 'Remove redundant role attribute',
            });
          }

          // Check for aria-label on non-interactive elements
          const nonInteractiveWithLabel = /<(div|span|p)\s+[^>]*aria-label/gi;
          if (nonInteractiveWithLabel.test(line)) {
            results.push({
              id: `aria-label-non-interactive-${path.basename(file)}-${index}`,
              name: 'ARIA Label on Non-Interactive Element',
              type: 'static',
              status: 'warning',
              message: 'aria-label on non-interactive element may not be announced',
              file,
              line: index + 1,
              duration: 0,
              severity: 'warning',
              suggestion: 'Consider using aria-describedby or visible text instead',
            });
          }
        });
      } catch (error) {
        // File read error handled elsewhere
      }
    }

    return results;
  }

  private async validateKeyboardNavigation(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const componentFiles = await glob('src/**/*.{jsx,tsx}');

    for (const file of componentFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          // Check for tabIndex misuse
          const tabIndexRegex = /tabIndex\s*=\s*{?\s*(-?\d+)/gi;
          const tabIndexMatches = [...line.matchAll(tabIndexRegex)];
          
          tabIndexMatches.forEach(match => {
            const value = parseInt(match[1]);
            if (value > 0) {
              results.push({
                id: `positive-tabindex-${path.basename(file)}-${index}`,
                name: 'Positive tabIndex',
                type: 'static',
                status: 'warning',
                message: `Positive tabIndex (${value}) can disrupt natural tab order`,
                file,
                line: index + 1,
                duration: 0,
                severity: 'warning',
                suggestion: 'Use tabIndex={0} or tabIndex={-1}, avoid positive values',
                details: {
                  wcagLevel: 'A',
                  guideline: 'WCAG 2.4.3 Focus Order',
                },
              });
            }
          });

          // Check for missing keyboard event handlers on interactive elements
          if (line.includes('onClick') && !line.includes('onKeyDown') && !line.includes('<button')) {
            results.push({
              id: `missing-keyboard-handler-${path.basename(file)}-${index}`,
              name: 'Missing Keyboard Handler',
              type: 'static',
              status: 'warning',
              message: 'Interactive element with onClick missing keyboard handler',
              file,
              line: index + 1,
              duration: 0,
              severity: 'warning',
              suggestion: 'Add onKeyDown handler for Enter and Space keys',
              details: {
                wcagLevel: 'A',
                guideline: 'WCAG 2.1.1 Keyboard',
              },
            });
          }

          // Check for skip links in navigation
          if (line.includes('<nav') && !content.includes('skip-link') && !content.includes('skip to main')) {
            results.push({
              id: `missing-skip-link-${path.basename(file)}`,
              name: 'Missing Skip Link',
              type: 'static',
              status: 'warning',
              message: 'Navigation may benefit from skip link',
              file,
              line: index + 1,
              duration: 0,
              severity: 'warning',
              suggestion: 'Add "Skip to main content" link for keyboard users',
              details: {
                wcagLevel: 'AA',
                guideline: 'WCAG 2.4.1 Bypass Blocks',
              },
            });
          }
        });
      } catch (error) {
        // File read error handled elsewhere
      }
    }

    return results;
  }

  private async validateFocusManagement(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const componentFiles = await glob('src/**/*.{jsx,tsx}');

    for (const file of componentFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        
        // Check for focus management in modal/dialog components
        if (content.includes('modal') || content.includes('dialog') || content.includes('Modal')) {
          if (!content.includes('useRef') && !content.includes('focus()')) {
            results.push({
              id: `modal-no-focus-management-${path.basename(file)}`,
              name: 'Modal Missing Focus Management',
              type: 'static',
              status: 'warning',
              message: 'Modal component may need focus management',
              file,
              duration: 0,
              severity: 'warning',
              suggestion: 'Implement focus trapping and return focus when closed',
              details: {
                wcagLevel: 'AA',
                guideline: 'WCAG 2.4.3 Focus Order',
              },
            });
          }
        }

        // Check for focus indicators in CSS
        const lines = content.split('\n');
        let hasFocusStyles = false;
        
        lines.forEach((line, index) => {
          if (line.includes(':focus') || line.includes('focus:')) {
            hasFocusStyles = true;
          }
        });

        if (content.includes('button') || content.includes('input') || content.includes('select')) {
          if (!hasFocusStyles && !content.includes('focus-visible')) {
            results.push({
              id: `missing-focus-styles-${path.basename(file)}`,
              name: 'Missing Focus Styles',
              type: 'static',
              status: 'warning',
              message: 'Interactive elements may need focus indicators',
              file,
              duration: 0,
              severity: 'warning',
              suggestion: 'Add :focus or :focus-visible styles for keyboard users',
              details: {
                wcagLevel: 'AA',
                guideline: 'WCAG 2.4.7 Focus Visible',
              },
            });
          }
        }
      } catch (error) {
        // File read error handled elsewhere
      }
    }

    return results;
  }

  private async validateMediaAccessibility(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const componentFiles = await glob('src/**/*.{jsx,tsx}');

    for (const file of componentFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          // Check for video elements without captions
          if (line.includes('<video')) {
            if (!line.includes('track') && !content.includes('<track')) {
              results.push({
                id: `video-no-captions-${path.basename(file)}-${index}`,
                name: 'Video Without Captions',
                type: 'static',
                status: 'fail',
                message: 'Video element missing caption track',
                file,
                line: index + 1,
                duration: 0,
                severity: 'error',
                suggestion: 'Add <track> element with captions',
                details: {
                  wcagLevel: 'A',
                  guideline: 'WCAG 1.2.2 Captions (Prerecorded)',
                },
              });
            }
          }

          // Check for audio elements without alternatives
          if (line.includes('<audio')) {
            results.push({
              id: `audio-needs-alternative-${path.basename(file)}-${index}`,
              name: 'Audio Needs Alternative',
              type: 'static',
              status: 'warning',
              message: 'Audio element should have transcript or captions',
              file,
              line: index + 1,
              duration: 0,
              severity: 'warning',
              suggestion: 'Provide transcript or captions for audio content',
              details: {
                wcagLevel: 'A',
                guideline: 'WCAG 1.2.1 Audio-only and Video-only',
              },
            });
          }
        });
      } catch (error) {
        // File read error handled elsewhere
      }
    }

    return results;
  }

  private async validateFormAccessibility(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const componentFiles = await glob('src/**/*.{jsx,tsx}');

    for (const file of componentFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          // Check for inputs without labels
          const inputRegex = /<input\s+[^>]*type\s*=\s*["'](?!hidden)[^"']+["'][^>]*>/gi;
          const inputMatches = line.match(inputRegex);
          
          if (inputMatches) {
            inputMatches.forEach(input => {
              if (!input.includes('aria-label') && !input.includes('aria-labelledby') && 
                  !input.includes('id=')) {
                results.push({
                  id: `input-no-label-${path.basename(file)}-${index}`,
                  name: 'Input Without Label',
                  type: 'static',
                  status: 'fail',
                  message: 'Input element missing accessible label',
                  file,
                  line: index + 1,
                  duration: 0,
                  severity: 'error',
                  suggestion: 'Add <label>, aria-label, or aria-labelledby',
                  details: {
                    wcagLevel: 'A',
                    guideline: 'WCAG 3.3.2 Labels or Instructions',
                  },
                });
              }
            });
          }

          // Check for required field indicators
          if (line.includes('required') && !line.includes('aria-required') && 
              !line.includes('*') && !line.includes('Required')) {
            results.push({
              id: `required-field-no-indicator-${path.basename(file)}-${index}`,
              name: 'Required Field No Indicator',
              type: 'static',
              status: 'warning',
              message: 'Required field missing visual indicator',
              file,
              line: index + 1,
              duration: 0,
              severity: 'warning',
              suggestion: 'Add visual indicator (*, Required text) for required fields',
              details: {
                wcagLevel: 'A',
                guideline: 'WCAG 3.3.2 Labels or Instructions',
              },
            });
          }

          // Check for form validation feedback (but not console.error or similar)
          if (line.includes('error') && !line.includes('aria-describedby') && 
              !line.includes('aria-invalid') && !line.includes('console.') && 
              !line.includes('throw new Error') && !line.includes('new Error') &&
              !line.includes('Error:') && !line.includes('error:') &&
              (line.includes('input') || line.includes('form') || line.includes('field') || 
               line.includes('error') && line.includes('state')) &&
              !line.includes('//')) {
            results.push({
              id: `error-no-aria-${path.basename(file)}-${index}`,
              name: 'Error Without ARIA',
              type: 'static',
              status: 'warning',
              message: 'Error state should use ARIA attributes',
              file,
              line: index + 1,
              duration: 0,
              severity: 'warning',
              suggestion: 'Add aria-invalid and aria-describedby for error states',
              details: {
                wcagLevel: 'AA',
                guideline: 'WCAG 3.3.1 Error Identification',
              },
            });
          }
        });
      } catch (error) {
        // File read error handled elsewhere
      }
    }

    return results;
  }
}

export async function createAccessibilityChecker(): Promise<ValidatorModule> {
  return {
    name: 'accessibility-checker',
    type: 'static',
    async validate(config: ValidationConfig, options: ValidationOptions): Promise<ValidationResult[]> {
      const checker = new AccessibilityChecker(config);
      return await checker.validate(config, options);
    },
    canFix: false,
    dependencies: [],
  };
}