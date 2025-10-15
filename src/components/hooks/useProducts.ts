import { useState, useEffect, useCallback } from 'react';
import type { ProductSummaryDTO, ProductStatus } from '@/types';

interface UseProductsParams {
  page?: number;
  limit?: number;
  status?: ProductStatus;
  search?: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UseProductsReturn {
  products: ProductSummaryDTO[];
  meta?: PaginationMeta;
  loading: boolean;
  error?: Error;
  refetch: () => void;
}

export function useProducts({
  page = 1,
  limit = 20,
  status,
  search,
}: UseProductsParams): UseProductsReturn {
  const [products, setProducts] = useState<ProductSummaryDTO[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      // Build query params
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', limit.toString());
      if (status) params.set('status', status);
      if (search && search.trim()) params.set('search', search.trim());

      const response = await fetch(`/api/products?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }

      const data = await response.json();
      setProducts(data.data || []);
      setMeta(data.meta);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Unknown error occurred')
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, status, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    meta,
    loading,
    error,
    refetch: fetchProducts,
  };
}
