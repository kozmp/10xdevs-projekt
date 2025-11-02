import { z } from "zod";
import type { UpdateShopCommand } from "../../types";

// Schema dla UpdateShopCommand
export const updateShopSchema = z.object({
  shopifyDomain: z
    .string()
    .min(1, "Shopify domain is required")
    .regex(/^[a-z0-9-]+\.myshopify\.com$/, "Invalid Shopify domain format (e.g., your-shop.myshopify.com)"),
  apiKey: z
    .string()
    .min(1, "API key is required")
    .max(256, "API key is too long")
    .regex(/^shpat_[a-zA-Z0-9]+$/, "API key must start with 'shpat_' (Shopify Admin API token)"),
}) satisfies z.ZodType<UpdateShopCommand>;

// Schema dla walidacji odpowiedzi
// Obsługuje dwa stany:
// 1. isConnected = true - wszystkie pola wymagane
// 2. isConnected = false - tylko isConnected wymagane, reszta opcjonalna
export const shopResponseSchema = z.object({
  isConnected: z.boolean(),
  shopId: z.string().uuid().optional(),
  shopifyDomain: z.string().min(1).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
