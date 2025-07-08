## Task Sequence for Claude Code

### Task 1: Core Theme Configuration

```
Create a comprehensive theme configuration system in src/config/theme.ts that defines:

1. Color palette with semantic naming (primary, secondary, success, warning, danger, neutral shades)
2. Typography scale (font families, sizes, weights, line heights) 
3. Spacing scale (margins, padding, gaps)
4. Border radius values
5. Shadow definitions
6. Animation/transition presets
7. Breakpoint definitions

Structure it as a TypeScript object with nested categories. Make all values easily modifiable from this single source. Include both light and dark theme variants.

Follow the multi-platform guidelines - use serializable data only, no functions or complex objects.
```

### Task 2: CSS Custom Properties Generator

```
Create src/utils/cssVariables.ts that:

1. Takes the theme configuration and generates CSS custom properties
2. Converts theme object to CSS variables (e.g., colors.primary.500 becomes --color-primary-500)
3. Provides a function to inject these variables into document root
4. Handles theme switching by updating CSS variables
5. Returns CSS variable references for use in components

Include TypeScript types for theme structure and ensure the generator is pure function-based.
```

### Task 3: Enhanced Theme Context

```
Update src/contexts/ThemeContext.tsx to:

1. Use the centralized theme configuration
2. Implement theme persistence using storage adapter pattern (prepare for multi-platform)
3. Provide theme switching functionality
4. Inject CSS variables when theme changes
5. Include system theme detection (light/dark preference)
6. Export useTheme hook with proper TypeScript types

Ensure the context follows React best practices and doesn't cause unnecessary re-renders.
```

### Task 4: Tailwind Configuration Integration

```
Update tailwind.config.js to:

1. Use CSS custom properties from the theme system
2. Extend Tailwind's default theme with custom values
3. Create semantic utility classes (e.g., bg-primary, text-secondary)
4. Include custom spacing, typography, and color scales
5. Set up responsive breakpoints from theme config

Ensure Tailwind can access CSS variables properly and create a seamless integration.
```

### Task 5: I18n Configuration Setup

```
Create src/config/i18n.ts and src/locales/ structure:

1. Set up i18n configuration with fallback language
2. Create locales/en.json and locales/es.json as examples
3. Structure translations with nested objects for organization
4. Include UI labels, messages, and any text content
5. Create language detection and storage system
6. Follow platform-agnostic patterns for storage

Structure translations logically (ui.buttons.save, messages.errors.network, etc.)
```

### Task 6: I18n Context and Hooks

```
Create src/contexts/I18nContext.tsx that:

1. Manages current language state
2. Loads translation files dynamically
3. Provides translation function with interpolation support
4. Handles language switching with persistence
5. Includes fallback handling for missing translations
6. Exports useTranslation hook with TypeScript support

Make it work seamlessly with the theme system and follow React patterns.
```

### Task 7: Global Styles Integration

```
Update src/index.css to:

1. Import and apply CSS custom properties from theme
2. Set up base styles using theme variables
3. Include typography styles based on theme config
4. Add utility classes for common patterns
5. Ensure proper CSS cascade and specificity

Remove any hard-coded colors, fonts, or sizes - everything should reference theme variables.
```

### Task 8: Theme Switcher Component Update

```
Enhance src/components/ThemeSwitcher.tsx to:

1. Use the new theme context
2. Show current theme state
3. Provide toggle functionality for light/dark themes
4. Include visual feedback for theme changes
5. Use proper i18n for labels
6. Style using the centralized theme system

Make it a polished component that demonstrates the theme system working.
```

### Task 9: App Integration

```
Update src/App.tsx to:

1. Wrap the app with both ThemeProvider and I18nProvider
2. Initialize theme and i18n systems on app start
3. Add the ThemeSwitcher component for testing
4. Include sample content that uses both theme and i18n
5. Ensure proper loading states and error handling

Test that theme switching and language switching work correctly.
```

### Task 10: Type Definitions

```
Create src/types/theme.ts and src/types/i18n.ts with:

1. Complete TypeScript interfaces for theme structure
2. Type definitions for translation keys and functions
3. Utility types for theme variants and color schemes
4. Proper typing for hook return values
5. Ensure type safety across the entire system

Make the type system robust and helpful for development.
```

Execute these tasks in sequence. Each builds on the previous one, creating a comprehensive design system that's centralized, type-safe, and ready for multi-platform deployment.
