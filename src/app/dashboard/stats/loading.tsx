import React from 'react';

export default function PrayerStatsLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-pulse">
      
      {/* Header Bar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-200/80 shadow-clay-pill" />
          <div className="space-y-1.5">
            <div className="h-6 w-52 bg-slate-200/90 rounded-xl" />
            <div className="h-3.5 w-60 bg-slate-200/60 rounded-md" />
          </div>
        </div>

        {/* Tab Switcher Skeleton */}
        <div className="h-9 w-52 bg-slate-200/70 rounded-2xl" />
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-3xl bg-white/70 border border-white/80 shadow-clay-card flex items-center gap-3.5"
          >
            <div className="w-11 h-11 rounded-2xl bg-slate-200/80 shadow-inner shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 w-16 bg-slate-200/70 rounded" />
              <div className="h-6 w-12 bg-slate-200/90 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Graph Grid (12 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Bar Chart Container (8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white/70 border border-white/80 shadow-clay-card space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="space-y-1.5">
              <div className="h-5 w-48 bg-slate-200/80 rounded-lg" />
              <div className="h-3.5 w-56 bg-slate-200/60 rounded-md" />
            </div>
            <div className="h-6 w-24 bg-slate-200/80 rounded-full" />
          </div>

          {/* 7-Bar Chart Simulation */}
          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-56 pt-8 pb-2 px-2">
            {[45, 80, 60, 100, 40, 80, 100].map((height, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                <div className="h-4 w-8 bg-slate-200/60 rounded" />
                <div className="w-full max-w-[42px] h-40 bg-slate-100 shadow-inner rounded-2xl p-1 flex items-end">
                  <div
                    className="w-full rounded-xl bg-slate-200/90"
                    style={{ height: `${height}%` }}
                  />
                </div>
                <div className="h-3 w-8 bg-slate-200/70 rounded mt-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Prayer Matrix Breakdown (4 Cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white/70 border border-white/80 shadow-clay-card space-y-4">
          <div className="space-y-1.5">
            <div className="h-4 w-44 bg-slate-200/80 rounded-lg" />
            <div className="h-3 w-56 bg-slate-200/60 rounded-md" />
          </div>

          {/* 5 Prayer Rows */}
          <div className="space-y-3 pt-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-white/80 border border-white shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <div className="h-3.5 w-14 bg-slate-200/80 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-slate-100 shadow-inner" />
                  <div className="h-3.5 w-7 bg-slate-200/80 rounded" />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="h-3.5 w-28 bg-slate-200/70 rounded" />
            <div className="h-3.5 w-12 bg-slate-200/80 rounded" />
          </div>
        </div>

      </div>

    </div>
  );
}