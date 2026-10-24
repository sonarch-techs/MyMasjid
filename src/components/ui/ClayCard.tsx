import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ClayCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'light' | 'emeraldDark';
}

export function ClayCard({ children, className, variant = 'light', ...props }: ClayCardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'rounded-2xl p-5 border transition-all duration-200',
          variant === 'light' && 'bg-clay-surface shadow-clay-card border-white/80',
          variant === 'emeraldDark' && 'bg-emerald-900 shadow-neu-dark border-emerald-700/40 text-white',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}