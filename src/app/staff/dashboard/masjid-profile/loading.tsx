import React from 'react';

export default function MasjidProfileLoading() {
  return (
    <div className="max-w-md lg:max-w-3xl mx-auto space-y-6 pb-20 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl bg-slate-200/70" />
        <div className="h-6 w-36 bg-slate-200/70 rounded-xl" />
        <div className="w-9" />
      </div>

      {/* Photo Grid Skeleton */}
      <div className="h-44 rounded-2xl bg-slate-200/60" />

      {/* Description Inputs Skeleton */}
      <div className="h-64 rounded-2xl bg-slate-200/60" />

      {/* Button Skeleton */}
      <div className="h-12 rounded-xl bg-slate-200/70" />
    </div>
  );
}