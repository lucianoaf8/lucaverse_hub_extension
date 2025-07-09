# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server on port 5666 (auto-kills existing processes)
- `npm run dev:dashboard` - Start dev server with dashboard route
- `npm run dev:extension` - Start development mode for browser extension
- `npm run dev:electron` - Start development mode for Electron app

### Building
- `npm run build` - TypeScript compilation + Vite build for web
- `npm run build:web` - Build web application
- `npm run build:extension` - Build browser extension
- `npm run build:electron` - Build Electron desktop app
- `npm run build:all` - Build all platforms

### Testing
- `npm run test` - Run Jest test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:panels` - Test panel operations specifically
- `npm run test:dragdrop` - Test drag-and-drop functionality
- `npm run test:visual` - Run visual regression tests
- `npm run test:performance` - Run performance tests
- `npm run test:extension` - Test browser extension functionality

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

### Advanced Validation
- `npm run validate` - Run comprehensive validation suite
- `npm run validate:quick` - Run quick validation checks
- `npm run validate:dev` - Run development-specific validations
- `npm run validate:ci` - Run CI-specific validations
- `npm run validate:fix` - Attempt to fix validation issues automatically
- `npm run validate:report` - Generate validation report

## Architecture Overview

### Multi-Platform Support
This is a React TypeScript application that builds for three platforms:
- **Web Application** - Primary platform using Vite dev server
- **Browser Extension** - Chrome/Firefox extension using @crxjs/vite-plugin
- **Electron Desktop** - Cross-platform desktop app using Electron

### Core Technologies
- **React 18.2.0** with TypeScript for UI components
- **Vite 7.0.2** for build system and development server
- **Zustand 4.4.7** for state management
- **React Router DOM 7.6.3** for routing
- **Tailwind CSS 3.4.17** with custom CSS variables for theming
- **Framer Motion 10.16.4** for animations
- **@dnd-kit** suite for drag-and-drop interactions

### Directory Structure
```
src/
├── components/          # React components by feature
│   ├── common/         # Shared UI components
│   ├── dashboard/      # Dashboard-specific components
│   └── dev-center/     # Development tools and testing
├── pages/              # Route-level page components
├── contexts/           # React contexts (Theme, I18n)
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── locales/            # i18n translations (en/pt)
└── config/             # Configuration files
```

### Key Features
- **Comprehensive Validation Framework** - Custom validation suite in `scripts/validation/`
- **Advanced Theme System** - CSS custom properties with runtime theme switching
- **Multi-language Support** - English and Portuguese translations
- **Drag-and-Drop Dashboard** - Resizable panels with @dnd-kit
- **Development Tools** - Built-in component testing and theme playground
- **Performance Monitoring** - Bundle analysis and performance budgets

## Development Workflow

### State Management
- Uses Zustand for lightweight state management
- State is organized by feature domains
- Persistence layer for dashboard layouts and user preferences

### Styling System
- Tailwind CSS with custom CSS variables defined in `src/index.css`
- Theme switching via CSS custom properties
- Responsive design with mobile-first approach
- Glassmorphism design system with backdrop blur effects

### Testing Strategy
- **Unit Tests** - Jest with React Testing Library
- **Visual Regression** - Playwright with custom visual testing framework
- **Performance Tests** - Custom performance monitoring and budgets
- **Integration Tests** - Multi-platform integration testing
- **Manual Testing** - Guided manual testing framework

### Build Configuration
- TypeScript with `strict: false` for gradual typing
- Vite configuration with React plugin and path aliases (`@/` → `src/`)
- Multiple build modes for different platforms
- Bundle analysis with rollup-plugin-visualizer

### Error Handling
- React Error Boundaries for graceful error recovery
- Comprehensive error logging and reporting
- Development-friendly error messages with stack traces

## Key Patterns

### Component Structure
- Components use TypeScript interfaces for props
- Consistent naming: PascalCase for components, camelCase for functions
- Components are organized by feature with index.ts barrel exports

### Development Center
- Live component testing environment at `/dev-center`
- Theme playground for testing design system changes
- Animation testing utilities
- Performance monitoring dashboard

### Validation System
The `scripts/validation/` directory contains a comprehensive validation framework:
- **Static Analysis** - Architecture, guidelines, theme validation
- **Runtime Monitoring** - Health checks, performance tracking
- **Visual Testing** - Component states, regression testing
- **Accessibility** - A11y validation and ARIA compliance

### Platform-Specific Features
- Extension manifest configuration
- Electron main process setup
- Platform detection utilities
- Conditional feature loading

## Important Notes

- Development server runs on port 5666 (not the standard 5173)
- The app has comprehensive error boundaries and graceful degradation
- All builds include TypeScript compilation as a prerequisite
- The validation system should be run before committing changes
- Multi-platform builds require platform-specific testing