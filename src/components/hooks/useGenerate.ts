import { useState } from 'react';
import { GenerationStyle, GenerationLanguage } from '@/lib/services/product-description-generator.service';

interface UseGenerateParams {
  ids: string[];
}

interface GenerationResult {
  productId: string;
  status: 'success' | 'error';
  data?: {
    shortDescription: string;
    longDescription: string;
    metaDescription: string;
  };
  error?: string;
}

interface GenerationSummary {
  total: number;
  success: number;
  error: number;
}

interface UseGenerateReturn {
  generate: (style: GenerationStyle, language: GenerationLanguage) => Promise<void>;
  isGenerating: boolean;
  progress: number;
  results: GenerationResult[];
  summary: GenerationSummary | null;
  error: string | null;
}

export function useGenerate({ ids }: UseGenerateParams): UseGenerateReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [summary, setSummary] = useState<GenerationSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async (style: GenerationStyle, language: GenerationLanguage) => {
    if (isGenerating) return;

    try {
      setIsGenerating(true);
      setError(null);
      setProgress(0);
      setResults([]);
      setSummary(null);

      const response = await fetch('/api/products/generate-descriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: ids,
          style,
          language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate descriptions');
      }

      const data = await response.json();
      setResults(data.results);
      setSummary(data.summary);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generate,
    isGenerating,
    progress,
    results,
    summary,
    error,
  };
}