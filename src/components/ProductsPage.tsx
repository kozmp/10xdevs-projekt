import React from "react";
import { ProductsTable } from "./ProductsTable";
import { SearchInput } from "./SearchInput";
import { FilterDropdown } from "./FilterDropdown";
import { BulkActionsBar } from "./BulkActionsBar";
import { Button } from "./ui/button";
import { useProducts } from "./hooks/useProducts";

export function ProductsPage() {
  const {
    products,
    loading,
    error,
    selectedIds,
    setSelectedIds,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    pagination,
    setPagination,
    refetch,
  } = useProducts();

  const handleGenerateDescriptions = () => {
    if (selectedIds.length === 0) return;
    window.location.href = `/generate?ids=${selectedIds.join(",")}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Produkty</h1>
        <Button onClick={refetch}>Odśwież</Button>
      </div>

      <div className="flex items-center gap-4">
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Szukaj produktów..." className="w-96" />
        <FilterDropdown selected={filters} onSelect={setFilters} />
      </div>

      {selectedIds.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedIds.length}
          maxLimit={10}
          onGenerate={handleGenerateDescriptions}
          onClear={() => setSelectedIds([])}
        />
      )}

      {error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-md">{error.message}</div>
      ) : (
        <ProductsTable
          products={products}
          loading={loading}
          selectedIds={selectedIds}
          onSelectIds={setSelectedIds}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      )}
    </div>
  );
}
