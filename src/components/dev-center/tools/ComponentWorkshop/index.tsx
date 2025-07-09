import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import WorkflowToolPage from '../../components/WorkflowToolPage';
import SkeletonLoader from '../../components/SkeletonLoader';

// Lazy load component workshop sections
const BuildComponent = lazy(() => import('./BuildComponent'));
const TestStates = lazy(() => import('./TestStates'));
const ValidateComponent = lazy(() => import('./ValidateComponent'));
const DeployComponent = lazy(() => import('./DeployComponent'));

export default function ComponentWorkshop() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="build" replace />} />
      
      <Route path="/build" element={
        <WorkflowToolPage toolId="build">
          <Suspense fallback={<SkeletonLoader variant="tool" />}>
            <BuildComponent />
          </Suspense>
        </WorkflowToolPage>
      } />
      
      <Route path="/test-states" element={
        <WorkflowToolPage toolId="test-states">
          <Suspense fallback={<SkeletonLoader variant="tool" />}>
            <TestStates />
          </Suspense>
        </WorkflowToolPage>
      } />
      
      <Route path="/validate" element={
        <WorkflowToolPage toolId="validate">
          <Suspense fallback={<SkeletonLoader variant="tool" />}>
            <ValidateComponent />
          </Suspense>
        </WorkflowToolPage>
      } />
      
      <Route path="/deploy" element={
        <WorkflowToolPage toolId="deploy">
          <Suspense fallback={<SkeletonLoader variant="tool" />}>
            <DeployComponent />
          </Suspense>
        </WorkflowToolPage>
      } />
    </Routes>
  );
}