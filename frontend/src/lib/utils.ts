import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: 'USD' | 'KHR' | string): string {
  const num = Number(amount) || 0;
  if (currency === 'KHR') {
    const formatted = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(num);
    return `KHR ${formatted}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

/**
 * Normalizes Khmer Unicode numerals (០-៩) into standard Arabic digits (0-9).
 * E.g., '១០០០០០' -> '100000', '៥០' -> '50'
 */
export function normalizeKhmerDigits(val: string): string {
  if (!val) return '';
  const khmerDigits: Record<string, string> = {
    '០': '0',
    '១': '1',
    '២': '2',
    '៣': '3',
    '៤': '4',
    '៥': '5',
    '៦': '6',
    '៧': '7',
    '៨': '8',
    '៩': '9',
  };
  return val.replace(/[០-៩]/g, (char) => khmerDigits[char] || char);
}

/**
 * Normalizes text for space-insensitive search (removes whitespace & zero-width chars, lowercases).
 */
export function normalizeSearchText(val?: string | null): string {
  if (!val) return '';
  return val.replace(/[\s\u200B-\u200D\uFEFF]+/g, '').toLowerCase();
}
