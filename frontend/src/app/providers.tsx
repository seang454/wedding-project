'use client';

import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { WeddingProvider } from '@/context/wedding-context';

const RESOURCE_QUERY_KEYS: Record<string, string[]> = {
  gifts: ['gifts', 'gift-summary', 'clerk-reconciliation', 'clerk-reconciliation-detail', 'guests'],
  guests: ['guests', 'gifts', 'clerk-reconciliation', 'clerk-reconciliation-detail'],
  weddings: ['weddings'],
  users: ['clerks', 'weddings'],
  'bank-accounts': ['bank-accounts'],
};

function RealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
    let eventSource: EventSource | null = null;

    const connect = () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) return;

      eventSource = new EventSource(`${apiBase}/events/stream?token=${encodeURIComponent(token)}`);
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as { resource?: string };
          const resource = parsed?.resource;
          if (!resource) return;

          const keys = RESOURCE_QUERY_KEYS[resource];
          if (keys && keys.length > 0) {
            keys.forEach((key) => {
              queryClient.invalidateQueries({ queryKey: [key] });
            });
          } else {
            queryClient.invalidateQueries();
          }
        } catch {
          // Ignore heartbeat or non-JSON frames
        }
      };
    };

    connect();
    window.addEventListener('auth:token-refreshed', connect);

    return () => {
      window.removeEventListener('auth:token-refreshed', connect);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [queryClient]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1 minute
            refetchOnWindowFocus: true,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeSync />
      <WeddingProvider>
        {children}
        <Toaster position="top-right" richColors />
      </WeddingProvider>
    </QueryClientProvider>
  );
}
