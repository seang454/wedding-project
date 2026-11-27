'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/schemas/auth.schema';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      toast.success('ចូលប្រើប្រព័ន្ធបានជោគជ័យ!');
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { message?: string } } }).response?.data?.message
          ? (err as { response: { data: { message: string } } }).response.data.message
          : 'ឈ្មោះគណនី ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវឡើយ។';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-[#FAF8F3] text-[#2B3927] selection:bg-[#E2EBE0] selection:text-[#2B3927] overflow-hidden font-khmer-body">
      {/* HOMEPAGE MATCHING BACKGROUND TEXTURE */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-95 transition-opacity duration-700"
        style={{ backgroundImage: "url('/background/background.jpg')" }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#FAF8F3]/15 via-transparent to-[#FAF8F3]/25 pointer-events-none" />

      {/* TOP LEFT BACK TO HOME BUTTON */}
      <div className="absolute top-4 sm:top-8 left-4 sm:left-8 z-30 font-khmer-heading">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-b from-white/35 via-white/10 to-white/25 hover:from-white/55 hover:to-white/40 text-[#2B3927] text-xs font-semibold border border-white/85 shadow-[0_8px_24px_rgba(36,53,33,0.12),inset_0_1.5px_2px_rgba(255,255,255,0.95)] backdrop-blur-md backdrop-saturate-150 transition-all hover:border-[#C59F54]/70"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-[#4E8B7C]" />
          <span>ត្រឡប់ទៅទំព័រដើម</span>
        </Link>
      </div>

      {/* MAIN CONTAINER: 2-COLUMN SPLIT WITH ORGANIC WAVE DIVIDER */}
      <div className="relative z-20 w-full max-w-5xl rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-[0_24px_64px_rgba(20,35,18,0.28),inset_0_1.5px_3px_rgba(255,255,255,0.45)] border border-white/75 ring-1 ring-[#C59F54]/30 bg-[#1F2F1E]/75 backdrop-blur-2xl backdrop-saturate-150 flex flex-col lg:flex-row items-stretch">
        
        {/* LEFT COLUMN: 100% FULL-BLEED ARTWORK USING /auth/image.png */}
        <div className="relative w-full lg:w-1/2 min-h-[340px] sm:min-h-[440px] lg:min-h-[600px] overflow-hidden bg-[#F5F2EB]">
          <img
            src="/auth/image.png"
            alt="សិរីសួស្តី ផ្ការំដួល"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </div>

        {/* RIGHT COLUMN: Frosted Emerald Glass Form with Organic Curve */}
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-[#1E2E1C]/80 via-[#243822]/75 to-[#172515]/85 backdrop-blur-xl text-white p-7 sm:p-10 lg:p-12 flex flex-col justify-center relative z-20">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#C59F54]/15 blur-3xl pointer-events-none" />
          {/* Organic Wave Divider into Left Image on Large Screens */}
          <div className="hidden lg:block absolute -top-1 -bottom-1 -left-12 w-14 pointer-events-none z-30 overflow-visible text-[#1E2E1C]/85">
            <svg
              viewBox="0 0 100 600"
              preserveAspectRatio="none"
              className="w-full h-full fill-current"
            >
              <path d="M100,0 C60,110 5,190 5,300 C5,410 60,490 100,600 L100,0 Z" />
            </svg>
          </div>

          <div className="relative z-30 max-w-md mx-auto w-full">
            {/* Login Heading */}
            <div className="space-y-2 mb-6 text-center">
              <h2 className="font-khmer-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
                ចូលប្រើប្រព័ន្ធ
              </h2>
              <p className="font-khmer-body text-xs sm:text-sm text-[#CBDAC8] leading-relaxed">
                សូមបញ្ចូលឈ្មោះគណនី ឬអ៊ីមែលរបស់អ្នកដើម្បីបន្ត
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-[#D3E2D0] font-khmer-heading">
                  ឈ្មោះគណនី ឬ អ៊ីមែល
                </label>
                <div className="relative">
                  <input
                    {...register('identifier')}
                    type="text"
                    placeholder="សូមបញ្ចូលឈ្មោះគណនី ឬអ៊ីមែល"
                    className="w-full h-11 sm:h-12 rounded-full bg-black/30 border border-white/15 px-5 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:border-[#4E8B7C] focus:ring-2 focus:ring-[#4E8B7C]/30 transition-all font-khmer-body"
                  />
                </div>
                {errors.identifier && (
                  <p className="text-xs text-rose-400 mt-1 pl-3 font-khmer-body">
                    {errors.identifier.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-[#D3E2D0] font-khmer-heading">
                  ពាក្យសម្ងាត់
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="សូមបញ្ចូលពាក្យសម្ងាត់"
                    className="w-full h-11 sm:h-12 rounded-full bg-black/30 border border-white/15 px-5 pr-12 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:border-[#4E8B7C] focus:ring-2 focus:ring-[#4E8B7C]/30 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    aria-label={showPassword ? 'លាក់ពាក្យសម្ងាត់' : 'បង្ហាញពាក្យសម្ងាត់'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-400 mt-1 pl-3 font-khmer-body">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="text-right pt-0.5">
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info('សូមទាក់ទងមកកាន់អ្នកគ្រប់គ្រងដើម្បីកំណត់ពាក្យសម្ងាត់ឡើងវិញ');
                  }}
                  className="text-xs text-[#83B9A8] hover:text-[#A7D7C7] hover:underline transition-colors font-khmer-heading"
                >
                  ភ្លេចពាក្យសម្ងាត់?
                </a>
              </div>

              {/* Primary Login Button (Teal-Sage Pill) */}
              <Button
                type="submit"
                disabled={isLoggingIn}
                className="w-full h-11 sm:h-12 rounded-full bg-[#4E8B7C] hover:bg-[#427A6D] text-white font-bold text-sm sm:text-base shadow-lg shadow-black/30 transition-all hover:scale-[1.01] active:scale-[0.99] font-khmer-heading cursor-pointer mt-2"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> កំពុងផ្ទៀងផ្ទាត់...
                  </>
                ) : (
                  'ចូលប្រើប្រព័ន្ធ'
                )}
              </Button>
            </form>

            {/* Don't have an account? Register Now */}
            <div className="mt-5 text-center text-xs text-[#C5D7C2] font-khmer-heading">
              <span>មិនទាន់មានគណនីមែនទេ? </span>
              <Link
                href="/register"
                className="text-[#83B9A8] hover:text-[#A7D7C7] font-semibold underline hover:no-underline ml-1"
              >
                ចុះឈ្មោះឥឡូវនេះ
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
