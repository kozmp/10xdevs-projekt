import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { JobService } from "../job.service";
import type { SupabaseClient } from "../../../db/supabase.client";
import type { CreateJobCommand } from "../../../types";

/**
 * Unit Tests for JobService
 *
 * Coverage:
 * 1. createJob() - Success case
 * 2. createJob() - Products not found
 * 3. createJob() - Rollback on job_products insert failure
 * 4. calculateInitialCostEstimate() - Success (10 products)
 * 5. calculateInitialCostEstimate() - Job without products (graceful handling)
 * 6. calculateInitialCostEstimate() - Error handling (DB failure)
 */

describe("JobService", () => {
  let service: JobService;
  let mockSupabase: SupabaseClient;

  const TEST_SHOP_ID = "shop-123-uuid";
  const TEST_JOB_ID = "job-456-uuid";
  const TEST_PRODUCT_ID_1 = "product-1-uuid";
  const TEST_PRODUCT_ID_2 = "product-2-uuid";

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Supabase client
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    } as unknown as SupabaseClient;

    service = new JobService(mockSupabase);
  });

  describe("createJob", () => {
    it("should create job successfully with products", async () => {
      // ARRANGE: Mock products verification
      const mockProducts = [{ id: TEST_PRODUCT_ID_1 }, { id: TEST_PRODUCT_ID_2 }];

      (mockSupabase.from as Mock)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              in: vi.fn().mockResolvedValue({
                data: mockProducts,
                error: null,
              }),
            }),
          }),
        })
        // Mock job insert
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: TEST_JOB_ID,
                  shop_id: TEST_SHOP_ID,
                  status: "pending",
                  style: "professional",
                  language: "en",
                  publication_mode: "draft",
                  created_at: new Date().toISOString(),
                },
                error: null,
              }),
            }),
          }),
        })
        // Mock job_products insert
        .mockReturnValueOnce({
          insert: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        });

      const command: CreateJobCommand = {
        productIds: [TEST_PRODUCT_ID_1, TEST_PRODUCT_ID_2],
        style: "professional",
        language: "en",
        publicationMode: "draft",
      };

      // ACT
      const result = await service.createJob(command, TEST_SHOP_ID);

      // ASSERT
      expect(result).toBeDefined();
      expect(result.id).toBe(TEST_JOB_ID);
      expect(result.shopId).toBe(TEST_SHOP_ID);
      expect(result.status).toBe("pending");
      expect(result.style).toBe("professional");
      expect(result.language).toBe("en");

      // Verify Supabase was called correctly
      expect(mockSupabase.from).toHaveBeenCalledWith("products");
      expect(mockSupabase.from).toHaveBeenCalledWith("jobs");
      expect(mockSupabase.from).toHaveBeenCalledWith("job_products");
    });

    it("should throw error when products not found", async () => {
      // ARRANGE: Mock empty products result
      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({
              data: [], // No products found
              error: null,
            }),
          }),
        }),
      });

      const command: CreateJobCommand = {
        productIds: [TEST_PRODUCT_ID_1],
        style: "professional",
        language: "en",
      };

      // ACT & ASSERT
      await expect(service.createJob(command, TEST_SHOP_ID)).rejects.toThrow(/Products not found or access denied/);
    });

    it("should rollback job on job_products insert failure", async () => {
      // ARRANGE
      const mockProducts = [{ id: TEST_PRODUCT_ID_1 }];

      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      });

      (mockSupabase.from as Mock)
        // Mock products verification (success)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              in: vi.fn().mockResolvedValue({
                data: mockProducts,
                error: null,
              }),
            }),
          }),
        })
        // Mock job insert (success)
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: TEST_JOB_ID,
                  shop_id: TEST_SHOP_ID,
                  status: "pending",
                  style: "professional",
                  language: "en",
                  publication_mode: "draft",
                  created_at: new Date().toISOString(),
                },
                error: null,
              }),
            }),
          }),
        })
        // Mock job_products insert (failure)
        .mockReturnValueOnce({
          insert: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Insert constraint violation", code: "23503" },
          }),
        })
        // Mock job delete (rollback)
        .mockReturnValueOnce({
          delete: mockDelete,
        });

      const command: CreateJobCommand = {
        productIds: [TEST_PRODUCT_ID_1],
        style: "professional",
        language: "en",
      };

      // ACT & ASSERT
      await expect(service.createJob(command, TEST_SHOP_ID)).rejects.toThrow(/Failed to associate products with job/);

      // Verify rollback was called
      expect(mockDelete).toHaveBeenCalled();
    });
  });

  describe("calculateInitialCostEstimate", () => {
    it("should calculate and save cost estimate for 10 products", async () => {
      // ARRANGE: Mock job fetch
      const mockJob = {
        id: TEST_JOB_ID,
        shop_id: TEST_SHOP_ID,
        style: "professional",
        language: "en",
      };

      // Mock 10 products
      const mockJobProducts = Array.from({ length: 10 }, (_, i) => ({
        product_id: `product-${i}-uuid`,
      }));

      // Mock products data for CostEstimateService
      const mockProducts = Array.from({ length: 10 }, (_, i) => ({
        id: `product-${i}-uuid`,
        name: `Product ${i + 1}`,
        short_description: `Short description ${i + 1}`,
        long_description: `Long description for product ${i + 1} with details`,
      }));

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      });

      (mockSupabase.from as Mock)
        // Mock job fetch
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockJob,
                error: null,
              }),
            }),
          }),
        })
        // Mock job_products fetch
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: mockJobProducts,
              error: null,
            }),
          }),
        })
        // Mock products fetch (for CostEstimateService)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({
              data: mockProducts,
              error: null,
            }),
          }),
        })
        // Mock job update (save cost estimate)
        .mockReturnValueOnce({
          update: mockUpdate,
        });

      // ACT
      await service.calculateInitialCostEstimate(TEST_JOB_ID, "openai/gpt-4o-mini");

      // ASSERT: Verify job update was called with cost estimate
      expect(mockUpdate).toHaveBeenCalled();

      // Get the update call arguments
      const updateCall = mockUpdate.mock.calls[0][0];
      expect(updateCall).toHaveProperty("total_cost_estimate");
      expect(updateCall).toHaveProperty("estimated_tokens_total");

      // Verify cost is greater than 0
      expect(updateCall.total_cost_estimate).toBeGreaterThan(0);
      expect(updateCall.estimated_tokens_total).toBeGreaterThan(0);

      // Verify estimated tokens is reasonable (10 products * ~350 output tokens + input)
      expect(updateCall.estimated_tokens_total).toBeGreaterThan(3500); // At least 10 * 350
      expect(updateCall.estimated_tokens_total).toBeLessThan(10000); // Reasonable upper bound
    });

    it("should handle job without products gracefully (no crash)", async () => {
      // ARRANGE: Mock job fetch
      const mockJob = {
        id: TEST_JOB_ID,
        shop_id: TEST_SHOP_ID,
        style: "professional",
        language: "en",
      };

      // Mock console.error to verify logging
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      (mockSupabase.from as Mock)
        // Mock job fetch (success)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockJob,
                error: null,
              }),
            }),
          }),
        })
        // Mock job_products fetch (empty)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [], // No products
              error: null,
            }),
          }),
        });

      // ACT
      await service.calculateInitialCostEstimate(TEST_JOB_ID);

      // ASSERT: Should not throw, should log error
      expect(consoleErrorSpy).toHaveBeenCalled();
      const errorCall = consoleErrorSpy.mock.calls[0];
      expect(errorCall[0]).toContain(`Failed to fetch products for job ${TEST_JOB_ID}`);

      consoleErrorSpy.mockRestore();
    });

    it("should handle database errors gracefully without throwing", async () => {
      // ARRANGE: Mock database error
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Database connection failed", code: "500" },
            }),
          }),
        }),
      });

      // ACT
      await service.calculateInitialCostEstimate(TEST_JOB_ID);

      // ASSERT: Should not throw, should log error
      expect(consoleErrorSpy).toHaveBeenCalled();
      const errorCall = consoleErrorSpy.mock.calls[0];
      expect(errorCall[0]).toContain(`Failed to fetch job ${TEST_JOB_ID}`);

      consoleErrorSpy.mockRestore();
    });

    it("should handle CostEstimateService errors gracefully", async () => {
      // ARRANGE: Mock successful job and products fetch, but invalid product data
      const mockJob = {
        id: TEST_JOB_ID,
        shop_id: TEST_SHOP_ID,
        style: "professional",
        language: "en",
      };

      const mockJobProducts = [{ product_id: TEST_PRODUCT_ID_1 }];

      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      (mockSupabase.from as Mock)
        // Mock job fetch
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockJob,
                error: null,
              }),
            }),
          }),
        })
        // Mock job_products fetch
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: mockJobProducts,
              error: null,
            }),
          }),
        })
        // Mock products fetch with error
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Products not found", code: "404" },
            }),
          }),
        });

      // ACT
      await service.calculateInitialCostEstimate(TEST_JOB_ID);

      // ASSERT: Should log error, not throw
      expect(consoleErrorSpy).toHaveBeenCalled();
      const errorCall = consoleErrorSpy.mock.calls[0];
      expect(errorCall[0]).toContain(`Error calculating cost estimate for job ${TEST_JOB_ID}`);

      consoleErrorSpy.mockRestore();
    });
  });

  describe("getJob", () => {
    it("should fetch job successfully", async () => {
      // ARRANGE
      const mockJob = {
        id: TEST_JOB_ID,
        shop_id: TEST_SHOP_ID,
        status: "pending",
        style: "professional",
        language: "en",
        total_cost_estimate: 0.5,
        estimated_tokens_total: 5000,
        publication_mode: "draft",
        created_at: new Date().toISOString(),
        started_at: null,
        completed_at: null,
      };

      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockJob,
              error: null,
            }),
          }),
        }),
      });

      // ACT
      const result = await service.getJob(TEST_JOB_ID);

      // ASSERT
      expect(result).toBeDefined();
      expect(result?.id).toBe(TEST_JOB_ID);
      expect(result?.totalCostEstimate).toBe(0.5);
      expect(result?.estimatedTokensTotal).toBe(5000);
    });

    it("should return null when job not found", async () => {
      // ARRANGE
      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Not found", code: "PGRST116" },
            }),
          }),
        }),
      });

      // ACT
      const result = await service.getJob(TEST_JOB_ID);

      // ASSERT
      expect(result).toBeNull();
    });
  });
});
