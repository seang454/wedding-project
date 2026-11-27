'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const OPTIONS = [
  { value: 5, label: '៥ ជួរ' },
  { value: 10, label: '១០ ជួរ' },
  { value: 20, label: '២០ ជួរ' },
];

interface RowsPerPageSelectProps {
  value: number;
  onChange: (value: number) => void;
}

/**
 * Custom luxury dropdown for selecting table rows per page.
 */
export function RowsPerPageSelect({ value, onChange }: RowsPerPageSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption = OPTIONS.find((opt) => opt.value === value) || OPTIONS[1];

  return (
    <div className="relative inline-block font-khmer-body" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/75 hover:bg-white/90 backdrop-blur-xs border border-[#D8C7A8]/90 hover:border-[#C59F54] text-xs font-semibold text-[#212E1E] shadow-2xs transition-all cursor-pointer"
      >
        <span>{currentOption.label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-[#63765E] transition-transform duration-200 ${
            open ? 'rotate-180 text-[#C59F54]' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 bottom-full mb-1.5 w-28 rounded-xl bg-[#FFFEFA]/85 backdrop-blur-2xl border border-white/80 shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-150">
          {OPTIONS.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#EAF0E7] text-[#1E2C1B] font-semibold'
                    : 'hover:bg-[#FAF6EE] text-[#3E513A] font-medium'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="h-3 w-3 text-[#C59F54]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
