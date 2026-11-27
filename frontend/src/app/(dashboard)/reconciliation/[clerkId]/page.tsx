'use client';

import { useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useActiveWedding } from '@/context/wedding-context';
import { useClerkReconciliationDetail } from '@/hooks/use-gifts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CustomSelect } from '@/components/ui/custom-select';
import { RowsPerPageSelect } from '@/components/common/rows-per-page-select';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { formatCurrency, normalizeSearchText } from '@/lib/utils';
import {
  ArrowLeft,
  Banknote,
  QrCode,
  User,
  UserCheck,
  Loader2,
  Receipt,
  Wallet,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  Search,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ClerkReconciliationDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col h-64 items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#4E8B7C]" />
          <p className="text-sm font-semibold text-[#3E513A] font-khmer-heading">
            កំពុងផ្ទុកព័ត៌មានលម្អិតរបស់អ្នកកត់ត្រា...
          </p>
        </div>
      }
    >
      <ClerkReconciliationDetailContent />
    </Suspense>
  );
}

function ClerkReconciliationDetailContent() {
  const params = useParams<{ clerkId: string }>();
  const router = useRouter();
  const clerkId = params?.clerkId || '';
  const { activeWedding, activeWeddingId: weddingId } = useActiveWedding();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [tableSearch, setTableSearch] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('');

  const { data, isLoading } = useClerkReconciliationDetail(weddingId, clerkId);

  const summary = data?.summary;
  const gifts = data?.gifts || [];

  // Group dual-currency gifts (USD + KHR) recorded for the same guest & payment method into one row
  const groupedGifts = (() => {
    const map = new Map<
      string,
      {
        id: string;
        guest?: (typeof gifts)[number]['guest'];
        guestNameSnapshot: string;
        paymentMethod: (typeof gifts)[number]['paymentMethod'];
        wishes?: string;
        usdAmt: number;
        khrAmt: number;
      }
    >();

    for (const gift of gifts) {
      const guestKey = gift.guestId || gift.guestNameSnapshot || gift.id;
      const key = `${guestKey}::${gift.paymentMethod}`;
      const amountUSD = Number(gift.amountUSD ?? (gift.currency === 'USD' ? gift.amount : 0)) || 0;
      const amountKHR = Number(gift.amountKHR ?? (gift.currency === 'KHR' ? gift.amount : 0)) || 0;
      const existing = map.get(key);
      if (existing) {
        existing.usdAmt += amountUSD;
        existing.khrAmt += amountKHR;
        if (!existing.wishes && gift.wishes) existing.wishes = gift.wishes;
      } else {
        map.set(key, {
          id: gift.id,
          guest: gift.guest,
          guestNameSnapshot: gift.guestNameSnapshot,
          paymentMethod: gift.paymentMethod,
          wishes: gift.wishes,
          usdAmt: amountUSD,
          khrAmt: amountKHR,
        });
      }
    }

    return Array.from(map.values());
  })();

  const formatGuestAddress = (guest?: (typeof gifts)[number]['guest']) =>
    [guest?.province, guest?.district, guest?.commune, guest?.village]
      .filter(Boolean)
      .join(', ') || '—';

  const formatGuestNote = (guest?: (typeof gifts)[number]['guest'], wishes?: string) =>
    [guest?.notes, wishes].filter((v) => Boolean(v && v.trim())).join(' • ') || '—';

  const normalizedSearch = normalizeSearchText(tableSearch);
  const filteredGroupedGifts = groupedGifts.filter((gift) => {
    const guestName = gift.guest?.name || gift.guestNameSnapshot || '';
    const address = formatGuestAddress(gift.guest);
    const note = formatGuestNote(gift.guest, gift.wishes);
    const matchesSearch =
      !normalizedSearch ||
      normalizeSearchText(guestName).includes(normalizedSearch) ||
      normalizeSearchText(gift.guest?.phone).includes(normalizedSearch) ||
      normalizeSearchText(address).includes(normalizedSearch) ||
      normalizeSearchText(note).includes(normalizedSearch);

    const matchesMethod =
      !paymentMethodFilter ||
      (paymentMethodFilter === 'CASH'
        ? gift.paymentMethod === 'CASH'
        : gift.paymentMethod === 'QR_CODE' || gift.paymentMethod === 'BANK_TRANSFER');

    const matchesCurrency =
      !currencyFilter ||
      (currencyFilter === 'USD' ? gift.usdAmt > 0 : gift.khrAmt > 0);

    return matchesSearch && matchesMethod && matchesCurrency;
  });

  const totalCount = filteredGroupedGifts.length;
  const pageCount = Math.max(1, Math.ceil(totalCount / limit));
  const safePage = Math.min(page, pageCount);
  const paginatedGifts = filteredGroupedGifts.slice((safePage - 1) * limit, safePage * limit);

  const handleExportCsv = () => {
    if (!groupedGifts.length) {
      toast.error('មិនមានទិន្នន័យសម្រាប់ទាញយកទេ');
      return;
    }

    const sortedGifts = [...groupedGifts].sort((a, b) => {
      const nameA = (a.guest?.name || a.guestNameSnapshot || '').trim();
      const nameB = (b.guest?.name || b.guestNameSnapshot || '').trim();
      return nameA.localeCompare(nameB, 'km', { sensitivity: 'base' });
    });

    const escapeCsv = (val: string | number | undefined | null) => {
      const str = String(val ?? '');
      return `"${str.replace(/"/g, '""')}"`;
    };

    const escapePhoneCsv = (phone?: string | null) => {
      const p = String(phone ?? '').trim();
      if (!p || p === '—') return '"—"';
      return `"=""${p.replace(/"/g, '""')}"""`;
    };

    const headers = [
      'ល.រ',
      'ឈ្មោះភ្ញៀវចូលរួម',
      'លេខទូរស័ព្ទ',
      'តុលេខ',
      'ស្ថានភាព',
      'វិធីទូទាត់',
      'ប្រាក់ដុល្លារ (USD)',
      'ប្រាក់រៀល (KHR)',
      'អាសយដ្ឋានភ្ញៀវ',
      'កំណត់ចំណាំ',
    ];

    const ROWS_PER_PAGE = 15;
    const csvLines: string[] = [headers.map(escapeCsv).join(',')];

    for (let i = 0; i < sortedGifts.length; i += ROWS_PER_PAGE) {
      const pageGifts = sortedGifts.slice(i, i + ROWS_PER_PAGE);
      const pageNum = Math.floor(i / ROWS_PER_PAGE) + 1;

      let pageCashUSD = 0;
      let pageCashKHR = 0;
      let pageQrUSD = 0;
      let pageQrKHR = 0;
      let pageTotalUSD = 0;
      let pageTotalKHR = 0;

      pageGifts.forEach((gift, idx) => {
        const globalIdx = i + idx + 1;
        const isQr =
          gift.paymentMethod === 'QR_CODE' || gift.paymentMethod === 'BANK_TRANSFER';

        pageTotalUSD += gift.usdAmt;
        pageTotalKHR += gift.khrAmt;
        if (isQr) {
          pageQrUSD += gift.usdAmt;
          pageQrKHR += gift.khrAmt;
        } else {
          pageCashUSD += gift.usdAmt;
          pageCashKHR += gift.khrAmt;
        }

        const usdAmt = gift.usdAmt;
        const khrAmt = gift.khrAmt;
        const methodLabel = gift.paymentMethod === 'CASH' ? 'សាច់ប្រាក់' : 'KHQR';
        const statusLabel =
          gift.guest?.invitationStatus === 'ATTENDED' ? 'បានមកដល់' : 'បានកត់ត្រា';
        const addressStr = formatGuestAddress(gift.guest);
        const noteStr = formatGuestNote(gift.guest, gift.wishes);

        const rowCells = [
          escapeCsv(globalIdx),
          escapeCsv(gift.guest?.name || gift.guestNameSnapshot),
          escapePhoneCsv(gift.guest?.phone),
          escapeCsv(gift.guest?.tableNumber ? `តុលេខ ${gift.guest.tableNumber}` : '—'),
          escapeCsv(statusLabel),
          escapeCsv(methodLabel),
          escapeCsv(usdAmt),
          escapeCsv(khrAmt),
          escapeCsv(addressStr),
          escapeCsv(noteStr),
        ];
        csvLines.push(rowCells.join(','));
      });

      csvLines.push(
        ['', '', '', '', '', `សរុបសាច់ប្រាក់ទំព័រទី ${pageNum} (Cash)`, pageCashUSD, pageCashKHR, '']
          .map(escapeCsv)
          .join(','),
      );
      csvLines.push(
        ['', '', '', '', '', `សរុប KHQR ទំព័រទី ${pageNum}`, pageQrUSD, pageQrKHR, '']
          .map(escapeCsv)
          .join(','),
      );
      csvLines.push(
        ['', '', '', '', '', `សរុបប្រចាំទំព័រទី ${pageNum} (Page Total)`, pageTotalUSD, pageTotalKHR, '']
          .map(escapeCsv)
          .join(','),
      );
      csvLines.push('');
    }

    csvLines.push(
      ['', '', '', '', '', 'សរុបសាច់ប្រាក់រួម (Total Cash)', summary?.cashUSD || 0, summary?.cashKHR || 0, '']
        .map(escapeCsv)
        .join(','),
    );
    csvLines.push(
      ['', '', '', '', '', 'សរុប KHQR រួម (Total KHQR)', summary?.qrUSD || 0, summary?.qrKHR || 0, '']
        .map(escapeCsv)
        .join(','),
    );
    csvLines.push(
      ['', '', '', '', '', 'សរុបថវិកាទាំងអស់ (Grand Total)', summary?.totalUSD || 0, summary?.totalKHR || 0, '']
        .map(escapeCsv)
        .join(','),
    );

    const csvContent = '\uFEFF' + csvLines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeClerkName = (data?.clerkName || 'clerk').replace(/\s+/g, '_');
    link.href = url;
    link.download = `Reconciliation_${safeClerkName}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('បានទាញយកឯកសារ Excel (CSV) ដោយជោគជ័យ!');
  };

  const handleExportPdf = () => {
    if (!groupedGifts.length) {
      toast.error('មិនមានទិន្នន័យសម្រាប់ទាញយក PDF ទេ');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=1024,height=768');
    if (!printWindow) {
      toast.error('សូមអនុញ្ញាត Pop-up ដើម្បីទាញយកឯកសារ PDF');
      return;
    }

    const weddingTitle = activeWedding
      ? `${activeWedding.groomName} & ${activeWedding.brideName}`
      : 'ពិធីមង្គលការ';

    const sortedGifts = [...groupedGifts].sort((a, b) => {
      const nameA = (a.guest?.name || a.guestNameSnapshot || '').trim();
      const nameB = (b.guest?.name || b.guestNameSnapshot || '').trim();
      return nameA.localeCompare(nameB, 'km', { sensitivity: 'base' });
    });

    const ROWS_PER_PAGE = 15;
    const chunks: (typeof groupedGifts)[] = [];
    for (let i = 0; i < sortedGifts.length; i += ROWS_PER_PAGE) {
      chunks.push(sortedGifts.slice(i, i + ROWS_PER_PAGE));
    }

    const pagesHtml = chunks
      .map((pageGifts, pageIdx) => {
        const pageNum = pageIdx + 1;
        const totalPages = chunks.length;
        const isLastPage = pageNum === totalPages;

        let pageCashUSD = 0;
        let pageCashKHR = 0;
        let pageQrUSD = 0;
        let pageQrKHR = 0;
        let pageTotalUSD = 0;
        let pageTotalKHR = 0;

        const rowsHtml = pageGifts
          .map((gift, idx) => {
            const globalIdx = pageIdx * ROWS_PER_PAGE + idx + 1;
            const isQr =
              gift.paymentMethod === 'QR_CODE' || gift.paymentMethod === 'BANK_TRANSFER';

            pageTotalUSD += gift.usdAmt;
            pageTotalKHR += gift.khrAmt;
            if (isQr) {
              pageQrUSD += gift.usdAmt;
              pageQrKHR += gift.khrAmt;
            } else {
              pageCashUSD += gift.usdAmt;
              pageCashKHR += gift.khrAmt;
            }

            const usdAmt = gift.usdAmt > 0 ? formatCurrency(gift.usdAmt, 'USD') : '—';
            const khrAmt = gift.khrAmt > 0 ? formatCurrency(gift.khrAmt, 'KHR') : '—';
            const methodLabel = gift.paymentMethod === 'CASH' ? 'សាច់ប្រាក់' : 'KHQR';
            const addressStr = formatGuestAddress(gift.guest);
            const noteStr = formatGuestNote(gift.guest, gift.wishes);

            return `
              <tr>
                <td>${globalIdx}</td>
                <td><strong>${gift.guest?.name || gift.guestNameSnapshot}</strong></td>
                <td>${gift.guest?.phone || '—'}</td>
                <td>${gift.guest?.tableNumber ? `តុលេខ ${gift.guest.tableNumber}` : '—'}</td>
                <td>${methodLabel}</td>
                <td class="num">${usdAmt}</td>
                <td class="num">${khrAmt}</td>
                <td>${addressStr}</td>
                <td>${noteStr}</td>
              </tr>
            `;
          })
          .join('');

        return `
          <div class="pdf-page ${isLastPage ? '' : 'page-break'}">
            <div class="header">
              <div>
                <h1 class="title">របាយការណ៍ផ្ទៀងផ្ទាត់បេឡា — ${data?.clerkName || 'អ្នកកត់ត្រា'}</h1>
                <p class="sub">${weddingTitle} • ចំនួនកត់ត្រាសរុប៖ ${summary?.totalEnvelopes ?? 0} ស្រោមសំបុត្រ</p>
              </div>
              <div style="text-align:right">
                <p class="sub"><strong>ទំព័រទី ${pageNum} នៃ ${totalPages}</strong></p>
                <p class="sub">កាលបរិច្ឆេទបោះពុម្ព៖ ${new Date().toLocaleString('km-KH')}</p>
              </div>
            </div>

            ${
              pageIdx === 0
                ? `
              <div class="cards">
                <div class="card">
                  <div class="card-label">សាច់ប្រាក់សុទ្ធសរុប (Cash)</div>
                  <div class="card-vals"><span>${formatCurrency(summary?.cashUSD || 0, 'USD')}</span><span>${formatCurrency(summary?.cashKHR || 0, 'KHR')}</span></div>
                </div>
                <div class="card">
                  <div class="card-label">ទូទាត់តាម KHQR សរុប</div>
                  <div class="card-vals"><span>${formatCurrency(summary?.qrUSD || 0, 'USD')}</span><span>${formatCurrency(summary?.qrKHR || 0, 'KHR')}</span></div>
                </div>
                <div class="card total">
                  <div class="card-label">សរុបថវិកាទាំងអស់ (Grand Total)</div>
                  <div class="card-vals"><span>${formatCurrency(summary?.totalUSD || 0, 'USD')}</span><span>${formatCurrency(summary?.totalKHR || 0, 'KHR')}</span></div>
                </div>
              </div>
            `
                : ''
            }

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>ឈ្មោះភ្ញៀវចូលរួម</th>
                  <th>លេខទូរស័ព្ទ</th>
                  <th>តុលេខ</th>
                  <th>វិធីទូទាត់</th>
                  <th style="text-align:right">ដុល្លារ (USD)</th>
                  <th style="text-align:right">រៀល (KHR)</th>
                  <th>អាសយដ្ឋានភ្ញៀវ</th>
                  <th>កំណត់ចំណាំ</th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
              <tfoot>
                <tr>
                  <td colspan="5" style="text-align:right">សរុបសាច់ប្រាក់ទំព័រទី ${pageNum} (Cash):</td>
                  <td class="num">${formatCurrency(pageCashUSD, 'USD')}</td>
                  <td class="num">${formatCurrency(pageCashKHR, 'KHR')}</td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td colspan="5" style="text-align:right">សរុប KHQR ទំព័រទី ${pageNum}:</td>
                  <td class="num">${formatCurrency(pageQrUSD, 'USD')}</td>
                  <td class="num">${formatCurrency(pageQrKHR, 'KHR')}</td>
                  <td></td>
                  <td></td>
                </tr>
                <tr class="page-total">
                  <td colspan="5" style="text-align:right">សរុបប្រចាំទំព័រទី ${pageNum} (Page Total):</td>
                  <td class="num">${formatCurrency(pageTotalUSD, 'USD')}</td>
                  <td class="num">${formatCurrency(pageTotalKHR, 'KHR')}</td>
                  <td></td>
                  <td></td>
                </tr>
                ${
                  isLastPage && totalPages > 1
                    ? `
                  <tr class="grand">
                    <td colspan="5" style="text-align:right">សរុបរួមគ្រប់ទំព័រទាំងអស់ (Grand Total):</td>
                    <td class="num">${formatCurrency(summary?.totalUSD || 0, 'USD')}</td>
                    <td class="num">${formatCurrency(summary?.totalKHR || 0, 'KHR')}</td>
                    <td></td>
                    <td></td>
                  </tr>
                `
                    : ''
                }
              </tfoot>
            </table>
          </div>
        `;
      })
      .join('');

    printWindow.document.write(`<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8" />
  <title>របាយការណ៍ផ្ទៀងផ្ទាត់បេឡា - ${data?.clerkName || 'អ្នកកត់ត្រា'}</title>
  <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;600;700&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: 'Kantumruy Pro', sans-serif; color: #212E1E; margin: 20px; font-size: 11.5px; }
    .pdf-page { width: 100%; }
    .page-break { page-break-after: always; break-after: page; }
    .header { border-bottom: 2px solid #C59F54; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-end; }
    .title { font-size: 17px; font-weight: 700; color: #243521; margin: 0 0 4px 0; }
    .sub { font-size: 11.5px; color: #5C6E57; margin: 0; }
    .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; }
    .card { border: 1px solid #DFD5C3; border-radius: 10px; padding: 9px 11px; background: #FAF8F3; }
    .card.total { background: #243521; color: #fff; border-color: #C59F54; }
    .card-label { font-size: 10.5px; font-weight: 600; margin-bottom: 5px; opacity: 0.9; }
    .card-vals { display: flex; justify-content: space-between; font-weight: 700; font-size: 12.5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 6px; }
    th, td { border: 1px solid #E2D7C0; padding: 6px 8px; text-align: left; }
    th { background: #F5EFE2; font-weight: 700; font-size: 10.5px; white-space: nowrap; }
    td.num { font-weight: 700; text-align: right; white-space: nowrap; }
    tfoot td { background: #FAF8F3; font-weight: 700; font-size: 11px; }
    tfoot tr.page-total td { background: #EFE9DC; color: #212E1E; font-size: 11.5px; }
    tfoot tr.grand td { background: #243521; color: #fff; font-size: 12px; border-color: #C59F54; }
    @page { size: A4 portrait; margin: 12mm; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  ${pagesHtml}
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 450);
    };
  </script>
</body>
</html>`);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/reconciliation')}
            className="h-9 px-3 rounded-xl border-[#D8C7A8] bg-white/60 hover:bg-white text-[#243521] font-khmer-heading text-xs cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            ត្រឡប់ក្រោយ
          </Button>
          <div>
            <h1 className="font-khmer-body text-xl sm:text-2xl font-bold tracking-tight text-[#212E1E] flex items-center gap-2">
              <User className="h-5 w-5 text-[#C59F54]" />
              <span>{data?.clerkName || 'អ្នកកត់ត្រា'}</span>
            </h1>
            <p className="font-khmer-body text-xs sm:text-sm text-[#5C6E57] mt-0.5">
              បញ្ជីឈ្មោះភ្ញៀវចូលរួម និងសរុបថវិកាដែលបានកត់ត្រា ({summary?.totalEnvelopes ?? 0} ស្រោមសំបុត្រ)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={isLoading || gifts.length === 0}
            className="font-khmer-heading text-xs rounded-xl border-emerald-300 bg-white/75 hover:bg-emerald-50 text-emerald-900 cursor-pointer gap-1.5"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
            <span>ទាញយក Excel (CSV)</span>
          </Button>
          <Button
            size="sm"
            onClick={handleExportPdf}
            disabled={isLoading || gifts.length === 0}
            className="font-khmer-heading text-xs rounded-xl bg-[#243521] hover:bg-[#1A2617] text-white border border-[#C59F54]/40 cursor-pointer gap-1.5 shadow-sm"
          >
            <FileText className="h-4 w-4 text-[#E6C673]" />
            <span>ទាញយក PDF</span>
          </Button>
          <Link href="/gifts">
            <Button
              variant="outline"
              size="sm"
              className="font-khmer-heading text-xs rounded-xl border-[#C59F54]/60 bg-white/60 hover:bg-white text-[#243521] cursor-pointer"
            >
              មើលបញ្ជីចំណងដៃទាំងអស់
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col h-64 items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#4E8B7C]" />
          <p className="text-sm font-semibold text-[#3E513A] font-khmer-heading">
            កំពុងផ្ទុកព័ត៌មានលម្អិតរបស់អ្នកកត់ត្រា...
          </p>
        </div>
      ) : (
        <>
          {/* 3 Glass Summary Cards: Cash (USD/KHR), QR (USD/KHR), Total (USD/KHR) */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Cash Card */}
            <Card className="p-5 bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 border border-white/85 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="font-khmer-heading text-xs sm:text-sm font-bold text-emerald-900">
                  សាច់ប្រាក់សុទ្ធ (Cash)
                </span>
                <div className="h-8 w-8 rounded-xl bg-emerald-100/90 flex items-center justify-center text-emerald-700">
                  <Banknote className="h-4 w-4" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/60">
                <div>
                  <p className="text-[11px] text-[#5C6E57] font-khmer-heading">ដុល្លារ (USD)</p>
                  <p className="text-lg sm:text-xl font-extrabold text-emerald-950 font-sans mt-0.5">
                    {formatCurrency(summary?.cashUSD || 0, 'USD')}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#5C6E57] font-khmer-heading">រៀល (KHR)</p>
                  <p className="text-lg sm:text-xl font-extrabold text-emerald-950 font-sans mt-0.5">
                    {formatCurrency(summary?.cashKHR || 0, 'KHR')}
                  </p>
                </div>
              </div>
            </Card>

            {/* QR Card */}
            <Card className="p-5 bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 border border-white/85 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="font-khmer-heading text-xs sm:text-sm font-bold text-[#7C622D]">
                  ទូទាត់តាម KHQR (QR)
                </span>
                <div className="h-8 w-8 rounded-xl bg-[#EAE2D2] flex items-center justify-center text-[#8C6F2D]">
                  <QrCode className="h-4 w-4" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/60">
                <div>
                  <p className="text-[11px] text-[#5C6E57] font-khmer-heading">ដុល្លារ (USD)</p>
                  <p className="text-lg sm:text-xl font-extrabold text-[#2A200B] font-sans mt-0.5">
                    {formatCurrency(summary?.qrUSD || 0, 'USD')}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#5C6E57] font-khmer-heading">រៀល (KHR)</p>
                  <p className="text-lg sm:text-xl font-extrabold text-[#2A200B] font-sans mt-0.5">
                    {formatCurrency(summary?.qrKHR || 0, 'KHR')}
                  </p>
                </div>
              </div>
            </Card>

            {/* Combined Total Card */}
            <Card className="p-5 bg-gradient-to-br from-[#1A2818]/90 via-[#243521]/90 to-[#1A2818]/90 backdrop-blur-xl border border-[#C59F54]/50 shadow-xl rounded-2xl text-white">
              <div className="flex items-center justify-between mb-3">
                <span className="font-khmer-heading text-xs sm:text-sm font-bold text-[#E6C673]">
                  សរុបថវិកាទាំងអស់ (Total)
                </span>
                <div className="h-8 w-8 rounded-xl bg-white/15 border border-[#C59F54]/40 flex items-center justify-center text-[#E6C673]">
                  <Wallet className="h-4 w-4" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/20">
                <div>
                  <p className="text-[11px] text-[#C8D6C3] font-khmer-heading">សរុបដុល្លារ (USD)</p>
                  <p className="text-lg sm:text-xl font-extrabold text-white font-sans mt-0.5">
                    {formatCurrency(summary?.totalUSD || 0, 'USD')}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#C8D6C3] font-khmer-heading">សរុបរៀល (KHR)</p>
                  <p className="text-lg sm:text-xl font-extrabold text-[#E6C673] font-sans mt-0.5">
                    {formatCurrency(summary?.totalKHR || 0, 'KHR')}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search & Filter Bar */}
          <Card className="p-4 bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 border border-white/85 shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)] rounded-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#8A9C84]" />
                <Input
                  placeholder="ស្វែងរកតាមឈ្មោះភ្ញៀវ ទូរស័ព្ទ អាសយដ្ឋាន ឬកំណត់ចំណាំ..."
                  value={tableSearch}
                  onChange={(e) => {
                    setTableSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 bg-white/70 backdrop-blur-sm border-[#D8C7A8] rounded-xl h-10 text-xs sm:text-sm"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="w-full sm:w-44">
                  <CustomSelect
                    value={paymentMethodFilter}
                    onChange={(val) => {
                      setPaymentMethodFilter(val);
                      setPage(1);
                    }}
                    searchable={false}
                    options={[
                      { value: '', label: 'វិធីទូទាត់ទាំងអស់' },
                      { value: 'CASH', label: 'សាច់ប្រាក់' },
                      { value: 'QR_CODE', label: 'KHQR' },
                    ]}
                    placeholder="វិធីទូទាត់"
                    className="[&_button]:h-10 [&_button]:rounded-xl [&_button]:bg-white/70 [&_button]:border-[#D8C7A8]"
                  />
                </div>
                <div className="w-full sm:w-44">
                  <CustomSelect
                    value={currencyFilter}
                    onChange={(val) => {
                      setCurrencyFilter(val);
                      setPage(1);
                    }}
                    searchable={false}
                    options={[
                      { value: '', label: 'រូបិយប័ណ្ណទាំងអស់' },
                      { value: 'USD', label: 'ដុល្លារ ($)' },
                      { value: 'KHR', label: 'រៀល (៛)' },
                    ]}
                    placeholder="រូបិយប័ណ្ណ"
                    className="[&_button]:h-10 [&_button]:rounded-xl [&_button]:bg-white/70 [&_button]:border-[#D8C7A8]"
                  />
                </div>
                {(tableSearch || paymentMethodFilter || currencyFilter) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTableSearch('');
                      setPaymentMethodFilter('');
                      setCurrencyFilter('');
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

          {/* Glass Table: Attended Users & Money Recorded */}
          <Card className="border border-white/85 overflow-hidden bg-gradient-to-b from-white/25 via-white/5 to-white/15 backdrop-blur-sm backdrop-saturate-150 rounded-2xl shadow-[0_8px_32px_rgba(36,53,33,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(255,255,255,0.5)]">
            <Table>
              <TableHeader className="bg-gradient-to-b from-white/35 via-white/15 to-white/20 backdrop-blur-sm border-b border-white/70">
                <TableRow>
                  <TableHead className="font-khmer-heading text-xs font-bold text-[#212E1E]">#</TableHead>
                  <TableHead className="font-khmer-heading text-xs font-bold text-[#212E1E]">ឈ្មោះភ្ញៀវចូលរួម</TableHead>
                  <TableHead className="font-khmer-heading text-xs font-bold text-[#212E1E]">លេខទូរស័ព្ទ / តុ</TableHead>
                  <TableHead className="font-khmer-heading text-xs font-bold text-[#212E1E]">វិធីទូទាត់</TableHead>
                  <TableHead className="font-khmer-heading text-xs font-bold text-[#212E1E]">ប្រាក់ដុល្លារ (USD)</TableHead>
                  <TableHead className="font-khmer-heading text-xs font-bold text-[#212E1E]">ប្រាក់រៀល (KHR)</TableHead>
                  <TableHead className="font-khmer-heading text-xs font-bold text-[#212E1E]">អាសយដ្ឋានភ្ញៀវ</TableHead>
                  <TableHead className="font-khmer-heading text-xs font-bold text-[#212E1E]">កំណត់ចំណាំ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedGifts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-[#63765E]">
                      <Receipt className="h-8 w-8 mx-auto text-[#C59F54] mb-2 opacity-60" />
                      <p className="font-khmer-heading text-sm font-bold text-[#212E1E]">
                        មិនទាន់មានទិន្នន័យកត់ត្រាដោយអ្នកកត់ត្រានេះទេ
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedGifts.map((gift, index) => {
                    const isCash = gift.paymentMethod === 'CASH';
                    const usdAmt = gift.usdAmt;
                    const khrAmt = gift.khrAmt;
                    return (
                      <TableRow
                        key={gift.id}
                        className="hover:bg-white/45 transition-colors border-b border-[#E8DFC9]/45"
                      >
                        <TableCell className="text-xs font-bold text-[#63765E] font-sans">
                          {(safePage - 1) * limit + index + 1}
                        </TableCell>
                        <TableCell className="font-semibold text-[#212E1E]">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-emerald-700 shrink-0" />
                            <span>{gift.guest?.name || gift.guestNameSnapshot}</span>
                            {gift.guest?.invitationStatus === 'ATTENDED' && (
                              <Badge className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0">
                                បានមកដល់
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-[#5C6E57]">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 font-mono">
                              <Phone className="h-3 w-3 text-[#8A9C84]" />
                              {gift.guest?.phone || '—'}
                            </span>
                            {gift.guest?.tableNumber && (
                              <Badge variant="outline" className="text-[10px] border-[#D8C7A8] bg-white/60 text-[#243521]">
                                តុលេខ {gift.guest.tableNumber}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-[11px] font-khmer-heading font-semibold ${
                              isCash
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-[#EAE4D5] text-[#46381C] border border-[#D5C7AE]'
                            }`}
                          >
                            {isCash ? (
                              <span className="inline-flex items-center gap-1">
                                <Banknote className="h-3 w-3" /> សាច់ប្រាក់
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1">
                                <QrCode className="h-3 w-3" /> KHQR
                              </span>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-[#212E1E] font-sans">
                          {usdAmt > 0 ? formatCurrency(usdAmt, 'USD') : '—'}
                        </TableCell>
                        <TableCell className="font-bold text-[#212E1E] font-sans">
                          {khrAmt > 0 ? formatCurrency(khrAmt, 'KHR') : '—'}
                        </TableCell>
                        <TableCell className="text-xs text-[#63765E]">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-[#C59F54] shrink-0" />
                            <span>{formatGuestAddress(gift.guest)}</span>
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-[#5C6E57] max-w-[220px]">
                          <span className="line-clamp-2" title={formatGuestNote(gift.guest, gift.wishes)}>
                            {formatGuestNote(gift.guest, gift.wishes)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
                <span className="text-[#8A9C84]">(សរុប៖ {totalCount} កំណត់ត្រា)</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#5C6E57] mr-1">
                  ទំព័រទី <strong className="text-[#212E1E]">{safePage}</strong> នៃ{' '}
                  <strong className="text-[#212E1E]">{pageCount}</strong>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 w-8 p-0 rounded-lg border-[#D8C7A8] text-[#243521] hover:bg-[#EAE4D5] disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage >= pageCount}
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  className="h-8 w-8 p-0 rounded-lg border-[#D8C7A8] text-[#243521] hover:bg-[#EAE4D5] disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
