'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 animate-fade-in-up">
      <div className="glass-panel p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-text-main mb-4">
          Something went wrong!
        </h2>
        <p className="text-text-muted mb-6">
          An error occurred while processing your request. Please try again.
        </p>
        {error.message && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-red-400 font-mono">
              {error.message}
            </p>
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 btn-gradient"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex-1 btn-secondary"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
