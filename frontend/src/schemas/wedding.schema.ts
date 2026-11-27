import { z } from 'zod';
import { normalizeKhmerDigits } from '@/lib/utils';

export const createWeddingSchema = z.object({
  groomName: z.string().min(1, 'ត្រូវការឈ្មោះកូនកំលោះ'),
  brideName: z.string().min(1, 'ត្រូវការឈ្មោះកូនក្រមុំ'),
  weddingDate: z.string().min(1, 'ត្រូវការថ្ងៃអាពាហ៍ពិពាហ៍'),
  venue: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  commune: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  targetAmount: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (v === '' || v === undefined || v === null) return undefined;
      if (typeof v === 'number') return isNaN(v) ? undefined : v;
      const normalized = normalizeKhmerDigits(String(v)).replace(/[,\s]/g, '');
      const num = parseFloat(normalized);
      return isNaN(num) ? undefined : num;
    }),
  imageUrl: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
});

export const updateWeddingSchema = createWeddingSchema.partial();

// What the form fields hold (pre-transform)
export type CreateWeddingFormInput = {
  groomName: string;
  brideName: string;
  weddingDate: string;
  venue?: string;
  province?: string;
  district?: string;
  commune?: string;
  phone?: string;
  notes?: string;
  targetAmount?: string | number;
  imageUrl?: string;
};

// Output after Zod transform (what gets sent to API)
export type CreateWeddingFormData = z.infer<typeof createWeddingSchema>;
export type UpdateWeddingFormData = z.infer<typeof updateWeddingSchema>;
