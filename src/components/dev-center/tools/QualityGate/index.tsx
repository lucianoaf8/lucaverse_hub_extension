import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import WorkflowToolPage from '../../components/WorkflowToolPage';
import SkeletonLoader from '../../components/SkeletonLoader';

// Lazy load quality gate sections
const MeasureBaseline = lazy(() => import('./MeasureBaseline'));
const AnalyzeIssues = lazy(() => import('./AnalyzeIssues'));
const FixOptimize = lazy(() => import('./FixOptimize'));
const VerifyResults = lazy(() => import('./VerifyResults'));

export default function QualityGate() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="measure" replace />} />
      
      <Route path="/measure" element={
        <WorkflowToolPage toolId="measure">
          <Suspense fallback={<SkeletonLoader variant="tool" />}>
            <MeasureBaseline />
          </Suspense>
        </WorkflowToolPage>
      } />
      
      <Route path="/analyze" element={
        <WorkflowToolPage toolId="analyze">
          <Suspense fallback={<SkeletonLoader variant="tool" />}>
            <AnalyzeIssues />
          </Suspense>
        </WorkflowToolPage>
      } />
      
      <Route path="/fix" element={
        <WorkflowToolPage toolId="fix">
          <Suspense fallback={<SkeletonLoader variant="tool" />}>
            <FixOptimize />
          </Suspense>
        </WorkflowToolPage>
      } />
      
      <Route path="/verify" element={
        <WorkflowToolPage toolId="verify">
          <Suspense fallback={<SkeletonLoader variant="tool" />}>
            <VerifyResults />
          </Suspense>
        </WorkflowToolPage>
      } />
    </Routes>
  );
}