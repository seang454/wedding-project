'use client';

import { useState } from 'react';
import { useWeddings, useBankAccounts, useAddBankAccount, useSetPrimaryBank, useDeleteBankAccount } from '@/hooks/use-weddings';
import { useActiveWedding } from '@/context/wedding-context';
import { usePresignedUploadUrl } from '@/hooks/use-gifts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditCard, QrCode, Plus, Star, Loader2, Trash2, AlertTriangle, Copy, Check, ZoomIn, Download, Sparkles, X, Upload, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { activeWedding: currentWedding, activeWeddingId: weddingId } = useActiveWedding();

  const { data: bankAccounts, isLoading } = useBankAccounts(weddingId);
  const addBankMutation = useAddBankAccount(weddingId);
  const setPrimaryMutation = useSetPrimaryBank(weddingId);
  const deleteBankMutation = useDeleteBankAccount(weddingId);
  const getPresignedUrl = usePresignedUploadUrl();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteBankId, setDeleteBankId] = useState<string | null>(null);
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewQr, setPreviewQr] = useState<{
    url: string;
    title: string;
    accountName: string;
    accountNumber: string;
  } | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('បានចម្លងលេខគណនីរួចរាល់!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadQr = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('បានទាញយករូបភាព QR!');
  };

  // Upload QR code image directly to S3
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingQr(true);
      const ticket = await getPresignedUrl.mutateAsync({
        fileName: file.name,
        contentType: file.type || 'image/png',
        folder: 'qr-codes',
      });

      await fetch(ticket.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'image/png' },
        body: file,
      });

      setQrImageUrl(ticket.fileUrl);
      toast.success('បានបញ្ចូលរូបភាព QR Code ដោយជោគជ័យ!');
    } catch {
      toast.error('មានបញ្ហាក្នុងការបញ្ចូល QR Code');
    } finally {
      setUploadingQr(false);
    }
  };

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weddingId) {
      return toast.error('សូមជ្រើសរើស ឬបង្កើតមង្គលការជាមុនសិន!');
    }
    if (!bankName || !accountName || !accountNumber) {
      return toast.error('សូមបំពេញព័ត៌មានធនាគារឱ្យបានគ្រប់ជ្រុងជ្រោយ');
    }

    try {
      await addBankMutation.mutateAsync({
        weddingId,
        bankName,
        accountName,
        accountNumber,
        qrImageUrl: qrImageUrl || undefined,
        isPrimary,
      });

      toast.success('បានរក្សាទុកគណនីធនាគារដោយជោគជ័យ!');
      setBankName('');
      setAccountName('');
      setAccountNumber('');
      setQrImageUrl('');
      setIsModalOpen(false);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message ||
        (err as Error)?.message ||
        'មានបញ្ហាក្នុងការបន្ថែមគណនីធនាគារ';
      const displayMsg = Array.isArray(errorMsg) ? errorMsg.join(', ') : String(errorMsg);
      toast.error(displayMsg);
    }
  };

  const handleSetPrimary = async (bankId: string) => {
    try {
      await setPrimaryMutation.mutateAsync(bankId);
      toast.success('បានកំណត់ជា QR ទទួលប្រាក់ចម្បង!');
    } catch {
      toast.error('មានបញ្ហាក្នុងការកំណត់ QR ចម្បង');
    }
  };

  const handleDeleteBank = async () => {
    if (!deleteBankId) return;
    try {
      await deleteBankMutation.mutateAsync(deleteBankId);
      toast.success('បានលុបគណនីធនាគារដោយជោគជ័យ!');
      setDeleteBankId(null);
    } catch {
      toast.error('មានបញ្ហាក្នុងការលុបគណនីធនាគារ');
    }
  };

  return (
    <div className="space-y-6 font-khmer-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-khmer-body text-2xl sm:text-3xl font-bold tracking-tight text-[#212E1E]">
            គណនីធនាគារ &amp; QR ទទួលប្រាក់
          </h1>
          <p className="font-khmer-body text-xs sm:text-sm text-[#5C6E57] mt-1">
            រៀបចំគណនីធនាគារ ABA និង ACLEDA របស់គូស្វាមីភរិយា សម្រាប់ឱ្យភ្ញៀវស្កេនជូនចំណងដៃតាម KHQR។
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#243521] hover:bg-[#1A2617] text-white font-khmer-heading font-semibold rounded-full px-5 shadow-md border border-[#C59F54]/40 cursor-pointer"
        >
          <Plus className="mr-1.5 h-4 w-4 text-[#E6C673]" /> បន្ថែមគណនីធនាគារ
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col h-64 items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#4E8B7C]" />
          <p className="text-sm font-semibold text-[#3E513A] font-khmer-heading">
            កំពុងផ្ទុកគណនីធនាគារ...
          </p>
        </div>
      ) : !bankAccounts || bankAccounts.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 border border-white/85 rounded-3xl shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)]">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-[#EAF0E7] flex items-center justify-center text-[#243521] mb-3 border border-[#C59F54]/30">
            <CreditCard className="h-7 w-7 text-[#C59F54]" />
          </div>
          <h3 className="font-khmer-heading text-lg font-bold text-[#212E1E]">
            មិនទាន់មានគណនីធនាគារនៅឡើយទេ
          </h3>
          <p className="text-xs text-[#63765E] mt-1 mb-5 max-w-sm mx-auto font-khmer-body">
            សូមបន្ថែមគណនី ABA ឬ ACLEDA អមដោយរូបភាព KHQR ដើម្បីឱ្យភ្ញៀវអាចស្កេនជូនចំណងដៃបានយ៉ាងងាយស្រួល។
          </p>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#243521] hover:bg-[#1A2617] text-white font-khmer-heading rounded-full px-6"
          >
            + បន្ថែមគណនីធនាគារ
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {bankAccounts.map((account) => (
            <div
              key={account.id}
              className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 border border-white/85 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* CARD TOP - FULL-CARD KHQR IMAGE */}
              <div className="relative w-full bg-white/80 backdrop-blur-sm border-b border-[#C59F54]/30 overflow-hidden flex flex-col items-center justify-center">
                {account.qrImageUrl ? (
                  <div className="relative group w-full">
                    <img
                      src={account.qrImageUrl}
                      alt={`${account.bankName} QR`}
                      className="w-full h-auto max-h-[420px] object-contain mx-auto block cursor-pointer"
                      onClick={() =>
                        setPreviewQr({
                          url: account.qrImageUrl!,
                          title: account.bankName,
                          accountName: account.accountName,
                          accountNumber: account.accountNumber,
                        })
                      }
                    />

                    {/* Hover Overlay */}
                    <div
                      onClick={() =>
                        setPreviewQr({
                          url: account.qrImageUrl!,
                          title: account.bankName,
                          accountName: account.accountName,
                          accountNumber: account.accountNumber,
                        })
                      }
                      className="absolute inset-0 bg-black/35 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer text-white font-khmer-heading text-xs font-semibold gap-1.5"
                    >
                      <ZoomIn className="w-4 h-4 text-[#E6C673]" />
                      <span>ចុចដើម្បីមើលរូបធំ</span>
                    </div>

                    {/* Floating Quick Action Buttons on Bottom-Right of QR */}
                    <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewQr({
                            url: account.qrImageUrl!,
                            title: account.bankName,
                            accountName: account.accountName,
                            accountNumber: account.accountNumber,
                          })
                        }
                        className="px-2.5 py-1.5 rounded-xl bg-white/85 hover:bg-white backdrop-blur-md border border-[#D8C7A8] text-[#243521] text-[11px] font-khmer-heading font-semibold flex items-center gap-1 shadow-md transition-all cursor-pointer"
                      >
                        <ZoomIn className="w-3.5 h-3.5 text-[#C59F54]" />
                        មើលរូបធំ
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleDownloadQr(
                            account.qrImageUrl!,
                            `KHQR_${account.bankName}_${account.accountNumber}.png`,
                          )
                        }
                        className="px-2.5 py-1.5 rounded-xl bg-white/85 hover:bg-white backdrop-blur-md border border-[#D8C7A8] text-[#243521] text-[11px] font-khmer-heading font-semibold flex items-center gap-1 shadow-md transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-[#C59F54]" />
                        ទាញយក
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center w-full p-6">
                    <QrCode className="w-10 h-10 mx-auto text-[#C59F54]/50 mb-2" />
                    <p className="text-xs text-[#8A9C84] font-khmer-body">
                      មិនទាន់បានបញ្ចូលរូបភាព KHQR នៅឡើយទេ
                    </p>
                  </div>
                )}
              </div>

              {/* CARD MIDDLE - VIRTUAL LUXURY BANK CARD */}
              <div className="relative p-5 sm:p-6 bg-gradient-to-br from-[#1A2817]/85 via-[#243A21]/85 to-[#131F11]/85 backdrop-blur-xl text-white border-b border-[#C59F54]/30 overflow-hidden flex-1 flex flex-col justify-between">
                {/* Radial Glow Accents */}
                <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#C59F54]/15 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-[#3F6239]/20 blur-xl pointer-events-none" />

                {/* Top Row: Bank Info & Primary Badge */}
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#C59F54]/30 to-[#243521] border border-[#C59F54]/50 flex items-center justify-center text-[#E6C673] shadow-inner shrink-0">
                      <CreditCard className="h-5 w-5 text-[#E6C673]" />
                    </div>
                    <div>
                      <h3 className="font-khmer-heading text-lg font-bold text-white tracking-wide leading-tight">
                        {account.bankName}
                      </h3>
                      <p className="font-khmer-body text-xs text-[#C8D6C3] tracking-wider uppercase font-medium mt-0.5">
                        {account.accountName}
                      </p>
                    </div>
                  </div>

                  {account.isPrimary ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#DFB76C] via-[#E9CA7C] to-[#C59F54] text-[#1E2C1B] font-khmer-heading font-extrabold text-xs shadow-md border border-[#FFF2D0]/60 shrink-0">
                      <Star className="h-3.5 w-3.5 fill-[#1E2C1B] text-[#1E2C1B]" />
                      QR ចម្បង
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs font-khmer-heading rounded-full border-[#C59F54]/60 bg-white/10 hover:bg-[#C59F54] hover:text-[#1E2C1B] text-[#E6C673] backdrop-blur-sm transition-all cursor-pointer shrink-0"
                      onClick={() => handleSetPrimary(account.id)}
                    >
                      + កំណត់ជា QR ចម្បង
                    </Button>
                  )}
                </div>

                {/* Middle Row: Gold Chip & KHQR Accepted */}
                <div className="relative flex items-center justify-between mt-4 pt-1">
                  {/* Realistic Gold EMV Chip Graphic */}
                  <div className="w-10 h-7 rounded-md bg-gradient-to-br from-[#F5D88A] via-[#C59F54] to-[#8F6A1C] p-[2px] shadow-sm border border-[#FFE7A8]/70 flex items-center justify-center">
                    <div className="w-full h-full border border-black/25 rounded-[3px] grid grid-cols-2 gap-0.5 opacity-60">
                      <div className="border-r border-b border-black/30" />
                      <div className="border-b border-black/30" />
                      <div className="border-r border-black/30" />
                      <div />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/30 border border-[#C59F54]/30 text-[10px] font-mono text-[#E6C673] tracking-widest font-semibold">
                    <Sparkles className="w-3 h-3 text-[#E6C673]" />
                    <span>KHQR ACCEPTED</span>
                  </div>
                </div>

                {/* Bottom Row: Account Number Box with 1-Click Copy */}
                <div className="relative mt-3 p-3 rounded-2xl bg-black/30 backdrop-blur-md border border-[#C59F54]/30 flex items-center justify-between gap-3 shadow-inner">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-[#A1B39D] font-khmer-heading font-semibold">
                      លេខគណនីធនាគារ (ACCOUNT NUMBER)
                    </span>
                    <p className="font-mono text-base sm:text-lg font-bold tracking-widest text-[#FFF8EB] drop-shadow-sm mt-0.5">
                      {account.accountNumber}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(account.id, account.accountNumber)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-[#C59F54] hover:text-[#1E2C1B] border border-[#C59F54]/40 text-[#E6C673] text-xs font-khmer-heading flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
                    title="ចម្លងលេខគណនី"
                  >
                    {copiedId === account.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300 font-bold">បានចម្លង</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#E6C673]" />
                        <span>ចម្លង</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* CARD FOOTER - STATUS & ELEGANT DELETE */}
              <div className="px-5 py-3.5 bg-white/25 backdrop-blur-sm border-t border-white/70 flex items-center justify-between">
                {account.isPrimary ? (
                  <div className="flex items-center gap-2 text-xs text-emerald-700 font-khmer-heading font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                    </span>
                    <span>បង្ហាញលើតុទទួលភ្ញៀវ &amp; ធៀបការ</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-[#63765E] font-khmer-heading">
                    <span className="w-2 h-2 rounded-full bg-[#B3C2AF]" />
                    <span>គណនីបម្រុង</span>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteBankId(account.id)}
                  className="h-8 px-2.5 text-xs font-khmer-heading text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>លុបគណនី</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DELETE BANK CONFIRM MODAL */}
      <Dialog open={!!deleteBankId} onOpenChange={(o) => !o && setDeleteBankId(null)}>
        <DialogContent onClose={() => setDeleteBankId(null)} className="bg-[#FAF8F3] border-[#E8DFC9] rounded-3xl font-khmer-body max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-khmer-heading text-base font-bold text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> បញ្ជាក់ការលុប
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#5C6E57] font-khmer-body">
            តើអ្នកប្រាកដថាចង់លុបគណនីធនាគារនេះ? ទង្វើនេះមិនអាចដោះស្រាយបានឡើងវិញ។
          </p>
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              className="flex-1 font-khmer-heading rounded-xl border-[#D8C7A8]"
              onClick={() => setDeleteBankId(null)}
            >
              បោះបង់
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-khmer-heading rounded-xl"
              onClick={handleDeleteBank}
              disabled={deleteBankMutation.isPending}
            >
              {deleteBankMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              លុបចោល
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PREVIEW KHQR MODAL */}
      <Dialog open={!!previewQr} onOpenChange={(o) => !o && setPreviewQr(null)}>
        <DialogContent onClose={() => setPreviewQr(null)} className="bg-[#FAF8F3] border-[#E8DFC9] rounded-3xl font-khmer-body max-w-sm text-center p-6">
          <DialogHeader>
            <DialogTitle className="font-khmer-heading text-lg font-bold text-[#212E1E] flex items-center justify-center gap-2">
              <QrCode className="h-5 w-5 text-[#C59F54]" />
              {previewQr?.title || 'KHQR Code'}
            </DialogTitle>
          </DialogHeader>

          {previewQr && (
            <div className="space-y-4 pt-2">
              <div className="p-3 bg-white rounded-2xl border-2 border-[#E2D7C0] shadow-md inline-block">
                <img
                  src={previewQr.url}
                  alt={previewQr.title}
                  className="max-h-72 max-w-full object-contain mx-auto rounded-xl"
                />
              </div>

              <div className="bg-[#F4EFE6] p-3 rounded-2xl border border-[#E8DFC9] text-xs">
                <p className="font-semibold text-[#212E1E] font-khmer-heading">{previewQr.accountName}</p>
                <p className="font-mono text-[#5C6E57] tracking-wider mt-0.5">{previewQr.accountNumber}</p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                <Button
                  onClick={() => handleDownloadQr(previewQr.url, `KHQR_${previewQr.title}.png`)}
                  className="bg-[#243521] hover:bg-[#1A2617] text-white font-khmer-heading text-xs rounded-xl h-9 px-4 cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5 text-[#E6C673]" />
                  ទាញយករូបភាព QR
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPreviewQr(null)}
                  className="border-[#D8C7A8] text-[#3E513A] hover:bg-[#EAE4D5] font-khmer-heading text-xs rounded-xl h-9 px-4 cursor-pointer"
                >
                  បិទ
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ADD BANK MODAL (STRUCTURED STEPPED CARD UI) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} className="max-w-[95vw] sm:max-w-xl">
        <DialogContent className="p-0 overflow-hidden flex flex-col bg-[#FAF8F3] border border-[#E2D7C0] rounded-3xl font-khmer-body shadow-2xl">
          {/* Dynamic Animated Progress Bar */}
          {(() => {
            const fields = [
              Boolean(bankName.trim()),
              Boolean(accountName.trim()),
              Boolean(accountNumber.trim()),
              Boolean(qrImageUrl.trim()),
            ];
            const pct = Math.round((fields.filter(Boolean).length / fields.length) * 100);
            return (
              <div className="h-1.5 w-full bg-[#EAE3D3] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#243521] to-[#C59F54] rounded-r-full transition-all duration-500 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
            );
          })()}

          {/* Clean Header */}
          <div className="px-5 sm:px-6 py-4 bg-white border-b border-[#EFE9DC] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#F6EFE0] border border-[#C59F54]/30 flex items-center justify-center text-[#8C6D23] shrink-0">
                <CreditCard className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="font-khmer-body text-base font-bold text-[#212E1E] leading-tight">
                  បន្ថែមគណនីធនាគារទទួលប្រាក់
                </h2>
                <p className="text-xs text-[#63765E] mt-0.5">
                  ភ្ជាប់គណនី ABA ឬ ACLEDA សម្រាប់ស្កេន KHQR
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="h-8 w-8 rounded-full bg-[#FAF6EE] hover:bg-[#EFE9DC] text-[#63765E] hover:text-[#212E1E] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleAddBank} className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 overflow-y-auto">
            {/* Section Card 1: Bank Details */}
            <div className="bg-white rounded-2xl p-5 border border-[#E8DFC9] shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="h-6 w-6 rounded-full border border-[#C59F54] bg-[#F6EFE0] text-[#8C6D23] text-xs font-bold flex items-center justify-center shrink-0">
                  ១
                </span>
                <span className="text-sm font-semibold text-[#243521]">ព័ត៌មានគណនីធនាគារ</span>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-2.5 text-left">
                  <label className="text-xs font-medium text-[#3E513A] block">
                    ឈ្មោះធនាគារ <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="ឧ. ABA Bank (USD) ឬ ACLEDA"
                    required
                    className="bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl h-10 text-sm transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-2.5 text-left">
                    <label className="text-xs font-medium text-[#3E513A] block">
                      ឈ្មោះម្ចាស់គណនី <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="ឧ. SOK SAN & BOPHA"
                      required
                      className="bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl h-10 text-sm uppercase transition-all"
                    />
                  </div>

                  <div className="space-y-2.5 text-left">
                    <label className="text-xs font-medium text-[#3E513A] block">
                      លេខគណនីធនាគារ <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="ឧ. 001 234 567"
                      required
                      className="bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl h-10 text-sm font-mono tracking-wider transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section Card 2: KHQR Upload & Primary Setting */}
            <div className="bg-white rounded-2xl p-5 border border-[#E8DFC9] shadow-2xs space-y-3.5">
              <div className="flex items-center gap-2.5">
                <span className="h-6 w-6 rounded-full border border-[#C59F54] bg-[#F6EFE0] text-[#8C6D23] text-xs font-bold flex items-center justify-center shrink-0">
                  ២
                </span>
                <span className="text-sm font-semibold text-[#243521]">រូបភាព KHQR &amp; ការកំណត់</span>
              </div>

              <label className="flex flex-col items-center justify-center w-full p-4 rounded-xl border-2 border-dashed border-[#D8C7A8] hover:border-[#C59F54] bg-[#FAF8F3]/50 hover:bg-[#FAF6EE] transition-all cursor-pointer text-center group">
                {uploadingQr ? (
                  <div className="flex items-center gap-2 text-xs text-[#3E513A] py-2">
                    <Loader2 className="h-5 w-5 animate-spin text-[#C59F54]" />
                    <span>កំពុងផ្ទុកឡើងរូបភាព KHQR...</span>
                  </div>
                ) : qrImageUrl ? (
                  <div className="flex items-center gap-3 w-full">
                    <img
                      src={qrImageUrl}
                      alt="QR Preview"
                      className="h-14 w-14 object-contain rounded-xl border border-[#E8DFC9] bg-white p-1 shrink-0"
                    />
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-xs font-semibold text-emerald-700">✓ បានភ្ជាប់រូបភាព KHQR រួចរាល់</p>
                      <p className="text-xs text-[#63765E] mt-0.5 truncate">ចុចទីនេះដើម្បីផ្លាស់ប្តូររូបភាពថ្មី</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 py-1">
                    <div className="h-9 w-9 mx-auto rounded-xl bg-[#F6EFE0] border border-[#C59F54]/30 flex items-center justify-center text-[#C59F54] group-hover:scale-105 transition-transform">
                      <Upload className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-semibold text-[#212E1E]">ចុចដើម្បីជ្រើសរើសរូបភាព KHQR</p>
                    <p className="text-xs text-[#8A9C84]">គាំទ្រ PNG, JPG (ABA / ACLEDA KHQR)</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
              </label>

              <label className="flex items-center gap-2.5 pt-1 text-xs text-[#212E1E] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="h-4 w-4 rounded border-[#D8C7A8] text-[#243521] focus:ring-[#243521]"
                />
                <span className="font-medium">កំណត់ជា QR ចម្បងសម្រាប់ភ្ញៀវស្កេនលើធៀបការឌីជីថល</span>
              </label>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="h-10 px-5 rounded-xl border-[#D8C7A8] text-[#5C6E57] hover:bg-white cursor-pointer"
              >
                បោះបង់
              </Button>
              <Button
                type="submit"
                disabled={addBankMutation.isPending}
                className="h-10 px-6 bg-[#243521] hover:bg-[#1A2617] text-white font-semibold rounded-xl shadow-sm border border-[#C59F54]/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {addBankMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#E6C673]" />
                ) : (
                  <ShieldCheck className="h-4 w-4 text-[#E6C673]" />
                )}
                <span>រក្សាទុកគណនីធនាគារ</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
