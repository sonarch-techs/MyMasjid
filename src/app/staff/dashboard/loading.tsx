import React from 'react';

export default function StaffDashboardLoading() {
  return (
    <div className="space-y-6 max-w-md lg:max-w-7xl mx-auto animate-pulse">
      {/* Title Skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 bg-slate-200/70 rounded-xl" />
        <div className="h-4 w-40 bg-slate-200/50 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Skeleton: Greeting + Menu */}
        <div className="lg:col-span-5 space-y-4">
          <div className="h-28 rounded-2xl bg-slate-200/60 shadow-sm" />
          <div className="space-y-2.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-slate-200/50" />
            ))}
          </div>
        </div>

        {/* Right Skeleton: Bento Published Timings & Shortcuts */}
        <div className="hidden lg:flex lg:col-span-7 flex-col space-y-6">
          <div className="h-64 rounded-3xl bg-slate-200/60" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-36 rounded-2xl bg-slate-200/50" />
            <div className="h-36 rounded-2xl bg-slate-200/50" />
          </div>
        </div>
      </div>
    </div>
  );
}