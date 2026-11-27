'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useActiveWedding } from '@/context/wedding-context';
import {
  useClerks,
  useCreateClerk,
  useUpdateClerk,
  useAssignClerkWeddings,
  useDeleteClerk,
  ClerkUser,
} from '@/hooks/use-clerks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import { CustomSelect } from '@/components/ui/custom-select';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  UserPlus,
  Users,
  Heart,
  Loader2,
  Trash2,
  Check,
  X,
  Phone,
  Mail,
  ShieldAlert,
  AlertTriangle,
  Calendar,
  Search,
  Eye,
  EyeOff,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { normalizeSearchText } from '@/lib/utils';

export default function ClerksPage() {
  const { user } = useAuth();
  const isClerk = user?.role === 'CLERK' || user?.role === 'ACCOUNTANT';
  const { weddings } = useActiveWedding();

  const { data: clerks, isLoading } = useClerks();
  const createClerkMutation = useCreateClerk();
  const updateClerkMutation = useUpdateClerk();
  const assignWeddingsMutation = useAssignClerkWeddings();
  const deleteClerkMutation = useDeleteClerk();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClerk, setEditingClerk] = useState<ClerkUser | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedWeddingIds, setSelectedWeddingIds] = useState<string[]>([]);
  const [createWeddingSearch, setCreateWeddingSearch] = useState('');
  const [createWeddingDate, setCreateWeddingDate] = useState('');

  const [assigningClerk, setAssigningClerk] = useState<ClerkUser | null>(null);
  const [assignWeddingIds, setAssignWeddingIds] = useState<string[]>([]);
  const [assignWeddingSearch, setAssignWeddingSearch] = useState('');
  const [assignWeddingDate, setAssignWeddingDate] = useState('');
  const [deleteClerkId, setDeleteClerkId] = useState<string | null>(null);
  const [clerkSearch, setClerkSearch] = useState('');
  const [clerkWeddingFilter, setClerkWeddingFilter] = useState('');

  const filterWeddings = (query: string, dateFilter?: string) => {
    const list = weddings || [];
    const q = normalizeSearchText(query);
    return list.filter((w) => {
      const matchesQuery =
        !q ||
        normalizeSearchText(`${w.groomName}&${w.brideName}`).includes(q) ||
        normalizeSearchText(`${w.groomName}${w.brideName}`).includes(q) ||
        normalizeSearchText(`${w.brideName}&${w.groomName}`).includes(q) ||
        normalizeSearchText(`${w.brideName}${w.groomName}`).includes(q) ||
        normalizeSearchText(w.venue).includes(q) ||
        normalizeSearchText(w.province).includes(q);
      const matchesDate =
        !dateFilter || w.weddingDate.toString().slice(0, 10) === dateFilter;
      return matchesQuery && matchesDate;
    });
  };

  if (isClerk) {
    return (
      <Card className="p-10 text-center max-w-lg mx-auto mt-10 rounded-3xl">
        <ShieldAlert className="h-12 w-12 text-amber-600 mx-auto mb-3" />
        <h2 className="font-khmer-heading text-lg font-bold text-[#212E1E]">
          មិនមានសិទ្ធិចូលប្រើទំព័រនេះទេ
        </h2>
        <p className="text-xs text-[#5C6E57] mt-1 mb-5">
          មានតែម្ចាស់កម្មវិធី (Owner) ប៉ុណ្ណោះដែលអាចបង្កើត និងចាត់តាំងអ្នកកត់ត្រាបាន។
        </p>
        <Link href="/dashboard">
          <Button className="bg-[#243521] text-white rounded-full px-6">
            ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង
          </Button>
        </Link>
      </Card>
    );
  }

  const toggleCreateWedding = (id: string) => {
    setSelectedWeddingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleAssignWedding = (id: string) => {
    setAssignWeddingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const openCreateModal = () => {
    setEditingClerk(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setShowPassword(false);
    setSelectedWeddingIds([]);
    setCreateWeddingSearch('');
    setCreateWeddingDate('');
    setIsCreateOpen(true);
  };

  const openEditModal = (clerk: ClerkUser) => {
    setEditingClerk(clerk);
    setFullName(clerk.fullName || '');
    setEmail(clerk.email || '');
    setPhone(clerk.phone || '');
    setPassword('');
    setShowPassword(false);
    setSelectedWeddingIds((clerk.assignedWeddings || []).map((w) => w.id));
    setCreateWeddingSearch('');
    setCreateWeddingDate('');
    setIsCreateOpen(true);
  };

  const handleSaveClerk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return toast.error('សូមបញ្ចូលឈ្មោះអ្នកកត់ត្រា');
    if (!email.trim() && !phone.trim()) {
      return toast.error('សូមបញ្ចូលអ៊ីមែល ឬ លេខទូរស័ព្ទយ៉ាងតិចមួយ');
    }
    if (!editingClerk && password.length < 6) {
      return toast.error('ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៦ ខ្ទង់');
    }
    if (editingClerk && password.trim().length > 0 && password.trim().length < 6) {
      return toast.error('ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៦ ខ្ទង់');
    }

    try {
      if (editingClerk) {
        await updateClerkMutation.mutateAsync({
          clerkId: editingClerk.id,
          data: {
            fullName: fullName.trim(),
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            password: password.trim() || undefined,
            weddingIds: selectedWeddingIds,
          },
        });
        toast.success('បានកែប្រែព័ត៌មានអ្នកកត់ត្រាដោយជោគជ័យ!');
      } else {
        await createClerkMutation.mutateAsync({
          fullName: fullName.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          password,
          weddingIds: selectedWeddingIds,
        });
        toast.success('បានបង្កើតគណនីអ្នកកត់ត្រាដោយជោគជ័យ!');
      }
      setIsCreateOpen(false);
      setEditingClerk(null);
      setFullName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setSelectedWeddingIds([]);
      setCreateWeddingSearch('');
      setCreateWeddingDate('');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (editingClerk ? 'មានបញ្ហាក្នុងការកែប្រែអ្នកកត់ត្រា' : 'មានបញ្ហាក្នុងការបង្កើតអ្នកកត់ត្រា');
      toast.error(msg);
    }
  };

  const openAssignModal = (clerk: ClerkUser) => {
    setAssigningClerk(clerk);
    setAssignWeddingIds((clerk.assignedWeddings || []).map((w) => w.id));
    setAssignWeddingSearch('');
    setAssignWeddingDate('');
  };

  const handleSaveAssignments = async () => {
    if (!assigningClerk) return;
    try {
      await assignWeddingsMutation.mutateAsync({
        clerkId: assigningClerk.id,
        weddingIds: assignWeddingIds,
      });
      toast.success(`បានកែប្រែការចាត់តាំងមង្គលការជូន ${assigningClerk.fullName} រួចរាល់!`);
      setAssigningClerk(null);
    } catch {
      toast.error('មានបញ្ហាក្នុងការចាត់តាំងមង្គលការ');
    }
  };

  const handleDeleteClerk = async () => {
    if (!deleteClerkId) return;
    try {
      await deleteClerkMutation.mutateAsync(deleteClerkId);
      toast.success('បានលុបគណនីអ្នកកត់ត្រាដោយជោគជ័យ!');
      setDeleteClerkId(null);
    } catch {
      toast.error('មានបញ្ហាក្នុងការលុបអ្នកកត់ត្រា');
    }
  };

  return (
    <div className="space-y-6 font-khmer-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-khmer-body text-2xl sm:text-3xl font-bold tracking-tight text-[#212E1E]">
            គ្រប់គ្រងអ្នកកត់ត្រា (Clerks)
          </h1>
          <p className="font-khmer-body text-xs sm:text-sm text-[#5C6E57] mt-1">
            បង្កើតគណនីអ្នកកត់ត្រា និងចាត់តាំងពិធីមង្គលការដែលពួកគេអាចមើល និងកត់ត្រាចំណងដៃបាន។
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          size="lg"
          className="bg-[#243521] hover:bg-[#1A2617] text-white font-khmer-heading font-bold rounded-full px-6 shadow-md border border-[#C59F54]/40 cursor-pointer"
        >
          <UserPlus className="mr-2 h-4 w-4 text-[#E6C673]" />
          បង្កើតអ្នកកត់ត្រាថ្មី
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4 bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 border border-white/85 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#8A9C84]" />
            <Input
              placeholder="ស្វែងរកតាមឈ្មោះ អ៊ីមែល ឬលេខទូរស័ព្ទ..."
              value={clerkSearch}
              onChange={(e) => setClerkSearch(e.target.value)}
              className="pl-9 bg-white/70 backdrop-blur-sm border-[#D8C7A8] rounded-xl h-10 text-xs sm:text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-full sm:w-60">
              <CustomSelect
                value={clerkWeddingFilter}
                onChange={setClerkWeddingFilter}
                options={[
                  { value: '', label: 'មង្គលការទាំងអស់' },
                  { value: 'UNASSIGNED', label: 'មិនទាន់បានចាត់តាំង' },
                  ...(weddings || []).map((w) => ({
                    value: w.id,
                    label: `${w.groomName} & ${w.brideName}`,
                  })),
                ]}
                placeholder="ច្រោះតាមមង្គលការ"
                className="[&_button]:h-10 [&_button]:rounded-xl [&_button]:bg-white/70 [&_button]:border-[#D8C7A8]"
              />
            </div>
            {(clerkSearch || clerkWeddingFilter) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setClerkSearch('');
                  setClerkWeddingFilter('');
                }}
                className="h-10 rounded-xl border-[#D8C7A8] text-[#3E513A] hover:bg-[#EAE4D5] text-xs px-3 shrink-0 cursor-pointer"
              >
                <X className="mr-1 h-3.5 w-3.5" /> សម្អាត
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Clerks Table */}
      <Card className="border border-white/85 overflow-hidden bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 rounded-2xl shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)]">
        <Table>
          <TableHeader className="bg-gradient-to-b from-white/35 via-white/15 to-white/20 backdrop-blur-sm border-b border-white/70">
            <TableRow>
              <TableHead className="font-khmer-heading text-xs font-bold text-[#212E1E]">ឈ្មោះអ្នកកត់ត្រា</TableHead>
              <TableHead className="font-khmer-heading text-xs font-bold text-[#212E1E]">អ៊ីមែល / ទូរស័ព្ទ</TableHead>
              <TableHead className="font-khmer-heading text-xs font-bold text-[#212E1E]">មង្គលការដែលបានចាត់តាំង</TableHead>
              <TableHead className="font-khmer-heading text-xs font-bold text-[#212E1E] text-right">សកម្មភាព</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-[#63765E]">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#4E8B7C] mb-2" />
                  កំពុងផ្ទុកបញ្ជីអ្នកកត់ត្រា...
                </TableCell>
              </TableRow>
            ) : !clerks || clerks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-[#63765E]">
                  <Users className="h-8 w-8 mx-auto text-[#C59F54] mb-2 opacity-60" />
                  <p className="font-khmer-heading text-sm font-bold text-[#212E1E]">
                    មិនទាន់មានអ្នកកត់ត្រានៅឡើយទេ
                  </p>
                  <p className="text-xs text-[#8A9C84] mt-1">
                    ចុចប៊ូតុង «បង្កើតអ្នកកត់ត្រាថ្មី» ដើម្បីបង្កើត និងចាត់តាំងមង្គលការជូនពួកគេ
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              (() => {
                const q = normalizeSearchText(clerkSearch);
                const filteredClerks = clerks.filter((clerk) => {
                  const matchesSearch =
                    !q ||
                    normalizeSearchText(clerk.fullName).includes(q) ||
                    normalizeSearchText(clerk.email).includes(q) ||
                    normalizeSearchText(clerk.phone).includes(q);
                  const assignedIds = (clerk.assignedWeddings || []).map((w) => w.id);
                  const matchesWedding =
                    !clerkWeddingFilter ||
                    (clerkWeddingFilter === 'UNASSIGNED'
                      ? assignedIds.length === 0
                      : assignedIds.includes(clerkWeddingFilter));
                  return matchesSearch && matchesWedding;
                });

                if (filteredClerks.length === 0) {
                  return (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-[#63765E]">
                        <Search className="h-7 w-7 mx-auto text-[#C59F54] mb-2 opacity-60" />
                        <p className="font-khmer-heading text-sm font-bold text-[#212E1E]">
                          រកមិនឃើញអ្នកកត់ត្រាដែលត្រូវនឹងការច្រោះទេ
                        </p>
                      </TableCell>
                    </TableRow>
                  );
                }

                return filteredClerks.map((clerk) => (
                <TableRow
                  key={clerk.id}
                  className="hover:bg-white/45 transition-colors border-b border-[#E8DFC9]/45"
                >
                  <TableCell className="font-semibold text-[#212E1E]">
                    <div className="flex items-center gap-2">
                      <span className="h-8 w-8 rounded-full bg-[#EAF0E7] border border-[#C59F54]/40 flex items-center justify-center text-[#243521] text-xs font-bold shrink-0">
                        {clerk.fullName.charAt(0).toUpperCase()}
                      </span>
                      <span>{clerk.fullName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-[#5C6E57]">
                    <div className="flex flex-col gap-0.5">
                      {clerk.email && (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3 w-3 text-[#8A9C84]" /> {clerk.email}
                        </span>
                      )}
                      {clerk.phone && (
                        <span className="inline-flex items-center gap-1 font-mono">
                          <Phone className="h-3 w-3 text-[#8A9C84]" /> {clerk.phone}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {clerk.assignedWeddings && clerk.assignedWeddings.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {clerk.assignedWeddings.map((w) => (
                          <Badge
                            key={w.id}
                            className="bg-[#FAF6EE] text-[#243521] border border-[#C59F54]/50 text-[11px] font-medium"
                          >
                            <Heart className="h-3 w-3 mr-1 text-[#C59F54] fill-[#C59F54]" />
                            {w.groomName} &amp; {w.brideName}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-[#8A9C84]">មិនទាន់បានចាត់តាំងមង្គលការ</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openAssignModal(clerk)}
                        className="h-8 px-3.5 text-xs border-[#C59F54]/60 text-[#243521] hover:bg-[#FAF6EE] rounded-full font-khmer-heading cursor-pointer"
                      >
                        <Heart className="mr-1 h-3.5 w-3.5 text-[#C59F54]" /> ចាត់តាំងមង្គលការ
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(clerk)}
                        className="h-8 w-8 p-0 text-[#4E8B7C] hover:bg-[#FAF6EE] rounded-full cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteClerkId(clerk.id)}
                        className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-full cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                ));
              })()
            )}
          </TableBody>
        </Table>
      </Card>

      {/* CREATE CLERK MODAL (2-CARD FLEX LAYOUT + WEDDING SEARCH) */}
      <Dialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        className="max-w-[95vw] lg:max-w-[76vw]"
      >
        <DialogContent className="p-0 overflow-hidden flex flex-col bg-[#FAF8F3] border border-[#E2D7C0] rounded-3xl font-khmer-body shadow-2xl max-h-[92dvh]">
          {/* Dynamic Animated Progress Bar */}
          {(() => {
            const fields = [
              Boolean(fullName.trim()),
              Boolean(email.trim() || phone.trim()),
              password.length >= 6,
              selectedWeddingIds.length > 0,
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

          <div className="px-5 sm:px-6 py-4 bg-white border-b border-[#EFE9DC] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#F6EFE0] border border-[#C59F54]/30 flex items-center justify-center text-[#8C6D23] shrink-0">
                <UserPlus className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="font-khmer-body text-base font-bold text-[#212E1E] leading-tight">
                  {editingClerk ? 'កែប្រែព័ត៌មានអ្នកកត់ត្រា' : 'បង្កើតគណនីអ្នកកត់ត្រាថ្មី'}
                </h2>
                <p className="text-xs text-[#63765E] mt-0.5">
                  {editingClerk
                    ? 'កែប្រែឈ្មោះ អ៊ីមែល លេខទូរស័ព្ទ និងការចាត់តាំងមង្គលការ'
                    : 'បង្កើតគណនី និងស្វែងរកជ្រើសរើសមង្គលការដែលអ្នកកត់ត្រាអាចចូលប្រើបាន'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingClerk(null);
              }}
              className="h-8 w-8 rounded-full bg-[#FAF6EE] hover:bg-[#EFE9DC] text-[#63765E] hover:text-[#212E1E] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSaveClerk} autoComplete="off" className="p-4 sm:p-6 space-y-5 flex-1 min-h-0 overflow-y-auto">
            <div className="flex flex-col lg:flex-row gap-5 items-stretch">
              {/* CARD 1: Clerk Account Info */}
              <div className="flex-1 bg-white rounded-2xl p-5 sm:p-6 border border-[#E8DFC9] shadow-2xs space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="h-6 w-6 rounded-full border border-[#C59F54] bg-[#F6EFE0] text-[#8C6D23] text-xs font-bold flex items-center justify-center shrink-0">
                    ១
                  </span>
                  <span className="text-sm font-semibold text-[#243521]">ព័ត៌មានគណនីអ្នកកត់ត្រា</span>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#3E513A] block mb-1.5">
                    ឈ្មោះពេញ <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="ឧ. សុខ ចាន់"
                    autoComplete="off"
                    required
                    className="bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl h-11 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-medium text-[#3E513A] block mb-1.5">អ៊ីមែល</label>
                    <Input
                      type="email"
                      name="clerk-email"
                      autoComplete="off"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="clerk@example.com"
                      className="bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl h-11 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#3E513A] block mb-1.5">លេខទូរស័ព្ទ</label>
                    <Input
                      type="tel"
                      name="clerk-phone"
                      autoComplete="off"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="012 345 678"
                      className="bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl h-11 text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#3E513A] block mb-1.5">
                    {editingClerk ? (
                      <>
                        ពាក្យសម្ងាត់ថ្មី{' '}
                        <span className="text-[#8A9C84] font-normal">(ទុកទទេប្រសិនបើមិនប្តូរ)</span>
                      </>
                    ) : (
                      <>
                        ពាក្យសម្ងាត់ (យ៉ាងតិច ៦ ខ្ទង់) <span className="text-rose-500">*</span>
                      </>
                    )}
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      name="clerk-password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••"
                      required={!editingClerk}
                      className="bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl h-11 pr-11 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'លាក់ពាក្យសម្ងាត់' : 'បង្ហាញពាក្យសម្ងាត់'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#63765E] hover:text-[#212E1E] transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD 2: Search & Assign Weddings */}
              <div className="flex-1 bg-white rounded-2xl p-5 sm:p-6 border border-[#E8DFC9] shadow-2xs flex flex-col space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="h-6 w-6 rounded-full border border-[#C59F54] bg-[#F6EFE0] text-[#8C6D23] text-xs font-bold flex items-center justify-center shrink-0">
                      ២
                    </span>
                    <span className="text-sm font-semibold text-[#243521]">ចាត់តាំងមង្គលការ</span>
                  </div>
                  <Badge className="bg-[#FAF6EE] text-[#8C6D23] border border-[#C59F54]/40 text-[11px]">
                    {selectedWeddingIds.length} បានជ្រើសរើស
                  </Badge>
                </div>

                {/* Search & Date Filter */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-[#8A9C84]" />
                    <Input
                      value={createWeddingSearch}
                      onChange={(e) => setCreateWeddingSearch(e.target.value)}
                      placeholder="ស្វែងរកតាមឈ្មោះគូស្វាមីភរិយា..."
                      className="pl-9 bg-[#FAF8F3] border-[#DFD5C3] focus:border-[#C59F54] rounded-xl h-10 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="relative w-full sm:w-44 shrink-0">
                    <CustomDatePicker
                      value={createWeddingDate}
                      onChange={setCreateWeddingDate}
                      placeholder="ច្រោះតាមថ្ងៃ"
                      className="[&_button]:h-10 [&_button]:rounded-xl [&_button]:bg-[#FAF8F3] [&_button]:border-[#DFD5C3]"
                    />
                    {createWeddingDate && (
                      <button
                        type="button"
                        onClick={() => setCreateWeddingDate('')}
                        aria-label="សម្អាតថ្ងៃពិធី"
                        className="absolute right-8 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full flex items-center justify-center text-[#7D8C78] hover:text-[#212E1E] hover:bg-[#EAE4D5] cursor-pointer z-10"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {!weddings || weddings.length === 0 ? (
                  <p className="text-xs text-[#8A9C84] py-8 text-center">អ្នកមិនទាន់មានមង្គលការនៅឡើយទេ</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1 flex-1">
                    {filterWeddings(createWeddingSearch, createWeddingDate).length === 0 ? (
                      <p className="text-xs text-[#8A9C84] py-6 text-center">
                        រកមិនឃើញមង្គលការដែលត្រូវនឹងការស្វែងរកទេ
                      </p>
                    ) : (
                      filterWeddings(createWeddingSearch, createWeddingDate).map((w) => {
                        const checked = selectedWeddingIds.includes(w.id);
                        return (
                          <label
                            key={w.id}
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                              checked
                                ? 'bg-[#FAF6EE] border-[#C59F54] text-[#212E1E]'
                                : 'bg-white border-[#E8DFC9] text-[#5C6E57] hover:bg-[#FAF8F3]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleCreateWedding(w.id)}
                                className="rounded border-[#D8C7A8] text-[#243521] focus:ring-[#243521] shrink-0"
                              />
                              <span className="text-xs font-semibold truncate">
                                {w.groomName} &amp; {w.brideName}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#8A9C84] inline-flex items-center gap-1 shrink-0 ml-2">
                              <Calendar className="h-3 w-3" />
                              {new Date(w.weddingDate).toLocaleDateString('km-KH')}
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="h-10 px-5 rounded-xl border-[#D8C7A8] text-[#5C6E57]"
              >
                បោះបង់
              </Button>
              <Button
                type="submit"
                disabled={createClerkMutation.isPending || updateClerkMutation.isPending}
                className="h-10 px-6 bg-[#243521] hover:bg-[#1A2617] text-white font-semibold rounded-xl shadow-sm border border-[#C59F54]/40 cursor-pointer"
              >
                {createClerkMutation.isPending || updateClerkMutation.isPending ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin text-[#E6C673]" />
                ) : (
                  <Check className="mr-1.5 h-4 w-4 text-[#E6C673]" />
                )}
                {editingClerk ? 'រក្សាទុកការកែប្រែ' : 'បង្កើតអ្នកកត់ត្រា'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ASSIGN WEDDINGS MODAL */}
      <Dialog open={!!assigningClerk} onOpenChange={(o) => !o && setAssigningClerk(null)}>
        <DialogContent className="p-0 overflow-hidden flex flex-col bg-[#FAF8F3] border border-[#E2D7C0] rounded-3xl font-khmer-body shadow-2xl max-w-md max-h-[90dvh]">
          <div className="px-5 py-4 bg-white border-b border-[#EFE9DC] flex items-center justify-between shrink-0">
            <div>
              <h2 className="font-khmer-heading text-base font-bold text-[#212E1E]">
                ចាត់តាំងមង្គលការជូន {assigningClerk?.fullName}
              </h2>
              <p className="text-xs text-[#63765E] mt-0.5">
                ស្វែងរក និងជ្រើសរើសមង្គលការដែលអ្នកកត់ត្រានេះអាចមើលឃើញ
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAssigningClerk(null)}
              className="h-8 w-8 rounded-full bg-[#FAF6EE] hover:bg-[#EFE9DC] text-[#63765E] flex items-center justify-center cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-5 space-y-3 flex-1 min-h-0 overflow-y-auto">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#8A9C84]" />
                <Input
                  value={assignWeddingSearch}
                  onChange={(e) => setAssignWeddingSearch(e.target.value)}
                  placeholder="ស្វែងរកមង្គលការ..."
                  className="pl-9 bg-white border-[#DFD5C3] focus:border-[#C59F54] rounded-xl h-10 text-xs sm:text-sm"
                />
              </div>
              <div className="relative w-full sm:w-44 shrink-0">
                <CustomDatePicker
                  value={assignWeddingDate}
                  onChange={setAssignWeddingDate}
                  placeholder="ច្រោះតាមថ្ងៃ"
                  className="[&_button]:h-10 [&_button]:rounded-xl [&_button]:bg-white [&_button]:border-[#DFD5C3]"
                />
                {assignWeddingDate && (
                  <button
                    type="button"
                    onClick={() => setAssignWeddingDate('')}
                    aria-label="សម្អាតថ្ងៃពិធី"
                    className="absolute right-8 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full flex items-center justify-center text-[#7D8C78] hover:text-[#212E1E] hover:bg-[#EAE4D5] cursor-pointer z-10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {!weddings || weddings.length === 0 ? (
              <p className="text-xs text-[#8A9C84] text-center py-6">មិនទាន់មានមង្គលការនៅឡើយទេ</p>
            ) : filterWeddings(assignWeddingSearch, assignWeddingDate).length === 0 ? (
              <p className="text-xs text-[#8A9C84] text-center py-6">
                រកមិនឃើញមង្គលការដែលត្រូវនឹងការស្វែងរកទេ
              </p>
            ) : (
              filterWeddings(assignWeddingSearch, assignWeddingDate).map((w) => {
                const checked = assignWeddingIds.includes(w.id);
                return (
                  <label
                    key={w.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      checked
                        ? 'bg-white border-[#C59F54] shadow-xs text-[#212E1E]'
                        : 'bg-white/70 border-[#E8DFC9] text-[#5C6E57] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAssignWedding(w.id)}
                        className="rounded border-[#D8C7A8] text-[#243521] focus:ring-[#243521] shrink-0"
                      />
                      <span className="text-xs font-semibold truncate">
                        {w.groomName} &amp; {w.brideName}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8A9C84] shrink-0 ml-2">
                      {new Date(w.weddingDate).toLocaleDateString('km-KH')}
                    </span>
                  </label>
                );
              })
            )}

            <div className="flex justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAssigningClerk(null)}
                className="rounded-xl border-[#D8C7A8] text-[#5C6E57] text-xs h-9 px-4"
              >
                បោះបង់
              </Button>
              <Button
                type="button"
                onClick={handleSaveAssignments}
                disabled={assignWeddingsMutation.isPending}
                className="bg-[#243521] hover:bg-[#1A2617] text-white rounded-xl text-xs h-9 px-5 font-semibold cursor-pointer"
              >
                {assignWeddingsMutation.isPending ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin text-[#E6C673]" />
                ) : (
                  <Check className="mr-1.5 h-3.5 w-3.5 text-[#E6C673]" />
                )}
                រក្សាទុកការចាត់តាំង
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE CLERK CONFIRMATION */}
      <Dialog open={!!deleteClerkId} onOpenChange={(o) => !o && setDeleteClerkId(null)}>
        <DialogContent className="max-w-md bg-[#FAF8F3] border-[#E8DFC9] rounded-3xl font-khmer-body">
          <DialogHeader>
            <DialogTitle className="font-khmer-heading text-lg font-bold text-rose-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
              បញ្ជាក់ការលុបអ្នកកត់ត្រា
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-[#5C6E57]">
              តើអ្នកពិតជាចង់លុបគណនីអ្នកកត់ត្រានេះមែនទេ?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeleteClerkId(null)}
                className="rounded-xl border-[#D8C7A8] text-[#3E513A] text-xs h-9"
              >
                បោះបង់
              </Button>
              <Button
                onClick={handleDeleteClerk}
                disabled={deleteClerkMutation.isPending}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs h-9 px-4 font-bold cursor-pointer"
              >
                {deleteClerkMutation.isPending && (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                )}
                យល់ព្រមលុប
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
