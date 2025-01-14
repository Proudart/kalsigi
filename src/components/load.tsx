import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background-100 z-50">
      <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-600"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;



