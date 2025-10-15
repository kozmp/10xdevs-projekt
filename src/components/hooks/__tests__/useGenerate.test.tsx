import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGenerate } from "../useGenerate";
import type { GenerationStyle, GenerationLanguage } from "@/lib/services/product-description-generator.service";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("useGenerate Hook", () => {
  const mockIds = ["1", "2"];
  const mockStyle: GenerationStyle = "professional";
  const mockLanguage: GenerationLanguage = "pl";

  const mockResults = [
    { productId: "1", success: true },
    { productId: "2", success: true },
  ];

  const mockSummary = {
    total: 2,
    successful: 2,
    failed: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ results: mockResults, summary: mockSummary }),
    });
  });

  describe("Initialization", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => useGenerate({ ids: mockIds }));

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.progress).toBe(0);
      expect(result.current.results).toEqual([]);
      expect(result.current.summary).toBe(null);
      expect(result.current.error).toBe(null);
    });
  });

  describe("Generation Process", () => {
    it("should handle successful generation", async () => {
      const { result } = renderHook(() => useGenerate({ ids: mockIds }));

      await act(async () => {
        await result.current.generate(mockStyle, mockLanguage);
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.progress).toBe(100);
      expect(result.current.results).toEqual(mockResults);
      expect(result.current.summary).toEqual(mockSummary);
      expect(result.current.error).toBe(null);
    });

    it("should prevent concurrent generations", async () => {
      const { result } = renderHook(() => useGenerate({ ids: mockIds }));

      // Start first generation
      const firstGeneration = result.current.generate(mockStyle, mockLanguage);

      // Try to start second generation
      await act(async () => {
        await result.current.generate(mockStyle, mockLanguage);
      });

      // Only one fetch should have been called
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Wait for first generation to complete
      await firstGeneration;
    });

    it("should send correct request payload", async () => {
      const { result } = renderHook(() => useGenerate({ ids: mockIds }));

      await act(async () => {
        await result.current.generate(mockStyle, mockLanguage);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/products/generate-descriptions",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productIds: mockIds,
            style: mockStyle,
            language: mockLanguage,
          }),
        })
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors", async () => {
      const errorMessage = "API Error";
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: errorMessage }),
      });

      const { result } = renderHook(() => useGenerate({ ids: mockIds }));

      await act(async () => {
        await result.current.generate(mockStyle, mockLanguage);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.progress).toBe(0);
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useGenerate({ ids: mockIds }));

      await act(async () => {
        await result.current.generate(mockStyle, mockLanguage);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.isGenerating).toBe(false);
    });

    it("should handle malformed response data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}), // Missing required fields
      });

      const { result } = renderHook(() => useGenerate({ ids: mockIds }));

      await act(async () => {
        await result.current.generate(mockStyle, mockLanguage);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe("State Management", () => {
    it("should reset state before new generation", async () => {
      const { result } = renderHook(() => useGenerate({ ids: mockIds }));

      // First generation
      await act(async () => {
        await result.current.generate(mockStyle, mockLanguage);
      });

      // Second generation
      await act(async () => {
        await result.current.generate(mockStyle, mockLanguage);
      });

      expect(result.current.results).toEqual(mockResults);
      expect(result.current.error).toBe(null);
    });

    it("should maintain progress state", async () => {
      const { result } = renderHook(() => useGenerate({ ids: mockIds }));

      let resolveProgress: (value: any) => void;
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveProgress = resolve;
          })
      );

      // Start generation
      const generatePromise = act(async () => {
        await result.current.generate(mockStyle, mockLanguage);
      });

      // Check initial state
      expect(result.current.isGenerating).toBe(true);
      expect(result.current.progress).toBe(0);

      // Resolve the fetch
      resolveProgress!({
        ok: true,
        json: () => Promise.resolve({ results: mockResults, summary: mockSummary }),
      });

      // Wait for generation to complete
      await generatePromise;

      // Check final state
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.progress).toBe(100);
    });
  });
});
