# Lucaverse Hub - Enhanced Productivity Hub

A modern React TypeScript application designed as a multi-platform productivity hub with advanced theming, internationalization, and cross-platform deployment capabilities.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd lucaverse-hub-react

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:5666`

## 📋 Available Scripts

### Development
- `npm run dev` - Start development server (auto-kills port 5666 processes)
- `npm run dev:dashboard` - Start with dashboard route
- `npm run dev:theme` - Start with theme demo
- `npm run dev:animations` - Start with animation demo
- `npm run dev:extension` - Development mode for browser extension
- `npm run dev:electron` - Development mode for Electron app

### Building
- `npm run build` - Build for web (default)
- `npm run build:web` - Build web application
- `npm run build:extension` - Build browser extension
- `npm run build:electron` - Build Electron desktop app

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

### Testing
- `npm run test` - Run Jest test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:panels` - Test panel operations
- `npm run test:dragdrop` - Test drag-and-drop functionality
- `npm run test:visual` - Run visual regression tests
- `npm run test:performance` - Run performance tests

## 🏗️ Architecture

### Multi-Platform Support
This application builds for three distinct platforms:

1. **Web Application** - Primary platform using Vite dev server
2. **Browser Extension** - Chrome/Firefox extension using @crxjs/vite-plugin
3. **Electron Desktop App** - Cross-platform desktop application

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components
│   └── dashboard/      # Dashboard-specific components
├── pages/              # Route components
│   ├── DevCenter.tsx   # Development center page
│   ├── Dashboard.tsx   # Main dashboard
│   ├── ThemeDemo.tsx   # Theme demonstration
│   └── AnimationDemo.tsx # Animation examples
├── contexts/           # React contexts
│   ├── ThemeContext.tsx # Theme management
│   └── I18nContext.tsx  # Internationalization
├── config/             # Configuration files
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── locales/            # Translation files
└── tests/              # Test files
```

## 🎨 Theme System

### Overview
The application features a comprehensive theme system with centralized design tokens:

- **CSS Custom Properties**: All colors, fonts, and spacing defined as CSS variables
- **Tailwind Integration**: Seamless integration with Tailwind CSS
- **Dynamic Theming**: Runtime theme switching capability
- **Design Tokens**: Centralized color palettes, typography, and spacing

### Theme Configuration
Located in `src/config/theme.ts` - the single source of truth for all design tokens.

### Color System
- **Primary Colors**: Brand colors with 50-950 scale
- **Semantic Colors**: Success, warning, danger, info states
- **Surface Colors**: Background and surface variations
- **Text Colors**: Hierarchical text color system

### Usage Example
```tsx
// Using theme colors in components
<button className="bg-primary-500 hover:bg-primary-600 text-white">
  Click me
</button>

// Using semantic colors
<div className="bg-success-50 border border-success-200 text-success-800">
  Success message
</div>
```

## 🌍 Internationalization

### Supported Languages
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Japanese (ja)

### Adding Translations
1. Add translation keys to `src/locales/{language}.json`
2. Use the `useTranslation` hook in components:

```tsx
import { useTranslation } from '../contexts/I18nContext';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('welcome.title')}</h1>;
}
```

## 🧩 Key Features

### Dashboard
- **Real-time Clock**: Live time display
- **Navigation**: Seamless routing between sections
- **Responsive Design**: Mobile-first responsive layout
- **Dark Theme**: Modern dark UI with accent colors

### Development Center
- **Multi-platform Testing**: Test across web, extension, and desktop
- **Theme Playground**: Live theme customization
- **Animation Demos**: Interactive animation examples
- **Component Library**: Reusable component showcase

### Browser Extension
- **Cross-browser Support**: Chrome and Firefox compatible
- **Manifest V3**: Modern extension architecture
- **Background Scripts**: Service worker implementation

### Electron Desktop
- **Cross-platform**: Windows, macOS, Linux support
- **Native Integration**: OS-specific features
- **Auto-updater**: Built-in update mechanism

## 🛠️ Development Guidelines

### Code Style
- **TypeScript**: Strict typing with interfaces
- **ESLint**: Enforced code quality rules
- **Prettier**: Consistent code formatting
- **Naming Conventions**: 
  - PascalCase for components
  - camelCase for functions and variables
  - kebab-case for CSS classes

### Component Structure
```tsx
// Component template
interface ComponentProps {
  title: string;
  children?: ReactNode;
}

export default function Component({ title, children }: ComponentProps) {
  return (
    <div className="component-wrapper">
      <h1>{title}</h1>
      {children}
    </div>
  );
}
```

### Adding New Components
1. Create component in appropriate directory
2. Add TypeScript interfaces for props
3. Export from `index.ts` barrel file
4. Add tests if applicable

## 🧪 Testing Strategy

### Test Types
- **Unit Tests**: Component and utility testing with Jest
- **Integration Tests**: Multi-component interaction testing
- **Visual Tests**: Screenshot-based regression testing
- **Performance Tests**: Bundle size and runtime performance
- **Platform Tests**: Extension and Electron specific testing

### Running Tests
```bash
# Run all tests
npm run test

# Specific test suites
npm run test:panels      # Panel system tests
npm run test:dragdrop    # Drag and drop tests
npm run test:visual      # Visual regression tests
npm run test:performance # Performance benchmarks
```

## 📦 Build and Deployment

### Web Deployment
```bash
npm run build:web
# Output: dist/web/
```

### Browser Extension
```bash
npm run build:extension
# Output: dist/extension/
# Load unpacked extension from this directory
```

### Electron Desktop
```bash
npm run build:electron
npm run electron:build
# Output: dist/electron/ and packaged apps
```

### Build Analysis
```bash
npm run analyze:bundle  # Bundle size analysis
npm run analyze:web     # Web build analysis
npm run analyze:extension # Extension build analysis
```

## 🔧 Configuration

### Environment Variables
Create `.env` file for local development:
```env
VITE_APP_TITLE=Lucaverse Hub
VITE_API_URL=http://localhost:3000
```

### Vite Configuration
- **Main Config**: `vite.config.ts` - Web development
- **Dev Center Config**: `vite.config.dev-center.ts` - Development center specific

### TypeScript Configuration
- **Strict Mode**: Disabled for flexibility
- **Module Resolution**: Bundler mode for modern tooling
- **Path Aliases**: `@/` maps to `src/`

## 📚 Documentation

### Additional Documentation
- `docs/theme_documentation.md` - Comprehensive theme system guide
- `docs/theme_system_implementation.md` - Theme implementation details
- `CLAUDE.md` - AI assistant development guidance

### API Documentation
Component APIs are documented using TypeScript interfaces. See individual component files for detailed prop documentation.

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes following code style guidelines
4. Run tests: `npm run test`
5. Run linting: `npm run lint:fix`
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open Pull Request

### Code Review Checklist
- [ ] TypeScript types are properly defined
- [ ] Components follow naming conventions
- [ ] Tests are included for new functionality
- [ ] Documentation is updated
- [ ] ESLint passes without warnings
- [ ] Build succeeds for all platforms

## 📄 License

This project is private and proprietary to Lucaverse.

## 🆘 Support

### Common Issues

**Port 5666 already in use:**
```bash
npm run dev  # Automatically kills existing processes
```

**Build failures:**
```bash
npm run type-check  # Check TypeScript errors
npm run lint        # Check code quality issues
```

**Extension not loading:**
1. Build extension: `npm run build:extension`
2. Load unpacked from `dist/extension/`
3. Check browser console for errors

### Getting Help
- Check existing documentation in `docs/` directory
- Review component source code for usage examples
- Run test suites to understand expected behavior

---

**Version**: 2.0.0  
**Last Updated**: July 2025  
**Maintainer**: Lucaverse Team
