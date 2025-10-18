import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addShopFormSchema, type AddShopFormData } from './schema';
import type { UseAddShopFormReturn, AddShopApiResponse } from './types';

export const useAddShopForm = (
  onSuccess?: () => void,
  onError?: (error: Error) => void,
  redirectUrl: string = '/'
): UseAddShopFormReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<AddShopFormData>({
    resolver: zodResolver(addShopFormSchema),
    defaultValues: {
      shopifyDomain: '',
      apiKey: '',
      apiSecret: ''
    }
  });

  const handleSubmit = async (data: AddShopFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);

      const response = await fetch('/api/shops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json() as AddShopApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Wystąpił błąd podczas dodawania sklepu');
      }

      setSuccess(true);
      form.reset();

      if (onSuccess) {
        onSuccess();
      }

      // Przekierowanie po sukcesie
      if (redirectUrl) {
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd';
      setError(errorMessage);
      
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    success,
    handleSubmit: form.handleSubmit(handleSubmit),
    form
  };
};
