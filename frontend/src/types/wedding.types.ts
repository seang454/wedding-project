export interface BankAccount {
  id: string;
  weddingId: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  qrImageUrl?: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface Wedding {
  id: string;
  ownerId: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
  venue?: string;
  province?: string;
  district?: string;
  commune?: string;
  phone?: string;
  notes?: string;
  targetAmount?: number;
  imageUrl?: string;
  createdAt: string;
  bankAccounts?: BankAccount[];
}
