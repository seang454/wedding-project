'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useWeddings,
  useCreateWedding,
  useUpdateWedding,
  useDeleteWedding,
} from '@/hooks/use-weddings';
import { usePresignedUploadUrl } from '@/hooks/use-gifts';
import { useActiveWedding } from '@/context/wedding-context';
import { useAuth } from '@/hooks/use-auth';
import {
  createWeddingSchema,
  CreateWeddingFormInput,
  CreateWeddingFormData,
} from '@/schemas/wedding.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import { CustomSelect } from '@/components/ui/custom-select';
import { UserNav } from '@/components/common/user-nav';
import {
  getAllProvinces,
  getDistrictsByProvince,
  getCommunesByDistrict,
} from '@/lib/cambodia-locations';
import {
  Heart,
  Calendar,
  MapPin,
  Phone,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Target,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  X,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { Wedding } from '@/types/wedding.types';
import { normalizeKhmerDigits, normalizeSearchText } from '@/lib/utils';

export default function StandaloneWeddingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isClerk = user?.role === 'CLERK' || user?.role === 'ACCOUNTANT';
  const { weddings, isLoading, activeWeddingId, selectWedding } = useActiveWedding();
  const createMutation = useCreateWedding();
  const deleteMutation = useDeleteWedding();
  const getPresignedUrl = usePresignedUploadUrl();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editWedding, setEditWedding] = useState<Wedding | null>(null);
  const [deleteWedding, setDeleteWedding] = useState<Wedding | null>(null);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState<1 | 2>(1);
  const [imagePreview, setImagePreview] = useState<string>('/wedding/defaultWeddingImage.jpg');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  const provinces = getAllProvinces();
  const districts = getDistrictsByProvince(selectedProvinceCode);
  const communes = getCommunesByDistrict(selectedDistrictCode);

  // useUpdateWedding needs the id; we pass it dynamically
  const updateMutation = useUpdateWedding(editWedding?.id ?? '');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateWeddingFormInput>({
    resolver: zodResolver(createWeddingSchema) as never,
  });

  const openCreate = () => {
    reset({
      groomName: '',
      brideName: '',
      weddingDate: '',
      venue: '',
      province: '',
      district: '',
      commune: '',
      phone: '',
      notes: '',
      targetAmount: '',
      imageUrl: '',
    });
    setSelectedProvinceCode('');
    setSelectedDistrictCode('');
    setImagePreview('/wedding/defaultWeddingImage.jpg');
    setIsCreateOpen(true);
  };

  const openEdit = (w: Wedding) => {
    setEditWedding(w);
    setImagePreview(w.imageUrl || '/wedding/defaultWeddingImage.jpg');
    const pCode = provinces.find((pr) => pr.nameKm === w.province)?.code || '';
    const dCode = pCode
      ? getDistrictsByProvince(pCode).find((d) => d.nameKm === w.district)?.code || ''
      : '';
    setSelectedProvinceCode(pCode);
    setSelectedDistrictCode(dCode);
    reset({
      groomName: w.groomName,
      brideName: w.brideName,
      weddingDate: w.weddingDate.toString().slice(0, 10),
      venue: w.venue ?? '',
      province: w.province ?? '',
      district: w.district ?? '',
      commune: w.commune ?? '',
      phone: w.phone ?? '',
      notes: w.notes ?? '',
      targetAmount: w.targetAmount != null ? String(w.targetAmount) : '',
      imageUrl: w.imageUrl || '',
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const ticket = await getPresignedUrl.mutateAsync({
        fileName: file.name,
        contentType: file.type || 'image/jpeg',
        folder: 'weddings',
      });

      // Upload binary to S3 / MinIO
      await fetch(ticket.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'image/jpeg' },
        body: file,
      });

      setValue('imageUrl', ticket.fileUrl);
      setImagePreview(ticket.fileUrl);
      toast.success('បានបញ្ចូលរូបភាពមង្គលការដោយជោគជ័យ!');
    } catch {
      toast.error('មានបញ្ហាក្នុងការបញ្ចូលរូបភាព');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleResetToDefault = () => {
    setValue('imageUrl', '');
    setImagePreview('/wedding/defaultWeddingImage.jpg');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmitCreate = async (raw: CreateWeddingFormInput) => {
    try {
      const data = createWeddingSchema.parse(raw) as CreateWeddingFormData;
      await createMutation.mutateAsync(data);
      toast.success('បានបង្កើតទិន្នន័យមង្គលការថ្មីដោយជោគជ័យ!');
      setIsCreateOpen(false);
      reset();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message ||
        (err as Error)?.message ||
        'មានបញ្ហាក្នុងការបង្កើតទិន្នន័យមង្គលការ';
      const displayMsg = Array.isArray(errorMsg) ? errorMsg.join(', ') : String(errorMsg);
      toast.error(displayMsg);
    }
  };

  const onSubmitEdit = async (raw: CreateWeddingFormInput) => {
    if (!editWedding) return;
    try {
      const data = createWeddingSchema.parse(raw) as CreateWeddingFormData;
      await updateMutation.mutateAsync(data);
      toast.success('បានកែប្រែព័ត៌មានមង្គលការដោយជោគជ័យ!');
      setEditWedding(null);
      reset();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message ||
        (err as Error)?.message ||
        'មានបញ្ហាក្នុងការកែប្រែព័ត៌មានមង្គលការ';
      const displayMsg = Array.isArray(errorMsg) ? errorMsg.join(', ') : String(errorMsg);
      toast.error(displayMsg);
    }
  };

  const closeDeleteModal = () => {
    setDeleteWedding(null);
    setDeleteConfirmStep(1);
  };

  const confirmDelete = async () => {
    if (!deleteWedding) return;
    try {
      await deleteMutation.mutateAsync(deleteWedding.id);
      toast.success('បានលុបទិន្នន័យមង្គលការដោយជោគជ័យ!');
      closeDeleteModal();
    } catch {
      toast.error('មានបញ្ហាក្នុងការលុបទិន្នន័យ');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FAF8F3] text-[#2B3927] selection:bg-[#E2EBE0] selection:text-[#2B3927] font-khmer-body overflow-x-clip">
      {/* 1. HOMEPAGE MATCHING BACKGROUND TEXTURE */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-95 transition-opacity duration-700"
        style={{ backgroundImage: "url('/background/background.jpg')" }}
      />

      {/* 2. SUBTLE WARM TINT OVERLAY */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#FAF8F3]/30 via-[#FAF8F3]/15 to-[#FAF8F3]/40 pointer-events-none" />

      {/* 3. STANDALONE TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-white/80 bg-gradient-to-b from-white/40 via-white/20 to-white/30 px-4 sm:px-8 backdrop-blur-md backdrop-saturate-150 shadow-xs">
        <Link href="/" className="flex items-center group py-1.5">
          <img
            src="/images/logo.png"
            alt="ផ្ការំដួល"
            className="h-12 sm:h-13 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
          />
        </Link>

        <div className="flex items-center gap-4">
          <UserNav />
        </div>
      </header>

      {/* 4. MAIN CONTENT CONTAINER */}
      <main className="relative z-10 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-16 space-y-6 animate-page-enter">
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="font-khmer-body text-2xl sm:text-3xl font-bold tracking-tight text-[#212E1E]">
              {isClerk ? 'មង្គលការដែលបានចាត់តាំង' : 'គ្រប់គ្រងមង្គលការ'}
            </h1>
            <p className="font-khmer-body text-xs sm:text-sm text-[#5C6E57] mt-1">
              {isClerk
                ? 'សូមជ្រើសរើសពិធីអាពាហ៍ពិពាហ៍ដែលម្ចាស់កម្មវិធីបានចាត់តាំងជូនអ្នក ដើម្បីចូលកត់ត្រាចំណងដៃ។'
                : 'សូមជ្រើសរើសពិធីអាពាហ៍ពិពាហ៍ដែលអ្នកចង់ដំណើរការ ឬបង្កើតមង្គលការថ្មីដើម្បីចាប់ផ្តើម។'}
            </p>
          </div>
          {!isClerk && (
            <Button
              onClick={openCreate}
              className="bg-[#243521] hover:bg-[#1A2617] text-white font-khmer-heading font-bold rounded-full px-6 py-2.5 shadow-md border border-[#C59F54]/40 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <Plus className="mr-2 h-4 w-4 text-[#E6C673]" /> បង្កើតមង្គលការថ្មី
            </Button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col h-64 items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#4E8B7C]" />
            <p className="text-sm text-[#3E513A] font-khmer-heading">កំពុងផ្ទុកទិន្នន័យ...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!weddings || weddings.length === 0) && (
          <Card className="p-8 sm:p-14 text-center rounded-3xl border border-white/80 bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)]">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-white/60 backdrop-blur-xs flex items-center justify-center mb-4 border border-[#C59F54]/30 shadow-xs">
              <Heart className="h-8 w-8 text-[#C59F54]" />
            </div>
            <h3 className="font-khmer-heading text-lg font-bold text-[#212E1E]">
              មិនទាន់មានព័ត៌មានមង្គលការនៅឡើយទេ
            </h3>
            <p className="text-xs text-[#63765E] mt-1 mb-6 max-w-sm mx-auto font-khmer-body">
              ចុចប៊ូតុងខាងក្រោមដើម្បីបង្កើតព័ត៌មានអំពីពិធីអាពាហ៍ពិពាហ៍របស់អ្នក និងចាប់ផ្តើមប្រើប្រាស់ Dashboard។
            </p>
            <Button
              onClick={openCreate}
              className="bg-[#243521] hover:bg-[#1A2617] text-white font-khmer-heading rounded-full px-7 py-2.5 shadow-md border border-[#C59F54]/40 cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4 text-[#E6C673]" /> បង្កើតមង្គលការដំបូង
            </Button>
          </Card>
        )}

        {/* Search, Filter & Wedding Cards Grid */}
        {!isLoading && weddings && weddings.length > 0 && (() => {
          const q = normalizeSearchText(searchQuery);
          const locationOptions = Array.from(
            new Set(
              weddings
                .map((w) => w.province?.trim() || w.venue?.trim() || '')
                .filter(Boolean),
            ),
          );
          const hasActiveFilters = Boolean(searchQuery || dateFilter || locationFilter);
          const clearAllFilters = () => {
            setSearchQuery('');
            setDateFilter('');
            setLocationFilter('');
          };

          const filteredWeddings = weddings.filter((w) => {
            const matchesSearch =
              !q ||
              normalizeSearchText(`${w.groomName}&${w.brideName}`).includes(q) ||
              normalizeSearchText(`${w.groomName}${w.brideName}`).includes(q) ||
              normalizeSearchText(`${w.brideName}&${w.groomName}`).includes(q) ||
              normalizeSearchText(`${w.brideName}${w.groomName}`).includes(q) ||
              normalizeSearchText(w.venue).includes(q) ||
              normalizeSearchText(w.province).includes(q) ||
              normalizeSearchText(w.district).includes(q) ||
              normalizeSearchText(w.commune).includes(q) ||
              normalizeSearchText(w.phone).includes(q);

            const matchesDate =
              !dateFilter || w.weddingDate.toString().slice(0, 10) === dateFilter;

            const matchesLocation =
              !locationFilter ||
              (w.province ?? '').trim() === locationFilter ||
              (w.venue ?? '').trim() === locationFilter ||
              (w.district ?? '').trim() === locationFilter ||
              (w.commune ?? '').trim() === locationFilter;

            return matchesSearch && matchesDate && matchesLocation;
          });

          return (
            <>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
                  {/* Search Input */}
                  <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7D8C78] pointer-events-none" />
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ស្វែងរកតាមឈ្មោះគូស្វាមីភរិយា ទីតាំង ឬទូរស័ព្ទ..."
                      className="h-11 pl-11 pr-10 rounded-full bg-white/85 backdrop-blur-md border border-[#DFD5C3] focus:border-[#C59F54] text-sm text-[#212E1E] placeholder:text-[#8A9C84] shadow-xs"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        aria-label="សម្អាតការស្វែងរក"
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center text-[#7D8C78] hover:text-[#212E1E] hover:bg-[#EAE4D5]/70 transition-colors cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filter by Date */}
                  <div className="relative w-full sm:w-52">
                    <CustomDatePicker
                      value={dateFilter}
                      onChange={setDateFilter}
                      placeholder="ច្រោះតាមថ្ងៃពិធី"
                      className="[&_button]:h-11 [&_button]:rounded-full [&_button]:bg-white/85 [&_button]:backdrop-blur-md [&_button]:border-[#DFD5C3]"
                    />
                    {dateFilter && (
                      <button
                        type="button"
                        onClick={() => setDateFilter('')}
                        aria-label="សម្អាតថ្ងៃពិធី"
                        className="absolute right-9 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center text-[#7D8C78] hover:text-[#212E1E] hover:bg-[#EAE4D5]/70 transition-colors cursor-pointer z-10"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filter by Location */}
                  <div className="w-full sm:w-52">
                    <CustomSelect
                      value={locationFilter}
                      onChange={setLocationFilter}
                      options={[
                        { value: '', label: 'ទីតាំងទាំងអស់' },
                        ...locationOptions.map((loc) => ({ value: loc, label: loc })),
                      ]}
                      placeholder="ច្រោះតាមទីតាំង"
                      className="[&_button]:h-11 [&_button]:rounded-full [&_button]:bg-white/85 [&_button]:backdrop-blur-md [&_button]:border-[#DFD5C3]"
                    />
                  </div>

                  {hasActiveFilters && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearAllFilters}
                      className="h-11 rounded-full border-[#D8C7A8] bg-white/80 text-[#3E513A] hover:bg-[#EAE4D5] font-khmer-heading text-xs px-4 shrink-0 cursor-pointer"
                    >
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> សម្អាត
                    </Button>
                  )}
                </div>

                <p className="text-xs text-[#5C6E57] font-khmer-body shrink-0">
                  បង្ហាញ <span className="font-bold text-[#212E1E]">{filteredWeddings.length}</span> នៃ{' '}
                  <span className="font-bold text-[#212E1E]">{weddings.length}</span> មង្គលការ
                </p>
              </div>

              {filteredWeddings.length === 0 ? (
                <Card className="p-8 sm:p-12 text-center rounded-3xl border border-white/80 bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)]">
                  <div className="h-14 w-14 mx-auto rounded-full bg-white/60 backdrop-blur-xs flex items-center justify-center mb-3 border border-[#C59F54]/30 shadow-xs">
                    <Search className="h-6 w-6 text-[#C59F54]" />
                  </div>
                  <h3 className="font-khmer-heading text-base font-bold text-[#212E1E]">
                    រកមិនឃើញមង្គលការដែលត្រូវនឹងការស្វែងរកទេ
                  </h3>
                  <p className="text-xs text-[#63765E] mt-1 mb-5 font-khmer-body">
                    សូមព្យាយាមស្វែងរកតាមឈ្មោះ ថ្ងៃពិធី ឬទីតាំងផ្សេងទៀត។
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearAllFilters}
                    className="rounded-full border-[#D8C7A8] text-[#243521] hover:bg-[#EAE4D5] font-khmer-heading text-xs px-5 cursor-pointer"
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" /> សម្អាតការស្វែងរក
                  </Button>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {filteredWeddings.map((wedding) => {
              const isSelected = wedding.id === activeWeddingId;
              return (
                <Card
                  key={wedding.id}
                  onClick={() => {
                    selectWedding(wedding);
                    toast.success(`បានជ្រើសរើសមង្គលការ ${wedding.groomName} & ${wedding.brideName}`);
                    router.push('/dashboard');
                  }}
                  className={`group cursor-pointer overflow-hidden border transition-all duration-300 rounded-3xl bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] hover:shadow-2xl hover:-translate-y-1 ${
                    isSelected
                      ? 'border-[#C59F54] ring-2 ring-[#C59F54]/60'
                      : 'border-white/85 hover:border-[#C59F54]/70'
                  }`}
                >
                  {/* Full-width Wedding Cover Image */}
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-gradient-to-b from-[#1C2819] via-[#243521] to-[#121B10] flex items-center justify-center">
                    <img
                      src={wedding.imageUrl || '/wedding/defaultWeddingImage.jpg'}
                      alt={`${wedding.groomName} & ${wedding.brideName}`}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay for bottom text clarity */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 pointer-events-none" />

                    {/* Top Bar with Badge */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-[#E6C673]/40 text-[#E6C673] text-xs font-khmer-heading shadow-xs">
                        <Heart className="h-3.5 w-3.5 fill-[#E6C673]" />
                        <span>ពិធីអាពាហ៍ពិពាហ៍</span>
                      </div>

                      {isSelected ? (
                        <Badge className="bg-[#C59F54] text-[#243521] font-bold font-khmer-heading text-xs px-3 py-1 shadow-md">
                          ★ កំពុងជ្រើសរើស
                        </Badge>
                      ) : (
                        <Badge className="bg-black/40 text-white backdrop-blur-md border border-white/20 font-khmer-heading text-xs px-2.5 py-0.5">
                          ✓ សកម្ម
                        </Badge>
                      )}
                    </div>

                    {/* Bottom of Image: Couple Names */}
                    <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
                      <h2 className="font-khmer-body text-2xl font-bold tracking-tight text-white drop-shadow-md group-hover:text-[#E6C673] transition-colors">
                        {wedding.groomName} &amp; {wedding.brideName}
                      </h2>
                      <p className="text-[11px] text-[#D8E6D5] font-khmer-body mt-0.5 drop-shadow-sm">
                        ចុចលើកាតនេះដើម្បីចូលគ្រប់គ្រង Dashboard
                      </p>
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-4 bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150">
                    <div className="flex flex-wrap gap-4 text-xs text-[#5C6E57]">
                      <span className="flex items-center gap-1.5 font-medium text-[#2E402B]">
                        <Calendar className="h-4 w-4 text-[#C59F54] shrink-0" />
                        {new Date(wedding.weddingDate).toLocaleDateString('km-KH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      {wedding.venue && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-[#C59F54] shrink-0" />
                          <span className="truncate">{wedding.venue}</span>
                        </span>
                      )}
                      {wedding.targetAmount && (
                        <span className="flex items-center gap-1.5">
                          <Target className="h-4 w-4 text-[#4E8B7C] shrink-0" />
                          <span>គោលដៅ: ${wedding.targetAmount.toLocaleString()}</span>
                        </span>
                      )}
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#F0EAE1]">
                      <span className="text-xs font-semibold text-[#243521] flex items-center gap-1 group-hover:translate-x-1 transition-transform font-khmer-heading">
                        <span>ចូលទៅផ្ទាំងគ្រប់គ្រង (Dashboard)</span>
                        <ArrowRight className="h-3.5 w-3.5 text-[#C59F54]" />
                      </span>

                      {!isClerk && (
                        <div
                          className="flex gap-1.5"
                          onClick={(e) => e.stopPropagation()} // Prevent card navigation when clicking edit/delete
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(wedding)}
                            className="font-khmer-heading text-xs rounded-xl border-[#D8C7A8] text-[#3E513A] hover:bg-[#EAE4D5] h-8 px-2.5 cursor-pointer"
                          >
                            <Pencil className="mr-1 h-3.5 w-3.5 text-[#4E8B7C]" /> កែប្រែ
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDeleteConfirmStep(1);
                              setDeleteWedding(wedding);
                            }}
                            className="font-khmer-heading text-xs rounded-xl border-red-200 text-red-600 hover:bg-red-50 h-8 px-2.5 cursor-pointer"
                          >
                            <Trash2 className="mr-1 h-3.5 w-3.5" /> លុប
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
                </div>
              )}
            </>
          );
        })()}

        {/* CREATE / EDIT MODAL (STRUCTURED STEPPED CARD UI) */}
        <Dialog
          open={isCreateOpen || !!editWedding}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateOpen(false);
              setEditWedding(null);
              reset();
            }
          }}
          className="max-w-[95vw] sm:max-w-2xl"
        >
          <DialogContent className="p-0 overflow-hidden flex flex-col bg-[#FAF8F3] border border-[#E2D7C0] rounded-3xl font-khmer-body shadow-2xl">
            {/* Dynamic Animated Progress Bar */}
            {(() => {
              const fields = [
                Boolean(watch('groomName')?.trim()),
                Boolean(watch('brideName')?.trim()),
                Boolean(watch('weddingDate')?.trim()),
                Boolean(watch('phone')?.trim()),
                Boolean(watch('province')?.trim()),
                Boolean(watch('notes')?.trim()),
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
                <div className="h-9 w-9 rounded-xl bg-[#F6EFE0] border border-[#C59F54]/30 flex items-center justify-center text-[#C59F54] shrink-0">
                  <Heart className="h-4.5 w-4.5 fill-[#C59F54]" />
                </div>
                <div>
                  <h2 className="font-khmer-body text-base font-bold text-[#212E1E] leading-tight">
                    {editWedding ? 'កែប្រែព័ត៌មានមង្គលការ' : 'បង្កើតមង្គលការថ្មី'}
                  </h2>
                  <p className="text-xs text-[#63765E] mt-0.5">
                    បំពេញព័ត៌មានគូស្វាមីភរិយា ថ្ងៃពិធី និងទីតាំងប្រារព្ធ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditWedding(null);
                  reset();
                }}
                className="h-8 w-8 rounded-full bg-[#FAF6EE] hover:bg-[#EFE9DC] text-[#63765E] hover:text-[#212E1E] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(editWedding ? onSubmitEdit : onSubmitCreate)}
              className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 overflow-y-auto"
            >
              {/* Card 1: Couple & Event Details */}
              <div className="bg-white rounded-2xl p-5 border border-[#E8DFC9] shadow-2xs space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="h-6 w-6 rounded-full border border-[#C59F54] bg-[#F6EFE0] text-[#8C6D23] text-xs font-bold flex items-center justify-center shrink-0">
                    ១
                  </span>
                  <span className="text-sm font-semibold text-[#243521]">ព័ត៌មានគូស្វាមីភរិយា &amp; កម្មវិធី</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-2.5">
                    <label className="text-xs font-medium text-[#3E513A] block">
                      ឈ្មោះកូនកំលោះ <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register('groomName')}
                      placeholder="ឧ. ចាន់ វណ្ណ"
                      className="bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl h-10 text-sm transition-all"
                    />
                    {errors.groomName && (
                      <p className="text-xs text-red-500">{errors.groomName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-xs font-medium text-[#3E513A] block">
                      ឈ្មោះកូនក្រមុំ <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register('brideName')}
                      placeholder="ឧ. មាស លីដា"
                      className="bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl h-10 text-sm transition-all"
                    />
                    {errors.brideName && (
                      <p className="text-xs text-red-500">{errors.brideName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-2.5">
                    <label className="text-xs font-medium text-[#3E513A] flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-[#C59F54]" />
                      <span>ថ្ងៃអាពាហ៍ពិពាហ៍</span> <span className="text-red-500">*</span>
                    </label>
                    <CustomDatePicker
                      value={watch('weddingDate') || ''}
                      onChange={(val) => setValue('weddingDate', val, { shouldValidate: true })}
                      placeholder="ជ្រើសរើសថ្ងៃអាពាហ៍ពិពាហ៍"
                    />
                    {errors.weddingDate && (
                      <p className="text-xs text-red-500">{errors.weddingDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-xs font-medium text-[#3E513A] flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-[#C59F54]" />
                      <span>លេខទូរស័ព្ទទំនាក់ទំនង</span>
                    </label>
                    <Input
                      {...register('phone')}
                      placeholder="ឧ. 012 345 678"
                      className="bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl h-10 text-sm font-mono transition-all"
                    />
                  </div>
                </div>

                {/* Cambodia Location Cascade Dropdowns */}
                <div className="pt-2 border-t border-[#F0EAE1] space-y-2">
                  <p className="text-xs font-semibold text-[#3E513A]">
                    ទីតាំងមង្គលការ <span className="text-[#8A9C84] font-normal">(ស្រេចចិត្ត)</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-xs text-[#63765E] block mb-1.5">ខេត្ត/ក្រុង</label>
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
                      <label className="text-xs text-[#63765E] block mb-1.5">ស្រុក/ខណ្ឌ</label>
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
                      <label className="text-xs text-[#63765E] block mb-1.5">ឃុំ/សង្កាត់</label>
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

                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#3E513A] block">
                    កំណត់ចំណាំ <span className="text-[#8A9C84] font-normal">(ស្រេចចិត្ត)</span>
                  </label>
                  <Input
                    {...register('notes')}
                    placeholder="ឧ. ពិធីហែជំនូនម៉ោង ៧:០០ ព្រឹក និងពិសាភោជនាហារម៉ោង ៥:០០ ល្ងាច..."
                    className="bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl h-10 text-sm transition-all"
                  />
                </div>
              </div>

              {/* Card 2: Cover Image Upload */}
              <div className="bg-white rounded-2xl p-5 border border-[#E8DFC9] shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-6 w-6 rounded-full border border-[#C59F54] bg-[#F6EFE0] text-[#8C6D23] text-xs font-bold flex items-center justify-center shrink-0">
                      ២
                    </span>
                    <span className="text-sm font-semibold text-[#243521]">រូបភាពតំណាងមង្គលការ</span>
                  </div>
                  <span className="text-xs font-normal text-[#6B7E66]">
                    {imagePreview === '/wedding/defaultWeddingImage.jpg' ? 'រូបភាពលំនាំដើម' : 'រូបភាពផ្ទាល់ខ្លួន'}
                  </span>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <div className="relative w-18 h-18 rounded-xl bg-[#FAF8F3] border border-[#D8C7A8] overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={imagePreview}
                      alt="Wedding Preview"
                      className="w-full h-full object-contain p-1"
                    />
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <p className="text-xs text-[#5C6E57] leading-relaxed">
                      អ្នកអាចផ្ទុករូបភាពគូស្វាមីភរិយា ឬទុកនៅទទេដើម្បីប្រើប្រាស់រូបភាពលំនាំដើមនៃប្រព័ន្ធ។
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="h-9 px-3.5 text-xs rounded-xl border-[#C59F54]/60 text-[#243521] hover:bg-[#FAF6EE] bg-white cursor-pointer"
                      >
                        <Upload className="h-3.5 w-3.5 mr-1.5 text-[#C59F54]" />
                        {uploadingImage ? 'កំពុងបញ្ចូល...' : 'ជ្រើសរើសរូបភាព'}
                      </Button>
                      {imagePreview !== '/wedding/defaultWeddingImage.jpg' && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleResetToDefault}
                          className="h-9 px-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          ប្រើរូបលំនាំដើមវិញ
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditWedding(null);
                    reset();
                  }}
                  className="h-10 px-5 rounded-xl border-[#D8C7A8] text-[#5C6E57] hover:bg-white cursor-pointer"
                >
                  បោះបង់
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-6 bg-[#243521] hover:bg-[#1A2617] text-white font-semibold rounded-xl shadow-sm border border-[#C59F54]/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin text-[#E6C673]" /> : <Sparkles className="h-4 w-4 text-[#E6C673]" />}
                  <span>{editWedding ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'បង្កើតមង្គលការ'}</span>
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* DELETE CONFIRM MODAL (2-STEP ALERT) */}
        <Dialog open={!!deleteWedding} onOpenChange={(o) => !o && closeDeleteModal()}>
          <DialogContent
            onClose={closeDeleteModal}
            className="bg-[#FAF8F3] border-[#E8DFC9] rounded-3xl font-khmer-body max-w-sm"
          >
            <DialogHeader>
              <DialogTitle className="font-khmer-heading text-base font-bold text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                {deleteConfirmStep === 1
                  ? 'បញ្ជាក់ការលុប'
                  : 'ការព្រមានចុងក្រោយ — លុបជាអចិន្ត្រៃយ៍!'}
              </DialogTitle>
            </DialogHeader>

            {deleteConfirmStep === 1 ? (
              <>
                <p className="text-sm text-[#5C6E57] font-khmer-body">
                  តើអ្នកប្រាកដថាចង់លុបព័ត៌មានមង្គលការ{' '}
                  <strong className="text-[#212E1E]">
                    {deleteWedding?.groomName} &amp; {deleteWedding?.brideName}
                  </strong>
                  ? ទិន្នន័យចំណងដៃ និងភ្ញៀវទាំងអស់នឹងត្រូវបានលុបផងដែរ។
                </p>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    className="flex-1 font-khmer-heading rounded-xl border-[#D8C7A8]"
                    onClick={closeDeleteModal}
                  >
                    បោះបង់
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-khmer-heading rounded-xl"
                    onClick={() => setDeleteConfirmStep(2)}
                  >
                    លុបចោល
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 leading-relaxed space-y-1.5">
                  <p className="font-semibold">
                    សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ!
                  </p>
                  <p>
                    មង្គលការ <strong>{deleteWedding?.groomName} &amp; {deleteWedding?.brideName}</strong> រួមទាំងបញ្ជីភ្ញៀវ កំណត់ត្រាចំណងដៃ និងគណនីធនាគារទាំងអស់នឹងត្រូវលុបបាត់ទាំងស្រុង។ តើអ្នកពិតជាចង់លុបមែនទេ?
                  </p>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    className="flex-1 font-khmer-heading rounded-xl border-[#D8C7A8]"
                    onClick={closeDeleteModal}
                    disabled={deleteMutation.isPending}
                  >
                    ទេ (រក្សាទុក)
                  </Button>
                  <Button
                    className="flex-1 bg-red-700 hover:bg-red-800 text-white font-khmer-heading rounded-xl"
                    onClick={confirmDelete}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : null}
                    បាទ/ចាស លុបទាំងអស់
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
