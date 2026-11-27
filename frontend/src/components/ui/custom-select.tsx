'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { cn, normalizeSearchText } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Custom luxury dropdown replacing native <select> with warm ivory & sage-gold UI.
 * Uses a portal so it is never clipped inside scrollable modals.
 */
export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'ជ្រើសរើស',
  searchPlaceholder = 'ស្វែងរក...',
  searchable = true,
  disabled = false,
  className,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; openUpward: boolean } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < 240 && rect.top > 240;

    setCoords({
      top: openUpward ? rect.top - 6 : rect.bottom + 6,
      left: rect.left,
      width: rect.width,
      openUpward,
    });
  }, []);

  useEffect(() => {
    if (!open) {
      setSearch('');
      return;
    }
    updatePosition();
    const focusTimer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 10);

    const handleScrollOrResize = () => updatePosition();
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, updatePosition]);

  const selectedOption = options.find((opt) => opt.value === value);
  const normalizedSearch = normalizeSearchText(search);
  const filteredOptions = normalizedSearch
    ? options.filter(
        (opt) =>
          normalizeSearchText(opt.label).includes(normalizedSearch) ||
          normalizeSearchText(opt.value).includes(normalizedSearch),
      )
    : options;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={cn(
          'w-full h-11 rounded-xl border border-[#DFD5C3]/90 bg-white/75 hover:bg-white/90 backdrop-blur-xs pl-3.5 pr-3 text-sm font-khmer-body flex items-center justify-between gap-2 transition-all cursor-pointer text-left focus:outline-none',
          open && 'border-[#C59F54] ring-2 ring-[#C59F54]/15',
          disabled && 'opacity-50 cursor-not-allowed bg-[#FAF8F3]/60',
          className,
        )}
      >
        <span className={cn('truncate', selectedOption ? 'text-[#212E1E] font-medium' : 'text-[#8A9C84]')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-[#63765E] shrink-0 transition-transform duration-200',
            open && 'rotate-180 text-[#C59F54]',
          )}
        />
      </button>

      {open &&
        coords &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              left: coords.left,
              width: Math.max(coords.width, 180),
              top: coords.openUpward ? undefined : coords.top,
              bottom: coords.openUpward ? window.innerHeight - coords.top : undefined,
            }}
            className="z-[200] rounded-2xl bg-[#FFFEFA]/95 backdrop-blur-2xl border border-white/80 shadow-2xl p-1.5 font-khmer-body animate-in fade-in zoom-in-95 duration-150"
          >
            {searchable && options.length > 0 && (
              <div className="relative mb-1.5 px-0.5 pt-0.5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8A9C84] pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setOpen(false);
                  }}
                  placeholder={searchPlaceholder}
                  className="w-full h-8.5 pl-8 pr-7 rounded-xl bg-[#FAF8F3] border border-[#DFD5C3] focus:border-[#C59F54] focus:outline-none text-xs text-[#212E1E] placeholder:text-[#8A9C84]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 rounded-full flex items-center justify-center text-[#8A9C84] hover:text-[#212E1E] hover:bg-[#EAE4D5] cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
            <div className="max-h-60 overflow-y-auto space-y-0.5 pr-0.5">
              {options.length === 0 ? (
                <div className="px-3 py-2.5 text-xs text-[#8A9C84] text-center">គ្មានទិន្នន័យ</div>
              ) : filteredOptions.length === 0 ? (
                <div className="px-3 py-2.5 text-xs text-[#8A9C84] text-center">រកមិនឃើញទិន្នន័យ</div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-xl text-sm flex items-center justify-between gap-2 transition-colors cursor-pointer',
                        isSelected
                          ? 'bg-[#EAF0E7] text-[#1E2C1B] font-semibold'
                          : 'hover:bg-[#FAF6EE] text-[#3E513A]',
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && (
                        <span className="h-4.5 w-4.5 rounded-full bg-[#243521] text-[#E6C673] flex items-center justify-center shrink-0">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
