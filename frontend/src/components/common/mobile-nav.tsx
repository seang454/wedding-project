'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { LayoutDashboard, Gift, Users, UserPlus, CreditCard, Settings, Heart } from 'lucide-react';

const mobileNavItems = [
  { name: 'ទូទៅ', href: '/dashboard', icon: LayoutDashboard },
  { name: 'មង្គលការ', href: '/weddings', icon: Heart },
  { name: 'ចំណងដៃ', href: '/gifts', icon: Gift },
  { name: 'ភ្ញៀវ', href: '/guests', icon: Users },
  { name: 'បេឡា', href: '/reconciliation', icon: CreditCard },
  { name: 'អ្នកកត់ត្រា', href: '/clerks', icon: UserPlus, ownerOnly: true },
  { name: 'កំណត់', href: '/settings', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isClerk = user?.role === 'CLERK' || user?.role === 'ACCOUNTANT';
  const visibleItems = mobileNavItems.filter((item) => !(item.ownerOnly && isClerk));

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-between overflow-x-auto border-t border-[#E5DAC4] bg-[#FAF8F3]/95 backdrop-blur-md px-1.5 font-khmer-heading shadow-lg">
      {visibleItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 flex-1 min-w-[56px] h-full px-1 text-[10px] whitespace-nowrap transition-colors',
              isActive
                ? 'text-[#212E1E] font-bold'
                : 'text-[#6C8068] hover:text-[#212E1E]',
            )}
          >
            <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-[#243521]' : 'text-[#8A9B85]')} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
