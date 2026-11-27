export type GiftCurrency = 'USD' | 'KHR' | 'THB' | 'EUR';
export type PaymentMethod = 'CASH' | 'QR_CODE' | 'BANK_TRANSFER';

export interface Gift {
  id: string;
  weddingId: string;
  guestId?: string;
  guestNameSnapshot: string;
  amount: number;
  currency: GiftCurrency;
  paymentMethod: PaymentMethod;
  bankAccountId?: string;
  transactionRef?: string;
  receiptImageUrl?: string;
  wishes?: string;
  recordedBy?: string;
  createdAt: string;
  guest?: {
    id: string;
    name: string;
    phone?: string;
    tableNumber?: number;
    side?: string;
    invitationStatus?: string;
    province?: string;
    district?: string;
    commune?: string;
    village?: string;
    notes?: string;
  };
  bankAccount?: {
    id: string;
    bankName: string;
    accountNumber: string;
  };
  recordedByUser?: {
    id: string;
    fullName: string;
  };
}

export interface GiftSummary {
  weddingId: string;
  currency: GiftCurrency;
  totalEnvelopes: number;
  totalAmount: number;
  totalCash: number;
  countCash: number;
  totalQr: number;
  countQr: number;
}

export interface ClerkReconciliation {
  clerkId?: string;
  clerkName: string;
  totalEnvelopes: number;
  cashUSD: number;
  cashKHR: number;
  qrUSD: number;
  qrKHR: number;
  totalUSD: number;
  totalKHR: number;
}

export interface ClerkReconciliationDetail {
  clerkId: string;
  clerkName: string;
  summary: {
    totalEnvelopes: number;
    cashUSD: number;
    cashKHR: number;
    qrUSD: number;
    qrKHR: number;
    totalUSD: number;
    totalKHR: number;
  };
  gifts: Gift[];
}
