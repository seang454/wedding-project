'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const DialogAnimationContext = React.createContext<boolean>(false);

export function Dialog({
  open,
  onOpenChange,
  children,
  className,
}: DialogProps & { className?: string }) {
  const [mounted, setMounted] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(open);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (open) {
      setShouldRender(true);
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setIsVisible(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 240);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!shouldRender || !mounted) return null;

  return createPortal(
    <DialogAnimationContext.Provider value={isVisible}>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Full-webpage Backdrop */}
        <div
          className={cn(
            'fixed inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-300 ease-out',
            isVisible ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => onOpenChange(false)}
        />
        {/* Content wrapper */}
        <div className={cn('relative z-[101] w-full max-w-lg', className)}>{children}</div>
      </div>
    </DialogAnimationContext.Provider>,
    document.body,
  );
}

export function DialogContent({
  className,
  children,
  onClose,
}: {
  className?: string;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const isVisible = React.useContext(DialogAnimationContext);

  return (
    <div
      className={cn(
        'relative w-full rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800 max-h-[90dvh] overflow-y-auto transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-3',
        className,
      )}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {children}
    </div>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 text-center sm:text-left mb-4', className)}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn('text-lg font-semibold leading-none tracking-tight text-gray-900 dark:text-gray-50', className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-gray-500 dark:text-gray-400', className)}
      {...props}
    />
  );
}
