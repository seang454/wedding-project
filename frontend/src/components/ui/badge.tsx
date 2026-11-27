import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-[#243521] text-[#E6C673] hover:bg-[#1A2617]',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-gray-300 text-gray-800 dark:border-gray-700 dark:text-gray-100',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none select-none',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
