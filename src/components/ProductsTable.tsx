import { useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import type { ProductSummaryDTO } from '@/types';

interface ProductsTableProps {
  products: ProductSummaryDTO[];
  selectedIds: string[];
  onToggle: (id: string) => boolean;
  onToggleAll: (ids: string[]) => void;
  onRowClick?: (productId: string) => void;
  isMaxReached: boolean;
  maxLimit: number;
}

const statusLabels: Record<string, string> = {
  published: 'Opublikowany',
  draft: 'Szkic',
};

export function ProductsTable({
  products,
  selectedIds,
  onToggle,
  onToggleAll,
  onRowClick,
  isMaxReached,
  maxLimit,
}: ProductsTableProps) {
  const productIds = useMemo(() => products.map((p) => p.id), [products]);

  const allSelected = useMemo(() => {
    if (products.length === 0) return false;
    return products.every((p) => selectedIds.includes(p.id));
  }, [products, selectedIds]);

  const someSelected = useMemo(() => {
    if (products.length === 0) return false;
    return products.some((p) => selectedIds.includes(p.id)) && !allSelected;
  }, [products, selectedIds, allSelected]);

  const handleSelectAll = useCallback(() => {
    onToggleAll(productIds);
  }, [onToggleAll, productIds]);

  const handleToggle = useCallback(
    (id: string) => {
      const isSelected = selectedIds.includes(id);
      if (!isSelected && isMaxReached) {
        // Show feedback that limit is reached
        return;
      }
      onToggle(id);
    },
    [onToggle, selectedIds, isMaxReached]
  );

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Brak produktów do wyświetlenia
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Zaznacz wszystkie produkty"
                ref={(node) => {
                  if (node) {
                    (node as any).indeterminate = someSelected;
                  }
                }}
              />
            </TableHead>
            <TableHead>Nazwa</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Kategorie</TableHead>
            <TableHead>Kolekcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const isSelected = selectedIds.includes(product.id);
            const isDisabled = !isSelected && isMaxReached;

            return (
              <TableRow
                key={product.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={(e) => {
                  // Don't trigger row click if clicking on checkbox
                  if (
                    e.target instanceof HTMLElement &&
                    (e.target.closest('button[role="checkbox"]') ||
                      e.target.closest('input[type="checkbox"]'))
                  ) {
                    return;
                  }
                  onRowClick?.(product.id);
                }}
              >
                <TableCell
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(product.id)}
                    disabled={isDisabled}
                    aria-label={`Zaznacz produkt ${product.name}`}
                    title={
                      isDisabled
                        ? `Osiągnięto limit ${maxLimit} produktów`
                        : undefined
                    }
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.sku || '-'}</TableCell>
                <TableCell>
                  <span
                    className={
                      product.status === 'published'
                        ? 'text-green-600'
                        : 'text-gray-600'
                    }
                  >
                    {statusLabels[product.status] || product.status}
                  </span>
                </TableCell>
                <TableCell>
                  {product.categories.length > 0
                    ? product.categories.map((c) => c.name).join(', ')
                    : '-'}
                </TableCell>
                <TableCell>
                  {product.collections.length > 0
                    ? product.collections.map((c) => c.name).join(', ')
                    : '-'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
