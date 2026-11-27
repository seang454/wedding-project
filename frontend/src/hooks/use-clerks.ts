'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Wedding } from '@/types/wedding.types';

export interface ClerkUser {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: 'CLERK';
  createdByOwnerId?: string;
  createdAt: string;
  assignedWeddings?: Wedding[];
}

export interface CreateClerkInput {
  fullName: string;
  email?: string;
  phone?: string;
  password: string;
  weddingIds?: string[];
}

export function useClerks() {
  return useQuery<ClerkUser[]>({
    queryKey: ['clerks'],
    queryFn: async () => {
      const res = await apiClient.get('/users/clerks');
      return res.data;
    },
  });
}

export function useCreateClerk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateClerkInput) => {
      const res = await apiClient.post('/users/clerks', data);
      return res.data as ClerkUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clerks'] });
    },
  });
}

export interface UpdateClerkInput {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  weddingIds?: string[];
}

export function useUpdateClerk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ clerkId, data }: { clerkId: string; data: UpdateClerkInput }) => {
      const res = await apiClient.patch(`/users/clerks/${clerkId}`, data);
      return res.data as ClerkUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clerks'] });
    },
  });
}

export function useAssignClerkWeddings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ clerkId, weddingIds }: { clerkId: string; weddingIds: string[] }) => {
      const res = await apiClient.patch(`/users/clerks/${clerkId}/weddings`, { weddingIds });
      return res.data as ClerkUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clerks'] });
    },
  });
}

export function useDeleteClerk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (clerkId: string) => {
      await apiClient.delete(`/users/clerks/${clerkId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clerks'] });
    },
  });
}
