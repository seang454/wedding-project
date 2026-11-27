'use client';

import { useWeddings } from '@/hooks/use-weddings';
import { useActiveWedding } from '@/context/wedding-context';
import { useGiftSummary } from '@/hooks/use-gifts';
import { useGuests } from '@/hooks/use-guests';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import {
  Banknote,
  QrCode,
  Users,
  Heart,
  Calendar,
  MapPin,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Loader2,
  Sparkles,
  Gift,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { activeWedding: currentWedding, activeWeddingId: weddingId, isLoading: loadingWeddings } = useActiveWedding();

  const { data: summaries } = useGiftSummary(weddingId);
  const { data: guestsData } = useGuests(weddingId, 1, 1);
  const { data: attendedGuestsData } = useGuests(weddingId, 1, 1, {
    status: 'ATTENDED',
  });

  const summaryUSD = summaries?.find((s) => s.currency === 'USD');
  const summaryKHR = summaries?.find((s) => s.currency === 'KHR');

  const totalEnvelopes = (summaryUSD?.totalEnvelopes || 0) + (summaryKHR?.totalEnvelopes || 0);
  const totalGuests = guestsData?.meta?.itemCount || 0;
  const attendedGuests = attendedGuestsData?.meta?.itemCount || 0;
  const absentGuests = Math.max(0, totalGuests - attendedGuests);
  const attendanceRate = totalGuests > 0 ? Math.round((attendedGuests / totalGuests) * 100) : 0;

  const moneyChartConfig = {
    usd: {
      label: 'ដុល្លារ (USD)',
      color: '#243521',
    },
    khr: {
      label: 'ប្រាក់រៀល (KHR)',
      color: '#C59F54',
    },
  } satisfies ChartConfig;

  const moneyChartData = [
    {
      category: 'សាច់ប្រាក់',
      usd: summaryUSD?.totalCash || 0,
      khr: summaryKHR?.totalCash || 0,
    },
    {
      category: 'KHQR',
      usd: summaryUSD?.totalQr || 0,
      khr: summaryKHR?.totalQr || 0,
    },
    {
      category: 'សរុប',
      usd: summaryUSD?.totalAmount || 0,
      khr: summaryKHR?.totalAmount || 0,
    },
  ];

  const guestChartConfig = {
    present: {
      label: 'បានមកដល់',
      color: '#243521',
    },
    absent: {
      label: 'មិនទាន់មក',
      color: '#C59F54',
    },
  } satisfies ChartConfig;

  const guestChartData =
    totalGuests > 0
      ? [
          { status: 'present', name: 'បានមកដល់', value: attendedGuests, fill: '#243521' },
          { status: 'absent', name: 'មិនទាន់មក', value: absentGuests, fill: '#C59F54' },
        ]
      : [{ status: 'empty', name: 'មិនទាន់មានទិន្នន័យ', value: 1, fill: '#E8DFC9' }];

  if (loadingWeddings) {
    return (
      <div className="flex flex-col h-72 items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#4E8B7C]" />
        <p className="text-sm font-semibold text-[#3E513A] font-khmer-heading">
          កំពុងផ្ទុកទិន្នន័យមង្គលការ...
        </p>
      </div>
    );
  }

  if (!currentWedding) {
    return (
      <Card className="relative p-8 sm:p-12 text-center bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 border border-white/85 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] rounded-3xl shadow-sm">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-[#EAF0E7] flex items-center justify-center text-[#243521] mb-4 border border-[#C59F54]/30">
          <Heart className="h-8 w-8 text-[#C59F54]" />
        </div>
        <h2 className="font-khmer-heading text-xl sm:text-2xl font-bold text-[#212E1E]">
          មិនទាន់មានទិន្នន័យមង្គលការនៅឡើយទេ
        </h2>
        <p className="font-khmer-body text-xs sm:text-sm text-[#5C6E57] mt-2 mb-6 max-w-md mx-auto">
          សូមបង្កើតទិន្នន័យមង្គលការរបស់អ្នកដើម្បីចាប់ផ្តើមប្រើប្រាស់តុទទួលភ្ញៀវ និងកត់ត្រាចំណងដៃ
        </p>
        <Link href="/settings">
          <Button className="bg-[#243521] hover:bg-[#1A2617] text-white font-khmer-heading font-bold rounded-full px-6 py-2.5 shadow-md border border-[#C59F54]/40">
            រៀបចំការកំណត់មង្គលការ
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wedding Header Banner: Royal Emerald Luxury Celebration Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#142312]/85 via-[#243521]/85 to-[#172714]/85 backdrop-blur-2xl p-6 sm:p-8 text-white shadow-2xl border-2 border-[#C59F54]/60">
        {/* Subtle Luxury Damask / Flower Watermark in Background */}
        <div className="absolute right-10 -bottom-10 w-96 h-96 opacity-10 pointer-events-none">
          <img
            src="/images/logo-flower-transparent.png"
            alt=""
            className="w-full h-full object-contain filter invert"
          />
        </div>

        {/* Golden Kbach Corner Flourishes */}
        <img
          src="/border/kbach-corner-tl.png"
          alt=""
          className="absolute top-1.5 left-1.5 w-14 h-14 object-contain pointer-events-none opacity-90 drop-shadow-sm"
        />
        <img
          src="/border/kbach-corner-tr.png"
          alt=""
          className="absolute top-1.5 right-1.5 w-14 h-14 object-contain pointer-events-none opacity-90 drop-shadow-sm"
        />
        <img
          src="/border/kbach-corner-bl.png"
          alt=""
          className="absolute bottom-1.5 left-1.5 w-14 h-14 object-contain pointer-events-none opacity-90 drop-shadow-sm"
        />
        <img
          src="/border/kbach-corner-br.png"
          alt=""
          className="absolute bottom-1.5 right-1.5 w-14 h-14 object-contain pointer-events-none opacity-90 drop-shadow-sm"
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* LEFT: Couple Avatar & Names */}
          <div className="flex items-center gap-5 sm:gap-6 min-w-0">
            {/* Ornate Gold Frame with Couple Portrait */}
            <div className="relative shrink-0">
              <div className="w-22 h-22 sm:w-28 sm:h-28 rounded-full bg-[#F7F4EC] p-1 border-2 border-[#E6C673] ring-4 ring-[#C59F54]/30 overflow-hidden shadow-xl flex items-center justify-center">
                <img
                  src={currentWedding.imageUrl || '/wedding/defaultWeddingImage.jpg'}
                  alt={`${currentWedding.groomName} & ${currentWedding.brideName}`}
                  className="w-full h-full object-cover rounded-full drop-shadow-sm hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-[#243521] border-2 border-[#E6C673] flex items-center justify-center shadow-sm">
                <Heart className="h-3.5 w-3.5 text-[#E6C673] fill-[#E6C673]" />
              </div>
            </div>

            {/* Couple Typography & Metadata */}
            <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-[#FAF8F3]/15 text-[#E6C673] hover:bg-[#FAF8F3]/25 backdrop-blur-md border border-[#C59F54]/50 font-khmer-heading px-3 py-1 text-xs">
                  <Sparkles className="h-3 w-3 mr-1.5 text-[#E6C673]" /> ពិធីសិរីសួស្តី អាពាហ៍ពិពាហ៍
                </Badge>
                <span className="flex items-center gap-1.5 text-[11px] text-[#A8BCA5] font-khmer-heading bg-black/25 px-2.5 py-0.5 rounded-full border border-white/10">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>កំពុងដំណើរការផ្សាយផ្ទាល់</span>
                </span>
              </div>

              <h1 className="font-khmer-body text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-md leading-tight truncate">
                {currentWedding.groomName} <span className="text-[#E6C673] font-normal mx-1">&amp;</span> {currentWedding.brideName}
              </h1>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-[#D8E6D5] font-khmer-body">
                <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-xl border border-white/10">
                  <Calendar className="h-3.5 w-3.5 text-[#E6C673]" />
                  <span>
                    {new Date(currentWedding.weddingDate).toLocaleDateString('km-KH', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </span>
                {currentWedding.venue && (
                  <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-xl border border-white/10">
                    <MapPin className="h-3.5 w-3.5 text-[#E6C673]" />
                    <span className="truncate max-w-[200px]">{currentWedding.venue}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Action Buttons Group */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 font-khmer-heading">
            <Link href="/gifts">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#E6C673] to-[#C59F54] hover:from-[#DFC06E] hover:to-[#B69045] text-[#1E2C1B] font-bold shadow-xl border border-[#FAF8F3]/50 rounded-2xl px-6 h-12 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <PlusCircle className="mr-2 h-5 w-5 text-[#1E2C1B]" />
                <span>កត់ត្រាចំណងដៃថ្មី</span>
              </Button>
            </Link>

            <Link href="/weddings">
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 hover:bg-white/20 text-[#FAF8F3] border border-[#E6C673]/40 rounded-2xl px-5 h-12 text-sm transition-colors cursor-pointer"
              >
                <Heart className="mr-2 h-4 w-4 text-[#E6C673]" />
                <span>ប្តូរមង្គលការ</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Top Stat Cards: Dual Currency & Envelopes */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 font-khmer-body">
        {/* Total USD Card */}
        <Card className="hover:shadow-md transition-shadow bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 border border-white/85 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-semibold text-[#41533E] font-khmer-heading">
              ចំណងដៃសរុប (USD)
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Banknote className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#212E1E] font-sans">
              {formatCurrency(summaryUSD?.totalAmount || 0, 'USD')}
            </div>
            <div className="mt-2 text-[11px] text-[#63765E] flex justify-between border-t border-[#F0EAE1] pt-2">
              <span>សាច់ប្រាក់: {formatCurrency(summaryUSD?.totalCash || 0, 'USD')}</span>
              <span>KHQR: {formatCurrency(summaryUSD?.totalQr || 0, 'USD')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Total KHR Card */}
        <Card className="hover:shadow-md transition-shadow bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 border border-white/85 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-semibold text-[#41533E] font-khmer-heading">
              ចំណងដៃសរុប (KHR)
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-[#EAE2D2] flex items-center justify-center text-[#7C622D]">
              <Banknote className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#212E1E] font-sans">
              {formatCurrency(summaryKHR?.totalAmount || 0, 'KHR')}
            </div>
            <div className="mt-2 text-[11px] text-[#63765E] flex justify-between border-t border-[#F0EAE1] pt-2">
              <span>សាច់ប្រាក់: {formatCurrency(summaryKHR?.totalCash || 0, 'KHR')}</span>
              <span>KHQR: {formatCurrency(summaryKHR?.totalQr || 0, 'KHR')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Envelopes Count */}
        <Card className="hover:shadow-md transition-shadow bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 border border-white/85 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-semibold text-[#41533E] font-khmer-heading">
              ចំនួនស្រោមសំបុត្រសរុប
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-[#EAF0E7] flex items-center justify-center text-[#243521]">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#212E1E] font-sans">
              {totalEnvelopes}
            </div>
            <p className="mt-2 text-[11px] text-[#63765E] border-t border-[#F0EAE1] pt-2">
              {summaryUSD?.countCash || 0} សាច់ប្រាក់ • {summaryUSD?.countQr || 0} KHQR
            </p>
          </CardContent>
        </Card>

        {/* Attendance Card */}
        <Card className="hover:shadow-md transition-shadow bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 border border-white/85 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-semibold text-[#41533E] font-khmer-heading">
              វត្តមានភ្ញៀវកិត្តិយស
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center text-[#9E7B35]">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#212E1E] font-sans">
              {attendedGuests} / {totalGuests}
            </div>
            <p className="mt-2 text-[11px] text-[#63765E] border-t border-[#F0EAE1] pt-2">
              {totalGuests > 0
                ? `អត្រាវត្តមាន ${Math.round((attendedGuests / totalGuests) * 100)}%`
                : 'បញ្ចូលបញ្ជីភ្ញៀវដើម្បីតាមដានវត្តមាន'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts: Money (Bar) & Guest Attendance (Pie) */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Chart 1: Dual Currency Bar Chart (USD & KHR) */}
        <Card className="lg:col-span-7 bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 border border-white/85 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-[#212E1E] font-khmer-heading">
                វិភាគចំណងដៃតាមរូបិយប័ណ្ណ (USD &amp; KHR)
              </CardTitle>
              <p className="text-xs text-[#5C6E57] font-khmer-body mt-0.5">
                ប្រៀបធៀបសាច់ប្រាក់សុទ្ធ និង KHQR ជាប្រាក់ដុល្លារ និងប្រាក់រៀល
              </p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-[#EAF0E7] border border-[#C59F54]/30 flex items-center justify-center text-[#243521] shrink-0">
              <BarChart3 className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={moneyChartConfig} className="h-[260px] w-full aspect-auto">
              <BarChart data={moneyChartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="font-khmer-heading text-xs"
                />
                <YAxis
                  yAxisId="usd"
                  orientation="left"
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tickFormatter={(v) => `$${Number(v).toLocaleString()}`}
                />
                <YAxis
                  yAxisId="khr"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tickFormatter={(v) =>
                    Number(v) >= 1000000
                      ? `${(Number(v) / 1000000).toFixed(1)}M៛`
                      : Number(v) >= 1000
                      ? `${Math.round(Number(v) / 1000)}K៛`
                      : `${v}៛`
                  }
                />
                <ChartTooltip
                  cursor={{ fill: 'rgba(197, 159, 84, 0.1)' }}
                  content={
                    <ChartTooltipContent
                      valueFormatter={(val, key) =>
                        key === 'usd'
                          ? formatCurrency(Number(val), 'USD')
                          : formatCurrency(Number(val), 'KHR')
                      }
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  yAxisId="usd"
                  dataKey="usd"
                  fill="var(--color-usd)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={36}
                />
                <Bar
                  yAxisId="khr"
                  dataKey="khr"
                  fill="var(--color-khr)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Guest Attendance Pie / Donut Chart */}
        <Card className="lg:col-span-5 bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 border border-white/85 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] rounded-2xl flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-[#212E1E] font-khmer-heading">
                ស្ថិតិវត្តមានភ្ញៀវកិត្តិយស
              </CardTitle>
              <p className="text-xs text-[#5C6E57] font-khmer-body mt-0.5">
                សមាមាត្រភ្ញៀវបានមកដល់ និងមិនទាន់មក
              </p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-amber-50 border border-[#C59F54]/30 flex items-center justify-center text-[#9E7B35] shrink-0">
              <PieChartIcon className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between pt-2">
            <div className="relative flex items-center justify-center">
              <ChartContainer config={guestChartConfig} className="h-[200px] w-full aspect-auto">
                <PieChart>
                  {totalGuests > 0 && (
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          hideLabel
                          nameKey="status"
                          valueFormatter={(val) => `${val} នាក់`}
                        />
                      }
                    />
                  )}
                  <Pie
                    data={guestChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={84}
                    paddingAngle={totalGuests > 0 && attendedGuests > 0 && absentGuests > 0 ? 4 : 0}
                    cornerRadius={6}
                    strokeWidth={0}
                  >
                    {guestChartData.map((entry) => (
                      <Cell key={entry.status} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>

              {/* Center Donut Summary */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-[#212E1E] font-sans">
                  {attendanceRate}%
                </span>
                <span className="text-[11px] font-semibold text-[#5C6E57] font-khmer-heading">
                  វត្តមាន
                </span>
              </div>
            </div>

            {/* Bottom Legend Pills */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-white/60 font-khmer-heading text-xs">
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/35 border border-white/70">
                <div className="flex items-center gap-2 text-[#212E1E]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#243521] shrink-0" />
                  <span className="font-medium">បានមកដល់</span>
                </div>
                <span className="font-bold text-[#243521] font-sans">{attendedGuests}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/35 border border-white/70">
                <div className="flex items-center gap-2 text-[#212E1E]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#C59F54] shrink-0" />
                  <span className="font-medium">មិនទាន់មក</span>
                </div>
                <span className="font-bold text-[#8C6D23] font-sans">{absentGuests}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6 bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 border border-white/85 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] rounded-2xl shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 text-left">
              <h3 className="font-khmer-heading font-bold text-base text-[#212E1E]">
                ផ្ទៀងផ្ទាត់បេឡាសាច់ប្រាក់ចុងកម្មវិធី
              </h3>
              <p className="font-khmer-body text-xs sm:text-sm text-[#5C6E57]">
                ផ្ទៀងផ្ទាត់សាច់ប្រាក់សុទ្ធក្នុងហឹបរបស់ក្រឡាបញ្ជីនីមួយៗមុននឹងបិទតុទទួលភ្ញៀវ។
              </p>
            </div>
            <Link href="/reconciliation">
              <Button
                variant="outline"
                size="sm"
                className="font-khmer-heading text-xs font-semibold rounded-xl border-[#D8C7A8] text-[#243521] hover:bg-[#EAE4D5]"
              >
                ពិនិត្យបេឡា <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 border border-white/85 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] rounded-2xl shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 text-left">
              <h3 className="font-khmer-heading font-bold text-base text-[#212E1E]">
                គណនីធនាគារ &amp; QR ទទួលប្រាក់
              </h3>
              <p className="font-khmer-body text-xs sm:text-sm text-[#5C6E57]">
                គ្រប់គ្រងគណនីធនាគារ ABA និង ACLEDA របស់គូស្នេហ៍សម្រាប់ទទួលប្រាក់តាម KHQR។
              </p>
            </div>
            <Link href="/settings">
              <Button
                variant="outline"
                size="sm"
                className="font-khmer-heading text-xs font-semibold rounded-xl border-[#D8C7A8] text-[#243521] hover:bg-[#EAE4D5]"
              >
                គ្រប់គ្រងធនាគារ <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
