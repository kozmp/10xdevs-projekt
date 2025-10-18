import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProducts } from "../useProducts";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("useProducts Hook", () => {
  const mockProducts = [
    { id: "1", name: "Product 1" },
    { id: "2", name: "Product 2" },
  ];

  const mockResponse = {
    data: mockProducts,
    meta: { total: 2 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });
  });

  describe("Initialization and Data Fetching", () => {
    it("should initialize with default values", async () => {
      const { result } = renderHook(() => useProducts());

      expect(result.current.products).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe(null);
      expect(result.current.selectedIds).toEqual([]);
      expect(result.current.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
      });

      // Wait for initial fetch to complete
      await vi.waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it("should fetch products on mount", async () => {
      const { result } = renderHook(() => useProducts());

      await vi.waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.products).toEqual(mockProducts);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/products"));
    });
  });

  describe("Pagination Handling", () => {
    it("should update pagination when page changes", async () => {
      const { result } = renderHook(() => useProducts());

      await act(async () => {
        result.current.setPagination(2);
      });

      expect(result.current.pagination.page).toBe(2);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("page=2"));
    });

    it("should handle pagination meta data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: mockProducts,
            meta: { total: 100 },
          }),
      });

      const { result } = renderHook(() => useProducts());

      await vi.waitFor(() => {
        expect(result.current.pagination.total).toBe(100);
      });
    });
  });

  describe("Search and Filtering", () => {
    it("should update search query and fetch results", async () => {
      const { result } = renderHook(() => useProducts());

      await act(async () => {
        result.current.setSearchQuery("test");
      });

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("search=test"));
    });

    it("should update filters and fetch results", async () => {
      const { result } = renderHook(() => useProducts());

      await act(async () => {
        result.current.setFilters({ status: "active" });
      });

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("status=active"));
    });
  });

  describe("Selection Management", () => {
    it("should handle product selection", () => {
      const { result } = renderHook(() => useProducts());

      act(() => {
        result.current.setSelectedIds(["1", "2"]);
      });

      expect(result.current.selectedIds).toEqual(["1", "2"]);
    });

    it("should clear selection", () => {
      const { result } = renderHook(() => useProducts());

      act(() => {
        result.current.setSelectedIds(["1", "2"]);
      });

      act(() => {
        result.current.setSelectedIds([]);
      });

      expect(result.current.selectedIds).toEqual([]);
    });
  });

  describe("Error Handling", () => {
    it("should handle fetch errors", async () => {
      const errorMessage = "Failed to fetch";
      mockFetch.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useProducts());

      await vi.waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.loading).toBe(false);
      });
    });

    it("should handle API errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      const { result } = renderHook(() => useProducts());

      await vi.waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe("Refetching", () => {
    it("should allow manual refetch", async () => {
      const { result } = renderHook(() => useProducts());

      await act(async () => {
        result.current.refetch();
      });

      expect(mockFetch).toHaveBeenCalledTimes(2); // Initial fetch + refetch
    });

    it("should refetch on filter changes", async () => {
      const { result } = renderHook(() => useProducts());

      await act(async () => {
        result.current.setFilters({ status: "active" });
      });

      await act(async () => {
        result.current.setFilters({ status: "inactive" });
      });

      expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + 2 filter changes
    });
  });
});
