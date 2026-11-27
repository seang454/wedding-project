'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { User } from '@/types/auth.types';

/** GET /users/clerks - List reception clerks (OWNER/ADMIN) */
export function useClerks() {
  return useQuery<User[]>({
    queryKey: ['clerks'],
    queryFn: async () => {
      const res = await apiClient.get('/users/clerks');
      return res.data;
    },
  });
}

/** GET /users/:id */
export function useUserById(id: string) {
  return useQuery<User>({
    queryKey: ['user', id],
    queryFn: async () => {
      const res = await apiClient.get(`/users/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

/** GET /users - All users (ADMIN only) */
export function useAllUsers() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await apiClient.get('/users');
      return res.data;
    },
  });
}

/** GET /auth/me - Current logged-in user profile */
export function useCurrentUser() {
  return useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await apiClient.get('/auth/me');
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}
