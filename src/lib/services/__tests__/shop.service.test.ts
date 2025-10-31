import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import { ShopService } from "../shop.service";
import type { SupabaseClient } from "../../../db/supabase.client";

/**
 * Unit Tests for ShopService
 *
 * Coverage:
 * 1. verifyShopifyApiKey() - Success (valid key)
 * 2. verifyShopifyApiKey() - Error (401 Unauthorized)
 * 3. verifyShopifyApiKey() - Error (403 Forbidden)
 * 4. verifyShopifyApiKey() - Error (404 Not Found)
 * 5. createOrUpdateShop() - Success (INSERT - new shop)
 * 6. createOrUpdateShop() - Success (UPDATE - existing shop)
 * 7. deleteShop() - Success (shop deleted)
 * 8. deleteShop() - Not found (shop doesn't exist)
 * 9. getShopByUserId() - Success
 * 10. getShopByUserId() - Not found
 */

// Mock encryption module to avoid key length issues in tests
vi.mock("../../encryption", () => ({
  encryptApiKey: vi.fn((apiKey: string) => ({
    encrypted: `encrypted_${apiKey}_base64`,
    iv: "mocked_iv_base64",
  })),
  decryptApiKey: vi.fn((encrypted: string, iv: string) => {
    return encrypted.replace("encrypted_", "").replace("_base64", "");
  }),
}));

// Mock global fetch
global.fetch = vi.fn();

describe("ShopService", () => {
  let service: ShopService;
  let mockSupabase: SupabaseClient;

  const TEST_USER_ID = "user-123-uuid";
  const TEST_SHOP_ID = "shop-456-uuid";
  const TEST_SHOP_DOMAIN = "test-shop.myshopify.com";
  const TEST_API_KEY = "shpat_1234567890abcdef";

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
      single: vi.fn().mockReturnThis(),
    } as unknown as SupabaseClient;

    service = new ShopService(mockSupabase);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("verifyShopifyApiKey", () => {
    it("should verify valid Shopify API key successfully", async () => {
      // ARRANGE: Mock successful Shopify API response
      const mockShopifyResponse = {
        shop: {
          domain: "test-shop.myshopify.com",
          name: "Test Shop",
          email: "test@example.com",
        },
      };

      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockShopifyResponse,
      });

      // ACT
      const result = await service.verifyShopifyApiKey(TEST_SHOP_DOMAIN, TEST_API_KEY);

      // ASSERT
      expect(result.isValid).toBe(true);
      expect(result.shopDomain).toBe("test-shop.myshopify.com");
      expect(result.errorMessage).toBeUndefined();

      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        `https://${TEST_SHOP_DOMAIN}/admin/api/2024-01/shop.json`,
        expect.objectContaining({
          method: "GET",
          headers: {
            "X-Shopify-Access-Token": TEST_API_KEY,
            "Content-Type": "application/json",
          },
        })
      );
    });

    it("should return invalid for 401 Unauthorized error", async () => {
      // ARRANGE: Mock 401 response
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      });

      // ACT
      const result = await service.verifyShopifyApiKey(TEST_SHOP_DOMAIN, "invalid-key");

      // ASSERT
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Invalid API key - Unauthorized");
      expect(result.shopDomain).toBeUndefined();
    });

    it("should return invalid for 403 Forbidden error", async () => {
      // ARRANGE: Mock 403 response
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
      });

      // ACT
      const result = await service.verifyShopifyApiKey(TEST_SHOP_DOMAIN, TEST_API_KEY);

      // ASSERT
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("API key does not have required permissions");
    });

    it("should return invalid for 404 Not Found error", async () => {
      // ARRANGE: Mock 404 response
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      // ACT
      const result = await service.verifyShopifyApiKey("non-existent.myshopify.com", TEST_API_KEY);

      // ASSERT
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Shop not found - Check domain");
    });

    it("should handle network errors gracefully", async () => {
      // ARRANGE: Mock network error
      (global.fetch as Mock).mockRejectedValueOnce(new Error("Network error"));

      // ACT
      const result = await service.verifyShopifyApiKey(TEST_SHOP_DOMAIN, TEST_API_KEY);

      // ASSERT
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Network error");
    });

    it("should return invalid for malformed Shopify API response", async () => {
      // ARRANGE: Mock response without shop data
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}), // Missing 'shop' field
      });

      // ACT
      const result = await service.verifyShopifyApiKey(TEST_SHOP_DOMAIN, TEST_API_KEY);

      // ASSERT
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Invalid response from Shopify API");
    });
  });

  describe("createOrUpdateShop", () => {
    it("should create new shop (INSERT) when shop doesn't exist", async () => {
      // ARRANGE: Mock shop doesn't exist
      (mockSupabase.from as Mock)
        // Mock SELECT (shop doesn't exist)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: "PGRST116", message: "Not found" },
              }),
            }),
          }),
        })
        // Mock INSERT (new shop)
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  shop_id: TEST_SHOP_ID,
                  user_id: TEST_USER_ID,
                  shopify_domain: TEST_SHOP_DOMAIN,
                  api_key_encrypted: "encrypted_key_base64",
                  api_key_iv: "iv_base64",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
                error: null,
              }),
            }),
          }),
        });

      // ACT
      const result = await service.createOrUpdateShop(TEST_USER_ID, TEST_SHOP_DOMAIN, TEST_API_KEY);

      // ASSERT
      expect(result).toBeDefined();
      expect(result.shopId).toBe(TEST_SHOP_ID);
      expect(result.shopifyDomain).toBe(TEST_SHOP_DOMAIN);

      // Verify INSERT was called
      expect(mockSupabase.from).toHaveBeenCalledWith("shops");
    });

    it("should update existing shop (UPDATE) when shop already exists", async () => {
      // ARRANGE: Mock shop exists
      (mockSupabase.from as Mock)
        // Mock SELECT (shop exists)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  shop_id: TEST_SHOP_ID,
                  user_id: TEST_USER_ID,
                },
                error: null,
              }),
            }),
          }),
        })
        // Mock UPDATE
        .mockReturnValueOnce({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    shop_id: TEST_SHOP_ID,
                    user_id: TEST_USER_ID,
                    shopify_domain: "updated-shop.myshopify.com",
                    api_key_encrypted: "new_encrypted_key",
                    api_key_iv: "new_iv",
                    created_at: "2025-01-01T00:00:00Z",
                    updated_at: new Date().toISOString(),
                  },
                  error: null,
                }),
              }),
            }),
          }),
        });

      // ACT
      const result = await service.createOrUpdateShop(TEST_USER_ID, "updated-shop.myshopify.com", "new_api_key");

      // ASSERT
      expect(result).toBeDefined();
      expect(result.shopId).toBe(TEST_SHOP_ID);
      expect(result.shopifyDomain).toBe("updated-shop.myshopify.com");

      // Verify UPDATE was called
      const updateCall = (mockSupabase.from as Mock).mock.calls[1];
      expect(updateCall[0]).toBe("shops");
    });

    it("should throw error when INSERT fails", async () => {
      // ARRANGE: Mock shop doesn't exist, INSERT fails
      (mockSupabase.from as Mock)
        // Mock SELECT (shop doesn't exist)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: "PGRST116" },
              }),
            }),
          }),
        })
        // Mock INSERT (failure)
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "Unique constraint violation" },
              }),
            }),
          }),
        });

      // ACT & ASSERT
      await expect(service.createOrUpdateShop(TEST_USER_ID, TEST_SHOP_DOMAIN, TEST_API_KEY)).rejects.toThrow(
        /Failed to create shop/
      );
    });

    it("should throw error when UPDATE fails", async () => {
      // ARRANGE: Mock shop exists, UPDATE fails
      (mockSupabase.from as Mock)
        // Mock SELECT (shop exists)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  shop_id: TEST_SHOP_ID,
                  user_id: TEST_USER_ID,
                },
                error: null,
              }),
            }),
          }),
        })
        // Mock UPDATE (failure)
        .mockReturnValueOnce({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: "Database error" },
                }),
              }),
            }),
          }),
        });

      // ACT & ASSERT
      await expect(service.createOrUpdateShop(TEST_USER_ID, TEST_SHOP_DOMAIN, TEST_API_KEY)).rejects.toThrow(
        /Failed to update shop/
      );
    });
  });

  describe("deleteShop", () => {
    it("should delete shop successfully when shop exists", async () => {
      // ARRANGE: Mock shop exists
      (mockSupabase.from as Mock)
        // Mock SELECT (shop exists)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  shop_id: TEST_SHOP_ID,
                },
                error: null,
              }),
            }),
          }),
        })
        // Mock DELETE
        .mockReturnValueOnce({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: null,
            }),
          }),
        });

      // ACT
      const result = await service.deleteShop(TEST_USER_ID);

      // ASSERT
      expect(result).toBe(true);

      // Verify DELETE was called
      expect(mockSupabase.from).toHaveBeenCalledWith("shops");
    });

    it("should return false when shop doesn't exist", async () => {
      // ARRANGE: Mock shop doesn't exist
      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116", message: "Not found" },
            }),
          }),
        }),
      });

      // ACT
      const result = await service.deleteShop(TEST_USER_ID);

      // ASSERT
      expect(result).toBe(false);

      // Verify DELETE was NOT called
      const callCount = (mockSupabase.from as Mock).mock.calls.length;
      expect(callCount).toBe(1); // Only SELECT, no DELETE
    });

    it("should throw error when DELETE fails", async () => {
      // ARRANGE: Mock shop exists, DELETE fails
      (mockSupabase.from as Mock)
        // Mock SELECT (shop exists)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  shop_id: TEST_SHOP_ID,
                },
                error: null,
              }),
            }),
          }),
        })
        // Mock DELETE (failure)
        .mockReturnValueOnce({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: { message: "Foreign key constraint violation" },
            }),
          }),
        });

      // ACT & ASSERT
      await expect(service.deleteShop(TEST_USER_ID)).rejects.toThrow(/Failed to delete shop/);
    });
  });

  describe("getShopByUserId", () => {
    it("should return shop data when shop exists", async () => {
      // ARRANGE
      const mockShopData = {
        shop_id: TEST_SHOP_ID,
        user_id: TEST_USER_ID,
        shopify_domain: TEST_SHOP_DOMAIN,
        api_key_encrypted: "encrypted_key",
        api_key_iv: "iv",
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-24T00:00:00Z",
      };

      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockShopData,
              error: null,
            }),
          }),
        }),
      });

      // ACT
      const result = await service.getShopByUserId(TEST_USER_ID);

      // ASSERT
      expect(result).toBeDefined();
      expect(result?.shopId).toBe(TEST_SHOP_ID);
      expect(result?.shopifyDomain).toBe(TEST_SHOP_DOMAIN);
      expect(result?.createdAt).toBe("2025-01-01T00:00:00.000Z");
      expect(result?.updatedAt).toBe("2025-01-24T00:00:00.000Z");
    });

    it("should return null when shop doesn't exist", async () => {
      // ARRANGE
      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116", message: "Not found" },
            }),
          }),
        }),
      });

      // ACT
      const result = await service.getShopByUserId(TEST_USER_ID);

      // ASSERT
      expect(result).toBeNull();
    });
  });
});
