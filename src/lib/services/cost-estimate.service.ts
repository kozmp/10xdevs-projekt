import type { SupabaseClient } from "../../db/supabase.client";
import type { CostEstimateRequest, CostEstimateResponse } from "../../types";

/**
 * Serwis do kalkulacji kosztów generowania opisów produktów
 *
 * Odpowiedzialny za:
 * - Pobranie danych produktów z bazy
 * - Estymację tokenów (input/output)
 * - Kalkulację kosztów na podstawie pricing modelu
 * - Estymację czasu trwania
 */

/**
 * Model pricing configuration
 * Ceny w USD per 1M tokens
 */
interface ModelPricing {
  inputCostPer1M: number;
  outputCostPer1M: number;
  tokensPerSecond: number; // Average generation speed
}

/**
 * Supported models pricing (OpenRouter)
 */
const MODEL_PRICING: Record<string, ModelPricing> = {
  "openai/gpt-4o-mini": {
    inputCostPer1M: 0.15, // $0.15 per 1M input tokens
    outputCostPer1M: 0.6, // $0.60 per 1M output tokens
    tokensPerSecond: 150, // ~150 tokens/sec generation speed
  },
  "openai/gpt-4o": {
    inputCostPer1M: 2.5,
    outputCostPer1M: 10.0,
    tokensPerSecond: 100,
  },
  "anthropic/claude-3-haiku": {
    inputCostPer1M: 0.25,
    outputCostPer1M: 1.25,
    tokensPerSecond: 120,
  },
};

/**
 * Estimated output lengths based on style
 */
const ESTIMATED_OUTPUT_TOKENS: Record<string, number> = {
  professional: 350, // ~250 words
  casual: 300, // ~200 words
  "sales-focused": 400, // ~280 words with more persuasive content
};

/**
 * Base prompt template tokens (approximate)
 */
const BASE_PROMPT_TOKENS = 200; // System prompt + instructions

export class CostEstimateService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Kalkulacja kosztów dla generowania opisów produktów
   *
   * @param request - Żądanie z listą produktów i parametrami
   * @param userId - ID użytkownika (dla RLS)
   * @returns Szczegółowa kalkulacja kosztów
   * @throws Error jeśli produkty nie istnieją lub brak dostępu
   */
  async estimateCost(request: CostEstimateRequest, userId: string): Promise<CostEstimateResponse> {
    // 1. Pobierz produkty z bazy (weryfikacja RLS)
    const { data: products, error } = await this.supabase
      .from("products")
      .select("id, name, short_description, long_description")
      .in("id", request.productIds);

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    // Najpierw sprawdź czy są jakiekolwiek produkty
    if (!products) {
      throw new Error("No products found or access denied");
    }

    // Sprawdź czy wszystkie produkty zostały znalezione
    if (products.length !== request.productIds.length) {
      if (products.length === 0) {
        throw new Error("No products found or access denied");
      }
      const foundIds = products.map((p) => p.id);
      const missingIds = request.productIds.filter((id) => !foundIds.includes(id));
      throw new Error(`Products not found: ${missingIds.join(", ")}`);
    }

    // 2. Pobierz pricing dla modelu
    const pricing = MODEL_PRICING[request.model || "openai/gpt-4o-mini"];
    if (!pricing) {
      throw new Error(`Unsupported model: ${request.model}`);
    }

    // 3. Estymacja tokenów
    const { inputTokens, outputTokens } = this.estimateTokens(products, request);

    // 4. Kalkulacja kosztów
    const inputCost = (inputTokens / 1_000_000) * pricing.inputCostPer1M;
    const outputCost = (outputTokens / 1_000_000) * pricing.outputCostPer1M;
    const totalCost = inputCost + outputCost;

    // 5. Estymacja czasu trwania
    const estimatedDuration = Math.ceil(outputTokens / pricing.tokensPerSecond);

    // 6. Kalkulacja per-product
    const costPerProduct = totalCost / products.length;

    return {
      totalCost: parseFloat(totalCost.toFixed(6)), // 6 decimal precision for USD
      totalTokens: inputTokens + outputTokens,
      productCount: products.length,
      estimatedDuration,
      costPerProduct: parseFloat(costPerProduct.toFixed(6)),
      breakdown: {
        inputTokens,
        outputTokens,
        inputCost: parseFloat(inputCost.toFixed(6)),
        outputCost: parseFloat(outputCost.toFixed(6)),
      },
      model: request.model || "openai/gpt-4o-mini",
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Estymacja liczby tokenów dla input i output
   *
   * Input tokens = Base prompt + (product data per product)
   * Output tokens = Estimated length based on style * product count
   */
  private estimateTokens(
    products: { name: string; short_description: string | null; long_description: string | null }[],
    request: CostEstimateRequest
  ): { inputTokens: number; outputTokens: number } {
    // Input tokens estimation
    let inputTokensPerProduct = 0;

    for (const product of products) {
      // Approximate: 1 token ~= 4 characters (English), ~3 characters (Polish)
      const charToTokenRatio = request.language === "pl" ? 3 : 4;

      const nameTokens = Math.ceil((product.name?.length || 0) / charToTokenRatio);
      const shortDescTokens = Math.ceil((product.short_description?.length || 0) / charToTokenRatio);
      const longDescTokens = Math.ceil((product.long_description?.length || 0) / charToTokenRatio);

      inputTokensPerProduct += nameTokens + shortDescTokens + longDescTokens;
    }

    const totalInputTokens = BASE_PROMPT_TOKENS + inputTokensPerProduct;

    // Output tokens estimation
    const outputTokensPerProduct = ESTIMATED_OUTPUT_TOKENS[request.style] || 350;
    const totalOutputTokens = outputTokensPerProduct * products.length;

    return {
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
    };
  }

  /**
   * Pobiera dostępne modele z cenami
   */
  static getAvailableModels(): {
    model: string;
    inputCost: number;
    outputCost: number;
    speed: string;
  }[] {
    return Object.entries(MODEL_PRICING).map(([model, pricing]) => ({
      model,
      inputCost: pricing.inputCostPer1M,
      outputCost: pricing.outputCostPer1M,
      speed: `~${pricing.tokensPerSecond} tokens/sec`,
    }));
  }
}
