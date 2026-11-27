'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Heart,
  Sparkles,
  ShieldCheck,
  Banknote,
  QrCode,
  Users,
  CheckCircle2,
  ArrowRight,
  FileSpreadsheet,
  Clock,
  Laptop,
  Coins,
  Scale,
  Gift,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Building2,
  Calendar,
  Flower2,
  MapPin,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { WelcomeIntro } from '@/components/welcome-intro';
import { useAuth } from '@/hooks/use-auth';

export default function HomePage() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const isScrolled = scrollProgress >= 5;

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeen = sessionStorage.getItem('has_seen_welcome_intro');
      if (!hasSeen) {
        setShowIntro(true);
      }
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      setScrollProgress(progress);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#FAF8F3] text-[#2B3927] selection:bg-[#E2EBE0] selection:text-[#2B3927] overflow-x-clip font-khmer-body">
      {/* WELCOME INTRO VIDEO MODAL */}
      <WelcomeIntro isOpen={showIntro} onClose={() => setShowIntro(false)} />

      {/* 1. VIVID LOTUS BACKGROUND (/background/background.jpg) */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-95 transition-opacity duration-700"
        style={{ backgroundImage: "url('/background/background.jpg')" }}
      />

      {/* 2. SUBTLE AMBIENT TINT */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#FAF8F3]/15 via-transparent to-[#FAF8F3]/25 pointer-events-none" />

      {/* CONTENT WRAPPER */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* STICKY HEADER & NAVBAR NAVIGATION */}
        <header className="sticky top-0 z-50 transition-all">
          {/* SCROLL PROGRESS BAR (GROWS FORWARD & BACK ON SCROLL) */}
          <div className="w-full h-1 bg-[#1A2617]/70 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C59F54] via-[#F2D583] to-[#C59F54] shadow-[0_0_10px_rgba(230,198,115,0.75)] transition-[width] duration-150 ease-out"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>

          {/* TOP ANNOUNCEMENT & KHMER BLESSING BANNER */}
          <div className="bg-gradient-to-r from-[#222E1E] via-[#354530] to-[#222E1E] text-[#E8DFC9] py-2 px-4 text-center text-xs sm:text-sm font-medium tracking-wide flex items-center justify-center gap-2.5 border-b border-[#B89758]/30 shadow-inner font-khmer-body">
            <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
            <span>
              សូមប្រសិទ្ធពរជ័យ សិរីសួស្តី ជ័យមង្គល — ប្រព័ន្ធគ្រប់គ្រងចំណងដៃ & ទទួលភ្ញៀវមង្គលការទំនើប
            </span>
            <button
              onClick={() => setShowIntro(true)}
              className="inline-flex items-center gap-1 ml-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF6EE]/15 hover:bg-[#FAF6EE]/25 text-[#FAF6EE] text-xs font-semibold border border-[#C59F54]/50 transition-all cursor-pointer font-khmer-heading"
            >
              <Play className="h-2.5 w-2.5 fill-current text-[#F3E7C4]" />
              <span>វីដេអូស្វាគមន៍</span>
            </button>
            <Sparkles className="h-3.5 w-3.5 text-[#D4AF37] hidden sm:inline" />
          </div>

          {/* ADAPTIVE FLOATING FROSTED GLASS NAVBAR */}
          <div
            className={`mx-auto w-full transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isScrolled
                ? 'px-[3%] sm:px-[5%] xl:px-[9%] pt-2.5 pb-1'
                : 'px-[0%] pt-0 pb-0'
            }`}
          >
            <div
              className={`w-full backdrop-saturate-150 flex items-center border transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] h-16 ${
                isScrolled
                  ? 'rounded-[16px] border-white/85 bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] ring-1 ring-[#C59F54]/15 px-4 sm:px-6'
                  : 'rounded-[0px] border-transparent border-b-white/75 bg-gradient-to-b from-white/30 via-white/10 to-white/20 backdrop-blur-md shadow-xs px-4 sm:px-8'
              }`}
            >
              <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
              {/* Logo: Only Logo (Transparent Background) */}
              <Link href="/" className="flex items-center group py-1.5">
                <img
                  src="/images/logo.png"
                  alt="ផ្ការំដួល"
                  className="h-12 sm:h-13 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
                />
              </Link>

              {/* Desktop Nav Links (Glass Pill Hover) */}
              <nav className="hidden md:flex items-center gap-1.5 text-sm lg:text-base font-medium text-[#2B3927] font-khmer-body">
                <a
                  href="#features"
                  onClick={(e) => scrollToSection(e, 'features')}
                  className="px-3.5 py-1.5 rounded-full hover:bg-white/60 hover:text-[#243521] transition-all cursor-pointer"
                >
                  មុខងារសំខាន់ៗ
                </a>
                <a
                  href="#how-it-works"
                  onClick={(e) => scrollToSection(e, 'how-it-works')}
                  className="px-3.5 py-1.5 rounded-full hover:bg-white/60 hover:text-[#243521] transition-all cursor-pointer"
                >
                  របៀបដំណើរការ
                </a>
                <a
                  href="#dual-currency"
                  onClick={(e) => scrollToSection(e, 'dual-currency')}
                  className="px-3.5 py-1.5 rounded-full hover:bg-white/60 hover:text-[#243521] transition-all cursor-pointer"
                >
                  បេឡាដុល្លារ & រៀល
                </a>
              </nav>

              {/* Right Action CTAs (100% Khmer Language) */}
              <div className="hidden md:flex items-center gap-2.5 font-khmer-heading">
                <Button
                  onClick={() => setShowIntro(true)}
                  variant="ghost"
                  size="sm"
                  className="text-[#2B3927] bg-white/20 hover:bg-white/45 backdrop-blur-md font-semibold text-xs sm:text-sm gap-1.5 border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] rounded-full px-3.5 h-9 transition-all cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 fill-[#7C622D] text-[#7C622D]" />
                  <span>វីដេអូ</span>
                </Button>
                {!user && (
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="text-[#2B3927] hover:bg-white/60 font-semibold text-sm rounded-full px-4 h-9 cursor-pointer"
                    >
                      ចូលប្រព័ន្ធ
                    </Button>
                  </Link>
                )}
                <Link href="/weddings">
                  <Button className="bg-gradient-to-r from-[#243521]/95 to-[#3A4F34]/95 hover:from-[#1B2818] hover:to-[#2D3F28] backdrop-blur-md text-white shadow-lg shadow-[#243521]/20 font-bold gap-2 border border-[#C59F54]/50 rounded-full px-5 h-10 text-sm transition-all cursor-pointer">
                    <Gift className="h-4 w-4 text-[#E6DAC0]" />
                    <span>បើកតុទទួលភ្ញៀវ</span>
                  </Button>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center gap-2">
                <button
                  onClick={() => setShowIntro(true)}
                  aria-label="មើលវីដេអូស្វាគមន៍"
                  className="p-2 rounded-full bg-white/55 border border-white/75 text-[#2B3927] hover:bg-white/80 transition-colors"
                >
                  <Play className="h-4 w-4 fill-current text-[#7C622D]" />
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle Menu"
                  className="text-[#2B3927] rounded-full hover:bg-white/60"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
              </div>
            </div>

            {/* Mobile Dropdown Menu (Floating Glass) */}
            {mobileMenuOpen && (
              <div className="md:hidden mt-2 rounded-2xl border border-white/80 bg-white/70 backdrop-blur-2xl shadow-2xl px-4 pt-3 pb-6 space-y-2 font-khmer-body">
                <a
                  href="#features"
                  onClick={(e) => scrollToSection(e, 'features')}
                  className="block py-2 text-sm font-medium text-[#2B3927] hover:text-[#8C6D23]"
                >
                  មុខងារសំខាន់ៗ
                </a>
                <a
                  href="#how-it-works"
                  onClick={(e) => scrollToSection(e, 'how-it-works')}
                  className="block py-2 text-sm font-medium text-[#2B3927] hover:text-[#8C6D23]"
                >
                  របៀបដំណើរការ
                </a>
                <a
                  href="#dual-currency"
                  onClick={(e) => scrollToSection(e, 'dual-currency')}
                  className="block py-2 text-sm font-medium text-[#2B3927] hover:text-[#8C6D23]"
                >
                  បេឡាដុល្លារ & រៀល
                </a>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setShowIntro(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FAF8F3] border border-[#C59F54]/60 text-sm font-semibold text-[#2B3927] hover:bg-white"
                  >
                    <Play className="h-3.5 w-3.5 fill-[#7C622D] text-[#7C622D]" />
                    <span>ទស្សនាវីដេអូស្វាគមន៍</span>
                  </button>
                  {!user && (
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-center border-[#C8D1C5] text-[#2B3927] font-semibold">
                        ចូលប្រព័ន្ធ
                      </Button>
                    </Link>
                  )}
                  <Link href="/weddings" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full justify-center bg-[#2E3D2A] hover:bg-[#212D1E] text-white font-bold">
                      បើកតុទទួលភ្ញៀវ
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
          {/* User's Kbach Crown from public/kbach */}
          <div className="flex justify-center mb-4">
            <img
              src="/kbach/kbach-divider.png"
              alt="ក្បាច់ខ្មែរ"
              className="h-10 sm:h-12 w-auto max-w-[280px] sm:max-w-[340px] object-contain drop-shadow-xs opacity-90"
            />
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
            {/* Traditional Top Blessing Script (Inspired by picture header) */}
            <p className="khmer-calligraphy-sub text-xs sm:text-sm font-semibold tracking-widest uppercase">
              អបអរសាទរពិធីមង្គលការ
            </p>

            {/* Main Headline in 3D Gold Khmer Calligraphy */}
            <div className="space-y-1 sm:space-y-2 my-1">
              <h1 className="khmer-calligraphy-3d text-2xl sm:text-4xl lg:text-5xl font-bold leading-[1.65] sm:leading-[1.55] py-1">
                កត់ត្រាចំណងដៃគ្រប់ស្រោមសំបុត្រ
              </h1>
              <h2 className="khmer-calligraphy-3d text-xl sm:text-3xl lg:text-4xl font-bold leading-[1.65] sm:leading-[1.55]">
                ប្រកបដោយភាពរលូន និងថ្លៃថ្នូរ
              </h2>
            </div>

            {/* Concise Subheading description in Khmer (Wedding Body Font) */}
            <p className="font-khmer-body text-base text-[#2B3927] max-w-xl mx-auto leading-[1.85] font-medium tracking-wide">
              កត់ត្រាចំណងដៃរហ័សត្រឹម ១០ វិនាទី គាំទ្រទាំងដុល្លារ ($) និងរៀល (៛) 
              ស្កេន KHQR និងផ្ទៀងផ្ទាត់បេឡាដោយស្វ័យប្រវត្តិ។
            </p>

            {/* Action Buttons in Khmer */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 font-khmer-heading">
              <Link href="/weddings">
                <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-[#2E3D2A] to-[#455B3F] hover:from-[#212D1E] hover:to-[#364931] text-white font-bold shadow-lg shadow-[#2E3D2A]/20 gap-2 text-base border border-[#B89758]/40">
                  <Gift className="h-5 w-5 text-[#E7DEC8]" />
                  <span>បើកតុទទួលភ្ញៀវ</span>
                </Button>
              </Link>

              <Link href="/weddings">
                <Button size="lg" variant="outline" className="h-12 px-8 border-[#CBD5C8] hover:bg-[#EBF0E8]/70 text-[#2B3927] font-bold gap-2 text-base bg-white/90 backdrop-blur-sm shadow-xs">
                  <Laptop className="h-4 w-4 text-[#52644F]" />
                  <span>ផ្ទាំងគ្រប់គ្រង</span>
                </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowIntro(true)}
                className="h-12 px-6 border-[#C59F54]/60 hover:bg-[#FAF8F3] text-[#2B3927] font-bold gap-2 text-sm bg-[#FAF8F3]/80 backdrop-blur-sm shadow-xs"
              >
                <Play className="h-4 w-4 fill-[#7C622D] text-[#7C622D]" />
                <span>ទស្សនាវីដេអូ</span>
              </Button>
            </div>

            {/* Trust Indicators in Khmer */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-[#3E513A] font-medium font-khmer-body">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#4E7D46]" />
                ដុល្លារ ($) & រៀល (៛)
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#4E7D46]" />
                ស្កេន KHQR (ABA & ACLEDA)
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#4E7D46]" />
                ផ្ទៀងផ្ទាត់បេឡាភ្លាមៗ
              </span>
            </div>
          </div>
        </section>

        {/* User's Authentic Golden Kbach Divider from public/kbach */}
        <div className="flex justify-center my-6 sm:my-8">
          <img
            src="/kbach/kbach-divider.png"
            alt="ក្បាច់ខ្មែរ"
            className="h-8 sm:h-10 w-auto max-w-[260px] sm:max-w-[320px] object-contain drop-shadow-xs opacity-90"
          />
        </div>

        {/* KEY PAIN POINTS & FEATURES SECTION (100% KHMER) */}
        <section id="features" className="py-16 bg-[#FFFEFC]/50 backdrop-blur-xs border-y border-[#E8E1D3]/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <Badge variant="outline" className="border-[#B89758]/60 text-[#4E3D19] bg-[#F6EFE0] font-semibold font-khmer-heading text-xs px-3 py-1">
                ចំណុចពិសេស និងទំនុកចិត្តខ្ពស់
              </Badge>
              <h2 className="font-khmer-body font-bold text-2xl sm:text-3xl text-[#2B3927] leading-[1.45]">
                រចនាឡើងដើម្បីឆ្លើយតបនឹងល្បឿនជាក់ស្តែងនៃពិធីមង្គលការខ្មែរ
              </h2>
              <p className="font-khmer-body text-sm sm:text-base text-[#3E513A] leading-[1.85]">
                ការកត់ត្រាក្នុងសៀវភៅដៃបុរាណនាំឱ្យកកស្ទះភ្ញៀវ បាត់តួលេខ និងពិបាកទូទាត់លុយនៅយប់ជ្រៅ។ 
                ប្រព័ន្ធផ្ការំដួលដោះស្រាយបញ្ហាទាំងអស់នេះជូនលោកអ្នក។
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card className="p-7 rounded-3xl border border-[#E2DBCF]/60 bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 border border-white/85 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] hover:-translate-y-2 hover:scale-[1.015] hover:border-[#C59F54]/70 hover:shadow-[0_20px_44px_rgba(36,53,33,0.16),inset_0_2px_6px_rgba(255,255,255,1)] transition-all duration-300 ease-out group cursor-default relative overflow-hidden">
                {/* Authentic Golden Kbach Corners */}
                <img
                  src="/border/kbach-corner-tl.png"
                  alt=""
                  className="absolute top-2 left-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <img
                  src="/border/kbach-corner-tr.png"
                  alt=""
                  className="absolute top-2 right-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <img
                  src="/border/kbach-corner-bl.png"
                  alt=""
                  className="absolute bottom-2 left-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <img
                  src="/border/kbach-corner-br.png"
                  alt=""
                  className="absolute bottom-2 right-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />

                <div className="relative z-10">
                  <div className="h-12 w-12 rounded-2xl bg-[#EAF0E7] text-[#2B3927] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform border border-[#C6D6C2] shadow-xs">
                    <Clock className="h-6 w-6" />
                  </div>
                  <h3 className="font-khmer-body text-base font-semibold text-[#2B3927] mb-2">កត់ត្រាចំណងដៃរហ័សត្រឹម ១០ វិនាទី</h3>
                  <p className="font-khmer-body text-sm text-[#3E513A] leading-[1.85]">
                    វាយបញ្ចូលតែ ២ តួអក្សរនៃឈ្មោះ ឬលេខទូរស័ព្ទភ្ញៀវដើម្បីស្វែងរកភ្លាមៗ។ សម្រាប់ភ្ញៀវថ្មី អាចបង្កើតឈ្មោះបានត្រឹមតែ ១ ចុច ដោយមិនរំខានដល់ជួរភ្ញៀវឡើយ។
                  </p>
                </div>
              </Card>

              {/* Feature 2 */}
              <Card className="p-7 rounded-3xl border border-[#E2DBCF]/60 bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 border border-white/85 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] hover:-translate-y-2 hover:scale-[1.015] hover:border-[#C59F54]/70 hover:shadow-[0_20px_44px_rgba(36,53,33,0.16),inset_0_2px_6px_rgba(255,255,255,1)] transition-all duration-300 ease-out group cursor-default relative overflow-hidden">
                {/* Authentic Golden Kbach Corners */}
                <img
                  src="/border/kbach-corner-tl.png"
                  alt=""
                  className="absolute top-2 left-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <img
                  src="/border/kbach-corner-tr.png"
                  alt=""
                  className="absolute top-2 right-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <img
                  src="/border/kbach-corner-bl.png"
                  alt=""
                  className="absolute bottom-2 left-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <img
                  src="/border/kbach-corner-br.png"
                  alt=""
                  className="absolute bottom-2 right-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />

                <div className="relative z-10">
                  <div className="h-12 w-12 rounded-2xl bg-[#F6EFE0] text-[#7C622D] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform border border-[#E0D0B6] shadow-xs">
                    <Coins className="h-6 w-6" />
                  </div>
                  <h3 className="font-khmer-body text-base font-semibold text-[#2B3927] mb-2">គាំទ្ររូបិយប័ណ្ណពីរ (ដុល្លារ $ & រៀល ៛)</h3>
                  <p className="font-khmer-body text-sm text-[#3E513A] leading-[1.85]">
                    កត់ត្រាប្រាក់ដុល្លារ និងប្រាក់រៀលដាច់ដោយឡែកពីគ្នា គណនាសរុបដោយស្វ័យប្រវត្តិ មិនច្រឡំអត្រាប្តូរប្រាក់ ឬលាយឡំរូបិយប័ណ្ណឡើយ។
                  </p>
                </div>
              </Card>

              {/* Feature 3 */}
              <Card className="p-7 rounded-3xl border border-[#E2DBCF]/60 bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 border border-white/85 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] hover:-translate-y-2 hover:scale-[1.015] hover:border-[#C59F54]/70 hover:shadow-[0_20px_44px_rgba(36,53,33,0.16),inset_0_2px_6px_rgba(255,255,255,1)] transition-all duration-300 ease-out group cursor-default relative overflow-hidden">
                {/* Authentic Golden Kbach Corners */}
                <img
                  src="/border/kbach-corner-tl.png"
                  alt=""
                  className="absolute top-2 left-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <img
                  src="/border/kbach-corner-tr.png"
                  alt=""
                  className="absolute top-2 right-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <img
                  src="/border/kbach-corner-bl.png"
                  alt=""
                  className="absolute bottom-2 left-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <img
                  src="/border/kbach-corner-br.png"
                  alt=""
                  className="absolute bottom-2 right-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />

                <div className="relative z-10">
                  <div className="h-12 w-12 rounded-2xl bg-[#EAF0E7] text-[#2B3927] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform border border-[#C6D6C2] shadow-xs">
                    <Scale className="h-6 w-6" />
                  </div>
                  <h3 className="font-khmer-body text-base font-semibold text-[#2B3927] mb-2">ផ្ទៀងផ្ទាត់តុល្យភាពបេឡាចុងកម្មវិធី</h3>
                  <p className="font-khmer-body text-sm text-[#3E513A] leading-[1.85]">
                    រាល់ស្រោមសំបុត្រត្រូវបានភ្ជាប់ជាមួយអ្នកកត់ត្រាផ្ទាល់។ នៅពាក់កណ្តាលអធ្រាត្រ ផ្ទៀងផ្ទាត់លុយក្នុងហិបបានត្រឹម ២ នាទី ដោយគ្មានការខ្វែងគំនិតគ្នា។
                  </p>
                </div>
              </Card>

              {/* Feature 4 */}
              <Card className="p-7 rounded-3xl border border-[#E2DBCF]/60 bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 border border-white/85 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] hover:-translate-y-2 hover:scale-[1.015] hover:border-[#C59F54]/70 hover:shadow-[0_20px_44px_rgba(36,53,33,0.16),inset_0_2px_6px_rgba(255,255,255,1)] transition-all duration-300 ease-out group cursor-default relative overflow-hidden">
                {/* Authentic Golden Kbach Corners */}
                <img
                  src="/border/kbach-corner-tl.png"
                  alt=""
                  className="absolute top-2 left-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <img
                  src="/border/kbach-corner-tr.png"
                  alt=""
                  className="absolute top-2 right-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <img
                  src="/border/kbach-corner-bl.png"
                  alt=""
                  className="absolute bottom-2 left-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <img
                  src="/border/kbach-corner-br.png"
                  alt=""
                  className="absolute bottom-2 right-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />

                <div className="relative z-10">
                  <div className="h-12 w-12 rounded-2xl bg-[#E7EEF0] text-[#285767] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform border border-[#C3D5DA] shadow-xs">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <h3 className="font-khmer-body text-base font-semibold text-[#2B3927] mb-2">ស្កេន KHQR & ភ្ជាប់បង្កាន់ដៃផ្ទាល់</h3>
                  <p className="font-khmer-body text-sm text-[#3E513A] leading-[1.85]">
                    បង្ហាញ QR កូដរបស់កូនកំលោះកូនក្រមុំនៅតុទទួលភ្ញៀវ ថតនិងបញ្ចូលរូបភាពបង្កាន់ដៃផ្ទេរប្រាក់បានភ្លាមៗដោយសុវត្ថិភាពខ្ពស់។
                  </p>
                </div>
              </Card>

              {/* Feature 5 */}
              <Card className="p-7 rounded-3xl border border-[#E2DBCF]/60 bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 border border-white/85 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] hover:-translate-y-2 hover:scale-[1.015] hover:border-[#C59F54]/70 hover:shadow-[0_20px_44px_rgba(36,53,33,0.16),inset_0_2px_6px_rgba(255,255,255,1)] transition-all duration-300 ease-out group cursor-default relative overflow-hidden">
                {/* Authentic Golden Kbach Corners */}
                <img
                  src="/border/kbach-corner-tl.png"
                  alt=""
                  className="absolute top-2 left-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <img
                  src="/border/kbach-corner-tr.png"
                  alt=""
                  className="absolute top-2 right-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <img
                  src="/border/kbach-corner-bl.png"
                  alt=""
                  className="absolute bottom-2 left-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <img
                  src="/border/kbach-corner-br.png"
                  alt=""
                  className="absolute bottom-2 right-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />

                <div className="relative z-10">
                  <div className="h-12 w-12 rounded-2xl bg-[#EAF0E7] text-[#2B3927] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform border border-[#C6D6C2] shadow-xs">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <h3 className="font-khmer-body text-base font-semibold text-[#2B3927] mb-2">បញ្ជីឈ្មោះភ្ញៀវតាមរដ្ឋបាលកម្ពុជា</h3>
                  <p className="font-khmer-body text-sm text-[#3E513A] leading-[1.85]">
                    ចាត់ថ្នាក់ភ្ញៀវតាម ខេត្ត/រាជធានី ស្រុក/ខណ្ឌ ឃុំ/សង្កាត់ និងភូមិ ជាអក្សរខ្មែរផ្លូវការ ស្របតាមទិន្នន័យរដ្ឋបាលជាតិ។
                  </p>
                </div>
              </Card>

              {/* Feature 6 */}
              <Card className="p-7 rounded-3xl border border-[#E2DBCF]/60 bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 border border-white/85 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] hover:-translate-y-2 hover:scale-[1.015] hover:border-[#C59F54]/70 hover:shadow-[0_20px_44px_rgba(36,53,33,0.16),inset_0_2px_6px_rgba(255,255,255,1)] transition-all duration-300 ease-out group cursor-default relative overflow-hidden">
                {/* Authentic Golden Kbach Corners */}
                <img
                  src="/border/kbach-corner-tl.png"
                  alt=""
                  className="absolute top-2 left-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <img
                  src="/border/kbach-corner-tr.png"
                  alt=""
                  className="absolute top-2 right-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <img
                  src="/border/kbach-corner-bl.png"
                  alt=""
                  className="absolute bottom-2 left-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <img
                  src="/border/kbach-corner-br.png"
                  alt=""
                  className="absolute bottom-2 right-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />

                <div className="relative z-10">
                  <div className="h-12 w-12 rounded-2xl bg-[#F0EAF5] text-[#55366F] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform border border-[#D7C7E1] shadow-xs">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <h3 className="font-khmer-body text-base font-semibold text-[#2B3927] mb-2">ទាញយកទិន្នន័យជា Excel/CSV ត្រឹម ១ ចុច</h3>
                  <p className="font-khmer-body text-sm text-[#3E513A] leading-[1.85]">
                    ទាញយកបញ្ជីចំណងដៃទាំងមូលដើម្បីងាយស្រួលផ្ញើសារថ្លែងអំណរគុណ រក្សាទុកជាកម្រងអនុស្សាវរីយ៍ និងទុកជាឯកសារយោងទៅថ្ងៃក្រោយ។
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* User's Authentic Golden Kbach Divider from public/kbach */}
        <div className="flex justify-center my-6 sm:my-8">
          <img
            src="/kbach/kbach-divider.png"
            alt="ក្បាច់ខ្មែរ"
            className="h-8 sm:h-10 w-auto max-w-[260px] sm:max-w-[320px] object-contain drop-shadow-xs opacity-90"
          />
        </div>

        {/* HOW IT WORKS (3 SIMPLE STEPS - 100% KHMER) */}
        <section id="how-it-works" className="py-16 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="outline" className="border-[#B89758]/60 text-[#4E3D19] bg-[#F6EFE0] font-semibold font-khmer-heading text-xs px-3 py-1">
                ដំណើរការ ៣ ជំហានយ៉ាងងាយស្រួល
              </Badge>
              <h2 className="font-khmer-body font-bold text-2xl sm:text-3xl text-[#2B3927] leading-[1.45]">
                របៀបដំណើរការក្នុង ៣ ជំហាន
              </h2>
              <p className="font-khmer-body text-sm text-[#3E513A]">
                ចាប់ពីការរៀបចំបញ្ជីឈ្មោះភ្ញៀវ រហូតដល់ការបិទបញ្ជីបេឡានៅម៉ោង ១ យប់។
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Step 1 */}
              <div className="bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 p-8 rounded-3xl border border-white/85 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] relative overflow-hidden group hover:-translate-y-2 hover:scale-[1.015] hover:border-[#C59F54]/70 hover:shadow-[0_20px_44px_rgba(36,53,33,0.16),inset_0_2px_6px_rgba(255,255,255,1)] transition-all duration-300 ease-out cursor-default">
                {/* Authentic Golden Kbach Corners */}
                <img
                  src="/border/kbach-corner-tl.png"
                  alt=""
                  className="absolute top-2 left-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <img
                  src="/border/kbach-corner-tr.png"
                  alt=""
                  className="absolute top-2 right-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <img
                  src="/border/kbach-corner-bl.png"
                  alt=""
                  className="absolute bottom-2 left-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <img
                  src="/border/kbach-corner-br.png"
                  alt=""
                  className="absolute bottom-2 right-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />

                <div className="relative z-10 space-y-4">
                  <div className="h-10 w-10 rounded-full bg-[#344630] text-[#E8DFC9] font-bold flex items-center justify-center text-sm shadow-md border border-[#B89758]/50 font-khmer-heading">
                    ១
                  </div>
                  <h3 className="font-khmer-body text-base font-semibold text-[#2B3927]">រៀបចំកម្មវិធី & គណនីធនាគារ</h3>
                  <p className="font-khmer-body text-sm text-[#3E513A] leading-[1.85]">
                    បង្កើតព័ត៌មានមង្គលការ ដាក់រូបភាព QR ធនាគារ ABA / ACLEDA និងបញ្ចូលបញ្ជីឈ្មោះភ្ញៀវតាមរយៈ CSV ក្នុងពេលត្រឹមតែ ៣០ វិនាទី។
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 p-8 rounded-3xl border border-white/85 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] relative overflow-hidden group hover:-translate-y-2 hover:scale-[1.015] hover:border-[#C59F54]/70 hover:shadow-[0_20px_44px_rgba(36,53,33,0.16),inset_0_2px_6px_rgba(255,255,255,1)] transition-all duration-300 ease-out cursor-default">
                {/* Authentic Golden Kbach Corners */}
                <img
                  src="/border/kbach-corner-tl.png"
                  alt=""
                  className="absolute top-2 left-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <img
                  src="/border/kbach-corner-tr.png"
                  alt=""
                  className="absolute top-2 right-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <img
                  src="/border/kbach-corner-bl.png"
                  alt=""
                  className="absolute bottom-2 left-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <img
                  src="/border/kbach-corner-br.png"
                  alt=""
                  className="absolute bottom-2 right-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />

                <div className="relative z-10 space-y-4">
                  <div className="h-10 w-10 rounded-full bg-[#465C40] text-[#E8DFC9] font-bold flex items-center justify-center text-sm shadow-md border border-[#B89758]/50 font-khmer-heading">
                    ២
                  </div>
                  <h3 className="font-khmer-body text-base font-semibold text-[#2B3927]">ទទួលភ្ញៀវនៅរាត្រីមង្គលការ</h3>
                  <p className="font-khmer-body text-sm text-[#3E513A] leading-[1.85]">
                    អ្នកកត់ត្រាចូលប្រើគណនីផ្ទាល់ខ្លួន។ ពេលភ្ញៀវមកដល់ ស្រោមសំបុត្រត្រូវបានកត់ត្រាដោយសាច់ប្រាក់ ឬស្កេន KHQR ក្នុងពេលក្រោម ១០ វិនាទី។
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 p-8 rounded-3xl border border-white/85 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] relative overflow-hidden group hover:-translate-y-2 hover:scale-[1.015] hover:border-[#C59F54]/70 hover:shadow-[0_20px_44px_rgba(36,53,33,0.16),inset_0_2px_6px_rgba(255,255,255,1)] transition-all duration-300 ease-out cursor-default">
                {/* Authentic Golden Kbach Corners */}
                <img
                  src="/border/kbach-corner-tl.png"
                  alt=""
                  className="absolute top-2 left-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <img
                  src="/border/kbach-corner-tr.png"
                  alt=""
                  className="absolute top-2 right-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <img
                  src="/border/kbach-corner-bl.png"
                  alt=""
                  className="absolute bottom-2 left-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <img
                  src="/border/kbach-corner-br.png"
                  alt=""
                  className="absolute bottom-2 right-2 h-7 sm:h-8 w-auto object-contain pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />

                <div className="relative z-10 space-y-4">
                  <div className="h-10 w-10 rounded-full bg-[#7C622D] text-[#FAF6EE] font-bold flex items-center justify-center text-sm shadow-md border border-[#B89758]/50 font-khmer-heading">
                    ៣
                  </div>
                  <h3 className="font-khmer-body text-base font-semibold text-[#2B3927]">ផ្ទៀងផ្ទាត់បេឡា & របាយការណ៍</h3>
                  <p className="font-khmer-body text-sm text-[#3E513A] leading-[1.85]">
                    ចុងបញ្ចប់កម្មវិធី ផ្ទៀងផ្ទាត់សាច់ប្រាក់ជាក់ស្តែងក្នុងហិបធៀបនឹងប្រព័ន្ធបានភ្លាមៗ និងទាញយករបាយការណ៍សរុបជា Excel ត្រឹម ១ ចុច។
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION (CTA) FOOTER BANNER (100% KHMER) */}
        <section className="py-20 sm:py-28 text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
            <Heart className="mx-auto h-12 w-12 text-[#E87582] fill-[#E87582]/20 animate-bounce drop-shadow-sm" />
            <h2 className="font-khmer-body font-bold text-2xl sm:text-3xl text-[#2B3927] leading-[1.45] drop-shadow-xs">
              ត្រៀមខ្លួនរួចរាល់ក្នុងការធ្វើឱ្យតុទទួលភ្ញៀវមង្គលការរបស់អ្នកកាន់តែទំនើបហើយឬនៅ?
            </h2>
            <p className="font-khmer-body text-base text-[#3E513A] max-w-2xl mx-auto leading-[1.85] font-medium drop-shadow-xs">
              ទទួលយកភាពស្ងប់ចិត្តជាមួយនឹងការកត់ត្រាចំណងដៃត្រឹមត្រូវ ១០០% គ្មានការបាត់បង់ និងមានរបាយការណ៍ច្បាស់លាស់។
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4 font-khmer-heading">
              <Link href="/weddings">
                <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-[#2E3D2A] to-[#455A3F] hover:from-[#212D1E] hover:to-[#384A33] text-white font-bold shadow-xl shadow-[#2E3D2A]/20 text-base border border-[#B89758]/40">
                  បើកដំណើរការតុទទួលភ្ញៀវឥឡូវនេះ
                </Button>
              </Link>
              <Link href="/weddings">
                <Button size="lg" variant="outline" className="h-12 px-8 border-[#CBD5C8] hover:bg-[#EBF0E8]/70 text-[#2B3927] font-semibold text-base bg-white/85 backdrop-blur-xs shadow-xs">
                  ចូលទៅកាន់ផ្ទាំងគ្រប់គ្រង
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FOOTER (100% KHMER) */}
        <footer className="bg-[#FFFEFC]/85 backdrop-blur-md border-t border-[#E8E1D3] py-12 text-xs text-[#3E513A] font-khmer-body">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <img
                src="/images/logo-flower.png"
                alt="Logo"
                className="h-8 w-8 object-contain drop-shadow-xs"
              />
              <span className="font-bold text-[#2B3927] font-khmer-heading text-sm">ផ្ការំដួល (Pka Romduol)</span>
              <span>— ប្រព័ន្ធគ្រប់គ្រងចំណងដៃ & ទទួលភ្ញៀវមង្គលការកម្ពុជា</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 font-medium font-khmer-heading text-sm">
              <Link href="/dashboard" className="hover:text-[#2B3927] transition-colors">
                ផ្ទាំងគ្រប់គ្រង
              </Link>
              <Link href="/gifts" className="hover:text-[#2B3927] transition-colors">
                តុទទួលភ្ញៀវ
              </Link>
              <Link href="/guests" className="hover:text-[#2B3927] transition-colors">
                បញ្ជីភ្ញៀវ
              </Link>
              <Link href="/reconciliation" className="hover:text-[#2B3927] transition-colors">
                ផ្ទៀងផ្ទាត់បេឡា
              </Link>
              {user ? (
                <button
                  onClick={logout}
                  className="hover:text-red-600 text-[#3E513A] transition-colors cursor-pointer"
                >
                  ចាកចេញ
                </button>
              ) : (
                <Link href="/login" className="hover:text-[#2B3927] transition-colors">
                  ចូលប្រព័ន្ធ
                </Link>
              )}
            </div>

            <p>រក្សាសិទ្ធិគ្រប់យ៉ាង © ២០២៦ ផ្ការំដួល</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
