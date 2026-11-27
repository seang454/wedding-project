'use client';

import { Suspense } from 'react';
import { Sidebar } from '@/components/common/sidebar';
import { Navbar } from '@/components/common/navbar';
import { MobileNav } from '@/components/common/mobile-nav';
import { PageTransition } from '@/components/common/page-transition';
import { WeddingProvider } from '@/context/wedding-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#FAF8F3] text-[#2B3927] selection:bg-[#E2EBE0] selection:text-[#2B3927] font-khmer-body overflow-x-clip">
      {/* 1. HOMEPAGE MATCHING BACKGROUND TEXTURE */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-95 transition-opacity duration-700"
        style={{ backgroundImage: "url('/background/background.jpg')" }}
      />

      {/* 2. SUBTLE WARM TINT OVERLAY */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#FAF8F3]/20 via-[#FAF8F3]/10 to-[#FAF8F3]/30 pointer-events-none" />

      {/* 3. CONTENT SHELL */}
      <div className="relative z-10 min-h-screen flex">
        <Suspense fallback={<aside className="hidden lg:flex w-64 fixed inset-y-0 z-30" />}>
          <Sidebar />
        </Suspense>
        <div className="lg:pl-64 flex flex-col flex-1 min-w-0 min-h-screen w-full">
          <Navbar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 sm:pb-24 lg:pb-10 max-w-7xl w-full mx-auto">
            <Suspense fallback={<div className="w-full">{children}</div>}>
              <PageTransition>{children}</PageTransition>
            </Suspense>
          </main>
          <Suspense fallback={null}>
            <MobileNav />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
