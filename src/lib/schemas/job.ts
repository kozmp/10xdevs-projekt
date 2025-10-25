import { z } from "zod";
import type { CreateJobCommand, JobResponseDTO, JobDetailDTO, JobProductDTO } from "../../types";

// Schema dla stylu generowania opisu
export const jobStyleSchema = z.enum(["Professional", "Casual", "Sales-focused"]);

// Schema dla języka
export const languageSchema = z.enum(["pl", "en"]);

// Schema dla trybu publikacji
export const publicationModeSchema = z.enum(["draft", "published"]);

// Schema dla CreateJobCommand
export const createJobSchema = z.object({
  productIds: z
    .array(z.string().uuid())
    .min(1, "At least one product must be selected")
    .max(50, "Maximum 50 products can be processed in one batch"),
  style: jobStyleSchema,
  language: languageSchema,
  publicationMode: publicationModeSchema.optional(),
  model: z.string().optional(),
}) satisfies z.ZodType<CreateJobCommand>;

// Schema dla JobResponseDTO
export const jobResponseSchema = z.object({
  jobId: z.string().uuid(),
  status: z.enum(["pending", "in_progress", "completed", "failed", "cancelled"]),
}) satisfies z.ZodType<JobResponseDTO>;

// Schema dla JobProductDTO
export const jobProductSchema = z.object({
  productId: z.string().uuid(),
  status: z.enum(["pending", "in_progress", "completed", "failed"]),
  cost: z.number().nullable(),
  tokenUsageDetails: z.record(z.unknown()).nullable(),
}) satisfies z.ZodType<JobProductDTO>;

// Schema dla JobDetailDTO
export const jobDetailSchema = z.object({
  jobId: z.string().uuid(),
  status: z.enum(["pending", "in_progress", "completed", "failed", "cancelled"]),
  style: jobStyleSchema,
  language: languageSchema,
  publicationMode: publicationModeSchema,
  createdAt: z.string().datetime(),
  startedAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
  totalCostEstimate: z.number().nullable(),
  estimatedTokensTotal: z.number().nullable().optional(),
  products: z.array(jobProductSchema),
  progress: z.number().min(0).max(100),
}) satisfies z.ZodType<JobDetailDTO>;
