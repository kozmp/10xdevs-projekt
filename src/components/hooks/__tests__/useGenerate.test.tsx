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

      let firstGeneration: Promise<void>;

      // Start first generation
      act(() => {
        firstGeneration = result.current.generate(mockStyle, mockLanguage);
      });

      // Try to start second generation immediately (should be blocked)
      act(() => {
        result.current.generate(mockStyle, mockLanguage);
      });

      // Wait for first generation to complete
      await act(async () => {
        await firstGeneration!;
      });

      // Only one fetch should have been called (second was blocked)
      expect(mockFetch).toHaveBeenCalledTimes(1);
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

      // Hook validates response and sets error on invalid format
      expect(result.current.error).toBe('Invalid response format: missing or invalid results');
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.progress).toBe(0);
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

      let generatePromise: Promise<void>;

      // Start generation
      await act(async () => {
        generatePromise = result.current.generate(mockStyle, mockLanguage);
        // Wait a tick for the state to update
        await Promise.resolve();
      });

      // Check generating state
      expect(result.current.isGenerating).toBe(true);
      expect(result.current.progress).toBe(0);

      // Resolve the fetch
      await act(async () => {
        resolveProgress!({
          ok: true,
          json: () => Promise.resolve({ results: mockResults, summary: mockSummary }),
        });
        // Wait for generation to complete
        await generatePromise!;
      });

      // Check final state
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.progress).toBe(100);
    });
  });
});
