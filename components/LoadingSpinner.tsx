'use client';

import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      <span className="ml-2">Processing...</span>
    </div>
  );
} 