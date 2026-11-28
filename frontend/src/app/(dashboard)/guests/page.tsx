'use client';

import { useState } from 'react';
import { useWeddings } from '@/hooks/use-weddings';
import { useActiveWedding } from '@/context/wedding-context';
import { useGuests, useCreateGuest, useBatchImportGuests, useUpdateGuest, useDeleteGuest } from '@/hooks/use-guests';
import { useUpdateGift, useRecordGift, useDeleteGift } from '@/hooks/use-gifts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RowsPerPageSelect } from '@/components/common/rows-per-page-select';
import { CustomSelect } from '@/components/ui/custom-select';
import { normalizeKhmerDigits, normalizeSearchText } from '@/lib/utils';
import {
  getAllProvinces,
  getDistrictsByProvince,
  getCommunesByDistrict,
} from '@/lib/cambodia-locations';
import {
  Plus,
  Upload,
  Download,
  Check,
  Search,
  Users,
  Loader2,
  Trash2,
  Pencil,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  UserPlus,
  MapPin,
  Minus,
  Banknote,
} from 'lucide-react';
import { toast } from 'sonner';

export default function GuestsPage() {
  const { activeWedding: currentWedding, activeWeddingId: weddingId } = useActiveWedding();

  const [page, setPage] = useState(1);
  const [take, setTake] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sideFilter, setSideFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tableFilter, setTableFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Queries & Mutations
  const { data: guestsData, isLoading } = useGuests(weddingId, page, take, {
    search: searchTerm,
    side: sideFilter,
    status: statusFilter,
    tableNumber: tableFilter,
  });
  const createGuestMutation = useCreateGuest(weddingId);
  const updateGuestMutation = useUpdateGuest(weddingId);
  const updateGiftMutation = useUpdateGift(weddingId);
  const recordGiftMutation = useRecordGift(weddingId);
  const deleteGiftMutation = useDeleteGift(weddingId);
  const deleteGuestMutation = useDeleteGuest(weddingId);
  const batchImportMutation = useBatchImportGuests(weddingId);

  // Edit & Delete state
  const [deleteGuestId, setDeleteGuestId] = useState<string | null>(null);
  const [confirmResetGiftOpen, setConfirmResetGiftOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<{
    id: string;
    name: string;
    phone?: string;
    side: 'GROOM' | 'BRIDE' | 'BOTH';
    relationship?: string;
    invitationStatus: 'INVITED' | 'ATTENDED' | 'DECLINED';
    tableNumber?: number;
    province?: string;
    district?: string;
    commune?: string;
    village?: string;
    notes?: string;
    hasGifts: boolean;
    giftMode: 'USD' | 'KHR' | 'BOTH';
    usdGiftId?: string;
    usdAmount: number;
    khrGiftId?: string;
    khrAmount: number;
    giftPaymentMethod: 'CASH' | 'QR_CODE' | 'BANK_TRANSFER';
    giftWishes?: string;
  } | null>(null);
  const [editProvinceCode, setEditProvinceCode] = useState('');
  const [editDistrictCode, setEditDistrictCode] = useState('');

  // Form states for new guest with Cambodia locations
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [side, setSide] = useState<'GROOM' | 'BRIDE' | 'BOTH'>('BOTH');
  const [tableNumber, setTableNumber] = useState('');
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedProvinceName, setSelectedProvinceName] = useState('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  const [selectedDistrictName, setSelectedDistrictName] = useState('');
  const [selectedCommuneName, setSelectedCommuneName] = useState('');

  // Cambodia location cascades
  const provinces = getAllProvinces();
  const districts = getDistrictsByProvince(selectedProvinceCode);
  const communes = getCommunesByDistrict(selectedDistrictCode);
  const editDistricts = getDistrictsByProvince(editProvinceCode);
  const editCommunes = getCommunesByDistrict(editDistrictCode);

  // Add Single Guest
  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('សូមបញ្ចូលឈ្មោះភ្ញៀវ');

    try {
      await createGuestMutation.mutateAsync({
        weddingId,
        name: name.trim(),
        phone: phone.trim() || undefined,
        side,
        tableNumber: tableNumber ? parseInt(tableNumber, 10) : undefined,
        province: selectedProvinceName || undefined,
        district: selectedDistrictName || undefined,
        commune: selectedCommuneName || undefined,
      });

      toast.success('បានបន្ថែមភ្ញៀវដោយជោគជ័យ!');
      setName('');
      setPhone('');
      setTableNumber('');
      setSelectedProvinceCode('');
      setSelectedDistrictCode('');
      setIsAddModalOpen(false);
    } catch {
      toast.error('មានបញ្ហាក្នុងការបន្ថែមភ្ញៀវ');
    }
  };

  // Delete Guest
  const deletingGuest = guestsData?.data?.find((g) => g.id === deleteGuestId) || null;
  const deletingGuestHasGifts = (deletingGuest?.gifts?.length ?? 0) > 0;

  const handleDeleteGuest = async () => {
    if (!deleteGuestId) return;
    if (deletingGuestHasGifts) {
      toast.error('មិនអាចលុបភ្ញៀវដែលមានកំណត់ត្រាចំណងដៃរួចហើយបានទេ។ សូមលុបកំណត់ត្រាចំណងដៃជាមុនសិន!');
      return;
    }
    try {
      await deleteGuestMutation.mutateAsync(deleteGuestId);
      toast.success('បានលុបភ្ញៀវដោយជោគជ័យ!');
      setDeleteGuestId(null);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'មានបញ្ហាក្នុងការលុបភ្ញៀវ';
      toast.error(msg);
    }
  };

  // Update Guest
  const performUpdateGuest = async () => {
    if (!editingGuest || !editingGuest.name.trim()) return toast.error('សូមបញ្ចូលឈ្មោះភ្ញៀវ');

    try {
      await updateGuestMutation.mutateAsync({
        id: editingGuest.id,
        data: {
          name: editingGuest.name.trim(),
          phone: editingGuest.phone?.trim() || undefined,
          side: editingGuest.side,
          relationship: editingGuest.relationship?.trim() || undefined,
          invitationStatus: editingGuest.invitationStatus,
          tableNumber: editingGuest.tableNumber || undefined,
          province: editingGuest.province?.trim() || undefined,
          district: editingGuest.district?.trim() || undefined,
          commune: editingGuest.commune?.trim() || undefined,
          village: editingGuest.village?.trim() || undefined,
          notes: editingGuest.notes?.trim() || undefined,
        },
      });

      if (editingGuest.hasGifts && editingGuest.invitationStatus !== 'INVITED') {
        const ops: Promise<unknown>[] = [];
        const common = {
          paymentMethod: editingGuest.giftPaymentMethod,
          wishes: editingGuest.giftWishes?.trim() || undefined,
          guestNameSnapshot: editingGuest.name.trim(),
        };

        if (editingGuest.giftMode === 'USD') {
          if (editingGuest.usdGiftId) {
            ops.push(
              updateGiftMutation.mutateAsync({
                id: editingGuest.usdGiftId,
                data: { ...common, amountUSD: Number(editingGuest.usdAmount) || 0, amountKHR: 0 },
              }),
            );
            if (editingGuest.khrGiftId && editingGuest.khrGiftId !== editingGuest.usdGiftId) {
              ops.push(deleteGiftMutation.mutateAsync(editingGuest.khrGiftId));
            }
          } else if (editingGuest.khrGiftId) {
            ops.push(
              updateGiftMutation.mutateAsync({
                id: editingGuest.khrGiftId,
                data: { ...common, amountUSD: Number(editingGuest.usdAmount) || 0, amountKHR: 0 },
              }),
            );
          }
        } else if (editingGuest.giftMode === 'KHR') {
          if (editingGuest.khrGiftId) {
            ops.push(
              updateGiftMutation.mutateAsync({
                id: editingGuest.khrGiftId,
                data: { ...common, amountUSD: 0, amountKHR: Number(editingGuest.khrAmount) || 0 },
              }),
            );
            if (editingGuest.usdGiftId && editingGuest.usdGiftId !== editingGuest.khrGiftId) {
              ops.push(deleteGiftMutation.mutateAsync(editingGuest.usdGiftId));
            }
          } else if (editingGuest.usdGiftId) {
            ops.push(
              updateGiftMutation.mutateAsync({
                id: editingGuest.usdGiftId,
                data: { ...common, amountUSD: 0, amountKHR: Number(editingGuest.khrAmount) || 0 },
              }),
            );
          }
        } else {
          // BOTH: USD & KHR (single-row update if same giftId or only one exists)
          const targetId = editingGuest.usdGiftId || editingGuest.khrGiftId;
          if (targetId) {
            ops.push(
              updateGiftMutation.mutateAsync({
                id: targetId,
                data: {
                  ...common,
                  amountUSD: Number(editingGuest.usdAmount) || 0,
                  amountKHR: Number(editingGuest.khrAmount) || 0,
                },
              }),
            );
            if (
              editingGuest.usdGiftId &&
              editingGuest.khrGiftId &&
              editingGuest.khrGiftId !== editingGuest.usdGiftId
            ) {
              ops.push(deleteGiftMutation.mutateAsync(editingGuest.khrGiftId));
            }
          }
        }

        if (ops.length > 0) {
          await Promise.all(ops);
        }
      }

      toast.success('បានកែប្រែព័ត៌មានភ្ញៀវដោយជោគជ័យ!');
      setConfirmResetGiftOpen(false);
      setEditingGuest(null);
    } catch {
      toast.error('មានបញ្ហាក្នុងការកែប្រែព័ត៌មានភ្ញៀវ');
    }
  };

  const handleUpdateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuest || !editingGuest.name.trim()) return toast.error('សូមបញ្ចូលឈ្មោះភ្ញៀវ');

    if (editingGuest.hasGifts && editingGuest.invitationStatus === 'INVITED') {
      setConfirmResetGiftOpen(true);
      return;
    }

    await performUpdateGuest();
  };

  // Export to CSV (with UTF-8 BOM for Microsoft Excel compatibility)
  const handleExportCSV = async () => {
    try {
      toast.info('កំពុងទាញយកទិន្នន័យ CSV...');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/guests/wedding/${weddingId}/export`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
          },
        },
      );
      const json = await res.json();
      const allGuests = json.data || [];

      if (allGuests.length === 0) {
        return toast.error('មិនទាន់មានភ្ញៀវសម្រាប់ទាញយកឡើយ');
      }

      const headers = ['Name', 'Phone', 'Side', 'Table', 'Status', 'Province', 'District', 'Commune'];
      const rows = allGuests.map((g: { name: string; phone?: string; side: string; tableNumber?: number; invitationStatus: string; province?: string; district?: string; commune?: string }) => [
        `"${(g.name || '').replace(/"/g, '""')}"`,
        g.phone ? `"=""${g.phone.replace(/"/g, '""')}"""` : '""',
        `"${g.side || 'BOTH'}"`,
        `"${g.tableNumber || ''}"`,
        `"${g.invitationStatus || 'INVITED'}"`,
        `"${(g.province || '').replace(/"/g, '""')}"`,
        `"${(g.district || '').replace(/"/g, '""')}"`,
        `"${(g.commune || '').replace(/"/g, '""')}"`,
      ]);

      // \ufeff is the UTF-8 Byte Order Mark (BOM) which instructs Microsoft Excel to render Khmer Unicode correctly
      const csvContent = '\ufeff' + [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `guests_${currentWedding?.groomName || 'wedding'}_${currentWedding?.brideName || 'guests'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('បានទាញយកឯកសារ CSV សម្រាប់ Excel ដោយជោគជ័យ!');
    } catch {
      toast.error('មានបញ្ហាក្នុងការទាញយក CSV');
    }
  };

  // Download Sample CSV Template for Excel
  const handleDownloadSampleTemplate = () => {
    const headers = ['Name', 'Phone', 'Side', 'Table', 'Province', 'District', 'Commune'];
    const sampleRows = [
      ['សុខ សាន', '012345678', 'BOTH', '1', 'ភ្នំពេញ', 'ដូនពេញ', 'ផ្សារចាស់'],
      ['ចាន់ ធី', '098765432', 'GROOM', '2', 'កណ្ដាល', 'តាខ្មៅ', 'តាខ្មៅ'],
      ['ម៉ៅ វិបុល', '088123456', 'BRIDE', '3', 'សៀមរាប', 'សៀមរាប', 'ស្វាយដង្គំ'],
    ];

    const csvContent =
      '\ufeff' +
      [
        headers.join(','),
        ...sampleRows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')),
      ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_guests_excel.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('បានទាញយកគំរូ CSV សម្រាប់ Excel រួចរាល់!');
  };

  // CSV Import (supports UTF-8 BOM, comma and semicolon delimiters, and header matching)
  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        let text = (event.target?.result as string) || '';
        // Remove UTF-8 BOM if present
        if (text.charCodeAt(0) === 0xfeff) {
          text = text.slice(1);
        }

        const rawLines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (rawLines.length === 0) {
          return toast.error('ឯកសារ CSV គ្មានទិន្នន័យឡើយ');
        }

        // Detect delimiter: comma or semicolon
        const firstLine = rawLines[0];
        const delimiter = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ',';

        // Helper to parse CSV row accounting for quotes
        const parseRow = (line: string): string[] => {
          const regex = new RegExp(`(?:${delimiter}|^)(?:"([^"]*(?:""[^"]*)*)"|([^"${delimiter}]*))`, 'g');
          const result: string[] = [];
          let match;
          while ((match = regex.exec(line)) !== null) {
            let val = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
            result.push((val || '').trim());
          }
          return result;
        };

        const headerCols = parseRow(firstLine).map((h) => h.toLowerCase());
        const hasHeader = headerCols.some((h) =>
          ['name', 'ឈ្មោះ', 'phone', 'ទូរស័ព្ទ', 'table', 'តុ', 'side', 'province', 'ខេត្ត'].includes(h)
        );

        const dataLines = hasHeader ? rawLines.slice(1) : rawLines;
        const nameIdx = hasHeader ? headerCols.findIndex((h) => h.includes('name') || h.includes('ឈ្មោះ')) : 0;
        const phoneIdx = hasHeader ? headerCols.findIndex((h) => h.includes('phone') || h.includes('ទូរស័ព្ទ')) : 1;
        const sideIdx = hasHeader ? headerCols.findIndex((h) => h.includes('side') || h.includes('ខាង')) : -1;
        const tableIdx = hasHeader ? headerCols.findIndex((h) => h.includes('table') || h.includes('តុ')) : -1;
        const provIdx = hasHeader ? headerCols.findIndex((h) => h.includes('province') || h.includes('ខេត្ត')) : -1;
        const distIdx = hasHeader ? headerCols.findIndex((h) => h.includes('district') || h.includes('ស្រុក')) : -1;
        const commIdx = hasHeader ? headerCols.findIndex((h) => h.includes('commune') || h.includes('ឃុំ')) : -1;

        const guestsToImport = dataLines
          .map((line) => {
            const parts = parseRow(line);
            const guestName = parts[nameIdx >= 0 ? nameIdx : 0] || '';
            if (!guestName.trim()) return null;

            let parsedSide: 'GROOM' | 'BRIDE' | 'BOTH' = 'BOTH';
            if (sideIdx >= 0 && parts[sideIdx]) {
              const s = parts[sideIdx].toUpperCase();
              if (s.includes('GROOM') || s.includes('កំលោះ')) parsedSide = 'GROOM';
              else if (s.includes('BRIDE') || s.includes('ក្រមុំ')) parsedSide = 'BRIDE';
            }

            let parsedTable: number | undefined = undefined;
            const tableVal = tableIdx >= 0 ? parts[tableIdx] : parts[2];
            if (tableVal) {
              const num = parseInt(normalizeKhmerDigits(tableVal).replace(/\D/g, ''), 10);
              if (!isNaN(num)) parsedTable = num;
            }

            return {
              name: guestName.trim(),
              phone: (phoneIdx >= 0 ? parts[phoneIdx] : parts[1]) || undefined,
              side: parsedSide,
              tableNumber: parsedTable,
              province: (provIdx >= 0 ? parts[provIdx] : parts[3]) || undefined,
              district: distIdx >= 0 ? parts[distIdx] : undefined,
              commune: commIdx >= 0 ? parts[commIdx] : undefined,
            };
          })
          .filter(Boolean) as {
            name: string;
            phone?: string;
            side: 'GROOM' | 'BRIDE' | 'BOTH';
            tableNumber?: number;
            province?: string;
            district?: string;
            commune?: string;
          }[];

        if (guestsToImport.length === 0) {
          return toast.error('មិនមានទិន្នន័យភ្ញៀវត្រឹមត្រូវក្នុងឯកសារ CSV ឡើយ');
        }

        await batchImportMutation.mutateAsync(guestsToImport);
        toast.success(`បានបញ្ចូលភ្ញៀវចំនួន ${guestsToImport.length} នាក់ដោយជោគជ័យ!`);
        setIsImportModalOpen(false);
      } catch {
        toast.error('មានបញ្ហាក្នុងការបញ្ចូលឯកសារ CSV');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filter list
  const normalizedGuestSearch = normalizeSearchText(searchTerm);
  const availableTables = Array.from(
    new Set(
      (guestsData?.data || [])
        .map((g) => g.tableNumber)
        .filter((t): t is number => typeof t === 'number' && !isNaN(t)),
    ),
  ).sort((a, b) => a - b);

  const filteredGuests = guestsData?.data?.filter((g) => {
    const matchesSearch =
      !normalizedGuestSearch ||
      normalizeSearchText(g.name).includes(normalizedGuestSearch) ||
      normalizeSearchText(g.phone).includes(normalizedGuestSearch);
    const matchesSide = !sideFilter || g.side === sideFilter;
    const matchesStatus = !statusFilter || g.invitationStatus === statusFilter;
    const matchesTable = !tableFilter || String(g.tableNumber ?? '') === tableFilter;
    return matchesSearch && matchesSide && matchesStatus && matchesTable;
  });

  return (
    <div className="space-y-6 font-khmer-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-khmer-body text-2xl sm:text-3xl font-bold tracking-tight text-[#212E1E]">
            បញ្ជីភ្ញៀវកិត្តិយស
          </h1>
          <p className="font-khmer-body text-xs sm:text-sm text-[#5C6E57] mt-1">
            គ្រប់គ្រងការអញ្ជើញ កំណត់លេខតុ និងពិនិត្យវត្តមានភ្ញៀវតាមរាជធានី-ខេត្ត។
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-khmer-heading">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="rounded-full border-[#D8C7A8] text-[#3E513A] hover:bg-[#EAE4D5] text-xs h-9"
          >
            <Download className="mr-1.5 h-3.5 w-3.5 text-[#C59F54]" /> ទាញយក CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            className="rounded-full border-[#D8C7A8] text-[#3E513A] hover:bg-[#EAE4D5] text-xs h-9"
          >
            <Upload className="mr-1.5 h-3.5 w-3.5 text-[#4E8B7C]" /> បញ្ចូល CSV
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#243521] hover:bg-[#1A2617] text-white rounded-full text-xs h-9 px-4 font-bold shadow-md border border-[#C59F54]/40"
          >
            <Plus className="mr-1.5 h-4 w-4 text-[#E6C673]" /> បន្ថែមភ្ញៀវថ្មី
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4 bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 border border-white/85 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] rounded-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#8A9C84]" />
            <Input
              placeholder="ស្វែងរកតាមឈ្មោះ ឬលេខទូរស័ព្ទ..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-9 bg-white/70 backdrop-blur-sm border-[#D8C7A8] rounded-xl h-10 text-xs sm:text-sm"
            />
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
            <div className="w-full sm:w-40">
              <CustomSelect
                value={sideFilter}
                onChange={(val) => {
                  setSideFilter(val);
                  setPage(1);
                }}
                searchable={false}
                options={[
                  { value: '', label: 'ខាងទាំងអស់' },
                  { value: 'GROOM', label: 'ខាងកូនកំលោះ' },
                  { value: 'BRIDE', label: 'ខាងកូនក្រមុំ' },
                  { value: 'BOTH', label: 'ទាំងសងខាង' },
                ]}
                placeholder="ខាង"
                className="[&_button]:h-10 [&_button]:rounded-xl [&_button]:bg-white/70 [&_button]:border-[#D8C7A8]"
              />
            </div>
            <div className="w-full sm:w-40">
              <CustomSelect
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
                searchable={false}
                options={[
                  { value: '', label: 'ស្ថានភាពទាំងអស់' },
                  { value: 'INVITED', label: 'បានអញ្ជើញ' },
                  { value: 'ATTENDED', label: 'បានមកដល់' },
                ]}
                placeholder="ស្ថានភាព"
                className="[&_button]:h-10 [&_button]:rounded-xl [&_button]:bg-white/70 [&_button]:border-[#D8C7A8]"
              />
            </div>
            <div className="w-full sm:w-36">
              <CustomSelect
                value={tableFilter}
                onChange={(val) => {
                  setTableFilter(val);
                  setPage(1);
                }}
                options={[
                  { value: '', label: 'តុទាំងអស់' },
                  ...availableTables.map((t) => ({ value: String(t), label: `តុលេខ ${t}` })),
                ]}
                placeholder="តុលេខ"
                className="[&_button]:h-10 [&_button]:rounded-xl [&_button]:bg-white/70 [&_button]:border-[#D8C7A8]"
              />
            </div>
            {(searchTerm || sideFilter || statusFilter || tableFilter) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSideFilter('');
                  setStatusFilter('');
                  setTableFilter('');
                  setPage(1);
                }}
                className="h-10 rounded-xl border-[#D8C7A8] text-[#3E513A] hover:bg-[#EAE4D5] text-xs px-3 cursor-pointer"
              >
                <X className="mr-1 h-3.5 w-3.5" /> សម្អាត
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Guest Table */}
      <Card className="border border-white/85 overflow-hidden bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 rounded-2xl shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)]">
        <Table>
          <TableHeader className="bg-gradient-to-b from-white/35 via-white/15 to-white/20 backdrop-blur-sm border-b border-white/70">
            <TableRow>
              <TableHead className="font-khmer-heading text-xs font-bold text-[#212E1E]">ឈ្មោះភ្ញៀវ</TableHead>
              <TableHead className="font-khmer-heading text-xs font-bold text-[#212E1E]">លេខទូរស័ព្ទ</TableHead>
              <TableHead className="font-khmer-heading text-xs font-bold text-[#212E1E]">ខាង</TableHead>
              <TableHead className="font-khmer-heading text-xs font-bold text-[#212E1E]">តុលេខ</TableHead>
              <TableHead className="font-khmer-heading text-xs font-bold text-[#212E1E]">អាសយដ្ឋាន</TableHead>
              <TableHead className="font-khmer-heading text-xs font-bold text-[#212E1E]">ស្ថានភាព</TableHead>
              <TableHead className="font-khmer-heading text-xs font-bold text-[#212E1E] text-right">សកម្មភាព</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-[#63765E]">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#4E8B7C] mb-2" />
                  កំពុងផ្ទុកបញ្ជីភ្ញៀវ...
                </TableCell>
              </TableRow>
            ) : filteredGuests?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-[#63765E]">
                  <Users className="h-8 w-8 mx-auto text-[#C59F54] mb-2 opacity-60" />
                  <p className="font-khmer-heading text-sm font-bold text-[#212E1E]">មិនមានភ្ញៀវក្នុងបញ្ជីឡើយ</p>
                  <p className="text-xs text-[#8A9C84] mt-1">ចុច «បន្ថែមភ្ញៀវថ្មី» ឬ «បញ្ចូល CSV» ដើម្បីចាប់ផ្តើម</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredGuests?.map((guest) => (
                <TableRow key={guest.id} className="hover:bg-white/45 transition-colors border-b border-[#E8DFC9]/45">
                  <TableCell className="font-semibold text-[#212E1E]">{guest.name}</TableCell>
                  <TableCell className="text-xs text-[#5C6E57] font-mono">{guest.phone || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] border-[#D8C7A8] text-[#3E513A] bg-[#FAF8F3]">
                      {guest.side === 'GROOM'
                        ? 'ខាងកូនកំលោះ'
                        : guest.side === 'BRIDE'
                        ? 'ខាងកូនក្រមុំ'
                        : 'ទាំងសងខាង'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-[#243521]">
                    {guest.tableNumber ? `តុលេខ ${guest.tableNumber}` : '—'}
                  </TableCell>
                  <TableCell className="text-xs text-[#63765E]">
                    {[guest.province, guest.district].filter(Boolean).join(', ') || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`text-[10px] font-semibold py-0.5 px-2 rounded-full ${
                        guest.invitationStatus === 'ATTENDED'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-[#EAE4D5] text-[#46381C] border border-[#D5C7AE]'
                      }`}
                    >
                      {guest.invitationStatus === 'ATTENDED' ? '✅ បានមកដល់' : '📩 បានអញ្ជើញ'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const pCode =
                            provinces.find((pr) => pr.nameKm === guest.province)?.code || '';
                          const dCode = pCode
                            ? getDistrictsByProvince(pCode).find((d) => d.nameKm === guest.district)
                                ?.code || ''
                            : '';
                          setEditProvinceCode(pCode);
                          setEditDistrictCode(dCode);
                          const guestGifts = guest.gifts || [];
                          const firstGift = guestGifts[0];
                          const totalUSD = guestGifts.reduce(
                            (sum, g) => sum + (Number(g.amountUSD ?? (g.currency === 'USD' ? g.amount : 0)) || 0),
                            0,
                          );
                          const totalKHR = guestGifts.reduce(
                            (sum, g) => sum + (Number(g.amountKHR ?? (g.currency === 'KHR' ? g.amount : 0)) || 0),
                            0,
                          );
                          const initialMode: 'USD' | 'KHR' | 'BOTH' =
                            totalUSD > 0 && totalKHR > 0 ? 'BOTH' : totalUSD > 0 ? 'USD' : 'KHR';

                          setEditingGuest({
                            id: guest.id,
                            name: guest.name,
                            phone: guest.phone,
                            side: guest.side,
                            relationship: guest.relationship,
                            invitationStatus: guest.invitationStatus,
                            tableNumber: guest.tableNumber,
                            province: guest.province,
                            district: guest.district,
                            commune: guest.commune,
                            village: guest.village,
                            notes: guest.notes,
                            hasGifts: guestGifts.length > 0,
                            giftMode: initialMode,
                            usdGiftId: firstGift?.id,
                            usdAmount: totalUSD > 0 ? totalUSD : 15,
                            khrGiftId: guestGifts[1]?.id || firstGift?.id,
                            khrAmount: totalKHR > 0 ? totalKHR : 60000,
                            giftPaymentMethod: firstGift?.paymentMethod || 'CASH',
                            giftWishes: firstGift?.wishes || '',
                          });
                        }}
                        className="h-7 w-7 p-0 text-[#4E8B7C] hover:bg-[#FAF8F3] rounded-lg cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteGuestId(guest.id)}
                        className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-white/70 bg-white/20 backdrop-blur-sm font-khmer-heading text-xs">
          <div className="flex items-center gap-2 text-[#5C6E57]">
            <span>បង្ហាញក្នុងមួយទំព័រ៖</span>
            <RowsPerPageSelect
              value={take}
              onChange={(val) => {
                setTake(val);
                setPage(1);
              }}
            />
            <span className="text-[#8A9C84]">
              (សរុប៖ {guestsData?.meta?.itemCount ?? guestsData?.data?.length ?? 0} នាក់)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#5C6E57] mr-1">
              ទំព័រទី <strong className="text-[#212E1E]">{page}</strong> នៃ{' '}
              <strong className="text-[#212E1E]">{guestsData?.meta?.pageCount || 1}</strong>
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
              disabled={!guestsData?.meta?.hasNextPage && page >= (guestsData?.meta?.pageCount || 1)}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 w-8 p-0 rounded-lg border-[#D8C7A8] text-[#243521] hover:bg-[#EAE4D5] disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* ADD GUEST MODAL (STRUCTURED STEPPED CARD UI) */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen} className="max-w-[95vw] sm:max-w-2xl">
        <DialogContent className="p-0 overflow-hidden flex flex-col bg-[#FAF8F3] border border-[#E2D7C0] rounded-3xl font-khmer-body shadow-2xl">
          {/* Dynamic Animated Progress Bar */}
          {(() => {
            const fields = [
              Boolean(name.trim()),
              Boolean(phone.trim()),
              Boolean(tableNumber.trim()),
              Boolean(selectedProvinceCode),
              Boolean(selectedDistrictCode),
              Boolean(selectedCommuneName),
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
                <UserPlus className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="font-khmer-body text-base font-bold text-[#212E1E] leading-tight">
                  បន្ថែមភ្ញៀវកិត្តិយសថ្មី
                </h2>
                <p className="text-xs text-[#63765E] mt-0.5">
                  បញ្ចូលឈ្មោះ លេខតុ និងអាសយដ្ឋានភ្ញៀវសម្រាប់ពិធីមង្គលការ
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="h-8 w-8 rounded-full bg-[#FAF6EE] hover:bg-[#EFE9DC] text-[#63765E] hover:text-[#212E1E] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleAddGuest} className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 overflow-y-auto">
            {/* Card 1: Guest Personal Details */}
            <div className="bg-white rounded-2xl p-5 border border-[#E8DFC9] shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="h-6 w-6 rounded-full border border-[#C59F54] bg-[#F6EFE0] text-[#8C6D23] text-xs font-bold flex items-center justify-center shrink-0">
                  ១
                </span>
                <span className="text-sm font-semibold text-[#243521]">ព័ត៌មានទូទៅរបស់ភ្ញៀវ</span>
              </div>

              <div className="space-y-2.5 text-left">
                <label className="text-xs font-medium text-[#3E513A] block">
                  ឈ្មោះពេញ <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ឧ. សុខ សាន"
                  required
                  className="bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl h-10 text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-2.5 text-left">
                  <label className="text-xs font-medium text-[#3E513A] block">លេខទូរស័ព្ទ</label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="012 345 678"
                    className="bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl h-10 text-sm font-mono transition-all"
                  />
                </div>
                <div className="space-y-2.5 text-left">
                  <label className="text-xs font-medium text-[#3E513A] block">តុលេខ</label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(normalizeKhmerDigits(e.target.value))}
                      placeholder="ឧ. 5"
                      className="bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl h-10 text-sm transition-all"
                    />
                </div>
              </div>

              {/* Clean Radio Group for Guest Side (matching reference UI) */}
              <div className="space-y-2 text-left pt-1">
                <label className="text-xs font-medium text-[#3E513A] block">ភ្ញៀវខាង</label>
                <div className="flex flex-wrap items-center gap-4">
                  {[
                    { value: 'BOTH', label: 'ទាំងសងខាង' },
                    { value: 'GROOM', label: 'ខាងកូនកំលោះ' },
                    { value: 'BRIDE', label: 'ខាងកូនក្រមុំ' },
                  ].map((opt) => {
                    const active = side === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSide(opt.value as 'GROOM' | 'BRIDE' | 'BOTH')}
                        className="flex items-center gap-2 text-xs font-medium text-[#212E1E] cursor-pointer group"
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
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Card 2: Cambodia Location */}
            <div className="bg-white rounded-2xl p-5 border border-[#E8DFC9] shadow-2xs space-y-3 text-left">
              <div className="flex items-center gap-2.5">
                <span className="h-6 w-6 rounded-full border border-[#C59F54] bg-[#F6EFE0] text-[#8C6D23] text-xs font-bold flex items-center justify-center shrink-0">
                  ២
                </span>
                <span className="text-sm font-semibold text-[#243521]">អាសយដ្ឋានក្នុងប្រទេសកម្ពុជា</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-xs text-[#63765E] block mb-2">រាជធានី-ខេត្ត</label>
                  <CustomSelect
                    value={selectedProvinceCode}
                    onChange={(code) => {
                      setSelectedProvinceCode(code);
                      const p = provinces.find((pr) => pr.code === code);
                      setSelectedProvinceName(p?.nameKm || '');
                      setSelectedDistrictCode('');
                      setSelectedDistrictName('');
                      setSelectedCommuneName('');
                    }}
                    options={provinces.map((p) => ({ value: p.code, label: p.nameKm }))}
                    placeholder="ជ្រើសរើសខេត្ត"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#63765E] block mb-2">ក្រុង-ស្រុក-ខណ្ឌ</label>
                  <CustomSelect
                    value={selectedDistrictCode}
                    disabled={!selectedProvinceCode}
                    onChange={(code) => {
                      setSelectedDistrictCode(code);
                      const d = districts.find((dist) => dist.code === code);
                      setSelectedDistrictName(d?.nameKm || '');
                      setSelectedCommuneName('');
                    }}
                    options={districts.map((d) => ({ value: d.code, label: d.nameKm }))}
                    placeholder="ជ្រើសរើសស្រុក"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#63765E] block mb-2">ឃុំ-សង្កាត់</label>
                  <CustomSelect
                    value={selectedCommuneName}
                    disabled={!selectedDistrictCode}
                    onChange={(val) => setSelectedCommuneName(val)}
                    options={communes.map((c) => ({ value: c.nameKm, label: c.nameKm }))}
                    placeholder="ជ្រើសរើសឃុំ"
                  />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="h-10 px-5 rounded-xl border-[#D8C7A8] text-[#5C6E57] hover:bg-white cursor-pointer"
              >
                បោះបង់
              </Button>
              <Button
                type="submit"
                disabled={createGuestMutation.isPending}
                className="h-10 px-6 bg-[#243521] hover:bg-[#1A2617] text-white font-semibold rounded-xl shadow-sm border border-[#C59F54]/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {createGuestMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#E6C673]" />
                ) : (
                  <Check className="h-4 w-4 text-[#E6C673]" />
                )}
                <span>រក្សាទុកភ្ញៀវ</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* IMPORT CSV MODAL */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent onClose={() => setIsImportModalOpen(false)} className="bg-[#FAF8F3] border-[#E8DFC9] rounded-3xl font-khmer-body max-w-md">
          <DialogHeader>
            <DialogTitle className="font-khmer-heading text-lg font-bold text-[#212E1E]">
              បញ្ចូលបញ្ជីភ្ញៀវតាមឯកសារ CSV
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <p className="text-xs text-[#5C6E57]">
              សូមជ្រើសរើសឯកសារ CSV ដែលមានទម្រង់ជួរឈរ៖ <code>Name, Phone, Side, Table, Province</code>។
            </p>

            {/* Template Download Box */}
            <div className="p-3.5 bg-[#F4EFE6] border border-[#E8DFC9] rounded-2xl flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[#212E1E] font-khmer-heading">គំរូឯកសារ Excel (CSV)</p>
                <p className="text-[11px] text-[#63765E]">បើកក្នុង Microsoft Excel ដោយគ្មានខូចពុម្ពអក្សរខ្មែរ</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadSampleTemplate}
                className="shrink-0 text-xs h-8 px-3 rounded-xl border-[#C59F54] text-[#8C6D23] hover:bg-[#C59F54]/10 cursor-pointer flex items-center gap-1.5 font-khmer-heading"
              >
                <Download className="w-3.5 h-3.5 text-[#C59F54]" />
                ទាញយកគំរូ
              </Button>
            </div>

            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-[#3E513A] font-khmer-heading">ជ្រើសរើសឯកសារ CSV របស់អ្នក</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
                className="w-full text-xs file:mr-2 file:rounded-xl file:border-0 file:bg-[#243521] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white cursor-pointer font-khmer-heading"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* EDIT GUEST MODAL (STRUCTURED 2-CARD STEPPED UI) */}
      <Dialog
        open={!!editingGuest}
        onOpenChange={(open) => !open && setEditingGuest(null)}
        className="max-w-[95vw] lg:max-w-[76vw]"
      >
        <DialogContent className="p-0 overflow-hidden flex flex-col bg-[#FAF8F3] border border-[#E2D7C0] rounded-3xl font-khmer-body shadow-2xl max-h-[92dvh]">
          {/* Dynamic Animated Progress Bar */}
          {editingGuest &&
            (() => {
              const fields = [
                Boolean(editingGuest.name?.trim()),
                Boolean(editingGuest.phone?.trim()),
                Boolean(editingGuest.tableNumber),
                Boolean(editingGuest.province?.trim()),
                Boolean(editingGuest.relationship?.trim() || editingGuest.notes?.trim()),
                editingGuest.hasGifts
                  ? editingGuest.giftMode === 'USD'
                    ? Number(editingGuest.usdAmount) > 0
                    : editingGuest.giftMode === 'KHR'
                    ? Number(editingGuest.khrAmount) > 0
                    : Number(editingGuest.usdAmount) > 0 && Number(editingGuest.khrAmount) > 0
                  : true,
              ];
              const pct = Math.round((fields.filter(Boolean).length / fields.length) * 100);
              return (
                <div className="h-1.5 w-full bg-[#EAE3D3] overflow-hidden shrink-0">
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
                <Pencil className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-khmer-body text-base font-bold text-[#212E1E] leading-tight">
                  កែប្រែព័ត៌មានភ្ញៀវកិត្តិយស
                </h2>
                <p className="text-xs text-[#63765E] mt-0.5">
                  កែប្រែព័ត៌មានទូទៅ អាសយដ្ឋាន និងទឹកប្រាក់ចំណងដៃរបស់ភ្ញៀវ
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEditingGuest(null)}
              className="h-8 w-8 rounded-full bg-[#FAF6EE] hover:bg-[#EFE9DC] text-[#63765E] hover:text-[#212E1E] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {editingGuest && (
            <form onSubmit={handleUpdateGuest} className="p-4 sm:p-6 space-y-5 flex-1 min-h-0 overflow-y-auto">
              <div className="flex flex-col lg:flex-row gap-5 items-stretch">
                {/* CARD 1: Guest Personal Details */}
                <div className="flex-1 bg-white rounded-2xl p-5 sm:p-6 border border-[#E8DFC9] shadow-2xs space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="h-6 w-6 rounded-full border border-[#C59F54] bg-[#F6EFE0] text-[#8C6D23] text-xs font-bold flex items-center justify-center shrink-0">
                      ១
                    </span>
                    <span className="text-sm font-semibold text-[#243521]">ព័ត៌មានទូទៅរបស់ភ្ញៀវ</span>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-xs font-medium text-[#3E513A] block">
                      ឈ្មោះពេញ <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      value={editingGuest.name}
                      onChange={(e) => setEditingGuest({ ...editingGuest, name: e.target.value })}
                      placeholder="ឧ. សុខ សាន"
                      required
                      className="bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl h-11 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-medium text-[#3E513A] block">លេខទូរស័ព្ទ</label>
                      <Input
                        value={editingGuest.phone || ''}
                        onChange={(e) => setEditingGuest({ ...editingGuest, phone: e.target.value })}
                        placeholder="012 345 678"
                        className="bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl h-11 font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-medium text-[#3E513A] block">តុលេខ</label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={editingGuest.tableNumber ?? ''}
                        onChange={(e) => {
                          const val = normalizeKhmerDigits(e.target.value);
                          const num = parseInt(val, 10);
                          setEditingGuest({
                            ...editingGuest,
                            tableNumber: isNaN(num) ? undefined : num,
                          });
                        }}
                        placeholder="ឧ. 5"
                        className="bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl h-11 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-medium text-[#3E513A] block">ភ្ញៀវខាង</label>
                      <CustomSelect
                        value={editingGuest.side}
                        onChange={(val) =>
                          setEditingGuest({ ...editingGuest, side: val as 'GROOM' | 'BRIDE' | 'BOTH' })
                        }
                        options={[
                          { value: 'BOTH', label: 'ទាំងសងខាង (កូនកំលោះ & កូនក្រមុំ)' },
                          { value: 'GROOM', label: 'ខាងកូនកំលោះ' },
                          { value: 'BRIDE', label: 'ខាងកូនក្រមុំ' },
                        ]}
                      />
                    </div>

                    <div className="space-y-2 text-left">
                      <label className="text-xs font-medium text-[#3E513A] block">ស្ថានភាព</label>
                      <CustomSelect
                        value={editingGuest.invitationStatus}
                        onChange={(val) =>
                          setEditingGuest({
                            ...editingGuest,
                            invitationStatus: val as 'INVITED' | 'ATTENDED' | 'DECLINED',
                          })
                        }
                        options={[
                          { value: 'INVITED', label: 'បានអញ្ជើញ' },
                          { value: 'ATTENDED', label: 'បានមកដល់' },
                          { value: 'DECLINED', label: 'មិនអាចចូលរួម' },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-xs font-medium text-[#3E513A] block">
                      កំណត់ចំណាំអំពីភ្ញៀវ <span className="text-[#8A9C84] font-normal">(ស្រេចចិត្ត)</span>
                    </label>
                    <Input
                      value={editingGuest.notes || ''}
                      onChange={(e) => setEditingGuest({ ...editingGuest, notes: e.target.value })}
                      placeholder="ឧ. មិត្តភក្តិសាកលវិទ្យាល័យ, សាច់ញាតិ ឬ កំណត់ចំណាំផ្សេងៗ..."
                      className="bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl h-11 text-sm"
                    />
                  </div>
                </div>

                {/* CARD 2: Address & Gift Money */}
                <div className="flex-1 bg-white rounded-2xl p-5 sm:p-6 border border-[#E8DFC9] shadow-2xs space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="h-6 w-6 rounded-full border border-[#C59F54] bg-[#F6EFE0] text-[#8C6D23] text-xs font-bold flex items-center justify-center shrink-0">
                      ២
                    </span>
                    <span className="text-sm font-semibold text-[#243521]">អាសយដ្ឋាន &amp; ចំណងដៃ</span>
                  </div>

                  {/* Address Section */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold text-[#3E513A]">
                      អាសយដ្ឋានភ្ញៀវ <span className="text-[#8A9C84] font-normal">(ស្រេចចិត្ត)</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-xs text-[#63765E] block mb-1.5">ខេត្ត/ក្រុង</label>
                        <CustomSelect
                          value={editProvinceCode}
                          onChange={(code) => {
                            setEditProvinceCode(code);
                            const p = provinces.find((pr) => pr.code === code);
                            setEditDistrictCode('');
                            setEditingGuest({
                              ...editingGuest,
                              province: p?.nameKm || '',
                              district: '',
                              commune: '',
                            });
                          }}
                          options={provinces.map((p) => ({ value: p.code, label: p.nameKm }))}
                          placeholder={editingGuest.province || 'ជ្រើសរើសខេត្ត'}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#63765E] block mb-1.5">ស្រុក/ខណ្ឌ</label>
                        <CustomSelect
                          value={editDistrictCode}
                          disabled={!editProvinceCode}
                          onChange={(code) => {
                            setEditDistrictCode(code);
                            const d = editDistricts.find((dist) => dist.code === code);
                            setEditingGuest({
                              ...editingGuest,
                              district: d?.nameKm || '',
                              commune: '',
                            });
                          }}
                          options={editDistricts.map((d) => ({ value: d.code, label: d.nameKm }))}
                          placeholder={editingGuest.district || 'ជ្រើសរើសស្រុក'}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#63765E] block mb-1.5">ឃុំ/សង្កាត់</label>
                        <CustomSelect
                          value={editingGuest.commune || ''}
                          disabled={!editDistrictCode}
                          onChange={(val) => setEditingGuest({ ...editingGuest, commune: val })}
                          options={editCommunes.map((c) => ({ value: c.nameKm, label: c.nameKm }))}
                          placeholder={editingGuest.commune || 'ជ្រើសរើសឃុំ'}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#63765E] block mb-1.5">ភូមិ</label>
                        <Input
                          value={editingGuest.village || ''}
                          onChange={(e) => setEditingGuest({ ...editingGuest, village: e.target.value })}
                          placeholder="ភូមិ"
                          className="bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl h-10 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gift Money Editing Section (3 conditions: KHR / USD / BOTH) */}
                  <div className="pt-3 border-t border-[#F0EAE1] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#243521]">
                      <Banknote className="h-4 w-4 text-[#C59F54]" />
                      <span>ទឹកប្រាក់ចំណងដៃ</span>
                    </div>

                    {!editingGuest.hasGifts ? (
                      <div className="p-4 rounded-xl bg-[#FAF8F3] border border-dashed border-[#DFD5C3] text-center text-xs text-[#8A9C84]">
                        ភ្ញៀវនេះមិនទាន់មានកំណត់ត្រាចំណងដៃនៅឡើយទេ
                      </div>
                    ) : editingGuest.invitationStatus === 'INVITED' ? (
                      <div className="p-4 rounded-xl bg-[#FDF6EC] border border-dashed border-[#E6C587] text-center text-xs text-[#8C6D23]">
                        ស្ថានភាពត្រូវបានប្តូរទៅ «បានអញ្ជើញ» — កំណត់ត្រាចំណងដៃនឹងត្រូវលុបចេញដោយស្វ័យប្រវត្តិនៅពេលរក្សាទុក ដើម្បីអាចកត់ត្រាឡើងវិញបាន។
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#E8DFC9] space-y-3.5">
                        {/* 3 Currency Mode Pills */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-[#3E513A] block">រូបិយប័ណ្ណ</label>
                          <div className="flex flex-wrap items-center gap-4">
                            {[
                              { value: 'KHR', label: 'រៀល (៛)' },
                              { value: 'USD', label: 'ដុល្លារ ($)' },
                              { value: 'BOTH', label: 'ទាំងពីរ (ដុល្លារ & រៀល)' },
                            ].map((curr) => {
                              const active = editingGuest.giftMode === curr.value;
                              return (
                                <button
                                  key={curr.value}
                                  type="button"
                                  onClick={() =>
                                    setEditingGuest({
                                      ...editingGuest,
                                      giftMode: curr.value as 'USD' | 'KHR' | 'BOTH',
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
                                  <span className={active ? 'font-semibold text-[#243521]' : 'text-[#5C6E57]'}>
                                    {curr.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Amount Input(s) with Number Push (- / +) */}
                        <div
                          className={
                            editingGuest.giftMode === 'BOTH'
                              ? 'grid grid-cols-1 sm:grid-cols-2 gap-3'
                              : ''
                          }
                        >
                          {(editingGuest.giftMode === 'USD' || editingGuest.giftMode === 'BOTH') && (
                            <div>
                              <label className="text-xs text-[#63765E] block mb-1.5">
                                ចំនួនទឹកប្រាក់ដុល្លារ ($)
                              </label>
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={editingGuest.usdAmount}
                                onChange={(e) => {
                                  const val = parseFloat(normalizeKhmerDigits(e.target.value));
                                  setEditingGuest({
                                    ...editingGuest,
                                    usdAmount: isNaN(val) ? 0 : val,
                                  });
                                }}
                                placeholder="ឧ. 50"
                                className="h-10 bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl text-sm font-medium"
                              />
                            </div>
                          )}

                          {(editingGuest.giftMode === 'KHR' || editingGuest.giftMode === 'BOTH') && (
                            <div>
                              <label className="text-xs text-[#63765E] block mb-1.5">
                                ចំនួនទឹកប្រាក់រៀល (៛)
                              </label>
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={editingGuest.khrAmount}
                                onChange={(e) => {
                                  const val = parseFloat(normalizeKhmerDigits(e.target.value));
                                  setEditingGuest({
                                    ...editingGuest,
                                    khrAmount: isNaN(val) ? 0 : val,
                                  });
                                }}
                                placeholder="ឧ. 60000"
                                className="h-10 bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl text-sm font-medium"
                              />
                            </div>
                          )}
                        </div>

                        {/* Payment Method & Wishes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-[#63765E] block mb-1.5">វិធីទូទាត់</label>
                            <CustomSelect
                              value={editingGuest.giftPaymentMethod}
                              onChange={(val) =>
                                setEditingGuest({
                                  ...editingGuest,
                                  giftPaymentMethod: val as 'CASH' | 'QR_CODE' | 'BANK_TRANSFER',
                                })
                              }
                              options={[
                                { value: 'CASH', label: 'សាច់ប្រាក់' },
                                { value: 'QR_CODE', label: 'KHQR' },
                              ]}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-[#63765E] block mb-1.5">ពាក្យជូនពរ</label>
                            <Input
                              value={editingGuest.giftWishes || ''}
                              onChange={(e) =>
                                setEditingGuest({ ...editingGuest, giftWishes: e.target.value })
                              }
                              placeholder="ពាក្យជូនពរ..."
                              className="h-10 bg-white border-[#DFD5C3] rounded-xl text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingGuest(null)}
                  className="h-10 px-5 rounded-xl border-[#D8C7A8] text-[#5C6E57] hover:bg-white cursor-pointer"
                >
                  បោះបង់
                </Button>
                <Button
                  type="submit"
                  disabled={updateGuestMutation.isPending || updateGiftMutation.isPending}
                  className="h-10 px-6 bg-[#243521] hover:bg-[#1A2617] text-white font-semibold rounded-xl shadow-sm border border-[#C59F54]/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {updateGuestMutation.isPending || updateGiftMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#E6C673]" />
                  ) : (
                    <Check className="h-4 w-4 text-[#E6C673]" />
                  )}
                  <span>រក្សាទុកការកែប្រែ</span>
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={!!deleteGuestId} onOpenChange={(open) => !open && setDeleteGuestId(null)}>
        <DialogContent onClose={() => setDeleteGuestId(null)} className="max-w-md bg-[#FAF8F3] border-[#E8DFC9] rounded-3xl font-khmer-body">
          <DialogHeader>
            <DialogTitle className="font-khmer-heading text-lg font-bold text-rose-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
              បញ្ជាក់ការលុបភ្ញៀវ
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {deletingGuestHasGifts ? (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 leading-relaxed">
                មិនអាចលុបភ្ញៀវ <span className="font-semibold">{deletingGuest?.name}</span> បានទេ ព្រោះភ្ញៀវនេះមានកំណត់ត្រាចំណងដៃរួចហើយ។ សូមទៅលុបកំណត់ត្រាចំណងដៃនៅទំព័រ «កត់ត្រាចំណងដៃ» ជាមុនសិន!
              </div>
            ) : (
              <p className="text-sm text-[#5C6E57]">
                តើអ្នកពិតជាចង់លុបភ្ញៀវនេះចេញពីបញ្ជីមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានឡើយ។
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeleteGuestId(null)}
                className="rounded-xl border-[#D8C7A8] text-[#3E513A] hover:bg-[#EAE4D5] text-xs h-9"
              >
                {deletingGuestHasGifts ? 'បិទ' : 'បោះបង់'}
              </Button>
              {!deletingGuestHasGifts && (
                <Button
                  onClick={handleDeleteGuest}
                  disabled={deleteGuestMutation.isPending}
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs h-9 px-4 font-bold cursor-pointer"
                >
                  {deleteGuestMutation.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                  យល់ព្រមលុប
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CONFIRM RESET TO INVITED (REMOVES GIFT) DIALOG */}
      <Dialog open={confirmResetGiftOpen} onOpenChange={(open) => !open && setConfirmResetGiftOpen(false)}>
        <DialogContent onClose={() => setConfirmResetGiftOpen(false)} className="max-w-md bg-[#FAF8F3] border-[#E8DFC9] rounded-3xl font-khmer-body">
          <DialogHeader>
            <DialogTitle className="font-khmer-heading text-lg font-bold text-[#8C6D23] flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#C59F54]" />
              បញ្ជាក់ការលុបកំណត់ត្រាចំណងដៃ
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-[#5C6E57] leading-relaxed">
              ការប្តូរស្ថានភាពភ្ញៀវ <span className="font-semibold text-[#243521]">{editingGuest?.name}</span> ទៅជា «បានអញ្ជើញ» នឹងលុបកំណត់ត្រាចំណងដៃដែលមានស្រាប់ចេញពីប្រព័ន្ធ និងបេឡា ដើម្បីអាចកត់ត្រាឡើងវិញបាន។ តើអ្នកពិតជាចង់បន្តមែនទេ?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setConfirmResetGiftOpen(false)}
                className="rounded-xl border-[#D8C7A8] text-[#3E513A] hover:bg-[#EAE4D5] text-xs h-9"
              >
                បោះបង់
              </Button>
              <Button
                onClick={performUpdateGuest}
                disabled={updateGuestMutation.isPending}
                className="bg-[#2F432B] hover:bg-[#233320] text-white rounded-xl text-xs h-9 px-4 font-bold cursor-pointer"
              >
                {updateGuestMutation.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                បញ្ជាក់ និងលុបចំណងដៃ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
