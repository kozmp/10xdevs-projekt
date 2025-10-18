import { useState, useCallback, useMemo } from 'react';
import type { Product, UseProductsTableReturn } from './types';

export function useProductsTable(
  products: Product[],
  selectedIds: string[],
  onSelectIds: (ids: string[]) => void
): UseProductsTableReturn {
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      onSelectIds(checked ? products.map((p) => p.id) : []);
    },
    [products, onSelectIds]
  );

  const handleSelectOne = useCallback(
    (checked: boolean, id: string) => {
      onSelectIds(
        checked
          ? [...selectedIds, id]
          : selectedIds.filter((selectedId) => selectedId !== id)
      );
    },
    [selectedIds, onSelectIds]
  );

  const isAllSelected = useMemo(
    () => selectedIds.length === products.length && products.length > 0,
    [selectedIds, products]
  );

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds]
  );

  return {
    handleSelectAll,
    handleSelectOne,
    previewProduct,
    setPreviewProduct,
    isAllSelected,
    isSelected,
  };
}
