'use client';

import React from 'react';
import { AlertTriangle, LogOut } from 'lucide-react';
import { ClayCard } from '@/components/ui/ClayCard';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  description?: string;
  warningMessage?: string;
  confirmText?: string;
}

export function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  title = 'Confirm Sign Out',
  description = 'Are you sure you want to end your session?',
  warningMessage = 'You will need to sign in again to access protected tools and features.',
  confirmText = 'Yes, Sign Out',
}: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm">
        <ClayCard className="p-6 space-y-5 bg-white border border-white/80 shadow-2xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-inner shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">{title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/70 text-xs text-amber-900 leading-relaxed font-medium">
            {warningMessage}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="py-2.5 px-4 rounded-xl bg-clay-surface border border-white/80 shadow-clay-pill text-xs font-bold text-slate-700 hover:text-slate-900 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="py-2.5 px-4 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{loading ? 'Signing out...' : confirmText}</span>
            </button>
          </div>
        </ClayCard>
      </div>
    </div>
  );
}