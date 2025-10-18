import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { generateFormSchema, type GenerateFormData } from './schema';
import type { GenerateFormResult, GenerateFormSummary, UseGenerateFormReturn } from './types';
import { useGenerate } from '@/components/hooks/useGenerate';

export const useGenerateForm = (
  selectedProductIds: string[],
  onSuccess?: () => void,
  onError?: (error: Error) => void
): UseGenerateFormReturn => {
  const [results, setResults] = useState<GenerateFormResult[]>([]);
  const [summary, setSummary] = useState<GenerateFormSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { generate, isGenerating, progress } = useGenerate({ ids: selectedProductIds });

  const form = useForm<GenerateFormData>({
    resolver: zodResolver(generateFormSchema),
    defaultValues: {
      style: 'professional',
      language: 'pl',
      productIds: selectedProductIds
    }
  });

  const handleSubmit = async (data: GenerateFormData) => {
    try {
      setError(null);
      setResults([]);
      setSummary(null);

      const result = await generate(data.style, data.language);
      
      setResults(result.results);
      setSummary(result.summary);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd';
      setError(errorMessage);
      
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    }
  };

  return {
    isGenerating,
    progress,
    results,
    summary,
    error,
    handleSubmit: form.handleSubmit(handleSubmit),
    form
  };
};
