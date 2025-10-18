import { useCallback, useMemo } from 'react';
import type { UseProductsCountReturn } from './types';

export function useProductsCount(
  count: number,
  onCountClick?: () => void
): UseProductsCountReturn {
  const formattedCount = useMemo(() => {
    return new Intl.NumberFormat('pl-PL').format(count);
  }, [count]);

  const handleCountClick = useCallback(() => {
    if (onCountClick) {
      onCountClick();
    }
  }, [onCountClick]);

  const isClickable = Boolean(onCountClick);

  return {
    formattedCount,
    handleCountClick,
    isClickable,
  };
}
