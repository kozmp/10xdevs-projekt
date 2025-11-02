import { z } from "zod";
import type { GenerationStyle, GenerationLanguage } from "@/lib/services/product-description-generator.service";

export const generateFormSchema = z.object({
  style: z
    .custom<GenerationStyle>()
    .refine(
      (val): val is GenerationStyle => ["professional", "casual", "sales-focused"].includes(val as string),
      "Nieprawidłowy styl generacji"
    ),
  language: z
    .custom<GenerationLanguage>()
    .refine((val): val is GenerationLanguage => ["pl", "en"].includes(val as string), "Nieprawidłowy język"),
  productIds: z.array(z.string()).min(1, "Wybierz co najmniej jeden produkt"),
});

export type GenerateFormData = z.infer<typeof generateFormSchema>;
