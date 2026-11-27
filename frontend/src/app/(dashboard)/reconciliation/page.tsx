'use client';

import { useRouter } from 'next/navigation';
import { useActiveWedding } from '@/context/wedding-context';
import { useClerkReconciliation } from '@/hooks/use-gifts';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { CreditCard, Banknote, QrCode, User, Users, Loader2, ArrowRight } from 'lucide-react';

export default function ReconciliationPage() {
  const router = useRouter();
  const { activeWeddingId: weddingId } = useActiveWedding();

  const { data: reconciliations, isLoading } = useClerkReconciliation(weddingId);

  return (
    <div className="space-y-6 font-khmer-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-khmer-body text-2xl sm:text-3xl font-bold tracking-tight text-[#212E1E]">
            ផ្ទៀងផ្ទាត់បេឡាសាច់ប្រាក់ចុងកម្មវិធី
          </h1>
          <p className="font-khmer-body text-xs sm:text-sm text-[#5C6E57] mt-1">
            ផ្ទៀងផ្ទាត់ចំនួនទឹកប្រាក់ជាក់ស្តែងក្នុងហឹបរបស់អ្នកកត់ត្រានីមួយៗ ឱ្យត្រូវគ្នាជាមួយរបាយការណ៍ប្រព័ន្ធមុននឹងប្រគល់ជូនម្ចាស់ដើមការ។
          </p>
        </div>

        {!isLoading && reconciliations && reconciliations.length > 0 && (
          <Button
            onClick={() => router.push('/reconciliation/all')}
            className="bg-[#243521] hover:bg-[#1A2617] text-white font-khmer-heading font-bold rounded-full px-6 py-2.5 shadow-md border border-[#C59F54]/40 cursor-pointer transition-all hover:scale-[1.02] shrink-0"
          >
            <Users className="mr-2 h-4 w-4 text-[#E6C673]" />
            <span>មើលទាំងអស់</span>
            <ArrowRight className="ml-2 h-4 w-4 text-[#E6C673]" />
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col h-64 items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#4E8B7C]" />
          <p className="text-sm font-semibold text-[#3E513A] font-khmer-heading">
            កំពុងគណនាបេឡារបស់អ្នកកត់ត្រា...
          </p>
        </div>
      ) : !reconciliations || reconciliations.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 border border-white/85 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] rounded-3xl">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-[#EAF0E7] flex items-center justify-center text-[#243521] mb-3 border border-[#C59F54]/30">
            <CreditCard className="h-7 w-7 text-[#C59F54]" />
          </div>
          <h3 className="font-khmer-heading text-lg font-bold text-[#212E1E]">
            មិនទាន់មានទិន្នន័យកត់ត្រានៅឡើយទេ
          </h3>
          <p className="text-xs text-[#63765E] mt-1 max-w-sm mx-auto">
            នៅពេលអ្នកកត់ត្រាចាប់ផ្តើមកត់ត្រាចំណងដៃនៅតុទទួលភ្ញៀវ របាយការណ៍បេឡានឹងបង្ហាញនៅទីនេះដោយស្វ័យប្រវត្តិ។
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {reconciliations.map((clerk, idx) => (
            <Card
              key={clerk.clerkId || idx}
              onClick={() => clerk.clerkId && router.push(`/reconciliation/${clerk.clerkId}`)}
              className="group cursor-pointer border border-white/85 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-[#C59F54]/70 transition-all duration-300"
            >
              {/* Header: Royal Emerald Gradient */}
              <div className="bg-gradient-to-r from-[#1A2818]/85 via-[#283C25]/85 to-[#1A2818]/85 backdrop-blur-xl p-4 sm:p-5 text-white flex items-center justify-between border-b border-[#C59F54]/40">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center font-bold text-[#FAF8F3]">
                    <User className="h-5 w-5 text-[#E6C673]" />
                  </div>
                  <div>
                    <h3 className="font-khmer-heading font-bold text-base leading-tight text-white">
                      {clerk.clerkName}
                    </h3>
                    <p className="font-khmer-body text-xs text-[#D7E4D4] mt-0.5">
                      បានកត់ត្រា {clerk.totalEnvelopes} ស្រោមសំបុត្រ
                    </p>
                  </div>
                </div>
                <Badge className="bg-[#FAF8F3] text-[#1E2C1B] hover:bg-white border-none font-khmer-heading font-bold text-xs px-2.5 py-1">
                  អ្នកកត់ត្រា #{idx + 1}
                </Badge>
              </div>

              <CardContent className="p-5 sm:p-6 space-y-4">
                {/* Physical Cash Box Section */}
                <div className="rounded-xl bg-emerald-50/60 backdrop-blur-md p-4 border border-emerald-200/70">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs sm:text-sm mb-2 font-khmer-heading">
                    <Banknote className="h-4 w-4 text-emerald-700" />
                    <span>សាច់ប្រាក់សុទ្ធក្នុងហឹប</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] text-emerald-700 font-medium">សាច់ប្រាក់ដុល្លារ (USD)</p>
                      <p className="text-xl font-extrabold text-emerald-950 font-sans">
                        {formatCurrency(clerk.cashUSD, 'USD')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-emerald-700 font-medium">សាច់ប្រាក់រៀល (KHR)</p>
                      <p className="text-xl font-extrabold text-emerald-950 font-sans">
                        {formatCurrency(clerk.cashKHR, 'KHR')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* QR Online Payments Section */}
                <div className="rounded-xl bg-[#EAE4D5]/55 backdrop-blur-md p-4 border border-[#D5C7AE]/80">
                  <div className="flex items-center gap-2 text-[#46381C] font-bold text-xs sm:text-sm mb-2 font-khmer-heading">
                    <QrCode className="h-4 w-4 text-[#8C6F2D]" />
                    <span>ទូទាត់តាម KHQR ធនាគារ</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] text-[#7C622D] font-medium">KHQR ដុល្លារ (USD)</p>
                      <p className="text-lg font-bold text-[#2A200B] font-sans">
                        {formatCurrency(clerk.qrUSD, 'USD')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#7C622D] font-medium">KHQR រៀល (KHR)</p>
                      <p className="text-lg font-bold text-[#2A200B] font-sans">
                        {formatCurrency(clerk.qrKHR, 'KHR')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Combined Total & Navigate Hint */}
                <div className="pt-3 border-t border-white/60 flex items-center justify-between text-xs text-[#5C6E57] font-semibold font-khmer-heading">
                  <span>សរុបថវិកាដែលបានកត់ត្រា:</span>
                  <span className="text-[#212E1E] font-sans font-bold">
                    {formatCurrency(clerk.totalUSD, 'USD')} + {formatCurrency(clerk.totalKHR, 'KHR')}
                  </span>
                </div>
                <div className="flex items-center justify-end text-[11px] font-khmer-heading font-semibold text-[#8C6D23] group-hover:text-[#243521] transition-colors">
                  <span>ចុចដើម្បីមើលបញ្ជីភ្ញៀវ &amp; លម្អិត</span>
                  <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
