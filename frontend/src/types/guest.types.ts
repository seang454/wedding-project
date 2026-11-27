import type { Gift } from './gift.types';

export type GuestSide = 'GROOM' | 'BRIDE' | 'BOTH';
export type InvitationStatus = 'INVITED' | 'ATTENDED' | 'DECLINED';

export interface Guest {
  id: string;
  weddingId: string;
  name: string;
  phone?: string;
  side: GuestSide;
  relationship?: string;
  tableNumber?: number;
  invitationStatus: InvitationStatus;
  province?: string;
  district?: string;
  commune?: string;
  village?: string;
  notes?: string;
  gifts?: Gift[];
  createdAt: string;
}

export interface BatchGuestItem {
  name: string;
  phone?: string;
  side?: GuestSide;
  relationship?: string;
  tableNumber?: number;
  invitationStatus?: InvitationStatus;
  province?: string;
  district?: string;
  commune?: string;
  village?: string;
}
