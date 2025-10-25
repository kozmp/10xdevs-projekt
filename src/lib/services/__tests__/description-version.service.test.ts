import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { DescriptionVersionService } from "../description-version.service";
import type { SupabaseClient } from "../../../db/supabase.client";
import type { SaveDescriptionCommand } from "../../../types";

/**
 * Unit Tests for DescriptionVersionService
 *
 * Coverage:
 * 1. Sukces - Pomyślne zapisanie nowej wersji opisu
 * 2. Walidacja - Próba zapisu dla nieistniejącego produktu
 * 3. Autoryzacja - Brak dostępu do produktu (RLS)
 * 4. Edge Cases - Pierwszy opis (version = 1) vs kolejne wersje
 * 5. Pobieranie wersji - getDescriptionVersions
 */

describe("DescriptionVersionService", () => {
  let service: DescriptionVersionService;
  let mockSupabase: SupabaseClient;

  const TEST_JOB_ID = "123e4567-e89b-12d3-a456-426614174000";
  const TEST_PRODUCT_ID = "223e4567-e89b-12d3-a456-426614174001";

  const mockCommand: SaveDescriptionCommand = {
    content: "<p>This is a test description with enough content to pass validation.</p>",
    format: "html",
    versionNote: "Initial version",
  };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Create mock Supabase client with chainable methods
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(),
    } as unknown as SupabaseClient;

    service = new DescriptionVersionService(mockSupabase);
  });

  describe("saveDescriptionVersion", () => {
    it("should successfully save a new description version (first version)", async () => {
      // ARRANGE: Mock product verification (product exists)
      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  product_id: TEST_PRODUCT_ID,
                  job_id: TEST_JOB_ID,
                },
                error: null,
              }),
            }),
          }),
        }),
      });

      // Mock version check (no existing versions - first version)
      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null, // No previous versions
                  error: { code: "PGRST116" }, // Not found error
                }),
              }),
            }),
          }),
        }),
      });

      // Mock insert new version
      const mockInsertedVersion = {
        version_id: "323e4567-e89b-12d3-a456-426614174002",
        product_id: TEST_PRODUCT_ID,
        job_id: TEST_JOB_ID,
        content: mockCommand.content,
        format: mockCommand.format,
        version_note: mockCommand.versionNote,
        version: 1,
        created_at: "2025-10-24T10:00:00Z",
      };

      (mockSupabase.from as Mock).mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockInsertedVersion,
              error: null,
            }),
          }),
        }),
      });

      // ACT: Save description version
      const result = await service.saveDescriptionVersion(TEST_JOB_ID, TEST_PRODUCT_ID, mockCommand);

      // ASSERT: Verify result structure and values
      expect(result).toBeDefined();
      expect(result.versionId).toBe(mockInsertedVersion.version_id);
      expect(result.productId).toBe(TEST_PRODUCT_ID);
      expect(result.jobId).toBe(TEST_JOB_ID);
      expect(result.content).toBe(mockCommand.content);
      expect(result.format).toBe(mockCommand.format);
      expect(result.versionNote).toBe(mockCommand.versionNote);
      expect(result.version).toBe(1); // First version
      expect(result.createdAt).toBe(mockInsertedVersion.created_at);

      // Verify Supabase calls
      expect(mockSupabase.from).toHaveBeenCalledWith("products");
      expect(mockSupabase.from).toHaveBeenCalledWith("description_versions");
    });

    it("should successfully save a new description version (incremented version)", async () => {
      // ARRANGE: Mock product verification
      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { product_id: TEST_PRODUCT_ID, job_id: TEST_JOB_ID },
                error: null,
              }),
            }),
          }),
        }),
      });

      // Mock version check (existing version 2)
      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { version: 2 }, // Previous version is 2
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      // Mock insert new version (should be version 3)
      const mockInsertedVersion = {
        version_id: "423e4567-e89b-12d3-a456-426614174003",
        product_id: TEST_PRODUCT_ID,
        job_id: TEST_JOB_ID,
        content: mockCommand.content,
        format: mockCommand.format,
        version_note: mockCommand.versionNote,
        version: 3, // Incremented from 2
        created_at: "2025-10-24T10:05:00Z",
      };

      (mockSupabase.from as Mock).mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockInsertedVersion,
              error: null,
            }),
          }),
        }),
      });

      // ACT
      const result = await service.saveDescriptionVersion(TEST_JOB_ID, TEST_PRODUCT_ID, mockCommand);

      // ASSERT
      expect(result.version).toBe(3); // Should be incremented
    });

    it("should throw error when product does not exist (404)", async () => {
      // ARRANGE: Mock product verification - product not found
      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: "PGRST116", message: "No rows returned" },
              }),
            }),
          }),
        }),
      });

      // ACT & ASSERT: Should throw error with specific message
      await expect(service.saveDescriptionVersion(TEST_JOB_ID, TEST_PRODUCT_ID, mockCommand)).rejects.toThrow(
        "Product not found or access denied"
      );

      // Verify that insert was never called
      expect(mockSupabase.from).toHaveBeenCalledTimes(1);
      expect(mockSupabase.from).toHaveBeenCalledWith("products");
    });

    it("should throw error when product belongs to different job (403/404)", async () => {
      // ARRANGE: Mock product verification - product exists but wrong job_id
      const DIFFERENT_JOB_ID = "999e4567-e89b-12d3-a456-426614174999";

      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null, // RLS prevents access
                error: { code: "PGRST116" },
              }),
            }),
          }),
        }),
      });

      // ACT & ASSERT
      await expect(
        service.saveDescriptionVersion(DIFFERENT_JOB_ID, TEST_PRODUCT_ID, mockCommand)
      ).rejects.toThrow("Product not found or access denied");
    });

    it("should throw error when database insert fails (500)", async () => {
      // ARRANGE: Mock successful product verification
      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { product_id: TEST_PRODUCT_ID, job_id: TEST_JOB_ID },
                error: null,
              }),
            }),
          }),
        }),
      });

      // Mock version check
      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { code: "PGRST116" },
                }),
              }),
            }),
          }),
        }),
      });

      // Mock insert failure
      (mockSupabase.from as Mock).mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Database constraint violation", code: "23505" },
            }),
          }),
        }),
      });

      // ACT & ASSERT
      await expect(service.saveDescriptionVersion(TEST_JOB_ID, TEST_PRODUCT_ID, mockCommand)).rejects.toThrow(
        /Failed to save description version/
      );
    });
  });

  describe("getDescriptionVersions", () => {
    it("should return all description versions sorted by version descending", async () => {
      // ARRANGE: Mock multiple versions
      const mockVersions = [
        {
          version_id: "v3-uuid",
          product_id: TEST_PRODUCT_ID,
          job_id: TEST_JOB_ID,
          content: "<p>Version 3</p>",
          format: "html",
          version_note: "Latest version",
          version: 3,
          created_at: "2025-10-24T12:00:00Z",
        },
        {
          version_id: "v2-uuid",
          product_id: TEST_PRODUCT_ID,
          job_id: TEST_JOB_ID,
          content: "<p>Version 2</p>",
          format: "html",
          version_note: "Second version",
          version: 2,
          created_at: "2025-10-24T11:00:00Z",
        },
        {
          version_id: "v1-uuid",
          product_id: TEST_PRODUCT_ID,
          job_id: TEST_JOB_ID,
          content: "<p>Version 1</p>",
          format: "html",
          version_note: "Initial version",
          version: 1,
          created_at: "2025-10-24T10:00:00Z",
        },
      ];

      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockVersions,
              error: null,
            }),
          }),
        }),
      });

      // ACT
      const result = await service.getDescriptionVersions(TEST_PRODUCT_ID);

      // ASSERT
      expect(result).toHaveLength(3);
      expect(result[0].version).toBe(3); // Newest first
      expect(result[1].version).toBe(2);
      expect(result[2].version).toBe(1);

      // Verify correct Supabase calls
      expect(mockSupabase.from).toHaveBeenCalledWith("description_versions");
    });

    it("should return empty array when no versions exist", async () => {
      // ARRANGE: Mock no versions
      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      // ACT
      const result = await service.getDescriptionVersions(TEST_PRODUCT_ID);

      // ASSERT
      expect(result).toEqual([]);
    });

    it("should throw error when database fetch fails", async () => {
      // ARRANGE: Mock database error
      (mockSupabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Database connection failed" },
            }),
          }),
        }),
      });

      // ACT & ASSERT
      await expect(service.getDescriptionVersions(TEST_PRODUCT_ID)).rejects.toThrow(
        /Failed to fetch description versions/
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle description without version note", async () => {
      // ARRANGE: Command without versionNote
      const commandWithoutNote: SaveDescriptionCommand = {
        content: "<p>Test content</p>",
        format: "html",
        // No versionNote
      };

      // Mock successful flow
      (mockSupabase.from as Mock)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { product_id: TEST_PRODUCT_ID, job_id: TEST_JOB_ID },
                  error: null,
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: null,
                    error: { code: "PGRST116" },
                  }),
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  version_id: "test-uuid",
                  product_id: TEST_PRODUCT_ID,
                  job_id: TEST_JOB_ID,
                  content: commandWithoutNote.content,
                  format: commandWithoutNote.format,
                  version_note: null,
                  version: 1,
                  created_at: "2025-10-24T10:00:00Z",
                },
                error: null,
              }),
            }),
          }),
        });

      // ACT
      const result = await service.saveDescriptionVersion(TEST_JOB_ID, TEST_PRODUCT_ID, commandWithoutNote);

      // ASSERT
      expect(result.versionNote).toBeUndefined();
    });

    it("should handle markdown format", async () => {
      // ARRANGE: Command with markdown format
      const markdownCommand: SaveDescriptionCommand = {
        content: "# Test Markdown\n\nThis is **bold** text.",
        format: "markdown",
        versionNote: "Markdown version",
      };

      // Mock successful flow
      (mockSupabase.from as Mock)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { product_id: TEST_PRODUCT_ID, job_id: TEST_JOB_ID },
                  error: null,
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: null,
                    error: { code: "PGRST116" },
                  }),
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  version_id: "test-uuid",
                  product_id: TEST_PRODUCT_ID,
                  job_id: TEST_JOB_ID,
                  content: markdownCommand.content,
                  format: "markdown",
                  version_note: markdownCommand.versionNote,
                  version: 1,
                  created_at: "2025-10-24T10:00:00Z",
                },
                error: null,
              }),
            }),
          }),
        });

      // ACT
      const result = await service.saveDescriptionVersion(TEST_JOB_ID, TEST_PRODUCT_ID, markdownCommand);

      // ASSERT
      expect(result.format).toBe("markdown");
      expect(result.content).toContain("# Test Markdown");
    });
  });
});
