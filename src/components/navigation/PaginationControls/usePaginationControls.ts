import { useCallback, useMemo } from 'react';
import { PAGE_INFO_FORMAT } from './constants';
import type { UsePaginationControlsReturn } from './types';

export function usePaginationControls(
  currentPage: number,
  totalPages: number,
  onPageChange: (page: number) => void
): UsePaginationControlsReturn {
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePrevClick = useCallback(() => {
    onPageChange(currentPage - 1);
  }, [currentPage, onPageChange]);

  const handleNextClick = useCallback(() => {
    onPageChange(currentPage + 1);
  }, [currentPage, onPageChange]);

  const pageInfo = useMemo(() => {
    return PAGE_INFO_FORMAT
      .replace('{current}', String(currentPage))
      .replace('{total}', String(totalPages));
  }, [currentPage, totalPages]);

  const shouldRender = totalPages > 1;

  return {
    canGoPrev,
    canGoNext,
    handlePrevClick,
    handleNextClick,
    pageInfo,
    shouldRender,
  };
}
