'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Gift, GiftSummary, ClerkReconciliation, ClerkReconciliationDetail } from '@/types/gift.types';
import { PaginatedResponse } from '@/types/api.types';
import { RecordGiftFormData } from '@/schemas/gift.schema';

/** GET /gifts?weddingId=&page=&limit=&currency=&paymentMethod=&search= */
export function useGifts(
  weddingId: string,
  page = 1,
  limit = 20,
  currency?: string,
  paymentMethod?: string,
  search?: string,
) {
  return useQuery<PaginatedResponse<Gift>>({
    queryKey: ['gifts', weddingId, page, limit, currency, paymentMethod, search],
    queryFn: async () => {
      let url = `/gifts?weddingId=${weddingId}&page=${page}&limit=${limit}`;
      if (currency) url += `&currency=${currency}`;
      if (paymentMethod) url += `&paymentMethod=${paymentMethod}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await apiClient.get(url);
      return res.data;
    },
    enabled: !!weddingId,
  });
}

/** GET /gifts/:id */
export function useGift(id: string) {
  return useQuery<Gift>({
    queryKey: ['gift', id],
    queryFn: async () => {
      const res = await apiClient.get(`/gifts/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

/** GET /gifts/summary/:weddingId - Refreshes every 15s */
export function useGiftSummary(weddingId: string) {
  return useQuery<GiftSummary[]>({
    queryKey: ['gift-summary', weddingId],
    queryFn: async () => {
      const res = await apiClient.get(`/gifts/summary/${weddingId}`);
      return res.data;
    },
    enabled: !!weddingId,
    refetchInterval: 15000,
  });
}

/** GET /gifts/reconciliation/:weddingId */
export function useClerkReconciliation(weddingId: string) {
  return useQuery<ClerkReconciliation[]>({
    queryKey: ['clerk-reconciliation', weddingId],
    queryFn: async () => {
      const res = await apiClient.get(`/gifts/reconciliation/${weddingId}`);
      return res.data;
    },
    enabled: !!weddingId,
  });
}

/** GET /gifts/reconciliation/:weddingId/clerk/:clerkId */
export function useClerkReconciliationDetail(weddingId: string, clerkId: string) {
  return useQuery<ClerkReconciliationDetail>({
    queryKey: ['clerk-reconciliation-detail', weddingId, clerkId],
    queryFn: async () => {
      const res = await apiClient.get(`/gifts/reconciliation/${weddingId}/clerk/${clerkId}`);
      return res.data;
    },
    enabled: !!weddingId && !!clerkId,
  });
}

/** GET /gifts/wedding/:weddingId/export - Full unpaginated list for CSV/PDF */
export function useExportGifts(weddingId: string, enabled = false) {
  return useQuery<Gift[]>({
    queryKey: ['gifts-export', weddingId],
    queryFn: async () => {
      const res = await apiClient.get(`/gifts/wedding/${weddingId}/export`);
      return res.data;
    },
    enabled: !!weddingId && enabled,
  });
}

/** POST /gifts */
export function useRecordGift(weddingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: RecordGiftFormData) => {
      const res = await apiClient.post('/gifts', data);
      return res.data as Gift;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts', weddingId] });
      queryClient.invalidateQueries({ queryKey: ['gift-summary', weddingId] });
      queryClient.invalidateQueries({ queryKey: ['clerk-reconciliation', weddingId] });
      queryClient.invalidateQueries({ queryKey: ['guests', weddingId] });
      queryClient.invalidateQueries({ queryKey: ['guests-search', weddingId] });
      queryClient.invalidateQueries({ queryKey: ['gifts-export', weddingId] });
    },
  });
}

/** PATCH /gifts/:id */
export function useUpdateGift(weddingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{
        amount: number;
        currency: string;
        paymentMethod: string;
        wishes: string;
        guestNameSnapshot: string;
      }>;
    }) => {
      const res = await apiClient.patch(`/gifts/${id}`, data);
      return res.data as Gift;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts', weddingId] });
      queryClient.invalidateQueries({ queryKey: ['gift-summary', weddingId] });
      queryClient.invalidateQueries({ queryKey: ['clerk-reconciliation', weddingId] });
      queryClient.invalidateQueries({ queryKey: ['clerk-reconciliation-detail', weddingId] });
      queryClient.invalidateQueries({ queryKey: ['guests', weddingId] });
      queryClient.invalidateQueries({ queryKey: ['gifts-export', weddingId] });
    },
  });
}

/** DELETE /gifts/:id (OWNER / ADMIN only) */
export function useDeleteGift(weddingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (giftId: string) => {
      const res = await apiClient.delete(`/gifts/${giftId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts', weddingId] });
      queryClient.invalidateQueries({ queryKey: ['gift-summary', weddingId] });
      queryClient.invalidateQueries({ queryKey: ['clerk-reconciliation', weddingId] });
      queryClient.invalidateQueries({ queryKey: ['guests-search', weddingId] });
      queryClient.invalidateQueries({ queryKey: ['gifts-export', weddingId] });
    },
  });
}

// ─── Storage ──────────────────────────────────────────────────────────────

/** POST /storage/presigned-url */
export function usePresignedUploadUrl() {
  return useMutation({
    mutationFn: async ({
      fileName,
      contentType,
      folder = 'slips',
    }: {
      fileName: string;
      contentType: string;
      folder?: string;
    }) => {
      const res = await apiClient.post('/storage/presigned-url', {
        fileName,
        contentType,
        folder,
      });
      return res.data as { uploadUrl: string; fileUrl: string; key: string };
    },
  });
}
