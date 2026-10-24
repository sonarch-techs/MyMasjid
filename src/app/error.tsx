'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Runtime Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-clay-bg flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-clay-surface rounded-2xl p-6 shadow-clay-card border border-white/80 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Something went wrong</h2>
          <p className="text-xs text-slate-500 mt-1">
            An unexpected error occurred while loading this page.
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="clay-btn-emerald w-full py-2.5 px-4 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-clay-btn transition-transform active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
}