import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Checkbox } from "./ui/checkbox";
import { PaginationControls } from "./PaginationControls";
import { ProductPreviewModal } from "./ProductPreviewModal";

interface ProductsTableProps {
  products: any[];
  loading: boolean;
  selectedIds: string[];
  onSelectIds: (ids: string[]) => void;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  onPaginationChange: (page: number) => void;
}

export function ProductsTable({
  products,
  loading,
  selectedIds,
  onSelectIds,
  pagination,
  onPaginationChange,
}: ProductsTableProps) {
  const [previewProduct, setPreviewProduct] = React.useState<any>(null);

  const handleSelectAll = (checked: boolean) => {
    onSelectIds(checked ? products.map((p) => p.id) : []);
  };

  const handleSelectOne = (checked: boolean, id: string) => {
    onSelectIds(checked ? [...selectedIds, id] : selectedIds.filter((selectedId) => selectedId !== id));
  };

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
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === products.length}
                  onCheckedChange={handleSelectAll}
                  aria-label="Zaznacz wszystkie"
                />
              </TableHead>
              <TableHead>Nazwa</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Kategorie</TableHead>
              <TableHead>Ostatnia aktualizacja</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(product.id)}
                    onCheckedChange={(checked) => handleSelectOne(checked, product.id)}
                    aria-label={`Zaznacz ${product.name}`}
                  />
                </TableCell>
                <TableCell>
                  <button onClick={() => setPreviewProduct(product)} className="text-left hover:text-primary">
                    {product.name}
                  </button>
                </TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.status}</TableCell>
                <TableCell>{product.categories?.map((c) => c.name).join(", ")}</TableCell>
                <TableCell>{new Date(product.updated_at).toLocaleString()}</TableCell>
              </TableRow>
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

      <ProductPreviewModal product={previewProduct} onClose={() => setPreviewProduct(null)} />
    </>
  );
}
