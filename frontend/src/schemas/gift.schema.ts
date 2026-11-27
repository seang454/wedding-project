import { z } from 'zod';
import { normalizeKhmerDigits } from '@/lib/utils';

const parseAmount = (v: string | number | null | undefined): number => {
  if (v === '' || v === undefined || v === null) return 0;
  if (typeof v === 'number') return isNaN(v) ? 0 : v;
  const normalized = normalizeKhmerDigits(String(v)).replace(/[,\s]/g, '');
  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
};

export const recordGiftSchema = z
  .object({
    weddingId: z.string().min(1, 'Invalid wedding ID'),
    guestNameSnapshot: z.string().min(1, 'Guest name is required'),
    currencyMode: z.enum(['USD', 'KHR', 'BOTH']).default('KHR'),
    amount: z.union([z.string(), z.number()]).optional().transform(parseAmount),
    amountUSD: z.union([z.string(), z.number()]).optional().transform(parseAmount),
    amountKHR: z.union([z.string(), z.number()]).optional().transform(parseAmount),
    currency: z.enum(['USD', 'KHR', 'THB', 'EUR']),
    paymentMethod: z.enum(['CASH', 'QR_CODE', 'BANK_TRANSFER']),
  guestId: z.string().optional(),
  bankAccountId: z.string().optional(),
  transactionRef: z.string().optional(),
  receiptImageUrl: z.string().optional(),
  wishes: z.string().optional(),
  createGuestProfile: z.boolean(),
  phone: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? undefined : v ?? undefined)),
  side: z.enum(['GROOM', 'BRIDE', 'BOTH']).optional(),
  tableNumber: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((v) => {
      if (v === '' || v === undefined || v === null) return undefined;
      if (typeof v === 'number') return isNaN(v) ? undefined : v;
      const normalized = normalizeKhmerDigits(String(v)).replace(/[,\s]/g, '');
      const num = parseInt(normalized, 10);
      return isNaN(num) ? undefined : num;
    }),
  province: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? undefined : v ?? undefined)),
  district: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? undefined : v ?? undefined)),
  commune: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? undefined : v ?? undefined)),
  village: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? undefined : v ?? undefined)),
  guestNote: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? undefined : v ?? undefined)),
  })
  .superRefine((data, ctx) => {
    if (data.currencyMode === 'USD' && (!data.amountUSD || data.amountUSD <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['amountUSD'],
        message: 'ចំនួនទឹកប្រាក់ដុល្លារត្រូវតែធំជាង ០',
      });
    } else if (data.currencyMode === 'KHR' && (!data.amountKHR || data.amountKHR <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['amountKHR'],
        message: 'ចំនួនទឹកប្រាក់រៀលត្រូវតែធំជាង ០',
      });
    } else if (data.currencyMode === 'BOTH') {
      if (!data.amountUSD || data.amountUSD <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['amountUSD'],
          message: 'សូមបញ្ចូលទឹកប្រាក់ដុល្លារ',
        });
      }
      if (!data.amountKHR || data.amountKHR <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['amountKHR'],
          message: 'សូមបញ្ចូលទឹកប្រាក់រៀល',
        });
      }
    }
  });

// Raw input type for React Hook Form
export type RecordGiftFormInput = {
  weddingId: string;
  guestNameSnapshot: string;
  currencyMode: 'USD' | 'KHR' | 'BOTH';
  amount?: string | number;
  amountUSD?: string | number;
  amountKHR?: string | number;
  currency: 'USD' | 'KHR' | 'THB' | 'EUR';
  paymentMethod: 'CASH' | 'QR_CODE' | 'BANK_TRANSFER';
  guestId?: string;
  bankAccountId?: string;
  transactionRef?: string;
  receiptImageUrl?: string;
  wishes?: string;
  createGuestProfile: boolean;
  phone?: string | null;
  side?: 'GROOM' | 'BRIDE' | 'BOTH';
  tableNumber?: string | number | null;
  province?: string | null;
  district?: string | null;
  commune?: string | null;
  village?: string | null;
  guestNote?: string | null;
};

// Output after Zod parse & transform (sent to API)
export type RecordGiftFormData = z.infer<typeof recordGiftSchema>;
