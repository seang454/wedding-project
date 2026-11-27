'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toYMD(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

/**
 * Custom luxury date picker replacing native <input type="date"> with warm ivory & emerald-gold UI.
 */
export function CustomDatePicker({
  value,
  onChange,
  placeholder = 'ជ្រើសរើសកាលបរិច្ឆេទ',
  className,
}: CustomDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; openUpward: boolean } | null>(null);

  const parsed = value ? new Date(value + 'T00:00:00') : null;
  const initialDate = parsed && !isNaN(parsed.getTime()) ? parsed : new Date();

  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < 320 && rect.top > 320;

    setCoords({
      top: openUpward ? rect.top - 6 : rect.bottom + 6,
      left: rect.left,
      openUpward,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();

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
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, updatePosition]);

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const today = new Date();
  const todayStr = toYMD(today.getFullYear(), today.getMonth(), today.getDate());

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const formattedDisplay =
    parsed && !isNaN(parsed.getTime())
      ? parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : null;

  // Build 42-cell grid (6 weeks)
  const cells: { day: number; monthOffset: -1 | 0 | 1 }[] = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, monthOffset: -1 });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, monthOffset: 0 });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, monthOffset: 1 });
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'w-full h-10 rounded-xl border border-[#DFD5C3]/90 bg-white/75 hover:bg-white/90 backdrop-blur-xs pl-3.5 pr-3 text-sm font-khmer-body flex items-center justify-between gap-2 transition-all cursor-pointer text-left focus:outline-none',
          open && 'border-[#C59F54] ring-2 ring-[#C59F54]/15',
          className,
        )}
      >
        <span className={cn('truncate', formattedDisplay ? 'text-[#212E1E] font-medium' : 'text-[#8A9C84]')}>
          {formattedDisplay || placeholder}
        </span>
        <CalendarIcon className={cn('h-4 w-4 shrink-0 transition-colors', open ? 'text-[#C59F54]' : 'text-[#63765E]')} />
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
              top: coords.openUpward ? undefined : coords.top,
              bottom: coords.openUpward ? window.innerHeight - coords.top : undefined,
            }}
            className="z-[200] w-72 rounded-2xl bg-[#FFFEFA]/85 backdrop-blur-2xl border border-white/80 shadow-2xl p-4 font-khmer-body animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header: Month & Year + Prev/Next */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1] mb-3">
              <span className="text-sm font-bold text-[#212E1E]">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="h-7 w-7 rounded-lg bg-[#FAF6EE] hover:bg-[#EFE9DC] border border-[#E2D7C0] flex items-center justify-center text-[#243521] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="h-7 w-7 rounded-lg bg-[#FAF6EE] hover:bg-[#EFE9DC] border border-[#E2D7C0] flex items-center justify-center text-[#243521] transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-1.5 text-center">
              {WEEKDAYS.map((wd) => (
                <span key={wd} className="text-[11px] font-semibold text-[#8A9C84]">
                  {wd}
                </span>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {cells.map((cell, idx) => {
                let cellYear = viewYear;
                let cellMonth = viewMonth + cell.monthOffset;
                if (cellMonth < 0) {
                  cellMonth = 11;
                  cellYear -= 1;
                } else if (cellMonth > 11) {
                  cellMonth = 0;
                  cellYear += 1;
                }
                const cellStr = toYMD(cellYear, cellMonth, cell.day);
                const isSelected = value === cellStr;
                const isToday = todayStr === cellStr;
                const isCurrentMonth = cell.monthOffset === 0;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onChange(cellStr);
                      setOpen(false);
                    }}
                    className={cn(
                      'h-8 w-8 mx-auto rounded-lg text-xs flex items-center justify-center transition-all cursor-pointer',
                      isSelected
                        ? 'bg-[#243521] text-[#E6C673] font-bold shadow-xs'
                        : isToday
                        ? 'border border-[#C59F54] text-[#8C6D23] font-semibold bg-[#F6EFE0]/60'
                        : isCurrentMonth
                        ? 'text-[#212E1E] hover:bg-[#EAF0E7]'
                        : 'text-[#B5C0B2] hover:bg-[#FAF6EE]',
                    )}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>

            {/* Footer: Clear & Today */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#F0EAE1]">
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
                className="text-xs font-medium text-[#63765E] hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              >
                សម្អាត
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange(todayStr);
                  setViewYear(today.getFullYear());
                  setViewMonth(today.getMonth());
                  setOpen(false);
                }}
                className="text-xs font-semibold text-[#8C6D23] hover:text-[#243521] px-2.5 py-1 rounded-lg bg-[#F6EFE0] hover:bg-[#EFE9DC] border border-[#C59F54]/30 transition-colors cursor-pointer"
              >
                ថ្ងៃនេះ
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
