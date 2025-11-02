import { z } from "zod";

/**
 * Schema walidacji dla żądania kalkulacji kosztów
 *
 * Wymagania:
 * - productIds: 1-100 produktów (UUID array)
 * - style: styl generowania opisu
 * - language: język opisu
 * - model: opcjonalny model LLM (default: gpt-4o-mini)
 */
export const costEstimateRequestSchema = z.object({
  productIds: z
    .array(z.string().uuid("Product ID must be a valid UUID"))
    .min(1, "At least one product is required")
    .max(100, "Maximum 100 products allowed per estimation"),
  style: z.enum(["professional", "casual", "sales-focused"], {
    errorMap: () => ({ message: "Style must be one of: professional, casual, sales-focused" }),
  }),
  language: z.enum(["pl", "en"], {
    errorMap: () => ({ message: "Language must be one of: pl, en" }),
  }),
  model: z.string().optional().default("openai/gpt-4o-mini"),
});

export type CostEstimateRequestInput = z.infer<typeof costEstimateRequestSchema>;

/**
 * Schema walidacji dla odpowiedzi kalkulacji kosztów
 */
export const costEstimateResponseSchema = z.object({
  totalCost: z.number().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
  productCount: z.number().int().positive(),
  estimatedDuration: z.number().nonnegative(),
  costPerProduct: z.number().nonnegative(),
  breakdown: z.object({
    inputTokens: z.number().int().nonnegative(),
    outputTokens: z.number().int().nonnegative(),
    inputCost: z.number().nonnegative(),
    outputCost: z.number().nonnegative(),
  }),
  model: z.string(),
  timestamp: z.string().datetime(),
});

export type CostEstimateResponseOutput = z.infer<typeof costEstimateResponseSchema>;
