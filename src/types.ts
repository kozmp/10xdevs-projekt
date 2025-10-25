// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginSuccessResponse {
  message: string;
  user: {
    id: string;
    email: string;
  };
}

export interface LoginErrorResponse {
  error: string;
}

// Product Description types
export interface SaveDescriptionCommand {
  content: string;
  format: "html" | "markdown";
  versionNote?: string;
}

export interface DescriptionVersionDTO {
  versionId: string;
  productId: string;
  jobId: string;
  content: string;
  format: "html" | "markdown";
  versionNote?: string;
  createdAt: string;
  version: number;
}

// Shop types
export interface UpdateShopCommand {
  shopifyDomain: string;
  apiKey: string;
}

export interface ShopResponseDTO {
  /**
   * Indicates whether the shop is actively connected (API key exists)
   * - true: Shop is configured and has valid API key
   * - false: Shop is not configured or API key was removed
   */
  isConnected: boolean;
  /**
   * Optional fields - present only when isConnected = true
   */
  shopId?: string;
  shopifyDomain?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Cost Estimation types
export interface CostEstimateRequest {
  productIds: string[];
  style: "professional" | "casual" | "sales-focused";
  language: "pl" | "en";
  model?: string;
}

export interface CostEstimateResponse {
  totalCost: number;
  totalTokens: number;
  productCount: number;
  estimatedDuration: number;
  costPerProduct: number;
  breakdown: {
    inputTokens: number;
    outputTokens: number;
    inputCost: number;
    outputCost: number;
  };
  model: string;
  timestamp: string;
}

// Job types
export type JobStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";
export type JobStyle = "professional" | "casual" | "sales-focused";
export type JobLanguage = "pl" | "en";
export type PublicationMode = "draft" | "published";

export interface CreateJobCommand {
  productIds: string[];
  style: JobStyle;
  language: JobLanguage;
  publicationMode?: PublicationMode;
  model?: string;
}

export interface JobDTO {
  id: string;
  shopId: string;
  status: JobStatus;
  style: JobStyle;
  language: JobLanguage;
  totalCostEstimate?: number;
  estimatedTokensTotal?: number;
  publicationMode: PublicationMode;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface JobResponseDTO {
  jobId: string;
  status: JobStatus;
}

export interface JobProductDTO {
  productId: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  cost: number | null;
  tokenUsageDetails: Record<string, unknown> | null;
}

export interface JobDetailDTO {
  jobId: string;
  status: JobStatus;
  style: JobStyle;
  language: JobLanguage;
  publicationMode: PublicationMode;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  totalCostEstimate: number | null;
  estimatedTokensTotal?: number | null;
  products: JobProductDTO[];
  progress: number;
}

// Rozszerz Astro.locals o user i supabase
declare global {
  namespace App {
    interface Locals {
      user?: {
        id: string;
        email: string;
      };
      supabase: import("./db/supabase.client").SupabaseClient;
    }
  }
}
