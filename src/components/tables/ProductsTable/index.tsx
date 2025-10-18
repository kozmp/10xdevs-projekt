import React from "react";
import { Table, TableBody } from "@/components/ui/table";
import { PaginationControls } from "@/components/PaginationControls";
import { ProductPreviewModal } from "@/components/ProductPreviewModal";
import { ProductsTableHeader } from "./ProductsTableHeader";
import { ProductsTableRow } from "./ProductsTableRow";
import { useProductsTable } from "./useProductsTable";
import type { ProductsTableProps } from "./types";

export function ProductsTable({
  products,
  loading,
  selectedIds,
  onSelectIds,
  pagination,
  onPaginationChange,
}: ProductsTableProps) {
  const { handleSelectAll, handleSelectOne, previewProduct, setPreviewProduct, isAllSelected, isSelected } =
    useProductsTable(products, selectedIds, onSelectIds);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <ProductsTableHeader isAllSelected={isAllSelected} onSelectAll={handleSelectAll} />
          <TableBody>
            {products.map((product) => (
              <ProductsTableRow
                key={product.id}
                product={product}
                isSelected={isSelected(product.id)}
                onSelect={(checked) => handleSelectOne(checked, product.id)}
                onPreview={() => setPreviewProduct(product)}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <PaginationControls
          currentPage={pagination.page}
          totalPages={Math.ceil(pagination.total / pagination.limit)}
          onPageChange={onPaginationChange}
        />
      </div>

      <ProductPreviewModal productId={previewProduct?.id || null} onClose={() => setPreviewProduct(null)} />
    </>
  );
}
