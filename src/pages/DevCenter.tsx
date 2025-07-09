// Replace the entire existing DevCenter.tsx with the new grid-based layout
// Requirements:
// - Remove all existing scroll-based layout
// - Remove all current demo cards and sections
// - Implement the new grid system
// - Import and use all new components created above
// - Ensure no scrolling anywhere
// - Test that layout works on 1080p screens

import React from 'react';
import DevCenterGrid from '../components/dev-center/DevCenterGrid';
import DevCenterHeader from '../components/dev-center/DevCenterHeader';
import WorkflowCards from '../components/dev-center/WorkflowCards';
import QuickActionsBar from '../components/dev-center/QuickActionsBar';
import StatusPanels from '../components/dev-center/StatusPanels';
import LayoutTest from '../components/dev-center/LayoutTest';

export default function DevCenter() {
  return (
    <DevCenterGrid>
      <DevCenterHeader />
      <div className="dev-center-main">
        <WorkflowCards />
        <QuickActionsBar />
        <StatusPanels />
      </div>
      <LayoutTest />
    </DevCenterGrid>
  );
}