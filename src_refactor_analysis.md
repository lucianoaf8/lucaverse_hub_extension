# Src Folder Refactoring Task List - Specific Instructions

## PHASE 1: CRITICAL CONSOLIDATION TASKS

### Task 1.1: Create Shared Directory Structure
```bash
mkdir -p src/shared/components/debug
mkdir -p src/shared/components/ui  
mkdir -p src/shared/hooks
mkdir -p src/shared/utils
mkdir -p src/shared/types
```

### Task 1.2: Move All Hook Files to Shared
**MOVE these files from `src/hooks/` to `src/shared/hooks/`:**
- `src/hooks/useDragOperations.ts` → `src/shared/hooks/useDragOperations.ts`
- `src/hooks/useMultiPanelResize.ts` → `src/shared/hooks/useMultiPanelResize.ts`
- `src/hooks/useVirtualizedPanels.ts` → `src/shared/hooks/useVirtualizedPanels.ts`
- `src/hooks/useWorkspace.ts` → `src/shared/hooks/useWorkspace.ts`
- `src/hooks/useWebGL.ts` → `src/shared/hooks/useWebGL.ts`
- `src/hooks/useSettings.ts` → `src/shared/hooks/useSettings.ts`
- `src/hooks/useDebounce.ts` → `src/shared/hooks/useDebounce.ts`
- `src/hooks/useThrottle.ts` → `src/shared/hooks/useThrottle.ts`
- `src/hooks/useLocalStorage.ts` → `src/shared/hooks/useLocalStorage.ts`
- `src/hooks/useEventListener.ts` → `src/shared/hooks/useEventListener.ts`
- `src/hooks/useKeyPress.ts` → `src/shared/hooks/useKeyPress.ts`
- `src/hooks/useClickOutside.ts` → `src/shared/hooks/useClickOutside.ts`
- `src/hooks/useWindowSize.ts` → `src/shared/hooks/useWindowSize.ts`
- `src/hooks/usePreferences.ts` → `src/shared/hooks/usePreferences.ts`
- `src/hooks/useLayoutKeyboard.ts` → `src/shared/hooks/useLayoutKeyboard.ts`

**DELETE** empty `src/hooks/` directory after moving all files.

### Task 1.3: Move All Utility Files to Shared
**MOVE these files from `src/utils/` to `src/shared/utils/`:**
- `src/utils/assetPreloader.ts` → `src/shared/utils/assetPreloader.ts`
- `src/utils/collisionDetection.ts` → `src/shared/utils/collisionDetection.ts`
- `src/utils/dragConstraints.ts` → `src/shared/utils/dragConstraints.ts`
- `src/utils/gridSystem.ts` → `src/shared/utils/gridSystem.ts`
- `src/utils/layoutUtils.ts` → `src/shared/utils/layoutUtils.ts`
- `src/utils/panelBounds.ts` → `src/shared/utils/panelBounds.ts`
- `src/utils/resizeConstraints.ts` → `src/shared/utils/resizeConstraints.ts`
- `src/utils/resizeUtils.ts` → `src/shared/utils/resizeUtils.ts`
- `src/utils/stateMigration.ts` → `src/shared/utils/stateMigration.ts`
- `src/utils/testRunner.ts` → `src/shared/utils/testRunner.ts`

**DELETE** empty `src/utils/` directory after moving all files.

### Task 1.4: Move Debug Components to Shared
**MOVE** `src/components/debug/` → `src/shared/components/debug/`

### Task 1.5: Update Shared Hooks Index File
**UPDATE** `src/shared/hooks/index.ts` with correct paths:
```typescript
/**
 * Shared hooks barrel export
 * Re-exports all custom hooks for easy importing
 */

// Core hooks
export * from './useDragOperations';
export * from './useMultiPanelResize';
export * from './useVirtualizedPanels';
export * from './useWorkspace';
export * from './useWebGL';
export * from './useSettings';
export * from './useLayoutKeyboard';

// Utility hooks
export * from './useDebounce';
export * from './useThrottle';
export * from './useLocalStorage';
export * from './useEventListener';
export * from './useKeyPress';
export * from './useClickOutside';
export * from './useWindowSize';
export * from './usePreferences';
```

### Task 1.6: Create Shared Utils Index File
**CREATE** `src/shared/utils/index.ts`:
```typescript
/**
 * Shared utilities barrel export
 * Re-exports all utility functions for easy importing
 */

// Layout utilities
export * from './layoutUtils';
export * from './panelBounds';
export * from './gridSystem';
export * from './collisionDetection';

// Interaction utilities  
export * from './dragConstraints';
export * from './resizeConstraints';
export * from './resizeUtils';

// System utilities
export * from './assetPreloader';
export * from './stateMigration';
export * from './testRunner';
```

### Task 1.7: Create Shared Types Index File
**CREATE** `src/shared/types/index.ts`:
```typescript
/**
 * Shared types barrel export
 * Re-exports commonly used types
 */

// Re-export from main types directory
export type {
  Position,
  Size,
  PanelLayout,
  PanelState,
  PanelComponent,
  Panel,
  PanelType
} from '@/types/panel';

export type {
  GridSettings,
  DragState,
  ResizeState,
  LayoutState,
  WorkspaceConfig
} from '@/types/layout';

export type {
  PlatformAPI,
  PlatformType,
  PlatformCapabilities,
  StorageAPI,
  NotificationAPI
} from '@/types/platform';
```

### Task 1.8: Update Main Shared Index File
**UPDATE** `src/shared/index.ts`:
```typescript
/**
 * Shared module barrel export
 * Main entry point for all shared resources
 */

// Re-export all shared modules
export * from './components';
export * from './hooks';
export * from './utils';
export * from './types';
```

## PHASE 2: FEATURE-BASED ORGANIZATION

### Task 2.1: Create Feature Directory Structure
```bash
mkdir -p src/features/panels/components
mkdir -p src/features/panels/hooks
mkdir -p src/features/panels/utils
mkdir -p src/features/panels/types
mkdir -p src/features/smart-hub/components
mkdir -p src/features/ai-chat/components
mkdir -p src/features/task-manager/components
mkdir -p src/features/productivity/components
```

### Task 2.2: Move Panel Components to Features
**MOVE** these files to `src/features/panels/components/`:
- `src/components/panels/SmartHub.tsx` → `src/features/smart-hub/components/SmartHub.tsx`
- `src/components/panels/AIChat.tsx` → `src/features/ai-chat/components/AIChat.tsx`
- `src/components/panels/TaskManager.tsx` → `src/features/task-manager/components/TaskManager.tsx`
- `src/components/panels/Productivity.tsx` → `src/features/productivity/components/Productivity.tsx`
- `src/components/panels/index.ts` → `src/features/panels/components/index.ts`

**MOVE** these UI panel components to `src/features/panels/components/`:
- `src/components/ui/Panel.tsx` → `src/features/panels/components/Panel.tsx`
- `src/components/ui/DraggablePanel.tsx` → `src/features/panels/components/DraggablePanel.tsx`
- `src/components/ui/ResizablePanel.tsx` → `src/features/panels/components/ResizablePanel.tsx`
- `src/components/ui/PanelGroup.tsx` → `src/features/panels/components/PanelGroup.tsx`
- `src/components/ui/PanelToolbar.tsx` → `src/features/panels/components/PanelToolbar.tsx`
- `src/components/ui/PanelContextMenu.tsx` → `src/features/panels/components/PanelContextMenu.tsx`
- `src/components/ui/ResizeHandle.tsx` → `src/features/panels/components/ResizeHandle.tsx`
- `src/components/ui/DragHandle.tsx` → `src/features/panels/components/DragHandle.tsx`
- `src/components/ui/ResizePreview.tsx` → `src/features/panels/components/ResizePreview.tsx`
- `src/components/ui/ResizeHandles.tsx` → `src/features/panels/components/ResizeHandles.tsx`
- `src/components/ui/DropZone.tsx` → `src/features/panels/components/DropZone.tsx`
- `src/components/ui/DragFeedback.tsx` → `src/features/panels/components/DragFeedback.tsx`
- `src/components/ui/GridOverlay.tsx` → `src/features/panels/components/GridOverlay.tsx`

### Task 2.3: Create Feature Index Files

**CREATE** `src/features/panels/index.ts`:
```typescript
/**
 * Panels feature module
 * Main entry point for panel functionality
 */

// Core panel components
export * from './components/Panel';
export * from './components/DraggablePanel';
export * from './components/ResizablePanel';
export * from './components/PanelGroup';
export * from './components/PanelToolbar';
export * from './components/PanelContextMenu';

// Panel interaction components
export * from './components/ResizeHandle';
export * from './components/DragHandle';
export * from './components/ResizePreview';
export * from './components/ResizeHandles';
export * from './components/DropZone';
export * from './components/DragFeedback';
export * from './components/GridOverlay';

// Re-export shared hooks (panel-related)
export { useDragOperations, useMultiPanelResize } from '@/shared/hooks';

// Re-export shared utils (panel-related)
export { 
  snapToGrid, 
  magneticSnapToGrid,
  checkCollision,
  findCollisions,
  constrainPosition,
  calculateViewportBounds
} from '@/shared/utils';
```

**CREATE** `src/features/smart-hub/index.ts`:
```typescript
/**
 * Smart Hub feature module
 */

export * from './components/SmartHub';
```

**CREATE** `src/features/ai-chat/index.ts`:
```typescript
/**
 * AI Chat feature module
 */

export * from './components/AIChat';
```

**CREATE** `src/features/task-manager/index.ts`:
```typescript
/**
 * Task Manager feature module
 */

export * from './components/TaskManager';
```

**CREATE** `src/features/productivity/index.ts`:
```typescript
/**
 * Productivity feature module
 */

export * from './components/Productivity';
```

### Task 2.4: Create Main Features Index
**CREATE** `src/features/index.ts`:
```typescript
/**
 * Features barrel export
 * Main entry point for all feature modules
 */

// Panel system
export * from './panels';

// Individual features
export * from './smart-hub';
export * from './ai-chat';
export * from './task-manager';
export * from './productivity';
```

## PHASE 3: TEST STRUCTURE UNIFICATION

### Task 3.1: Create Unified Test Structure
```bash
mkdir -p src/tests/unit
mkdir -p src/tests/integration
mkdir -p src/tests/components
mkdir -p src/tests/stores
mkdir -p src/tests/utils
```

### Task 3.2: Move Component Tests
**MOVE** all files from `src/components/__tests__/` to `src/tests/components/`:
- `src/components/__tests__/ComponentTest.tsx` → `src/tests/components/ComponentTest.tsx`
- `src/components/__tests__/PanelMigrationTest.tsx` → `src/tests/components/PanelMigrationTest.tsx`
- `src/components/__tests__/LayoutSystemTest.tsx` → `src/tests/components/LayoutSystemTest.tsx`
- `src/components/__tests__/DragDropTest.tsx` → `src/tests/components/DragDropTest.tsx`
- `src/components/__tests__/ResizeTest.tsx` → `src/tests/components/ResizeTest.tsx`
- `src/components/__tests__/PanelManagementTest.tsx` → `src/tests/components/PanelManagementTest.tsx`
- `src/components/__tests__/index.ts` → `src/tests/components/index.ts`

**DELETE** empty `src/components/__tests__/` directory.

### Task 3.3: Move Store Tests
**MOVE** all files from `src/stores/__tests__/` to `src/tests/stores/`:
- `src/stores/__tests__/storeValidation.ts` → `src/tests/stores/storeValidation.ts`

### Task 3.4: Move General Tests
**MOVE** all files from `src/__tests__/` to `src/tests/unit/`:
- `src/__tests__/featureParityValidation.tsx` → `src/tests/unit/featureParityValidation.tsx`

**DELETE** empty `src/__tests__/` directory.

### Task 3.5: Create Test Index File
**CREATE** `src/tests/index.ts`:
```typescript
/**
 * Tests barrel export
 * Main entry point for all test utilities
 */

// Component tests
export * from './components';

// Store tests  
export * from './stores/storeValidation';

// Unit tests
export * from './unit/featureParityValidation';
```

## PHASE 4: CONFIGURATION UPDATES

### Task 4.1: Update TypeScript Configuration
**UPDATE** `tsconfig.json` paths section:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/stores": ["./src/stores"],
      "@/stores/*": ["./src/stores/*"],
      "@/platform/*": ["./src/platform/*"],
      "@/types/*": ["./src/types/*"],
      "@/tests/*": ["./src/tests/*"]
    }
  }
}
```

### Task 4.2: Update Vite Configuration
**UPDATE** `vite.config.ts` resolve.alias section:
```javascript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@/features': path.resolve(__dirname, './src/features'),
    '@/shared': path.resolve(__dirname, './src/shared'),
    '@/stores': path.resolve(__dirname, './src/stores'),
    '@/platform': path.resolve(__dirname, './src/platform'),
    '@/types': path.resolve(__dirname, './src/types'),
    '@/tests': path.resolve(__dirname, './src/tests')
  }
}
```

### Task 4.3: Update All Import Statements
**FIND AND REPLACE** these import patterns throughout the codebase:

**Hook imports:**
- `from '@/hooks/` → `from '@/shared/hooks/`
- `from '../hooks/` → `from '@/shared/hooks/'`
- `from '../../hooks/` → `from '@/shared/hooks/'`

**Utility imports:**
- `from '@/utils/` → `from '@/shared/utils/`
- `from '../utils/` → `from '@/shared/utils/'`
- `from '../../utils/` → `from '@/shared/utils/'`

**Panel component imports:**
- `from '@/components/panels'` → `from '@/features'`
- `from '../components/panels'` → `from '@/features'`

**Update these specific files with new import paths:**
- `src/App.tsx`
- `src/components/DynamicLayout.tsx`
- `src/stores/layoutStore.ts`
- `src/stores/appStore.ts`
- All files in `src/features/`
- All files in `src/tests/`

## PHASE 5: CLEANUP AND VALIDATION

### Task 5.1: Remove Empty Directories
**DELETE** these directories if empty:
- `src/hooks/`
- `src/utils/`
- `src/components/__tests__/`
- `src/stores/__tests__/`
- `src/__tests__/`
- `src/components/debug/`
- `src/components/panels/` (if all files moved)

### Task 5.2: Update Remaining Component UI Directory
**UPDATE** `src/components/ui/index.ts` to exclude moved components:
```typescript
/**
 * UI components barrel export
 * Re-exports remaining UI components (non-panel related)
 */

// Keep non-panel UI components here
export * from './Button';
export * from './Input';
export * from './Modal';
export * from './Toast';
export * from './Tooltip';
export * from './LoadingSpinner';
export * from './ErrorBoundary';

// Panel components moved to @/features/panels
// Debug components moved to @/shared/components/debug
```

## FINAL VALIDATION STRUCTURE

After completing all tasks, verify this final structure:

```
src/
├── components/                 # Remaining components
│   ├── providers/             # Context providers (keep)
│   ├── ui/                    # Non-panel UI components (reduced)
│   ├── DynamicLayout.tsx      # Main layout (keep)
│   └── index.ts               # Updated exports
├── features/                  # ✅ NEW: Feature-based modules
│   ├── panels/                # Panel system
│   │   ├── components/        # All panel-related components
│   │   └── index.ts           # Panel feature exports
│   ├── smart-hub/             # SmartHub feature
│   ├── ai-chat/               # AI Chat feature
│   ├── task-manager/          # Task Manager feature
│   ├── productivity/          # Productivity feature
│   └── index.ts               # All features export
├── shared/                    # ✅ UPDATED: Consolidated shared code
│   ├── components/            # Shared/reusable components
│   │   └── debug/             # Debug components (moved)
│   ├── hooks/                 # All hooks (consolidated)
│   ├── utils/                 # All utilities (consolidated)
│   ├── types/                 # Shared type exports
│   └── index.ts               # Shared barrel export
├── stores/                    # State management (unchanged)
├── platform/                 # Platform abstraction (unchanged)
├── types/                     # Type definitions (unchanged)
├── tests/                     # ✅ NEW: Unified test structure
│   ├── components/            # Component tests (moved)
│   ├── stores/                # Store tests (moved)
│   ├── unit/                  # Unit tests (moved)
│   ├── integration/           # Integration tests
│   └── index.ts               # Test exports
└── App.tsx                    # Main app (unchanged)
```

## VERIFICATION COMMANDS

After completing all tasks, run these commands to verify the refactoring:

```bash
# Check no broken imports
npm run type-check

# Verify build works
npm run build

# Check for any remaining old import patterns
grep -r "from '@/hooks/" src/
grep -r "from '@/utils/" src/
grep -r "from '@/components/panels" src/

# These should return no results if refactoring is complete
```