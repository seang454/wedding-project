'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';
import { Wedding, BankAccount } from '@/types/wedding.types';
import { CreateBankAccountFormData } from '@/schemas/bank.schema';
import { CreateWeddingFormData, UpdateWeddingFormData } from '@/schemas/wedding.schema';

// ─── Weddings ────────────────────────────────────────────────────────────────

/** GET /weddings - Owner's wedding list or Clerk's assigned weddings */
export function useWeddings() {
  const { user } = useAuth();
  return useQuery<Wedding[]>({
    queryKey: ['weddings', user?.id],
    queryFn: async () => {
      const res = await apiClient.get('/weddings');
      return res.data;
    },
    enabled: !!user?.id,
  });
}

/** GET /weddings/:id */
export function useWedding(id: string) {
  return useQuery<Wedding>({
    queryKey: ['wedding', id],
    queryFn: async () => {
      const res = await apiClient.get(`/weddings/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

/** POST /weddings */
export function useCreateWedding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateWeddingFormData) => {
      const res = await apiClient.post('/weddings', data);
      return res.data as Wedding;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weddings'] });
    },
  });
}

/** PATCH /weddings/:id */
export function useUpdateWedding(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateWeddingFormData) => {
      const res = await apiClient.patch(`/weddings/${id}`, data);
      return res.data as Wedding;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wedding', id] });
      queryClient.invalidateQueries({ queryKey: ['weddings'] });
    },
  });
}

/** DELETE /weddings/:id */
export function useDeleteWedding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/weddings/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weddings'] });
    },
  });
}

// ─── Bank Accounts ─────────────────────────────────────────────────────────

/** GET /bank-accounts/wedding/:weddingId */
export function useBankAccounts(weddingId: string) {
  return useQuery<BankAccount[]>({
    queryKey: ['bank-accounts', weddingId],
    queryFn: async () => {
      const res = await apiClient.get(`/bank-accounts/wedding/${weddingId}`);
      return res.data;
    },
    enabled: !!weddingId,
  });
}

/** GET /bank-accounts/:id */
export function useBankAccount(id: string) {
  return useQuery<BankAccount>({
    queryKey: ['bank-account', id],
    queryFn: async () => {
      const res = await apiClient.get(`/bank-accounts/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

/** POST /bank-accounts */
export function useAddBankAccount(weddingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateBankAccountFormData) => {
      const res = await apiClient.post('/bank-accounts', data);
      return res.data as BankAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts', weddingId] });
      queryClient.invalidateQueries({ queryKey: ['wedding', weddingId] });
    },
  });
}

/** PATCH /bank-accounts/:id */
export function useUpdateBankAccount(weddingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateBankAccountFormData> }) => {
      const res = await apiClient.patch(`/bank-accounts/${id}`, data);
      return res.data as BankAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts', weddingId] });
    },
  });
}

/** PATCH /bank-accounts/:id/primary */
export function useSetPrimaryBank(weddingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bankId: string) => {
      const res = await apiClient.patch(`/bank-accounts/${bankId}/primary`);
      return res.data as BankAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts', weddingId] });
    },
  });
}

/** DELETE /bank-accounts/:id */
export function useDeleteBankAccount(weddingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bankId: string) => {
      const res = await apiClient.delete(`/bank-accounts/${bankId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts', weddingId] });
    },
  });
}
