import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'សូមបញ្ចូលឈ្មោះគណនី ឬអ៊ីមែល'),
  password: z.string().min(6, 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(1, 'សូមបញ្ចូលឈ្មោះពេញរបស់អ្នក'),
    email: z
      .string()
      .email('ទម្រង់អ៊ីមែលមិនត្រឹមត្រូវឡើយ')
      .optional()
      .or(z.literal('')),
    phone: z
      .string()
      .regex(/^[0-9+ ]{8,15}$/, 'លេខទូរស័ព្ទមិនត្រឹមត្រូវឡើយ')
      .optional()
      .or(z.literal('')),
    password: z.string().min(6, 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ'),
    confirmPassword: z.string().min(1, 'សូមបញ្ជាក់ពាក្យសម្ងាត់ឡើងវិញ'),
    role: z.enum(['OWNER', 'CLERK', 'ACCOUNTANT']),
  })
  .refine((data) => Boolean(data.email || data.phone), {
    message: 'សូមបញ្ចូលអ៊ីមែល ឬលេខទូរស័ព្ទយ៉ាងហោចណាស់មួយ',
    path: ['email'],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'ពាក្យសម្ងាត់ផ្ទៀងផ្ទាត់មិនត្រូវគ្នាឡើយ',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
