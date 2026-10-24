import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface NeuInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const NeuInput = React.forwardRef<HTMLInputElement, NeuInputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-emerald-800/70 rtl:left-auto rtl:right-3.5">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={twMerge(
            clsx(
              'w-full bg-[#EBF0ED] shadow-neu-inset text-slate-800 placeholder-slate-400 font-medium rounded-xl py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/30 transition-all',
              icon ? 'pl-11 pr-4 rtl:pr-11 rtl:pl-4' : 'px-4',
              className
            )
          )}
          {...props}
        />
      </div>
    );
  }
);
NeuInput.displayName = 'NeuInput';