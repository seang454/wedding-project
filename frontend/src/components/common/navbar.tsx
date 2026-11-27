'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { UserNav } from './user-nav';
import { useActiveWedding } from '@/context/wedding-context';
import { Heart, ChevronDown, Check, Calendar, MapPin, LayoutGrid } from 'lucide-react';

export function Navbar() {
  const { activeWedding, weddings, setActiveWeddingId } = useActiveWedding();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-18 w-full items-center justify-between border-b border-white/80 bg-gradient-to-b from-white/35 via-white/15 to-white/25 px-4 sm:px-6 backdrop-blur-md backdrop-saturate-150 shadow-[0_8px_32px_rgba(36,53,33,0.08),inset_0_1px_1px_rgba(255,255,255,0.85)]">
      {/* Mobile Brand Logo */}
      <div className="flex items-center gap-2.5 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/images/logo.png"
            alt="ផ្ការំដួល Logo"
            className="h-9 w-auto object-contain"
          />
          <span className="font-khmer-body font-bold text-[#2B3927] text-sm">
            ផ្ការំដួល
          </span>
        </Link>
      </div>

      {/* Desktop Live Reception Indicator & Custom Wedding Switcher */}
      <div className="hidden lg:flex items-center gap-3 font-khmer-body">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/50 border border-white/75 backdrop-blur-md shadow-2xs">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
          </span>
          <span className="text-xs sm:text-sm font-semibold text-[#32452F]">
            តុទទួលភ្ញៀវមង្គលការ
          </span>
        </div>

        {/* Custom Luxury Wedding Switcher */}
        {activeWedding && weddings && weddings.length > 0 && (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/60 hover:bg-white/85 backdrop-blur-xl border border-white/80 hover:border-[#C59F54]/70 shadow-2xs transition-all cursor-pointer"
            >
              <span className="h-5 w-5 rounded-full bg-[#F6EFE0] border border-[#C59F54]/40 flex items-center justify-center shrink-0">
                <Heart className="h-3 w-3 text-[#C59F54] fill-[#C59F54]" />
              </span>
              <span className="text-xs font-semibold text-[#212E1E]">
                {activeWedding.groomName} &amp; {activeWedding.brideName}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-[#63765E] transition-transform duration-200 ${
                  open ? 'rotate-180 text-[#C59F54]' : ''
                }`}
              />
            </button>

            {open && (
              <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl bg-[#FFFEFA]/85 backdrop-blur-2xl border border-white/80 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 text-[11px] font-semibold text-[#63765E] border-b border-[#F0EAE1] mb-1">
                  ជ្រើសរើសពិធីមង្គលការ ({weddings.length})
                </div>

                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {weddings.map((w) => {
                    const isSelected = w.id === activeWedding.id;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => {
                          setActiveWeddingId(w.id);
                          setOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#EAF0E7] text-[#1E2C1B] border border-[#C59F54]/40'
                            : 'hover:bg-[#FAF6EE] text-[#3E513A] border border-transparent'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <Heart
                              className={`h-3 w-3 shrink-0 ${
                                isSelected
                                  ? 'text-[#C59F54] fill-[#C59F54]'
                                  : 'text-[#A1B39D]'
                              }`}
                            />
                            <p className="text-xs font-semibold truncate">
                              {w.groomName} &amp; {w.brideName}
                            </p>
                          </div>
                          <div className="flex items-center gap-2.5 mt-1 text-[10px] text-[#63765E] pl-4.5">
                            <span className="flex items-center gap-1 truncate">
                              <Calendar className="h-2.5 w-2.5 text-[#C59F54]" />
                              {new Date(w.weddingDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                            {w.venue && (
                              <span className="flex items-center gap-1 truncate">
                                <MapPin className="h-2.5 w-2.5 text-[#C59F54]" />
                                {w.venue}
                              </span>
                            )}
                          </div>
                        </div>

                        {isSelected && (
                          <span className="h-5 w-5 rounded-full bg-[#243521] text-[#E6C673] flex items-center justify-center shrink-0">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-1 pt-1 border-t border-[#F0EAE1]">
                  <Link
                    href="/weddings"
                    onClick={() => setOpen(false)}
                    className="w-full px-3 py-2 rounded-xl text-[11px] font-semibold text-[#8C6D23] hover:bg-[#FAF6EE] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span>គ្រប់គ្រងមង្គលការទាំងអស់</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <UserNav />
    </header>
  );
}
