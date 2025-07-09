// Create a test component to verify layout works on different screen sizes
// Requirements:
// - Test on 1920x1080, 1440x900, 1280x800
// - Ensure no scrolling on any resolution
// - Verify all content is visible
// - Report any overflow issues

import React from 'react';

export default function LayoutTest() {
  React.useEffect(() => {
    const testLayout = () => {
      const container = document.querySelector('.dev-center-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        const hasVerticalScroll = container.scrollHeight > container.clientHeight;
        const hasHorizontalScroll = container.scrollWidth > container.clientWidth;
      
        console.log('Layout Test Results:');
        console.log('Container size:', rect.width, 'x', rect.height);
        console.log('Viewport size:', window.innerWidth, 'x', window.innerHeight);
        console.log('Vertical scroll:', hasVerticalScroll ? 'YES (PROBLEM)' : 'NO (OK)');
        console.log('Horizontal scroll:', hasHorizontalScroll ? 'YES (PROBLEM)' : 'NO (OK)');
      
        if (hasVerticalScroll || hasHorizontalScroll) {
          console.error('LAYOUT PROBLEM: Scrolling detected');
        } else {
          console.log('✅ Layout test passed');
        }
      }
    };
  
    testLayout();
    window.addEventListener('resize', testLayout);
  
    return () => window.removeEventListener('resize', testLayout);
  }, []);
  
  return null;
}