'use client';

import React from 'react';
import { LocateOff, Compass, X, RefreshCw, Smartphone, Globe } from 'lucide-react';
import { ClayCard } from '@/components/ui/ClayCard';

interface GpsPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
}

export function GpsPermissionModal({
  isOpen,
  onClose,
  onRetry,
}: GpsPermissionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm sm:max-w-md">
        <ClayCard className="p-6 bg-gradient-to-b from-white via-clay-surface to-[#F0FDF4] border border-white/90 shadow-2xl relative">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Icon & Title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-inner shrink-0">
              <LocateOff className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-emerald-950">Enable GPS Location</h3>
              <p className="text-xs text-slate-500 font-medium">To auto-detect real nearest masjids</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Location access is currently disabled or blocked by your browser. Without GPS, we can only display default masjid listings.
          </p>

          {/* Step-by-step Browser Quick Guide */}
          <div className="space-y-2.5 p-3.5 rounded-2xl bg-white/80 border border-slate-200/60 shadow-sm text-xs mb-5">
            <div className="flex items-start gap-2.5">
              <Globe className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-950 block">In Mobile & Desktop Browsers:</strong>
                <span className="text-slate-600">Tap the <strong>tune/lock icon</strong> in the top address bar $\rightarrow$ <strong>Permissions</strong> $\rightarrow$ Switch <strong>Location</strong> to <strong>Allow</strong>.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 pt-2 border-t border-slate-100">
              <Smartphone className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-950 block">Device Quick Settings:</strong>
                <span className="text-slate-600">Ensure your phone&apos;s master <strong>Location / GPS</strong> toggle is turned ON.</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95"
            >
              Keep Default
            </button>
            <button
              type="button"
              onClick={() => {
                onRetry();
                onClose();
              }}
              className="flex-1 clay-btn-emerald py-2.5 text-white rounded-xl shadow-clay-btn text-xs font-bold flex items-center justify-center gap-1.5 transition-transform active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Allow & Retry</span>
            </button>
          </div>
        </ClayCard>
      </div>
    </div>
  );
}