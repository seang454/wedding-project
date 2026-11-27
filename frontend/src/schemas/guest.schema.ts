import { z } from 'zod';
import { normalizeKhmerDigits } from '@/lib/utils';

export const createGuestSchema = z.object({
  weddingId: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  side: z.enum(['GROOM', 'BRIDE', 'BOTH']).default('BOTH'),
  relationship: z.string().optional(),
  invitationStatus: z.enum(['INVITED', 'ATTENDED', 'DECLINED']).optional(),
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
  province: z.string().optional(),
  district: z.string().optional(),
  commune: z.string().optional(),
  village: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateGuestFormData = z.infer<typeof createGuestSchema>;
