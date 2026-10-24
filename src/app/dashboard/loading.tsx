import React from 'react';

export default function UserDashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Tile 1 Skeleton: User Overview & Daily Progress (2 Cols) */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-white/70 border border-white/80 shadow-clay-card flex flex-col justify-between min-h-[220px]">
          <div className="space-y-2.5">
            <div className="h-3.5 w-28 bg-slate-200/80 rounded-full" />
            <div className="h-7 w-44 bg-slate-200/90 rounded-xl" />
            <div className="h-3.5 w-64 bg-slate-200/60 rounded-md" />
          </div>

          <div className="my-5 space-y-2">
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-slate-200/70 rounded" />
              <div className="h-3 w-10 bg-slate-200/70 rounded" />
            </div>
            <div className="w-full h-3 rounded-full bg-slate-200/80 shadow-inner" />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="h-4 w-32 bg-slate-200/70 rounded-md" />
            <div className="h-4 w-24 bg-slate-200/70 rounded-md" />
          </div>
        </div>

        {/* Tile 2 Skeleton: Consistency Badge (1 Col) */}
        <div className="p-6 rounded-3xl bg-white/70 border border-white/80 shadow-clay-card flex flex-col justify-between min-h-[220px]">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200/80 shadow-inner" />
            <div className="h-4 w-32 bg-slate-200/80 rounded-lg" />
            <div className="h-3 w-40 bg-slate-200/60 rounded" />
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="h-4 w-16 bg-slate-200/70 rounded" />
            <div className="h-5 w-20 bg-slate-200/80 rounded-full" />
          </div>
        </div>

        {/* Tile 3 Skeleton: Friday / Jumu'ah Lifecycle (1 Col) */}
        <div className="p-6 rounded-3xl bg-white/70 border border-white/80 shadow-clay-card flex flex-col justify-between min-h-[220px]">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200/80 shadow-inner" />
            <div className="h-4 w-32 bg-slate-200/80 rounded-lg" />
            <div className="h-3 w-40 bg-slate-200/60 rounded" />
          </div>

          <div className="my-3 space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 bg-slate-200/70 rounded" />
              <div className="h-4 w-16 bg-slate-200/80 rounded-full" />
            </div>
            <div className="flex justify-between items-center">
              <div className="h-3 w-16 bg-slate-200/70 rounded" />
              <div className="h-4 w-16 bg-slate-200/80 rounded-full" />
            </div>
          </div>

          <div className="h-10 w-full bg-slate-200/80 rounded-xl" />
        </div>

        {/* Tile 4 Skeleton: Daily 5-Prayer Checklist (4 Cols) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 p-6 rounded-3xl bg-white/70 border border-white/80 shadow-clay-card space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="space-y-1.5">
              <div className="h-5 w-40 bg-slate-200/80 rounded-lg" />
              <div className="h-3.5 w-64 bg-slate-200/60 rounded-md" />
            </div>
            <div className="h-6 w-24 bg-slate-200/80 rounded-full" />
          </div>

          {/* 5-Prayer Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="rounded-2xl p-4 bg-white/90 border border-white shadow-sm flex flex-col justify-between min-h-[110px]"
              >
                <div className="flex items-center justify-between">
                  <div className="w-5 h-5 rounded-full bg-slate-200/80" />
                  <div className="w-5 h-5 rounded-full bg-slate-200/70" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-4 w-16 bg-slate-200/80 rounded" />
                  <div className="h-3 w-20 bg-slate-200/60 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Action Bar */}
          <div className="flex justify-end pt-3 border-t border-slate-100">
            <div className="h-10 w-36 bg-slate-200/80 rounded-xl" />
          </div>
        </div>

        {/* Tile 5 Skeleton: Analytics Banner (4 Cols) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 p-5 rounded-3xl bg-white/70 border border-white/80 shadow-clay-card flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-xl bg-slate-200/80 shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 w-44 bg-slate-200/80 rounded" />
              <div className="h-3 w-64 bg-slate-200/60 rounded" />
            </div>
          </div>
          <div className="h-10 w-32 bg-slate-200/80 rounded-xl self-end sm:self-auto shrink-0" />
        </div>

      </div>
    </div>
  );
}