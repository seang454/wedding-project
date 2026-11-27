'use client';

import { use, useState } from 'react';
import { useWeddings, useBankAccounts } from '@/hooks/use-weddings';
import { usePresignedUploadUrl } from '@/hooks/use-gifts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, Calendar, MapPin, QrCode, Upload, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function InvitationClient({
  params,
}: {
  params: Promise<{ weddingSlug: string }>;
}) {
  const { weddingSlug } = use(params);
  const { data: weddings, isLoading } = useWeddings();
  const wedding = weddings && weddings.length > 0 ? weddings[0] : null;
  const weddingId = wedding?.id || '';

  const { data: bankAccounts } = useBankAccounts(weddingId);
  const primaryBank = bankAccounts?.find((b) => b.isPrimary) || bankAccounts?.[0];
  const getPresignedUrl = usePresignedUploadUrl();

  const [guestName, setGuestName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'KHR'>('USD');
  const [wishes, setWishes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingSlip(true);
      const ticket = await getPresignedUrl.mutateAsync({
        fileName: file.name,
        contentType: file.type || 'image/jpeg',
      });

      await fetch(ticket.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'image/jpeg' },
        body: file,
      });

      setReceiptUrl(ticket.fileUrl);
      toast.success('Payment receipt attached!');
    } catch {
      toast.error('Failed to upload receipt');
    } finally {
      setUploadingSlip(false);
    }
  };

  const handleOnlineGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !amount) {
      return toast.error('Please enter your name and amount');
    }

    try {
      // Send gift to backend
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/gifts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weddingId,
            guestNameSnapshot: guestName,
            amount: parseFloat(amount),
            currency,
            paymentMethod: 'QR_CODE',
            bankAccountId: primaryBank?.id,
            receiptImageUrl: receiptUrl || undefined,
            wishes: wishes || undefined,
          }),
        },
      );

      if (res.ok) {
        setSubmitted(true);
        toast.success('Thank you for your blessing & wedding gift!');
      } else {
        toast.error('Failed to submit gift');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F3]">
        <p className="text-[#5C6E57] font-khmer-body">កំពុងដំណើរការសំបុត្រអាពាហ៍ពិពាហ៍...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-[#FAF8F3]">
        <Card className="w-full max-w-md p-8 text-center border border-[#C59F54]/30 shadow-xl bg-white rounded-2xl">
          <CheckCircle2 className="mx-auto h-16 w-16 text-[#4E8B7C] mb-3" />
          <h2 className="text-2xl font-bold text-[#243521] font-khmer-body">សូមអរគុណ!</h2>
          <p className="text-sm text-[#5C6E57] mt-2 font-khmer-body">
            ពរជ័យ និងចំណងដៃមង្គលការរបស់លោកអ្នកត្រូវបានកត់ត្រាជូនគូស្វាមីភរិយា{' '}
            <span className="font-semibold text-[#243521]">
              {wedding?.groomName} & {wedding?.brideName}
            </span>
            {' '}រួចរាល់ហើយ។
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#FAF8F3] py-12 px-4 overflow-hidden font-khmer-body">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-40 mix-blend-multiply"
        style={{ backgroundImage: "url('/background/background.jpg')" }}
      />
      <div className="fixed inset-0 z-0 bg-[#FAF8F3]/60 pointer-events-none" />
      <div className="relative z-10 max-w-xl mx-auto space-y-6">
        {/* Invitation Hero */}
        <Card className="overflow-hidden border border-[#C59F54]/30 shadow-xl bg-white text-center rounded-3xl">
          <div className="bg-gradient-to-r from-[#243521] via-[#2F442C] to-[#1C2B1A] p-8 text-white space-y-3">
            <Heart className="mx-auto h-10 w-10 fill-[#E6C673] text-[#E6C673] animate-pulse" />
            <p className="text-xs tracking-widest uppercase font-semibold text-[#E6C673] font-khmer-heading">
              សិរីសួស្តី អាពាហ៍ពិពាហ៍
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight font-khmer-body text-[#FAF8F3]">
              {wedding?.groomName || 'កូនកំលោះ'} & {wedding?.brideName || 'កូនក្រមុំ'}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#E6C673] pt-2">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {wedding?.weddingDate
                  ? new Date(wedding.weddingDate).toLocaleDateString('km-KH', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'ឆាប់ៗនេះ'}
              </span>
              {wedding?.venue && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {wedding.venue}
                </span>
              )}
            </div>
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Primary QR Code for Online Banking */}
            {primaryBank?.qrImageUrl ? (
              <div className="space-y-3 rounded-2xl bg-[#FAF8F3] p-6 border border-[#C59F54]/30">
                <Badge variant="outline" className="border-[#C59F54] text-[#243521] bg-white font-khmer-heading">
                  📱 ស្កេនចងដៃតាមរយៈ KHQR ធនាគារ
                </Badge>
                <div className="mx-auto w-48 h-48 bg-white p-3 rounded-2xl shadow-md border border-[#D8C7A8] flex items-center justify-center">
                  <img
                    src={primaryBank.qrImageUrl}
                    alt="Couple Bank QR"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-xs text-gray-600">
                  <p className="font-bold text-gray-900">{primaryBank.bankName}</p>
                  <p>{primaryBank.accountName}</p>
                  <p className="font-mono text-gray-500">{primaryBank.accountNumber}</p>
                </div>
              </div>
            ) : null}

            {/* Gift confirmation form */}
            <form onSubmit={handleOnlineGift} className="space-y-4 text-left">
              <h3 className="font-bold text-sm text-gray-900 text-center">
                Send Blessing & Confirm Online Transfer
              </h3>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Your Full Name</label>
                <Input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Sok San"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Gift Amount</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount sent"
                    required
                    className="font-bold text-base"
                  />
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant={currency === 'USD' ? 'default' : 'outline'}
                      onClick={() => setCurrency('USD')}
                      className="w-16"
                    >
                      USD
                    </Button>
                    <Button
                      type="button"
                      variant={currency === 'KHR' ? 'default' : 'outline'}
                      onClick={() => setCurrency('KHR')}
                      className="w-16"
                    >
                      KHR
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  Attach Payment Slip (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="text-xs file:mr-2 file:rounded-md file:border-0 file:bg-[#243521] file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-[#E6C673] hover:file:bg-[#1A2617] cursor-pointer"
                  />
                  {uploadingSlip && <Loader2 className="h-4 w-4 animate-spin text-[#243521]" />}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  Wedding Wishes (Optional)
                </label>
                <Input
                  value={wishes}
                  onChange={(e) => setWishes(e.target.value)}
                  placeholder="Wishing you eternal joy and happiness!"
                />
              </div>

              <Button type="submit" size="lg" className="w-full mt-2">
                Send Wedding Blessing
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
