'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getToastStyle = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-900 text-white border-emerald-700/60 shadow-clay-card',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />,
        };
      case 'error':
        return {
          bg: 'bg-red-900 text-white border-red-700/60 shadow-clay-card',
          icon: <AlertCircle className="w-5 h-5 text-red-300 shrink-0" />,
        };
      case 'warning':
        return {
          bg: 'bg-amber-900 text-white border-amber-700/60 shadow-clay-card',
          icon: <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />,
        };
      case 'info':
        return {
          bg: 'bg-slate-900 text-white border-slate-700/60 shadow-clay-card',
          icon: <Info className="w-5 h-5 text-sky-300 shrink-0" />,
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Claymorphic Toast Container */}
      <div className="fixed bottom-5 right-4 left-4 sm:left-auto sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {toasts.map((toast) => {
          const style = getToastStyle(toast.type);
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border text-xs sm:text-sm font-semibold backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-3 fade-in ${style.bg}`}
            >
              <div className="flex items-center gap-2.5">
                {style.icon}
                <span className="leading-snug">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}