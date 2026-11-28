'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { User, AuthResponse } from '@/types/auth.types';
import { LoginFormData, RegisterFormData } from '@/schemas/auth.schema';

export function useAuth() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData): Promise<AuthResponse> => {
      const res = await apiClient.post('/auth/login', {
        emailOrPhone: data.identifier,
        password: data.password,
      });
      return res.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      document.cookie = `accessToken=${data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
      setUser(data.user);
      queryClient.setQueryData(['currentUser'], data.user);
      window.location.href = '/weddings';
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData): Promise<AuthResponse> => {
      const payload: Record<string, unknown> = {
        fullName: data.fullName,
        password: data.password,
        role: data.role || 'OWNER',
      };
      if (data.email && data.email.trim() !== '') {
        payload.email = data.email.trim();
      }
      if (data.phone && data.phone.trim() !== '') {
        payload.phone = data.phone.trim();
      }
      const res = await apiClient.post('/auth/register', payload);
      return res.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      document.cookie = `accessToken=${data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
      setUser(data.user);
      queryClient.setQueryData(['currentUser'], data.user);
      window.location.href = '/weddings';
    },
  });

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors during logout
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    document.cookie = 'accessToken=; path=/; max-age=0';
    setUser(null);
    queryClient.clear();
    window.location.href = '/login';
  };

  return {
    user,
    isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout,
  };
}
