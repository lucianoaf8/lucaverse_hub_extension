import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import WorkflowToolPage from '../../components/WorkflowToolPage';
import SkeletonLoader from '../../components/SkeletonLoader';

// Lazy load theme studio sections
const ColorHarmony = lazy(() => import('./ColorHarmony'));
const Typography = lazy(() => import('./Typography'));
const SpacingLayout = lazy(() => import('./SpacingLayout'));
const EffectsAnimation = lazy(() => import('./EffectsAnimation'));

export default function ThemeStudio() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="color-harmony" replace />} />
      
      <Route path="/color-harmony" element={
        <WorkflowToolPage toolId="color-harmony">
          <Suspense fallback={<SkeletonLoader variant="tool" />}>
            <ColorHarmony />
          </Suspense>
        </WorkflowToolPage>
      } />
      
      <Route path="/typography" element={
        <WorkflowToolPage toolId="typography">
          <Suspense fallback={<SkeletonLoader variant="tool" />}>
            <Typography />
          </Suspense>
        </WorkflowToolPage>
      } />
      
      <Route path="/spacing-layout" element={
        <WorkflowToolPage toolId="spacing-layout">
          <Suspense fallback={<SkeletonLoader variant="tool" />}>
            <SpacingLayout />
          </Suspense>
        </WorkflowToolPage>
      } />
      
      <Route path="/effects-animation" element={
        <WorkflowToolPage toolId="effects-animation">
          <Suspense fallback={<SkeletonLoader variant="tool" />}>
            <EffectsAnimation />
          </Suspense>
        </WorkflowToolPage>
      } />
    </Routes>
  );
}