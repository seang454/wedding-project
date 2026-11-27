'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { recordGiftSchema, RecordGiftFormData, RecordGiftFormInput } from '@/schemas/gift.schema';
import { useWeddings, useBankAccounts } from '@/hooks/use-weddings';
import { useActiveWedding } from '@/context/wedding-context';
import { useGifts, useRecordGift, useDeleteGift, usePresignedUploadUrl } from '@/hooks/use-gifts';
import { useGuestSearch } from '@/hooks/use-guests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { RowsPerPageSelect } from '@/components/common/rows-per-page-select';
import { CustomSelect } from '@/components/ui/custom-select';
import { formatCurrency, normalizeKhmerDigits } from '@/lib/utils';
import {
  getAllProvinces,
  getDistrictsByProvince,
  getCommunesByDistrict,
} from '@/lib/cambodia-locations';
import {
  Plus,
  Search,
  Banknote,
  QrCode,
  UserCheck,
  CheckCircle2,
  Loader2,
  Receipt,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Gift,
} from 'lucide-react';
import { toast } from 'sonner';

export default function GiftsPage() {
  const { activeWedding: currentWedding, activeWeddingId: weddingId } = useActiveWedding();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestSearch, setGuestSearch] = useState('');
  const [selectedGuestName, setSelectedGuestName] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [deleteGiftIds, setDeleteGiftIds] = useState<string[] | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Cascading Cambodia location states
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  const provinces = getAllProvinces();
  const districts = getDistrictsByProvince(selectedProvinceCode);
  const communes = getCommunesByDistrict(selectedDistrictCode);

  // Queries & Mutations
  const { data: giftsData, isLoading: loadingGifts } = useGifts(
    weddingId,
    page,
    limit,
    currencyFilter,
    paymentMethodFilter || undefined,
    tableSearch,
  );
  const { data: searchResults } = useGuestSearch(weddingId, guestSearch);
  const { data: bankAccounts } = useBankAccounts(weddingId);
  const recordGiftMutation = useRecordGift(weddingId);
  const deleteGiftMutation = useDeleteGift(weddingId);
  const getPresignedUrl = usePresignedUploadUrl();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RecordGiftFormInput>({
    resolver: zodResolver(recordGiftSchema) as never,
    defaultValues: {
      weddingId,
      currencyMode: 'KHR',
      currency: 'KHR',
      paymentMethod: 'CASH',
      amount: 60000,
      amountKHR: 60000,
      amountUSD: 15,
      side: 'BOTH',
      createGuestProfile: true,
    },
  });

  const currentCurrencyMode = watch('currencyMode') || 'KHR';
  const currentPaymentMethod = watch('paymentMethod');
  const isCreateGuest = watch('createGuestProfile');
  const uploadedReceiptUrl = watch('receiptImageUrl');

  // Open entry modal
  const openModal = () => {
    reset({
      weddingId,
      currencyMode: 'KHR',
      currency: 'KHR',
      paymentMethod: 'CASH',
      amount: 60000,
      amountKHR: 60000,
      amountUSD: 15,
      side: 'BOTH',
      createGuestProfile: true,
      phone: '',
      tableNumber: undefined,
      province: '',
      district: '',
      commune: '',
      village: '',
      guestNote: '',
      wishes: '',
    });
    setGuestSearch('');
    setSelectedGuestName('');
    setSelectedProvinceCode('');
    setSelectedDistrictCode('');
    setIsModalOpen(true);
  };

  // Select an existing guest from autocomplete
  const handleSelectGuest = (guest: {
    id: string;
    name: string;
    phone?: string;
    side?: 'GROOM' | 'BRIDE' | 'BOTH';
    tableNumber?: number;
    province?: string;
    district?: string;
    commune?: string;
    village?: string;
  }) => {
    setValue('guestId', guest.id);
    setValue('guestNameSnapshot', guest.name);
    setSelectedGuestName(guest.name);
    setValue('phone', guest.phone || '');
    setValue('tableNumber', guest.tableNumber);
    setValue('province', guest.province || '');
    setValue('district', guest.district || '');
    setValue('commune', guest.commune || '');
    setValue('village', guest.village || '');
    if (guest.side) setValue('side', guest.side);

    // Sync province selection if name matches
    if (guest.province) {
      const p = provinces.find((pr) => pr.nameKm === guest.province || pr.nameEn === guest.province);
      if (p) {
        setSelectedProvinceCode(p.code);
        if (guest.district) {
          const dList = getDistrictsByProvince(p.code);
          const d = dList.find((di) => di.nameKm === guest.district || di.nameEn === guest.district);
          if (d) setSelectedDistrictCode(d.code);
        }
      }
    }
    setGuestSearch('');
  };

  // Upload slip to S3 directly via presigned URL
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingSlip(true);
      const ticket = await getPresignedUrl.mutateAsync({
        fileName: file.name,
        contentType: file.type || 'image/jpeg',
      });

      // Upload binary to S3
      await fetch(ticket.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'image/jpeg' },
        body: file,
      });

      setValue('receiptImageUrl', ticket.fileUrl);
      toast.success('បានបញ្ចូលរូបភាពវិក្កយបត្រដោយជោគជ័យ!');
    } catch {
      toast.error('មានបញ្ហាក្នុងការបញ្ចូលវិក្កយបត្រ');
    } finally {
      setUploadingSlip(false);
    }
  };

  const onSubmit = async (raw: RecordGiftFormInput) => {
    try {
      const parsed = recordGiftSchema.parse(raw) as RecordGiftFormData;
      const payload: RecordGiftFormData = {
        ...parsed,
        weddingId,
      };

      if (parsed.currencyMode === 'USD') {
        payload.currency = 'USD';
        payload.amount = parsed.amountUSD;
        payload.amountUSD = parsed.amountUSD;
        payload.amountKHR = 0;
      } else if (parsed.currencyMode === 'KHR') {
        payload.currency = 'KHR';
        payload.amount = parsed.amountKHR;
        payload.amountKHR = parsed.amountKHR;
        payload.amountUSD = 0;
      } else {
        payload.currency = 'USD';
        payload.amount = parsed.amountUSD;
        payload.amountUSD = parsed.amountUSD;
        payload.amountKHR = parsed.amountKHR;
      }

      await recordGiftMutation.mutateAsync(payload);

      const summaryText =
        parsed.currencyMode === 'BOTH'
          ? `$${parsed.amountUSD} និង ${Number(parsed.amountKHR).toLocaleString()} ៛`
          : parsed.currencyMode === 'USD'
          ? `$${parsed.amountUSD}`
          : `${Number(parsed.amountKHR).toLocaleString()} ៛`;

      toast.success(`បានកត់ត្រា ${summaryText} ពី ${parsed.guestNameSnapshot} ដោយជោគជ័យ!`);
      setIsModalOpen(false);
    } catch {
      toast.error('មានបញ្ហាក្នុងការកត់ត្រាចំណងដៃ');
    }
  };

  const handleDeleteGift = async () => {
    if (!deleteGiftIds || deleteGiftIds.length === 0) return;
    try {
      await Promise.all(deleteGiftIds.map((id) => deleteGiftMutation.mutateAsync(id)));
      toast.success('បានលុបកំណត់ត្រាចំណងដៃដោយជោគជ័យ!');
      setDeleteGiftIds(null);
    } catch {
      toast.error('មានបញ្ហាក្នុងការលុបកំណត់ត្រា');
    }
  };

  return (
    <div className="space-y-6 font-khmer-body">
      {/* Header & New Envelope Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-khmer-body text-2xl sm:text-3xl font-bold tracking-tight text-[#212E1E]">
            កត់ត្រាចំណងដៃ
          </h1>
          <p className="font-khmer-body text-xs sm:text-sm text-[#5C6E57] mt-1">
            ប្រព័ន្ធកត់ត្រាចំណងដៃសាច់ប្រាក់ និងស្កេន KHQR ធនាគារក្នុងពេលតែមួយយ៉ាងរហ័ស។
          </p>
        </div>
        <Button
          onClick={openModal}
          size="lg"
          className="bg-[#243521] hover:bg-[#1A2617] text-white font-khmer-heading font-bold rounded-full px-6 shadow-md border border-[#C59F54]/40 cursor-pointer"
        >
          <Plus className="mr-2 h-5 w-5 text-[#E6C673]" /> កត់ត្រាស្រោមថ្មី
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 border border-white/85 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] rounded-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#8A9C84]" />
            <Input
              placeholder="ស្វែងរកតាមឈ្មោះភ្ញៀវ..."
              value={tableSearch}
              onChange={(e) => {
                setTableSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 bg-white/70 backdrop-blur-sm border-[#D8C7A8] rounded-xl h-10 text-xs sm:text-sm"
            />
          </div>
          <div className="w-full sm:w-44">
            <CustomSelect
              value={paymentMethodFilter}
              onChange={(val) => {
                setPaymentMethodFilter(val);
                setPage(1);
              }}
              searchable={false}
              options={[
                { value: '', label: 'វិធីសាស្ត្រទាំងអស់' },
                { value: 'CASH', label: 'សាច់ប្រាក់' },
                { value: 'QR_CODE', label: 'KHQR ធនាគារ' },
              ]}
              placeholder="វិធីសាស្ត្រ"
              className="[&_button]:h-10 [&_button]:rounded-xl [&_button]:bg-white/70 [&_button]:border-[#D8C7A8]"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 font-khmer-heading">
            <Button
              variant={currencyFilter === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setCurrencyFilter('');
                setPage(1);
              }}
              className={`rounded-xl text-xs h-9 ${
                currencyFilter === ''
                  ? 'bg-[#243521] text-white'
                  : 'border-[#D8C7A8] text-[#3E513A] hover:bg-[#EAE4D5]'
              }`}
            >
              រូបិយប័ណ្ណទាំងអស់
            </Button>
            <Button
              variant={currencyFilter === 'USD' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setCurrencyFilter('USD');
                setPage(1);
              }}
              className={`rounded-xl text-xs h-9 ${
                currencyFilter === 'USD'
                  ? 'bg-[#243521] text-white'
                  : 'border-[#D8C7A8] text-[#3E513A] hover:bg-[#EAE4D5]'
              }`}
            >
              ដុល្លារ ($)
            </Button>
            <Button
              variant={currencyFilter === 'KHR' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setCurrencyFilter('KHR');
                setPage(1);
              }}
              className={`rounded-xl text-xs h-9 ${
                currencyFilter === 'KHR'
                  ? 'bg-[#243521] text-white'
                  : 'border-[#D8C7A8] text-[#3E513A] hover:bg-[#EAE4D5]'
              }`}
            >
              រៀល (៛)
            </Button>
            {(tableSearch || currencyFilter || paymentMethodFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTableSearch('');
                  setCurrencyFilter('');
                  setPaymentMethodFilter('');
                  setPage(1);
                }}
                className="rounded-xl text-xs h-9 border-[#D8C7A8] text-[#3E513A] hover:bg-[#EAE4D5] cursor-pointer"
              >
                <X className="mr-1 h-3.5 w-3.5" /> សម្អាត
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Gifts Table */}
      <Card className="border border-white/85 overflow-hidden bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 rounded-2xl shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)]">
        <Table>
          <TableHeader className="bg-gradient-to-b from-white/35 via-white/15 to-white/20 backdrop-blur-sm border-b border-white/70">
            <TableRow>
              <TableHead className="font-khmer-heading text-xs font-bold text-[#212E1E]">ឈ្មោះភ្ញៀវ</TableHead>
              <TableHead className="font-khmer-heading text-xs font-bold text-[#212E1E]">ចំនួនទឹកប្រាក់</TableHead>
              <TableHead className="font-khmer-heading text-xs font-bold text-[#212E1E]">វិធីសាស្ត្រ</TableHead>
              <TableHead className="font-khmer-heading text-xs font-bold text-[#212E1E]">អ្នកកត់ត្រា</TableHead>
              <TableHead className="font-khmer-heading text-xs font-bold text-[#212E1E]">ម៉ោងកត់ត្រា</TableHead>
              <TableHead className="font-khmer-heading text-xs font-bold text-[#212E1E]">បង្កាន់ដៃ</TableHead>
              <TableHead className="font-khmer-heading text-xs font-bold text-[#212E1E] text-right">លុប</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingGifts ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-[#63765E]">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#4E8B7C] mb-2" />
                  កំពុងផ្ទុកទិន្នន័យចំណងដៃ...
                </TableCell>
              </TableRow>
            ) : giftsData?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-[#63765E]">
                  <Receipt className="h-8 w-8 mx-auto text-[#C59F54] mb-2 opacity-60" />
                  <p className="font-khmer-heading text-sm font-bold text-[#212E1E]">មិនទាន់មានទិន្នន័យកត់ត្រានៅឡើយទេ</p>
                  <p className="text-xs text-[#8A9C84] mt-1">ចុចប៊ូតុង «កត់ត្រាស្រោមថ្មី» ដើម្បីចាប់ផ្តើមកត់ចំណងដៃ</p>
                </TableCell>
              </TableRow>
            ) : (
              (() => {
                const rawGifts = giftsData?.data || [];
                const map = new Map<
                  string,
                  {
                    id: string;
                    giftIds: string[];
                    guestNameSnapshot: string;
                    paymentMethod: (typeof rawGifts)[number]['paymentMethod'];
                    recordedByUser?: (typeof rawGifts)[number]['recordedByUser'];
                    createdAt: string;
                    receiptImageUrl?: string | null;
                    usdAmt: number;
                    khrAmt: number;
                  }
                >();

                for (const gift of rawGifts) {
                  const guestKey = gift.guestId || gift.guestNameSnapshot || gift.id;
                  const key = `${guestKey}::${gift.paymentMethod}`;
                  const amountUSD = Number(gift.amountUSD ?? (gift.currency === 'USD' ? gift.amount : 0)) || 0;
                  const amountKHR = Number(gift.amountKHR ?? (gift.currency === 'KHR' ? gift.amount : 0)) || 0;
                  const existing = map.get(key);
                  if (existing) {
                    existing.giftIds.push(gift.id);
                    existing.usdAmt += amountUSD;
                    existing.khrAmt += amountKHR;
                    if (!existing.receiptImageUrl && gift.receiptImageUrl) {
                      existing.receiptImageUrl = gift.receiptImageUrl;
                    }
                  } else {
                    map.set(key, {
                      id: gift.id,
                      giftIds: [gift.id],
                      guestNameSnapshot: gift.guestNameSnapshot,
                      paymentMethod: gift.paymentMethod,
                      recordedByUser: gift.recordedByUser,
                      createdAt: gift.createdAt,
                      receiptImageUrl: gift.receiptImageUrl,
                      usdAmt: amountUSD,
                      khrAmt: amountKHR,
                    });
                  }
                }

                return Array.from(map.values()).map((gift) => (
                  <TableRow key={gift.id} className="hover:bg-white/45 transition-colors border-b border-[#E8DFC9]/45">
                    <TableCell className="font-semibold text-[#212E1E]">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-[#4E8B7C]" />
                        <span>{gift.guestNameSnapshot}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-[#212E1E] font-sans">
                      {gift.usdAmt > 0 && gift.khrAmt > 0
                        ? `${formatCurrency(gift.usdAmt, 'USD')} + ${formatCurrency(gift.khrAmt, 'KHR')}`
                        : gift.usdAmt > 0
                          ? formatCurrency(gift.usdAmt, 'USD')
                          : formatCurrency(gift.khrAmt, 'KHR')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-xs font-semibold py-0.5 px-2.5 rounded-full ${
                          gift.paymentMethod === 'CASH'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-[#EAE4D5] text-[#46381C] border border-[#D5C7AE]'
                        }`}
                      >
                        {gift.paymentMethod === 'CASH' ? '💵 សាច់ប្រាក់' : '📱 KHQR'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-[#63765E]">
                      {gift.recordedByUser?.fullName || 'អ្នកកត់ត្រា'}
                    </TableCell>
                    <TableCell className="text-xs text-[#63765E]">
                      {new Date(gift.createdAt).toLocaleTimeString('km-KH', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>
                      {gift.receiptImageUrl ? (
                        <a
                          href={gift.receiptImageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-[#4E8B7C] hover:underline"
                        >
                          មើលវិក្កយបត្រ
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteGiftIds(gift.giftIds)}
                        className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ));
              })()
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-white/70 bg-white/20 backdrop-blur-sm font-khmer-heading text-xs">
          <div className="flex items-center gap-2 text-[#5C6E57]">
            <span>បង្ហាញក្នុងមួយទំព័រ៖</span>
            <RowsPerPageSelect
              value={limit}
              onChange={(val) => {
                setLimit(val);
                setPage(1);
              }}
            />
            <span className="text-[#8A9C84]">
              (សរុប៖ {giftsData?.meta?.itemCount ?? giftsData?.data?.length ?? 0} កំណត់ត្រា)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#5C6E57] mr-1">
              ទំព័រទី <strong className="text-[#212E1E]">{page}</strong> នៃ{' '}
              <strong className="text-[#212E1E]">{giftsData?.meta?.pageCount || 1}</strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 p-0 rounded-lg border-[#D8C7A8] text-[#243521] hover:bg-[#EAE4D5] disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!giftsData?.meta?.hasNextPage && page >= (giftsData?.meta?.pageCount || 1)}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 w-8 p-0 rounded-lg border-[#D8C7A8] text-[#243521] hover:bg-[#EAE4D5] disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* ALL-IN-ONE REGISTRATION MODAL (STRUCTURED STEPPED CARD UI) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} className="max-w-[95vw] lg:max-w-[80vw]">
        <DialogContent className="p-0 overflow-hidden flex flex-col bg-[#FAF8F3] border border-[#E2D7C0] rounded-3xl font-khmer-body shadow-2xl max-h-[92dvh]">
          {/* Dynamic Animated Progress Bar */}
          {(() => {
            const hasAmount =
              currentCurrencyMode === 'USD'
                ? Number(watch('amountUSD') || 0) > 0
                : currentCurrencyMode === 'KHR'
                ? Number(watch('amountKHR') || 0) > 0
                : Number(watch('amountUSD') || 0) > 0 && Number(watch('amountKHR') || 0) > 0;
            const fields = [
              Boolean(selectedGuestName || watch('guestNameSnapshot')?.trim()),
              Boolean(watch('phone')?.trim()),
              Boolean(String(watch('tableNumber') ?? '').trim()),
              Boolean(selectedProvinceCode),
              hasAmount,
              Boolean(watch('wishes')?.trim() || (currentPaymentMethod === 'QR_CODE' && (watch('bankAccountId') || uploadedReceiptUrl))),
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
                <Gift className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="font-khmer-body text-base font-bold text-[#212E1E] leading-tight">
                  កត់ត្រាចំណងដៃថ្មី (All-in-One Desk)
                </h2>
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

          <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-5 flex-1 min-h-0 overflow-y-auto">
            <div className="flex flex-col lg:flex-row gap-5 items-stretch">
              {/* CARD 1: Guest Information */}
              <div className="flex-1 bg-white rounded-2xl p-5 sm:p-6 border border-[#E8DFC9] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-6 w-6 rounded-full border border-[#C59F54] bg-[#F6EFE0] text-[#8C6D23] text-xs font-bold flex items-center justify-center shrink-0">
                      ១
                    </span>
                    <span className="text-sm font-semibold text-[#243521]">ព័ត៌មានភ្ញៀវកិត្តិយស</span>
                  </div>
                  {!watch('guestId') && (
                    <label className="flex items-center gap-1.5 text-xs text-[#63765E] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        {...register('createGuestProfile')}
                        className="rounded border-[#D8C7A8] text-[#243521] focus:ring-[#243521]"
                      />
                      <span>បង្កើតប្រវត្តិភ្ញៀវថ្មី (Walk-in)</span>
                    </label>
                  )}
                </div>

                  {/* Unified Search & Name Input with Autocomplete */}
                  {selectedGuestName ? (
                    <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900 border border-emerald-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-bold text-sm font-khmer-heading text-emerald-950">
                            {selectedGuestName}
                          </p>
                          <p className="text-[11px] text-emerald-700">
                            ភ្ញៀវក្នុងប្រព័ន្ធ • អាចកែប្រែព័ត៌មានខាងក្រោមបាន
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedGuestName('');
                          setValue('guestId', '');
                          setGuestSearch('');
                        }}
                        className="text-xs px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-semibold cursor-pointer transition-colors"
                      >
                        ប្តូរ / ជ្រើសរើសឡើងវិញ
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1 relative">
                      <label className="text-xs font-semibold text-[#3E513A] font-khmer-heading flex items-center justify-between">
                        <span>
                          ឈ្មោះភ្ញៀវ (ស្វែងរក ឬវាយបញ្ចូលផ្ទាល់) <span className="text-rose-500">*</span>
                        </span>
                        {guestSearch.trim() && (
                          <span className="text-[11px] font-normal text-[#63765E]">
                            (ស៊ីគ្នាដោយស្វ័យប្រវត្តិជាមួយស្រោម)
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-[#8A9C84]" />
                        <Input
                          placeholder="វាយឈ្មោះភ្ញៀវ ឬលេខទូរស័ព្ទ... (ឧ. សុខ សាន)"
                          value={guestSearch}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGuestSearch(val);
                            setValue('guestNameSnapshot', val, { shouldValidate: true });
                          }}
                          className="pl-9 bg-white border-[#D8C7A8] rounded-xl h-10 text-xs sm:text-sm font-semibold"
                        />
                      </div>

                      {errors.guestNameSnapshot && !guestSearch.trim() && (
                        <p className="text-xs text-rose-500 pl-2">{errors.guestNameSnapshot.message}</p>
                      )}

                      {/* Autocomplete Dropdown list */}
                      {searchResults && searchResults.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 z-30 rounded-xl border border-[#D8C7A8] bg-white shadow-xl max-h-48 overflow-y-auto divide-y divide-[#F0EAE1]">
                          <div className="p-2 bg-[#F8F5EE] text-[11px] text-[#63765E] font-khmer-heading font-semibold">
                            រកឃើញភ្ញៀវក្នុងប្រព័ន្ធ ({searchResults.length}) — ចុចលើឈ្មោះដើម្បីជ្រើសរើស
                          </div>
                          {searchResults.map((g) => (
                            <button
                              type="button"
                              key={g.id}
                              onClick={() => handleSelectGuest(g)}
                              className="w-full text-left p-2.5 text-xs hover:bg-[#FAF8F3] flex justify-between items-center transition-colors cursor-pointer"
                            >
                              <div>
                                <span className="font-bold text-[#212E1E]">{g.name}</span>
                                <span className="text-[#63765E] ml-2 text-[11px]">
                                  {g.side === 'GROOM' ? '(ខាងកំលោះ)' : g.side === 'BRIDE' ? '(ខាងក្រមុំ)' : ''}
                                </span>
                              </div>
                              <span className="text-[#63765E]">
                                {g.phone || 'គ្មានលេខ'} • តុ {g.tableNumber || '—'} • {g.province || '—'}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2.5">
                    <label className="text-xs font-medium text-[#3E513A] font-khmer-body block">
                      លេខទូរស័ព្ទ <span className="text-[#8A9C84] font-normal">(ស្រេចចិត្ត)</span>
                    </label>
                    <Input
                      {...register('phone')}
                      placeholder="012 345 678"
                      className="h-11 bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl text-sm font-khmer-body text-[#212E1E] transition-all"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-xs font-medium text-[#3E513A] font-khmer-body block">
                      តុលេខ <span className="text-[#8A9C84] font-normal">(ស្រេចចិត្ត)</span>
                    </label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={watch('tableNumber') ?? ''}
                        onChange={(e) => {
                          const val = normalizeKhmerDigits(e.target.value);
                          setValue('tableNumber', val, { shouldValidate: true });
                        }}
                        placeholder="ឧ. 12"
                        className="h-11 bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl text-sm font-khmer-body text-[#212E1E] transition-all"
                      />
                  </div>
                </div>

                {/* Guest Side Selection (Groom / Bride / Both) */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#3E513A] font-khmer-body block">
                    ខាងភ្ញៀវ
                  </label>
                  <div className="flex flex-wrap items-center gap-4">
                    {[
                      { value: 'GROOM', label: 'ខាងកូនកំលោះ' },
                      { value: 'BRIDE', label: 'ខាងកូនក្រមុំ' },
                      { value: 'BOTH', label: 'ទាំងសងខាង' },
                    ].map((opt) => {
                      const active = (watch('side') || 'BOTH') === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            setValue('side', opt.value as 'GROOM' | 'BRIDE' | 'BOTH', {
                              shouldValidate: true,
                            })
                          }
                          className="flex items-center gap-2 text-xs font-medium cursor-pointer group"
                        >
                          <span
                            className={`h-4 w-4 rounded-full border flex items-center justify-center transition-colors ${
                              active
                                ? 'border-[#243521] bg-white'
                                : 'border-[#D8C7A8] group-hover:border-[#C59F54]'
                            }`}
                          >
                            {active && <span className="h-2 w-2 rounded-full bg-[#243521]" />}
                          </span>
                          <span className={active ? 'text-[#212E1E] font-semibold' : 'text-[#63765E]'}>
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clean Address Section (NO nested box) */}
                <div className="pt-2 border-t border-[#F0EAE1] space-y-2">
                  <p className="text-xs font-semibold text-[#3E513A] font-khmer-body">
                    អាសយដ្ឋានភ្ញៀវ <span className="text-[#8A9C84] font-normal">(ស្រេចចិត្ត)</span>
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-xs text-[#63765E] block mb-2">ខេត្ត/ក្រុង</label>
                      <CustomSelect
                        value={selectedProvinceCode}
                        onChange={(code) => {
                          setSelectedProvinceCode(code);
                          const p = provinces.find((pr) => pr.code === code);
                          setValue('province', p?.nameKm || '');
                          setSelectedDistrictCode('');
                          setValue('district', '');
                          setValue('commune', '');
                        }}
                        options={provinces.map((p) => ({ value: p.code, label: p.nameKm }))}
                        placeholder="ជ្រើសរើស"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-[#63765E] block mb-2">ស្រុក/ខណ្ឌ</label>
                      <CustomSelect
                        value={selectedDistrictCode}
                        disabled={!selectedProvinceCode}
                        onChange={(code) => {
                          setSelectedDistrictCode(code);
                          const d = districts.find((dist) => dist.code === code);
                          setValue('district', d?.nameKm || '');
                          setValue('commune', '');
                        }}
                        options={districts.map((d) => ({ value: d.code, label: d.nameKm }))}
                        placeholder="ជ្រើសរើស"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-[#63765E] block mb-2">ឃុំ/សង្កាត់</label>
                      <CustomSelect
                        value={watch('commune') || ''}
                        disabled={!selectedDistrictCode}
                        onChange={(val) => setValue('commune', val)}
                        options={communes.map((c) => ({ value: c.nameKm, label: c.nameKm }))}
                        placeholder="ជ្រើសរើស"
                      />
                    </div>
                  </div>
                </div>

                {/* Guest Note (Optional) */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-medium text-[#3E513A] font-khmer-body block">
                    កំណត់ចំណាំអំពីភ្ញៀវ <span className="text-[#8A9C84] font-normal">(ស្រេចចិត្ត)</span>
                  </label>
                  <Input
                    {...register('guestNote')}
                    placeholder="ឧ. មិត្តភក្តិសាកលវិទ្យាល័យ ឬ ភ្ញៀវខាងកូនកំលោះ..."
                    className="h-11 bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl text-sm font-khmer-body text-[#212E1E] transition-all"
                  />
                </div>
              </div>

              {/* CARD 2: Amount, Payment & Wishes */}
              <div className="flex-1 bg-white rounded-2xl p-5 sm:p-6 border border-[#E8DFC9] shadow-2xs space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="h-6 w-6 rounded-full border border-[#C59F54] bg-[#F6EFE0] text-[#8C6D23] text-xs font-bold flex items-center justify-center shrink-0">
                    ២
                  </span>
                  <span className="text-sm font-semibold text-[#243521]">ចំនួនទឹកប្រាក់ &amp; ការទូទាត់</span>
                </div>

                {/* Radio-style Currency Mode Selector (KHR only / USD only / Both) */}
                <div className="space-y-2.5">
                  <label className="text-xs font-medium text-[#3E513A] font-khmer-body block">
                    រូបិយប័ណ្ណ
                  </label>
                  <div className="flex flex-wrap items-center gap-4 sm:gap-5 min-h-9">
                    {[
                      { value: 'KHR', label: 'រៀល (៛)' },
                      { value: 'USD', label: 'ដុល្លារ ($)' },
                      { value: 'BOTH', label: 'ទាំងពីរ (ដុល្លារ & រៀល)' },
                    ].map((curr) => {
                      const active = currentCurrencyMode === curr.value;
                      return (
                        <button
                          key={curr.value}
                          type="button"
                          onClick={() => {
                            const mode = curr.value as 'KHR' | 'USD' | 'BOTH';
                            setValue('currencyMode', mode, { shouldValidate: true });
                            if (mode === 'KHR') {
                              setValue('currency', 'KHR');
                              if (!Number(watch('amountKHR') || 0)) {
                                setValue('amountKHR', '60000', { shouldValidate: true });
                              }
                            } else if (mode === 'USD') {
                              setValue('currency', 'USD');
                              if (!Number(watch('amountUSD') || 0)) {
                                setValue('amountUSD', '15', { shouldValidate: true });
                              }
                            } else {
                              setValue('currency', 'USD');
                              if (!Number(watch('amountUSD') || 0)) {
                                setValue('amountUSD', '15', { shouldValidate: true });
                              }
                              if (!Number(watch('amountKHR') || 0)) {
                                setValue('amountKHR', '60000', { shouldValidate: true });
                              }
                            }
                          }}
                          className="flex items-center gap-2 text-xs font-medium cursor-pointer group"
                        >
                          <span
                            className={`h-4 w-4 rounded-full border flex items-center justify-center transition-colors ${
                              active
                                ? 'border-[#243521] bg-white'
                                : 'border-[#D8C7A8] group-hover:border-[#C59F54]'
                            }`}
                          >
                            {active && <span className="h-2 w-2 rounded-full bg-[#243521]" />}
                          </span>
                          <span className={active ? 'font-semibold text-[#243521]' : 'text-[#5C6E57]'}>
                            {curr.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Amount Input(s) based on Currency Mode */}
                <div className={currentCurrencyMode === 'BOTH' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3.5' : ''}>
                  {(currentCurrencyMode === 'USD' || currentCurrencyMode === 'BOTH') && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-[#3E513A] font-khmer-body block">
                        ចំនួនទឹកប្រាក់ដុល្លារ ($) <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={watch('amountUSD') ?? ''}
                        onChange={(e) => {
                          const val = normalizeKhmerDigits(e.target.value);
                          setValue('amountUSD', val, { shouldValidate: true });
                        }}
                        placeholder="ឧ. 50"
                        className="h-11 bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl text-sm font-khmer-body font-medium text-[#212E1E] transition-all"
                      />
                      {errors.amountUSD && (
                        <p className="text-xs text-rose-500 pl-1">{errors.amountUSD.message}</p>
                      )}
                    </div>
                  )}

                  {(currentCurrencyMode === 'KHR' || currentCurrencyMode === 'BOTH') && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-[#3E513A] font-khmer-body block">
                        ចំនួនទឹកប្រាក់រៀល (៛) <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={watch('amountKHR') ?? ''}
                        onChange={(e) => {
                          const val = normalizeKhmerDigits(e.target.value);
                          setValue('amountKHR', val, { shouldValidate: true });
                        }}
                        placeholder="ឧ. 60000"
                        className="h-11 bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl text-sm font-khmer-body font-medium text-[#212E1E] transition-all"
                      />
                      {errors.amountKHR && (
                        <p className="text-xs text-rose-500 pl-1">{errors.amountKHR.message}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="space-y-2.5">
                  <label className="text-xs font-medium text-[#3E513A] font-khmer-body block">វិធីសាស្ត្រទូទាត់</label>
                  <div className="flex items-center gap-6 h-11">
                    {[
                      { value: 'CASH', label: 'សាច់ប្រាក់សុទ្ធ' },
                      { value: 'QR_CODE', label: 'ស្កេន KHQR ធនាគារ' },
                    ].map((pm) => {
                      const active = currentPaymentMethod === pm.value;
                      return (
                        <button
                          key={pm.value}
                          type="button"
                          onClick={() => setValue('paymentMethod', pm.value as 'CASH' | 'QR_CODE')}
                          className="flex items-center gap-2 text-xs font-medium cursor-pointer group"
                        >
                          <span
                            className={`h-4 w-4 rounded-full border flex items-center justify-center transition-colors ${
                              active
                                ? 'border-[#243521] bg-white'
                                : 'border-[#D8C7A8] group-hover:border-[#C59F54]'
                            }`}
                          >
                            {active && <span className="h-2 w-2 rounded-full bg-[#243521]" />}
                          </span>
                          <span className={active ? 'font-semibold text-[#243521]' : 'text-[#5C6E57]'}>
                            {pm.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Wishes on its own full-width line */}
                <div className="space-y-2.5">
                  <label className="text-xs font-medium text-[#3E513A] font-khmer-body block">
                    ពាក្យជូនពរ <span className="text-[#8A9C84] font-normal">(ស្រេចចិត្ត)</span>
                  </label>
                  <Input
                    {...register('wishes')}
                    placeholder="ឧ. សូមឱ្យស្រឡាញ់គ្នារហូតដល់ចាស់កោងខ្នង!"
                    className="h-11 bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl text-sm font-khmer-body text-[#212E1E] transition-all"
                  />
                </div>

                {/* QR Payment details */}
                {currentPaymentMethod === 'QR_CODE' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#F0EAE1] text-xs">
                    <div>
                      <label className="font-medium text-[#3E513A] block mb-2">គណនីធនាគារ</label>
                      <CustomSelect
                        value={watch('bankAccountId') || ''}
                        onChange={(val) => setValue('bankAccountId', val)}
                        options={(bankAccounts || []).map((b) => ({
                          value: b.id,
                          label: `${b.bankName} (${b.accountNumber})`,
                        }))}
                        placeholder="ជ្រើសរើសគណនី"
                        className="h-10"
                      />
                    </div>

                    <div>
                      <label className="font-medium text-[#3E513A] block mb-2">លេខកូដប្រតិបត្តិការ</label>
                      <Input
                        {...register('transactionRef')}
                        placeholder="ឧ. ABA-TRX-1928"
                        className="h-10 text-xs bg-white border-[#DFD5C3] rounded-xl font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-medium text-[#3E513A] block mb-2">វិក្កយបត្រ / បង្កាន់ដៃ</label>
                      <label className="flex items-center justify-center h-10 px-3 rounded-xl border border-dashed border-[#D8C7A8] hover:border-[#C59F54] bg-[#FAF8F3]/60 hover:bg-white text-xs text-[#3E513A] cursor-pointer transition-all truncate">
                        {uploadingSlip ? (
                          <Loader2 className="h-4 w-4 animate-spin text-[#C59F54]" />
                        ) : uploadedReceiptUrl ? (
                          <span className="text-emerald-700 font-semibold">✓ បានភ្ជាប់រួច</span>
                        ) : (
                          <span>ជ្រើសរើសរូបភាព</span>
                        )}
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Clean Footer Action Bar */}
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
                disabled={isSubmitting}
                className="h-10 px-6 bg-[#243521] hover:bg-[#1A2617] text-white font-semibold rounded-xl shadow-sm border border-[#C59F54]/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#E6C673]" />
                ) : (
                  <Gift className="h-4 w-4 text-[#E6C673]" />
                )}
                <span>រក្សាទុកកំណត់ត្រាចំណងដៃ</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={!!deleteGiftIds} onOpenChange={(open) => !open && setDeleteGiftIds(null)}>
        <DialogContent onClose={() => setDeleteGiftIds(null)} className="max-w-md bg-[#FAF8F3] border-[#E8DFC9] rounded-3xl font-khmer-body">
          <DialogHeader>
            <DialogTitle className="font-khmer-heading text-lg font-bold text-rose-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
              បញ្ជាក់ការលុបកំណត់ត្រាចំណងដៃ
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-[#5C6E57]">
              តើអ្នកពិតជាចង់លុបកំណត់ត្រាចំណងដៃនេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានឡើយ។
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeleteGiftIds(null)}
                className="rounded-xl border-[#D8C7A8] text-[#3E513A] hover:bg-[#EAE4D5] text-xs h-9"
              >
                បោះបង់
              </Button>
              <Button
                onClick={handleDeleteGift}
                disabled={deleteGiftMutation.isPending}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs h-9 px-4 font-bold cursor-pointer"
              >
                {deleteGiftMutation.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                យល់ព្រមលុប
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
