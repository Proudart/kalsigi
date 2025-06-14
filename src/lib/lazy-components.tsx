import React, { lazy } from 'react';

// Simple loading wrapper for consistent UX
export const withSuspense = <P extends object>(
  Component: React.ComponentType<P>,
  LoadingComponent?: React.ComponentType
) => {
  const SuspenseWrapper = (props: P) => (
    <React.Suspense fallback={LoadingComponent ? <LoadingComponent /> : <div>Loading...</div>}>
      <Component {...props} />
    </React.Suspense>
  );
  
  SuspenseWrapper.displayName = `withSuspense(${Component.displayName || Component.name})`;
  return SuspenseWrapper;
};