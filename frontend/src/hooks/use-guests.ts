'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Guest, BatchGuestItem } from '@/types/guest.types';
import { PaginatedResponse } from '@/types/api.types';
import { CreateGuestFormData } from '@/schemas/guest.schema';

/** GET /guests/wedding/:weddingId?page=&take= */
export function useGuests(weddingId: string, page = 1, take = 20) {
  return useQuery<PaginatedResponse<Guest>>({
    queryKey: ['guests', weddingId, page, take],
    queryFn: async () => {
      const res = await apiClient.get(
        `/guests/wedding/${weddingId}?page=${page}&take=${take}`,
      );
      return res.data;
    },
    enabled: !!weddingId,
  });
}

/** GET /guests/:id */
export function useGuest(id: string) {
  return useQuery<Guest>({
    queryKey: ['guest', id],
    queryFn: async () => {
      const res = await apiClient.get(`/guests/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

/** GET /guests/search?weddingId=&search= */
export function useGuestSearch(weddingId: string, search: string) {
  return useQuery<Guest[]>({
    queryKey: ['guests-search', weddingId, search],
    queryFn: async () => {
      if (!search || search.trim().length === 0) return [];
      const res = await apiClient.get(
        `/guests/search?weddingId=${weddingId}&search=${encodeURIComponent(search.trim())}`,
      );
      return res.data;
    },
    enabled: !!weddingId && search.trim().length > 0,
  });
}

/** GET /guests/wedding/:weddingId/export */
export function useExportGuests(weddingId: string, enabled = false) {
  return useQuery<Guest[]>({
    queryKey: ['guests-export', weddingId],
    queryFn: async () => {
      const res = await apiClient.get(`/guests/wedding/${weddingId}/export`);
      return res.data;
    },
    enabled: !!weddingId && enabled,
  });
}

/** POST /guests */
export function useCreateGuest(weddingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateGuestFormData) => {
      const res = await apiClient.post('/guests', data);
      return res.data as Guest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests', weddingId] });
      queryClient.invalidateQueries({ queryKey: ['guests-export', weddingId] });
    },
  });
}

/** POST /guests/batch/:weddingId */
export function useBatchImportGuests(weddingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (guests: BatchGuestItem[]) => {
      const res = await apiClient.post(`/guests/batch/${weddingId}`, { guests });
      return res.data as { insertedCount: number };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests', weddingId] });
      queryClient.invalidateQueries({ queryKey: ['guests-export', weddingId] });
    },
  });
}

/** PATCH /guests/:id */
export function useUpdateGuest(weddingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateGuestFormData> }) => {
      const res = await apiClient.patch(`/guests/${id}`, data);
      return res.data as Guest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests', weddingId] });
      queryClient.invalidateQueries({ queryKey: ['guests-export', weddingId] });
    },
  });
}

/** PATCH /guests/:id/check-in */
export function useCheckInGuest(weddingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (guestId: string) => {
      const res = await apiClient.patch(`/guests/${guestId}/check-in`);
      return res.data as Guest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests', weddingId] });
    },
  });
}

/** DELETE /guests/:id (OWNER / ADMIN) */
export function useDeleteGuest(weddingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (guestId: string) => {
      const res = await apiClient.delete(`/guests/${guestId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests', weddingId] });
      queryClient.invalidateQueries({ queryKey: ['guests-export', weddingId] });
    },
  });
}
