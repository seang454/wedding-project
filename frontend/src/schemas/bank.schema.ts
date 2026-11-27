import { z } from 'zod';

export const createBankAccountSchema = z.object({
  weddingId: z.string().uuid(),
  bankName: z.string().min(1, 'Bank name is required'),
  accountName: z.string().min(1, 'Account holder name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  qrImageUrl: z.string().url().optional().or(z.literal('')),
  isPrimary: z.boolean().default(false),
});

export type CreateBankAccountFormData = z.infer<typeof createBankAccountSchema>;
