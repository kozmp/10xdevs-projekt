import { z } from 'zod';
import type { ListProductsQuery, ProductSummaryDTO, ProductDetailDTO, ProductStatus } from '../../types';

// Schema dla parametrów zapytania
export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  search: z.string().min(1).max(100).optional()
}) satisfies z.ZodType<ListProductsQuery>;

// Schema dla kategorii w odpowiedzi
const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1)
});

// Schema dla kolekcji w odpowiedzi
const collectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1)
});

// Schema dla podsumowania produktu
export const productSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  sku: z.string().min(1),
  shortDescription: z.string().nullable(),
  longDescription: z.string().nullable(),
  status: z.enum(['draft', 'published', 'archived']),
  categories: z.array(categorySchema),
  collections: z.array(collectionSchema)
}) satisfies z.ZodType<ProductSummaryDTO>;

// Schema dla metadanych paginacji
export const paginationMetaSchema = z.object({
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  totalPages: z.number().int().min(1)
});

// Schema dla pełnej odpowiedzi z listą produktów
export const listProductsResponseSchema = z.object({
  data: z.array(productSummarySchema),
  meta: paginationMetaSchema
});

// Schema dla szczegółów produktu
export const productDetailSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  sku: z.string().min(1),
  shortDescription: z.string().nullable(),
  longDescription: z.string().nullable(),
  status: z.enum(['draft', 'published', 'archived']),
  metadata: z.record(z.unknown()).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastSyncedAt: z.string().datetime().nullable(),
  categories: z.array(categorySchema),
  collections: z.array(collectionSchema)
}) satisfies z.ZodType<ProductDetailDTO>;

// Schema dla parametru ID
export const productIdSchema = z.string().uuid('Invalid product ID format');
