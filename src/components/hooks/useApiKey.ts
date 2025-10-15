import { useState } from 'react';
import type { UpdateShopCommand, ShopResponseDTO } from '@/types';

interface UseApiKeyReturn {
  key: string;
  setKey: (key: string) => void;
  save: () => Promise<ShopResponseDTO | null>;
  remove: () => Promise<boolean>;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

export function useApiKey(): UseApiKeyReturn {
  const [key, setKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const save = async (): Promise<ShopResponseDTO | null> => {
    if (key.length < 8) {
      setStatus('error');
      setError('Klucz API musi mieć co najmniej 8 znaków');
      return null;
    }

    setStatus('loading');
    setError(null);

    try {
      const body: UpdateShopCommand = { apiKey: key };
      const response = await fetch('/api/shops', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Nie udało się zapisać klucza API');
      }

      const shop: ShopResponseDTO = await response.json();
      setStatus('success');
      return shop;
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
      return null;
    }
  };

  const remove = async (): Promise<boolean> => {
    setStatus('loading');
    setError(null);

    try {
      const response = await fetch('/api/shops', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Nie udało się usunąć klucza API');
      }

      setStatus('success');
      setKey('');
      return true;
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
      return false;
    }
  };

  return {
    key,
    setKey,
    save,
    remove,
    status,
    error,
  };
}
