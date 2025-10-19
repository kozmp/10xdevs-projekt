import { z } from "zod";
import type { UpdateShopCommand } from "../../types";

// Schema dla UpdateShopCommand
export const updateShopSchema = z.object({
  apiKey: z
    .string()
    .min(1, "API key is required")
    .max(256, "API key is too long")
    .regex(/^[a-zA-Z0-9_\-]+$/, "API key can only contain letters, numbers, underscores and hyphens"),
}) satisfies z.ZodType<UpdateShopCommand>;

// Schema dla walidacji odpowiedzi
export const shopResponseSchema = z.object({
  shopId: z.string().uuid(),
  shopifyDomain: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
