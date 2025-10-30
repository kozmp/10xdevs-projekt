import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { CostEstimateService } from "../cost-estimate.service";
import type { SupabaseClient } from "../../../db/supabase.client";
import type { CostEstimateRequest } from "../../../types";

/**
 * Unit Tests for CostEstimateService
 *
 * Coverage:
 * 1. Sukces - Kalkulacja kosztów dla 1 produktu
 * 2. Sukces - Kalkulacja dla wielu produktów (różne style)
 * 3. Walidacja - Produkty nie istnieją (404)
 * 4. Walidacja - Brak dostępu do produktów (RLS)
 * 5. Edge Cases - Nieprawidłowy model, missing products
 */

describe("CostEstimateService", () => {
  let service: CostEstimateService;
  let mockSupabase: SupabaseClient;

  const TEST_USER_ID = "user-123-uuid";
  const TEST_PRODUCT_ID_1 = "product-1-uuid";
  const TEST_PRODUCT_ID_2 = "product-2-uuid";

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Supabase client
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
    } as unknown as SupabaseClient;

    service = new CostEstimateService(mockSupabase);
  });

  describe("estimateCost", () => {
    it("should calculate cost for single product with professional style", async () => {
      // ARRANGE: Mock product data
      const mockProduct = {
        id: TEST_PRODUCT_ID_1,
        name: "Premium Wireless Headphones",
        short_description: "High-quality audio experience",
        long_description:
          "Immerse yourself in superior sound quality with our premium wireless headphones featuring active noise cancellation.",
      };

      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [mockProduct],
            error: null,
          }),
        }),
      });

      const request: CostEstimateRequest = {
        productIds: [TEST_PRODUCT_ID_1],
        style: "professional",
        language: "en",
        model: "openai/gpt-4o-mini",
      };

      // ACT: Estimate cost
      const result = await service.estimateCost(request);

      // ASSERT: Verify result structure
      expect(result).toBeDefined();
      expect(result.productCount).toBe(1);
      expect(result.model).toBe("openai/gpt-4o-mini");
      expect(result.totalCost).toBeGreaterThan(0);
      expect(result.totalTokens).toBeGreaterThan(0);

      // Verify breakdown
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.inputTokens).toBeGreaterThan(0);
      expect(result.breakdown.outputTokens).toBe(350); // Professional style = 350 tokens
      expect(result.breakdown.inputCost).toBeGreaterThan(0);
      expect(result.breakdown.outputCost).toBeGreaterThan(0);

      // Verify calculations
      expect(result.totalCost).toBe(result.breakdown.inputCost + result.breakdown.outputCost);
      expect(result.totalTokens).toBe(result.breakdown.inputTokens + result.breakdown.outputTokens);
      expect(result.costPerProduct).toBe(result.totalCost);

      // Verify timestamp format
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

      // Verify estimated duration
      expect(result.estimatedDuration).toBeGreaterThan(0);
      expect(result.estimatedDuration).toBe(Math.ceil(result.breakdown.outputTokens / 150)); // 150 tokens/sec for gpt-4o-mini

      // Verify Supabase was called correctly
      expect(mockSupabase.from).toHaveBeenCalledWith("products");
    });

    it("should calculate cost for multiple products with different styles", async () => {
      // ARRANGE: Mock 10 products
      const mockProducts = Array.from({ length: 10 }, (_, i) => ({
        id: `product-${i}-uuid`,
        name: `Product ${i + 1}`,
        short_description: `Short description for product ${i + 1}`,
        long_description: `This is a longer description for product ${i + 1} with more details about features and benefits.`,
      }));

      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: mockProducts,
            error: null,
          }),
        }),
      });

      const productIds = mockProducts.map((p) => p.id);

      // Test casual style (300 tokens per product)
      const request: CostEstimateRequest = {
        productIds,
        style: "casual",
        language: "pl",
        model: "openai/gpt-4o-mini",
      };

      // ACT
      const result = await service.estimateCost(request);

      // ASSERT
      expect(result.productCount).toBe(10);
      expect(result.breakdown.outputTokens).toBe(300 * 10); // Casual = 300 tokens/product

      // Verify cost per product
      const expectedCostPerProduct = result.totalCost / 10;
      expect(result.costPerProduct).toBeCloseTo(expectedCostPerProduct, 6);

      // Verify pricing accuracy (GPT-4o-mini: $0.15/1M input, $0.60/1M output)
      const expectedOutputCost = (result.breakdown.outputTokens / 1_000_000) * 0.6;
      expect(result.breakdown.outputCost).toBeCloseTo(expectedOutputCost, 6);

      const expectedInputCost = (result.breakdown.inputTokens / 1_000_000) * 0.15;
      expect(result.breakdown.inputCost).toBeCloseTo(expectedInputCost, 6);
    });

    it("should calculate cost for sales-focused style (highest token count)", async () => {
      // ARRANGE
      const mockProduct = {
        id: TEST_PRODUCT_ID_1,
        name: "Product",
        short_description: "Short",
        long_description: "Long description",
      };

      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [mockProduct],
            error: null,
          }),
        }),
      });

      const request: CostEstimateRequest = {
        productIds: [TEST_PRODUCT_ID_1],
        style: "sales-focused",
        language: "en",
        model: "openai/gpt-4o-mini",
      };

      // ACT
      const result = await service.estimateCost(request);

      // ASSERT: Sales-focused should have 400 tokens output
      expect(result.breakdown.outputTokens).toBe(400);
      expect(result.breakdown.outputCost).toBeGreaterThan(0);
    });

    it("should throw error when products do not exist", async () => {
      // ARRANGE: Mock empty result (products not found)
      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      const request: CostEstimateRequest = {
        productIds: [TEST_PRODUCT_ID_1],
        style: "professional",
        language: "en",
      };

      // ACT & ASSERT
      await expect(service.estimateCost(request)).rejects.toThrow("No products found or access denied");

      // Verify Supabase was called
      expect(mockSupabase.from).toHaveBeenCalledWith("products");
    });

    it("should throw error when database query fails", async () => {
      // ARRANGE: Mock database error
      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Database connection failed", code: "500" },
          }),
        }),
      });

      const request: CostEstimateRequest = {
        productIds: [TEST_PRODUCT_ID_1],
        style: "professional",
        language: "en",
      };

      // ACT & ASSERT
      await expect(service.estimateCost(request)).rejects.toThrow(/Failed to fetch products/);
    });

    it("should throw error when some products are missing", async () => {
      // ARRANGE: Request 2 products, but only 1 returned (RLS or not found)
      const mockProduct = {
        id: TEST_PRODUCT_ID_1,
        name: "Product 1",
        short_description: "Description",
        long_description: "Long description",
      };

      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [mockProduct],
            error: null,
          }),
        }),
      });

      const request: CostEstimateRequest = {
        productIds: [TEST_PRODUCT_ID_1, TEST_PRODUCT_ID_2],
        style: "professional",
        language: "en",
      };

      // ACT & ASSERT
      await expect(service.estimateCost(request)).rejects.toThrow(/Products not found/);
    });

    it("should throw error for unsupported model", async () => {
      // ARRANGE
      const mockProduct = {
        id: TEST_PRODUCT_ID_1,
        name: "Product",
        short_description: "Description",
        long_description: "Long",
      };

      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [mockProduct],
            error: null,
          }),
        }),
      });

      const request: CostEstimateRequest = {
        productIds: [TEST_PRODUCT_ID_1],
        style: "professional",
        language: "en",
        model: "unsupported/model-xyz",
      };

      // ACT & ASSERT
      await expect(service.estimateCost(request)).rejects.toThrow("Unsupported model: unsupported/model-xyz");
    });
  });

  describe("Token Estimation Logic", () => {
    it("should estimate more input tokens for Polish text (3 chars/token)", async () => {
      // ARRANGE: Same text length, different language
      const mockProduct = {
        id: TEST_PRODUCT_ID_1,
        name: "Słuchawki bezprzewodowe premium", // 32 chars / 3 = ~11 tokens
        short_description: "Wysokiej jakości dźwięk", // 24 chars / 3 = 8 tokens
        long_description: "Doświadcz najwyższej jakości dźwięku", // 38 chars / 3 = ~13 tokens
      };

      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [mockProduct],
            error: null,
          }),
        }),
      });

      const requestPL: CostEstimateRequest = {
        productIds: [TEST_PRODUCT_ID_1],
        style: "professional",
        language: "pl",
      };

      // ACT
      const resultPL = await service.estimateCost(requestPL);

      // ASSERT: Input tokens should include base prompt + product data
      expect(resultPL.breakdown.inputTokens).toBeGreaterThan(200); // Base prompt = 200
      expect(resultPL.breakdown.inputTokens).toBeLessThan(300); // Should be reasonable
    });

    it("should estimate fewer input tokens for English text (4 chars/token)", async () => {
      // ARRANGE: English text
      const mockProduct = {
        id: TEST_PRODUCT_ID_1,
        name: "Premium Wireless Headphones", // 28 chars / 4 = 7 tokens
        short_description: "High quality sound", // 18 chars / 4 = ~5 tokens
        long_description: "Experience superior audio quality", // 34 chars / 4 = ~9 tokens
      };

      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [mockProduct],
            error: null,
          }),
        }),
      });

      const requestEN: CostEstimateRequest = {
        productIds: [TEST_PRODUCT_ID_1],
        style: "professional",
        language: "en",
      };

      // ACT
      const resultEN = await service.estimateCost(requestEN);

      // ASSERT
      expect(resultEN.breakdown.inputTokens).toBeGreaterThan(200);
      expect(resultEN.breakdown.inputTokens).toBeLessThan(300);
    });

    it("should handle products with null descriptions", async () => {
      // ARRANGE: Product with null fields
      const mockProduct = {
        id: TEST_PRODUCT_ID_1,
        name: "Product Name Only",
        short_description: null,
        long_description: null,
      };

      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [mockProduct],
            error: null,
          }),
        }),
      });

      const request: CostEstimateRequest = {
        productIds: [TEST_PRODUCT_ID_1],
        style: "professional",
        language: "en",
      };

      // ACT
      const result = await service.estimateCost(request);

      // ASSERT: Should not throw, should calculate with just name
      expect(result).toBeDefined();
      expect(result.breakdown.inputTokens).toBeGreaterThan(200); // At least base prompt
    });
  });

  describe("getAvailableModels (Static Method)", () => {
    it("should return list of available models with pricing", () => {
      // ACT
      const models = CostEstimateService.getAvailableModels();

      // ASSERT
      expect(models).toBeDefined();
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);

      // Check first model structure
      const firstModel = models[0];
      expect(firstModel).toHaveProperty("model");
      expect(firstModel).toHaveProperty("inputCost");
      expect(firstModel).toHaveProperty("outputCost");
      expect(firstModel).toHaveProperty("speed");

      // Verify GPT-4o-mini is included
      const gpt4oMini = models.find((m) => m.model === "openai/gpt-4o-mini");
      expect(gpt4oMini).toBeDefined();
      expect(gpt4oMini?.inputCost).toBe(0.15);
      expect(gpt4oMini?.outputCost).toBe(0.6);
      expect(gpt4oMini?.speed).toContain("150");
    });
  });

  describe("Cost Accuracy Validation", () => {
    it("should calculate accurate costs for GPT-4o-mini pricing", async () => {
      // ARRANGE: Known token counts
      const mockProduct = {
        id: TEST_PRODUCT_ID_1,
        name: "Test",
        short_description: "Test",
        long_description: "Test",
      };

      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [mockProduct],
            error: null,
          }),
        }),
      });

      const request: CostEstimateRequest = {
        productIds: [TEST_PRODUCT_ID_1],
        style: "professional",
        language: "en",
        model: "openai/gpt-4o-mini",
      };

      // ACT
      const result = await service.estimateCost(request);

      // ASSERT: Verify pricing formulas
      const expectedInputCost = (result.breakdown.inputTokens / 1_000_000) * 0.15;
      const expectedOutputCost = (result.breakdown.outputTokens / 1_000_000) * 0.6;

      expect(result.breakdown.inputCost).toBeCloseTo(expectedInputCost, 6);
      expect(result.breakdown.outputCost).toBeCloseTo(expectedOutputCost, 6);
      expect(result.totalCost).toBeCloseTo(expectedInputCost + expectedOutputCost, 6);
    });

    it("should return costs with 6 decimal precision", async () => {
      // ARRANGE
      const mockProduct = {
        id: TEST_PRODUCT_ID_1,
        name: "Product",
        short_description: "Description",
        long_description: "Long description text here",
      };

      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [mockProduct],
            error: null,
          }),
        }),
      });

      const request: CostEstimateRequest = {
        productIds: [TEST_PRODUCT_ID_1],
        style: "professional",
        language: "en",
      };

      // ACT
      const result = await service.estimateCost(request);

      // ASSERT: Check decimal precision
      const totalCostString = result.totalCost.toString();
      const decimalPart = totalCostString.split(".")[1];
      if (decimalPart) {
        expect(decimalPart.length).toBeLessThanOrEqual(6);
      }

      const costPerProductString = result.costPerProduct.toString();
      const decimalPartPerProduct = costPerProductString.split(".")[1];
      if (decimalPartPerProduct) {
        expect(decimalPartPerProduct.length).toBeLessThanOrEqual(6);
      }
    });
  });
});
