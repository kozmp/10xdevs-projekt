import { useState, useEffect } from 'react';
import type { ProductDetailDTO } from '@/types';

interface UseProductDetailReturn {
  product?: ProductDetailDTO;
  loading: boolean;
  error?: Error;
}

export function useProductDetail(
  productId: string | null
): UseProductDetailReturn {
  const [product, setProduct] = useState<ProductDetailDTO>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    if (!productId) {
      setProduct(undefined);
      setLoading(false);
      setError(undefined);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      setError(undefined);

      try {
        const response = await fetch(`/api/products/${productId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.statusText}`);
        }

        const data: ProductDetailDTO = await response.json();
        setProduct(data);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Unknown error occurred')
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return {
    product,
    loading,
    error,
  };
}
