import { z } from "zod";

export const addShopFormSchema = z.object({
  shopifyDomain: z
    .string()
    .min(1, "Domena jest wymagana")
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/, "Nieprawidłowy format domeny Shopify"),
  apiKey: z
    .string()
    .min(1, "Klucz API jest wymagany")
    .regex(/^[a-f0-9]{32}$/, "Nieprawidłowy format klucza API"),
  apiSecret: z
    .string()
    .min(1, "Sekret API jest wymagany")
    .regex(/^[a-f0-9]{32}$/, "Nieprawidłowy format sekretu API"),
});

export type AddShopFormData = z.infer<typeof addShopFormSchema>;
