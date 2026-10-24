import Link from 'next/link';
import { MapPinOff, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-clay-bg flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-clay-surface rounded-2xl p-6 shadow-clay-card border border-white/80 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
          <MapPinOff className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Page Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">
            The page or masjid you are looking for does not exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="clay-btn-emerald w-full py-2.5 px-4 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-clay-btn transition-transform active:scale-95 inline-flex"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}