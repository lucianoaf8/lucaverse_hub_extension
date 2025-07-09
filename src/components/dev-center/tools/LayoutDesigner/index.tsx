import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import WorkflowToolPage from '../../components/WorkflowToolPage';
import SkeletonLoader from '../../components/SkeletonLoader';

// Lazy load layout designer sections
const StructureDesign = lazy(() => import('./StructureDesign'));
const ResponsiveDesign = lazy(() => import('./ResponsiveDesign'));
const InteractiveFeatures = lazy(() => import('./InteractiveFeatures'));
const OptimizeLayout = lazy(() => import('./OptimizeLayout'));

export default function LayoutDesigner() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="structure" replace />} />
      
      <Route path="/structure" element={
        <WorkflowToolPage toolId="structure">
          <Suspense fallback={<SkeletonLoader variant="tool" />}>
            <StructureDesign />
          </Suspense>
        </WorkflowToolPage>
      } />
      
      <Route path="/responsive" element={
        <WorkflowToolPage toolId="responsive">
          <Suspense fallback={<SkeletonLoader variant="tool" />}>
            <ResponsiveDesign />
          </Suspense>
        </WorkflowToolPage>
      } />
      
      <Route path="/interactive" element={
        <WorkflowToolPage toolId="interactive">
          <Suspense fallback={<SkeletonLoader variant="tool" />}>
            <InteractiveFeatures />
          </Suspense>
        </WorkflowToolPage>
      } />
      
      <Route path="/optimize" element={
        <WorkflowToolPage toolId="optimize">
          <Suspense fallback={<SkeletonLoader variant="tool" />}>
            <OptimizeLayout />
          </Suspense>
        </WorkflowToolPage>
      } />
    </Routes>
  );
}