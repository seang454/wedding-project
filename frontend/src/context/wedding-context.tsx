'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWeddings } from '@/hooks/use-weddings';
import { Wedding } from '@/types/wedding.types';

interface WeddingContextType {
  weddings: Wedding[] | undefined;
  isLoading: boolean;
  activeWedding: Wedding | null;
  activeWeddingId: string;
  setActiveWeddingId: (id: string) => void;
  selectWedding: (wedding: Wedding) => void;
}

const WeddingContext = createContext<WeddingContextType | undefined>(undefined);

export function WeddingProvider({ children }: { children: React.ReactNode }) {
  const { data: weddings, isLoading } = useWeddings();
  const [selectedId, setSelectedId] = useState<string>('');

  useEffect(() => {
    // 1. Try reading from localStorage on mount
    const storedId = typeof window !== 'undefined' ? localStorage.getItem('activeWeddingId') : null;
    if (storedId) {
      setSelectedId(storedId);
    }
  }, []);

  useEffect(() => {
    // 2. If weddings load and no id selected or id not found, default to first wedding or clear
    if (weddings && weddings.length > 0) {
      const match = weddings.find((w) => w.id === selectedId);
      if (!match) {
        const fallback = weddings[0].id;
        setSelectedId(fallback);
        if (typeof window !== 'undefined') {
          localStorage.setItem('activeWeddingId', fallback);
        }
      }
    } else if (weddings && weddings.length === 0) {
      setSelectedId('');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('activeWeddingId');
      }
    }
  }, [weddings, selectedId]);

  const setActiveWeddingId = (id: string) => {
    setSelectedId(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeWeddingId', id);
    }
  };

  const selectWedding = (wedding: Wedding) => {
    setActiveWeddingId(wedding.id);
  };

  const activeWedding = weddings?.find((w) => w.id === selectedId) || (weddings && weddings.length > 0 ? weddings[0] : null);
  const activeWeddingId = activeWedding?.id || '';

  return (
    <WeddingContext.Provider
      value={{
        weddings,
        isLoading,
        activeWedding,
        activeWeddingId,
        setActiveWeddingId,
        selectWedding,
      }}
    >
      {children}
    </WeddingContext.Provider>
  );
}

export function useActiveWedding() {
  const context = useContext(WeddingContext);
  if (!context) {
    throw new Error('useActiveWedding must be used within a WeddingProvider');
  }
  return context;
}
