import { z } from "zod";

/**
 * Schema walidacji dla zapisu nowej wersji opisu produktu
 *
 * Wymagania:
 * - content: HTML/Markdown z rich-text editora (10-50000 znaków)
 * - format: typ formatu treści
 * - versionNote: opcjonalny komentarz do wersji (max 500 znaków)
 */
export const saveDescriptionSchema = z.object({
  content: z
    .string()
    .min(10, "Description content must be at least 10 characters")
    .max(50000, "Description content cannot exceed 50000 characters")
    .trim(),
  format: z.enum(["html", "markdown"]).default("html"),
  versionNote: z.string().max(500, "Version note cannot exceed 500 characters").optional(),
});

export type SaveDescriptionInput = z.infer<typeof saveDescriptionSchema>;

/**
 * Schema walidacji dla odpowiedzi DescriptionVersion
 */
export const descriptionVersionResponseSchema = z.object({
  versionId: z.string().uuid(),
  productId: z.string().uuid(),
  jobId: z.string().uuid(),
  content: z.string(),
  format: z.enum(["html", "markdown"]),
  versionNote: z.string().optional(),
  createdAt: z.string().datetime(),
  version: z.number().int().positive(),
});

export type DescriptionVersionResponse = z.infer<typeof descriptionVersionResponseSchema>;
