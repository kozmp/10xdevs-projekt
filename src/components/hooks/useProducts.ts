import { useState, useEffect } from "react";
import type { ProductSummaryDTO } from "@/types";

interface Pagination {
  page: number;
  limit: number;
  total: number;
}

interface Filters {
  status?: string;
  category?: string;
}

export function useProducts() {
  const [products, setProducts] = useState<ProductSummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchQuery,
        ...filters,
      });

      const response = await fetch(`/api/products?${queryParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data.data || []);
      setPagination((prev) => ({ ...prev, total: data.meta?.total || 0 }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, pagination.limit, searchQuery, filters]);

  const handlePaginationChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  return {
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
    setPagination: handlePaginationChange,
    refetch: fetchProducts,
  };
}
