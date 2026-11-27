'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  X,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeIntroProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeIntro({ isOpen, onClose }: WelcomeIntroProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [isCardVisible, setIsCardVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Reset closing state when opening
    setIsClosing(false);

    // Try auto-playing video
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }

    // Escape key closes modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Disable body scrolling while intro is active
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleDismiss = () => {
    setIsClosing(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('has_seen_welcome_intro', 'true');
    }
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      onClose();
      setIsClosing(false);
    }, 400);
  };

  const toggleSound = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-all duration-500 font-khmer-body ${
        isClosing ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Wedding Cartoon Video */}
      <video
        ref={videoRef}
        src="/videos/welcome-intro.mp4"
        autoPlay
        playsInline
        muted={isMuted}
        loop
        className="absolute inset-0 w-full h-full object-cover filter brightness-[1.0] contrast-[1.02] pointer-events-none"
      />

      {/* Subtle top & bottom ambient gradient for contrast while keeping center 100% visible */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-transparent to-black/65 pointer-events-none" />

      {/* Top Controls Bar */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-8 right-4 sm:right-8 flex items-center justify-between z-20">
        {/* Subtle Brand Tag */}
        <div className="flex items-center gap-2.5 bg-black/40 backdrop-blur-md border border-[#C59F54]/40 px-3.5 py-1.5 rounded-full text-xs text-[#FAF6EE] font-khmer-heading shadow-md">
          <Sparkles className="h-3.5 w-3.5 text-[#E6C673]" />
          <span>ផ្ការំដួល — ប្រព័ន្ធមង្គលការទំនើប</span>
        </div>

        {/* Right Action: Mute Toggle, Hide/Show Card & Skip Button */}
        <div className="flex items-center gap-2 sm:gap-3 font-khmer-heading">
          <button
            onClick={() => setIsCardVisible(!isCardVisible)}
            aria-label={isCardVisible ? 'លាក់ផ្ទាំងសារ' : 'បង្ហាញផ្ទាំងសារ'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 text-xs text-[#FAF6EE] transition-all hover:border-[#C59F54]/70 shadow-sm cursor-pointer"
          >
            {isCardVisible ? (
              <>
                <EyeOff className="h-4 w-4 text-[#F3E7C4]" />
                <span className="hidden sm:inline">លាក់ផ្ទាំងសារ</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 text-[#F3E7C4]" />
                <span className="hidden sm:inline">បង្ហាញផ្ទាំងសារ</span>
              </>
            )}
          </button>

          <button
            onClick={toggleSound}
            aria-label={isMuted ? 'បើកសំឡេង' : 'បិទសំឡេង'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 text-xs text-[#FAF6EE] transition-all hover:border-[#C59F54]/70 shadow-sm cursor-pointer"
          >
            {isMuted ? (
              <>
                <VolumeX className="h-4 w-4 text-[#F0A85D]" />
                <span className="hidden sm:inline">បើកសំឡេង</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 text-[#8EE07A]" />
                <span className="hidden sm:inline">បិទសំឡេង</span>
              </>
            )}
          </button>

          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="h-8 sm:h-9 px-3 sm:px-4 bg-white/10 hover:bg-white/20 text-[#FAF6EE] border border-white/20 hover:border-white/40 rounded-full text-xs font-semibold backdrop-blur-md transition-all gap-1.5 shadow-sm"
          >
            <span>រំលង</span>
            <X className="h-3.5 w-3.5 text-[#E8DFC9]" />
          </Button>
        </div>
      </div>

      {/* Center Royal Welcome Card - Ultra Clear Transparent Glass with Authentic Kbach */}
      <div
        className={`relative z-10 max-w-lg w-[92%] sm:w-full mx-auto text-center transition-all duration-500 ${
          isCardVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {/* Royal Khmer Card Container - Transparent Glass Allowing Background Video to Shine Through */}
        <div className="relative bg-black/20 backdrop-blur-[2px] border-2 border-[#C59F54]/80 rounded-3xl p-6 sm:p-9 text-white shadow-2xl overflow-hidden">
          {/* Authentic Gold Kbach Corners */}
          <img
            src="/border/kbach-corner-tl.png"
            alt=""
            className="absolute top-2.5 left-2.5 h-8 sm:h-10 w-auto object-contain opacity-95 pointer-events-none drop-shadow-md"
          />
          <img
            src="/border/kbach-corner-tr.png"
            alt=""
            className="absolute top-2.5 right-2.5 h-8 sm:h-10 w-auto object-contain opacity-95 pointer-events-none drop-shadow-md"
          />
          <img
            src="/border/kbach-corner-bl.png"
            alt=""
            className="absolute bottom-2.5 left-2.5 h-8 sm:h-10 w-auto object-contain opacity-95 pointer-events-none drop-shadow-md"
          />
          <img
            src="/border/kbach-corner-br.png"
            alt=""
            className="absolute bottom-2.5 right-2.5 h-8 sm:h-10 w-auto object-contain opacity-95 pointer-events-none drop-shadow-md"
          />

          {/* Romduol Flower Logo & Sacred Blessing */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src="/images/logo.png"
                alt="ផ្ការំដួល"
                className="h-16 sm:h-20 w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black/35 border border-[#C59F54]/70 text-[#FAF6EE] text-xs font-semibold font-khmer-heading shadow-md backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 text-[#F3E7C4]" />
              <span>សិរីសួស្តី ជ័យមង្គល វិបុលសុខ</span>
              <Sparkles className="h-3.5 w-3.5 text-[#F3E7C4]" />
            </div>

            {/* Main Welcome Headline with Drop Shadows for Contrast Over Video */}
            <div className="space-y-2">
              <h1 className="font-khmer-body font-bold text-2xl sm:text-3xl text-white leading-[1.35] drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                សូមស្វាគមន៍មកកាន់ប្រព័ន្ធ <span className="text-[#F3E7C4]">ផ្ការំដួល</span>
              </h1>
              <p className="font-khmer-body text-xs sm:text-sm text-[#FAF6EE] leading-[1.8] max-w-sm mx-auto drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] font-medium">
                ប្រព័ន្ធកត់ត្រាចំណងដៃ &amp; ទទួលភ្ញៀវមង្គលការឌីជីថលទំនើប ត្រឹមត្រូវ រហ័ស និងមានរបាយការណ៍បេឡាច្បាស់លាស់។
              </p>
            </div>

            {/* Divider Flourish */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#C59F54]" />
              <span className="text-[#F3E7C4] text-xs font-khmer-heading drop-shadow-md">❦ ផ្ការំដួល ❦</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#C59F54]" />
            </div>

            {/* Action Button */}
            <div className="pt-3 flex items-center justify-center font-khmer-heading">
              <Button
                onClick={handleDismiss}
                size="lg"
                className="w-full sm:w-auto h-12 px-9 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#E6C673] to-[#B89758] hover:from-[#C59F54] hover:to-[#A78445] text-[#241F0D] font-bold text-sm shadow-xl shadow-black/60 border border-[#FAF6EE]/50 gap-2 transition-transform hover:scale-[1.02]"
              >
                <span>ចូលទៅកាន់គេហទំព័រ</span>
                <ArrowRight className="h-4 w-4 text-[#241F0D]" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Enter Button when Card is Hidden */}
      {!isCardVisible && (
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 font-khmer-heading flex items-center gap-3">
          <Button
            onClick={handleDismiss}
            size="lg"
            className="h-12 px-8 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#E6C673] to-[#B89758] hover:from-[#C59F54] hover:to-[#A78445] text-[#241F0D] font-bold text-sm shadow-2xl border-2 border-white/70 gap-2 transition-transform hover:scale-105"
          >
            <span>ចូលទៅកាន់គេហទំព័រ</span>
            <ArrowRight className="h-4 w-4 text-[#241F0D]" />
          </Button>
        </div>
      )}
    </div>
  );
}
