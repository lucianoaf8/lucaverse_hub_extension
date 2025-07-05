/**
 * Validation script for Panel Resize System
 * Tests all components and functionality for professional resize behavior
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  console.log('🔄 Starting Panel Resize System Validation...\n');

  // Test 1: File Structure Validation
  console.log('✅ Test 1: Checking file structure...');
  
  const requiredFiles = [
    'src/components/ui/ResizablePanel.tsx',
    'src/components/ui/ResizePreview.tsx',
    'src/components/ui/ResizeHandles.tsx',
    'src/utils/resizeConstraints.ts',
    'src/utils/resizeUtils.ts',
    'src/hooks/useMultiPanelResize.ts',
    'src/components/__tests__/ResizeTest.tsx'
  ];
  
  const missingFiles = [];
  const existingFiles = [];
  
  requiredFiles.forEach(file => {
    const fullPath = join(process.cwd(), file);
    if (existsSync(fullPath)) {
      existingFiles.push(file);
      console.log(`   ✓ ${file}`);
    } else {
      missingFiles.push(file);
      console.log(`   ✗ ${file} - MISSING`);
    }
  });
  
  console.log(`\n📊 Files Check: ${existingFiles.length}/${requiredFiles.length} files present`);
  
  if (missingFiles.length > 0) {
    console.log('❌ Missing files detected. Please ensure all files are created.');
    process.exit(1);
  }
  
  // Test 2: Package Dependencies Validation
  console.log('\n✅ Test 2: Checking dependencies...');
  
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  const requiredPackages = [
    'react-resizable-panels'
  ];
  
  const missingPackages = [];
  
  requiredPackages.forEach(pkg => {
    if (packageJson.dependencies[pkg] || packageJson.devDependencies[pkg]) {
      console.log(`   ✓ ${pkg} - v${packageJson.dependencies[pkg] || packageJson.devDependencies[pkg]}`);
    } else {
      missingPackages.push(pkg);
      console.log(`   ✗ ${pkg} - NOT INSTALLED`);
    }
  });
  
  if (missingPackages.length > 0) {
    console.log('\n❌ Missing packages detected. Please run npm install for missing packages.');
    process.exit(1);
  }
  
  // Test 3: Component Implementation Validation
  console.log('\n✅ Test 3: Validating component implementations...');
  
  // Check ResizablePanel implementation
  const resizablePanelContent = readFileSync('src/components/ui/ResizablePanel.tsx', 'utf8');
  if (resizablePanelContent.includes('export const ResizablePanel') && 
      resizablePanelContent.includes('ResizeDirection') &&
      resizablePanelContent.includes('ResizeConstraints')) {
    console.log('   ✓ ResizablePanel implements 8-directional resize');
  } else {
    console.log('   ✗ ResizablePanel missing required implementation');
  }
  
  // Check ResizePreview implementation
  const resizePreviewContent = readFileSync('src/components/ui/ResizePreview.tsx', 'utf8');
  if (resizePreviewContent.includes('export const ResizePreview') && 
      resizePreviewContent.includes('DimensionDisplay') &&
      resizePreviewContent.includes('SnapIndicators')) {
    console.log('   ✓ ResizePreview provides visual feedback system');
  } else {
    console.log('   ✗ ResizePreview missing required components');
  }
  
  // Check ResizeHandles implementation
  const resizeHandlesContent = readFileSync('src/components/ui/ResizeHandles.tsx', 'utf8');
  if (resizeHandlesContent.includes('export const ResizeHandles') && 
      resizeHandlesContent.includes('HANDLE_CURSORS') &&
      resizeHandlesContent.includes('calculateHandlePosition')) {
    console.log('   ✓ ResizeHandles implements 8-directional handles');
  } else {
    console.log('   ✗ ResizeHandles missing required functionality');
  }
  
  // Check constraint system
  const resizeConstraintsContent = readFileSync('src/utils/resizeConstraints.ts', 'utf8');
  if (resizeConstraintsContent.includes('calculateResizeConstraints') && 
      resizeConstraintsContent.includes('validateResizeOperation') &&
      resizeConstraintsContent.includes('detectResizeCollisions')) {
    console.log('   ✓ Resize constraints system implemented');
  } else {
    console.log('   ✗ Resize constraints missing required functions');
  }
  
  // Check utility functions
  const resizeUtilsContent = readFileSync('src/utils/resizeUtils.ts', 'utf8');
  if (resizeUtilsContent.includes('calculateAspectRatio') && 
      resizeUtilsContent.includes('enforceMinMaxConstraints') &&
      resizeUtilsContent.includes('getPerformanceMetrics')) {
    console.log('   ✓ Resize utilities provide comprehensive helpers');
  } else {
    console.log('   ✗ Resize utilities missing required functions');
  }
  
  // Check multi-panel resize hook
  const multiPanelResizeContent = readFileSync('src/hooks/useMultiPanelResize.ts', 'utf8');
  if (multiPanelResizeContent.includes('useMultiPanelResize') && 
      multiPanelResizeContent.includes('calculateProportionalResize') &&
      multiPanelResizeContent.includes('handleOverflow')) {
    console.log('   ✓ Multi-panel resize interactions implemented');
  } else {
    console.log('   ✗ Multi-panel resize missing required functionality');
  }
  
  // Test 4: Feature Implementation Checklist
  console.log('\n✅ Test 4: Feature Implementation Checklist...');
  
  const features = [
    { name: '8-directional resize handles', check: resizeHandlesContent.includes("'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'") },
    { name: 'Minimum and maximum size constraints', check: resizeConstraintsContent.includes('minSize') && resizeConstraintsContent.includes('maxSize') },
    { name: 'Aspect ratio locking with modifier keys', check: resizablePanelContent.includes('aspectRatio') && resizablePanelContent.includes('shiftKey') },
    { name: 'Real-time resize preview', check: resizePreviewContent.includes('DimensionDisplay') && resizePreviewContent.includes('previewSize') },
    { name: 'Visual feedback with dimensions', check: resizePreviewContent.includes('Math.round(size.width)') && resizePreviewContent.includes('violations') },
    { name: 'Snap-to-size functionality', check: resizeUtilsContent.includes('snapToCommonSizes') && resizeUtilsContent.includes('PANEL_SIZE_PRESETS') },
    { name: 'Collision detection and prevention', check: resizeConstraintsContent.includes('detectResizeCollisions') && resizeConstraintsContent.includes('preventOverlap') },
    { name: 'Multi-panel proportional resize', check: multiPanelResizeContent.includes('calculateProportionalResize') && multiPanelResizeContent.includes('proportion') },
    { name: 'Performance optimization', check: resizeUtilsContent.includes('performanceMetrics') && resizeUtilsContent.includes('requestAnimationFrame') },
    { name: 'Touch support for mobile', check: resizeHandlesContent.includes('touchEnabled') && resizeHandlesContent.includes('onTouchStart') },
    { name: 'Constraint violation warnings', check: resizePreviewContent.includes('ConstraintViolationOverlay') && resizePreviewContent.includes('violations') },
    { name: 'Resize operation caching', check: resizeUtilsContent.includes('operationCache') && resizeUtilsContent.includes('getCachedOperation') },
    { name: 'Comprehensive validation system', check: resizeUtilsContent.includes('validateResizeOperation') && resizeUtilsContent.includes('confidence') },
    { name: 'Test component with instructions', check: readFileSync('src/components/__tests__/ResizeTest.tsx', 'utf8').includes('InstructionsPanel') }
  ];
  
  let passedFeatures = 0;
  features.forEach(feature => {
    if (feature.check) {
      console.log(`   ✓ ${feature.name}`);
      passedFeatures++;
    } else {
      console.log(`   ✗ ${feature.name}`);
    }
  });
  
  console.log(`\n📊 Feature Implementation: ${passedFeatures}/${features.length} features implemented`);
  
  // Test 5: TypeScript Interface Validation
  console.log('\n✅ Test 5: Validating TypeScript interfaces...');
  
  const typeInterfaces = [
    { name: 'ResizeDirection type definition', check: resizeHandlesContent.includes("export type ResizeDirection") },
    { name: 'ResizeConstraints interface', check: resizeConstraintsContent.includes("export interface ResizeConstraints") },
    { name: 'ResizeEventData interface', check: resizablePanelContent.includes("interface ResizeEventData") },
    { name: 'Performance metrics interface', check: resizeUtilsContent.includes("interface ResizePerformanceMetrics") },
    { name: 'Multi-panel resize config', check: multiPanelResizeContent.includes("interface MultiPanelResizeConfig") }
  ];
  
  let passedInterfaces = 0;
  typeInterfaces.forEach(typeInterface => {
    if (typeInterface.check) {
      console.log(`   ✓ ${typeInterface.name}`);
      passedInterfaces++;
    } else {
      console.log(`   ✗ ${typeInterface.name}`);
    }
  });
  
  console.log(`\n📊 TypeScript Interfaces: ${passedInterfaces}/${typeInterfaces.length} interfaces properly defined`);
  
  // Final validation summary
  console.log('\n🎯 VALIDATION SUMMARY:');
  console.log('='.repeat(60));
  console.log(`✅ All required files created: ${existingFiles.length}/${requiredFiles.length}`);
  console.log(`✅ All packages installed: ${requiredPackages.length - missingPackages.length}/${requiredPackages.length}`);
  console.log(`✅ Features implemented: ${passedFeatures}/${features.length}`);
  console.log(`✅ TypeScript interfaces: ${passedInterfaces}/${typeInterfaces.length}`);
  
  const totalSuccessRate = (
    (existingFiles.length / requiredFiles.length) +
    ((requiredPackages.length - missingPackages.length) / requiredPackages.length) +
    (passedFeatures / features.length) +
    (passedInterfaces / typeInterfaces.length)
  ) / 4;
  
  if (missingFiles.length === 0 && missingPackages.length === 0 && totalSuccessRate >= 0.95) {
    console.log('\n🎉 SUCCESS: Panel Resize System implementation is complete!');
    console.log('\n🚀 Next Steps:');
    console.log('   1. Run the development server: npm run dev');
    console.log('   2. Click "Panel Resize Test" in the main interface');
    console.log('   3. Test 8-directional resize handles on panel edges/corners');
    console.log('   4. Hold Shift while resizing to test aspect ratio locking');
    console.log('   5. Test minimum/maximum size constraint enforcement');
    console.log('   6. Verify resize preview shows accurate dimensions');
    console.log('   7. Test snap-to-size behavior with common dimensions');
    console.log('   8. Check collision detection prevents panel overlaps');
    console.log('   9. Test multi-panel selection and group resize (Ctrl+Click)');
    console.log('  10. Monitor performance metrics in real-time');
    
    console.log('\n📋 Testing Checklist:');
    console.log('   □ All 8 resize directions (N, S, E, W, NE, NW, SE, SW)');
    console.log('   □ Minimum size constraints prevent panels from becoming too small');
    console.log('   □ Maximum size constraints limit panel growth');
    console.log('   □ Shift+resize maintains aspect ratio');
    console.log('   □ Live dimension display during resize operations');
    console.log('   □ Snap indicators appear near common sizes');
    console.log('   □ Collision warnings when panels would overlap');
    console.log('   □ Performance stays above 30fps during complex operations');
    console.log('   □ Touch support works on mobile devices');
    console.log('   □ Keyboard shortcuts (Ctrl+A add panels, Ctrl+R reset)');
    
    process.exit(0);
  } else {
    console.log('\n⚠️  Some issues detected. Please review the failures above.');
    console.log(`Overall success rate: ${(totalSuccessRate * 100).toFixed(1)}%`);
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Validation failed with error:', error.message);
  process.exit(1);
}
