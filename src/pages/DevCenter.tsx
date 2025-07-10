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