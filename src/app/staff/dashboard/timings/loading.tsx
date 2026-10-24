import React from 'react';

export default function UpdateTimingsLoading() {
  return (
    <div className="max-w-md lg:max-w-4xl mx-auto space-y-6 pb-24 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="flex items-center justify-between pb-2">
        <div className="w-9 h-9 rounded-xl bg-slate-200/70" />
        <div className="h-6 w-36 bg-slate-200/70 rounded-xl" />
        <div className="w-9" />
      </div>

      {/* Masjid Header Banner Skeleton */}
      <div className="h-20 rounded-2xl bg-slate-200/60" />

      {/* Date Bar Skeleton */}
      <div className="h-24 rounded-2xl bg-slate-200/60" />

      {/* Prayer Table Skeleton */}
      <div className="h-80 rounded-2xl bg-slate-200/60" />

      {/* Friday Skeleton */}
      <div className="h-32 rounded-2xl bg-slate-200/60" />

      {/* Button Skeleton */}
      <div className="h-12 rounded-xl bg-slate-200/70" />
    </div>
  );
}