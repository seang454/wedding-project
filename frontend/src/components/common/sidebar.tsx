'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import {
  LayoutDashboard,
  Gift,
  Users,
  UserPlus,
  CreditCard,
  Settings,
  ArrowLeft,
  Sparkles,
  Heart,
} from 'lucide-react';

const navigation = [
  { name: 'ទិដ្ឋភាពទូទៅ', href: '/dashboard', icon: LayoutDashboard },
  { name: 'គ្រប់គ្រងមង្គលការ', href: '/weddings', icon: Heart },
  { name: 'កត់ត្រាចំណងដៃ', href: '/gifts', icon: Gift },
  { name: 'បញ្ជីភ្ញៀវកិត្តិយស', href: '/guests', icon: Users },
  { name: 'ផ្ទៀងផ្ទាត់បេឡា', href: '/reconciliation', icon: CreditCard },
  { name: 'អ្នកកត់ត្រា (Clerks)', href: '/clerks', icon: UserPlus, ownerOnly: true },
  { name: 'ការកំណត់ & QR ធនាគារ', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isClerk = user?.role === 'CLERK' || user?.role === 'ACCOUNTANT';
  const visibleNav = navigation.filter((item) => !(item.ownerOnly && isClerk));

  return (
    <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-30 border-r border-white/60 bg-[#FAF8F3]/75 backdrop-blur-xl shadow-xs">
      {/* Brand Header */}
      <div className="flex h-18 items-center px-5 border-b border-white/70">
        <Link href="/" className="flex items-center group py-1.5">
          <img
            src="/images/logo.png"
            alt="ផ្ការំដួល"
            className="h-12 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
          />
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1.5 p-4 font-khmer-heading">
        <div className="px-3 py-1 text-[11px] font-bold text-[#8A9B85] uppercase tracking-wider">
          ម៉ឺនុយចម្បង
        </div>
        {visibleNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm border font-semibold transition-colors duration-150',
                isActive
                  ? 'bg-gradient-to-r from-[#243521] to-[#364A33] text-white shadow-sm border-[#C59F54]/40'
                  : 'text-[#3E513A] border-transparent hover:bg-[#EAE4D5]/70 hover:text-[#212E1E]',
              )}
            >
              <Icon
                className={cn(
                  'h-4.5 w-4.5 shrink-0 transition-colors duration-150',
                  isActive ? 'text-[#E6C673]' : 'text-[#6C8068]'
                )}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Back to Home & Footer Info */}
      <div className="p-4 border-t border-[#E5DAC4] space-y-2 font-khmer-heading">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-white/70 hover:bg-white text-[#3E513A] text-xs font-semibold border border-[#E0D5C1] shadow-2xs transition-all hover:border-[#C59F54]"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-[#4E8B7C]" />
          <span>ត្រឡប់ទៅទំព័រដើម</span>
        </Link>
        <p className="text-[10px] text-[#8C9E87] text-center font-khmer-body pt-1">
          ប្រព័ន្ធផ្ការំដួល • សម្រាប់មង្គលការខ្មែរ
        </p>
      </div>
    </aside>
  );
}
