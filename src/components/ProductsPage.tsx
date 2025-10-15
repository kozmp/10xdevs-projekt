import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useProducts } from '@/components/hooks/useProducts';
import { useSelection } from '@/components/hooks/useSelection';
import { SearchInput } from '@/components/SearchInput';
import { FilterDropdown } from '@/components/FilterDropdown';
import { ProductsTable } from '@/components/ProductsTable';
import { BulkActionsBar } from '@/components/BulkActionsBar';
import { PaginationControls } from '@/components/PaginationControls';
import { ProductPreviewModal } from '@/components/ProductPreviewModal';
import { Toaster } from '@/components/ui/sonner';
import type { ProductStatus } from '@/types';

export function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const { products, meta, loading, error } = useProducts({
    page,
    limit: 20,
    status: statusFilter === 'all' ? undefined : statusFilter,
    search,
  });

  const {
    selected,
    toggle,
    toggleAll,
    clear,
    count,
    isMaxReached,
    maxLimit,
  } = useSelection<string>(50);

  const handleToggle = useCallback(
    (id: string) => {
      const added = toggle(id);
      if (!added && !selected.includes(id)) {
        toast.warning('Osiągnięto limit', {
          description: `Możesz zaznaczyć maksymalnie ${maxLimit} produktów`,
        });
      }
      return added;
    },
    [toggle, selected, maxLimit]
  );

  const handleToggleAll = useCallback(
    (ids: string[]) => {
      const prevCount = count;
      toggleAll(ids);

      // Show toast if limit was reached during select all
      if (count >= maxLimit && prevCount < count) {
        toast.info('Zaznaczono do limitu', {
          description: `Zaznaczono maksymalnie ${maxLimit} produktów`,
        });
      }
    },
    [toggleAll, count, maxLimit]
  );

  const handleGenerate = useCallback(() => {
    if (count === 0) return;

    // Redirect to generate page with selected IDs
    const ids = selected.join(',');
    window.location.href = `/generate?ids=${ids}`;
  }, [selected, count]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page on search
  }, []);

  const handleFilterChange = useCallback((value: ProductStatus | 'all') => {
    setStatusFilter(value);
    setPage(1); // Reset to first page on filter
  }, []);

  // Loading state
  if (loading && products.length === 0) {
    return (
      <main className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Produkty</h1>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-muted-foreground">Ładowanie produktów...</p>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <main className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Produkty</h1>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">
              Wystąpił błąd podczas ładowania produktów
            </h2>
            <p className="text-muted-foreground mb-4">{error.message}</p>
          </div>
        </div>
        <Toaster />
      </main>
    );
  }

  return (
    <main className="container mx-auto p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6">Produkty</h1>

      {/* Filters Section */}
      <section className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Szukaj produktów po nazwie lub SKU..."
          />
        </div>
        <div>
          <FilterDropdown value={statusFilter} onChange={handleFilterChange} />
        </div>
      </section>

      {/* Summary */}
      {meta && (
        <div className="text-sm text-muted-foreground mb-4">
          Znaleziono {meta.total} produktów
        </div>
      )}

      {/* Products Table */}
      <section className="mb-6">
        <ProductsTable
          products={products}
          selectedIds={selected}
          onToggle={handleToggle}
          onToggleAll={handleToggleAll}
          onRowClick={setSelectedProductId}
          isMaxReached={isMaxReached}
          maxLimit={maxLimit}
        />
      </section>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <section>
          <PaginationControls
            currentPage={page}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
            isLoading={loading}
          />
        </section>
      )}

      {/* Bulk Actions Bar (floating) */}
      <BulkActionsBar
        selectedCount={count}
        maxLimit={maxLimit}
        onGenerate={handleGenerate}
        onClear={clear}
      />

      {/* Product Preview Modal */}
      <ProductPreviewModal
        productId={selectedProductId}
        onClose={() => setSelectedProductId(null)}
      />

      {/* Toast notifications */}
      <Toaster />
    </main>
  );
}
