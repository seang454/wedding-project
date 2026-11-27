import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#243521] disabled:pointer-events-none disabled:opacity-50 select-none shadow-sm';

    const variants = {
      default: 'bg-[#243521] text-white hover:bg-[#1A2617] active:bg-[#141E12]',
      destructive: 'bg-red-600 text-white hover:bg-red-700',
      outline:
        'border border-[#D8C7A8] bg-white text-gray-700 hover:bg-[#FAF8F3] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200',
      secondary:
        'bg-[#F2EDE4] text-[#243521] hover:bg-[#E5DDCF] border border-[#C59F54]/30',
      ghost: 'hover:bg-[#FAF8F3] text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 shadow-none',
      link: 'text-[#243521] hover:text-[#4E8B7C] underline-offset-4 hover:underline shadow-none',
    };

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-11 rounded-lg px-8 text-base',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button };
