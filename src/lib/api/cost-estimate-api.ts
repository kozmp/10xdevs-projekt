import type { CostEstimateRequest, CostEstimateResponse } from "../../types";

/**
 * API Client dla kalkulacji kosztów generowania opisów
 *
 * Funkcje do komunikacji z endpointami:
 * - POST /api/jobs/estimate - Kalkulacja kosztów
 * - GET /api/jobs/estimate - Lista dostępnych modeli
 */

/**
 * Informacje o dostępnym modelu AI
 */
export interface AvailableModel {
  model: string;
  inputCost: number;
  outputCost: number;
  speed: string;
}

/**
 * Response z GET /api/jobs/estimate
 */
interface AvailableModelsResponse {
  models: AvailableModel[];
}

/**
 * Kalkuluje koszty generowania opisów dla wybranych produktów
 *
 * @param request - Parametry żądania (productIds, style, language, model)
 * @returns Promise z kalkulacją kosztów
 * @throws Error jeśli request się nie powiedzie (401, 404, 500)
 *
 * @example
 * ```ts
 * const estimate = await calculateCostEstimate({
 *   productIds: ['uuid-1', 'uuid-2'],
 *   style: 'professional',
 *   language: 'pl',
 *   model: 'openai/gpt-4o-mini'
 * });
 * console.log(`Total cost: $${estimate.totalCost}`);
 * ```
 */
export async function calculateCostEstimate(request: CostEstimateRequest): Promise<CostEstimateResponse> {
  const response = await fetch("/api/jobs/estimate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;

    // Rozróżnienie błędów dla lepszego UX
    if (response.status === 401) {
      throw new Error("Musisz być zalogowany aby wykonać kalkulację");
    }
    if (response.status === 404) {
      throw new Error("Wybrane produkty nie zostały znalezione lub nie masz do nich dostępu");
    }
    if (response.status === 400) {
      throw new Error(`Nieprawidłowe dane: ${errorMessage}`);
    }

    throw new Error(`Nie udało się obliczyć kosztów: ${errorMessage}`);
  }

  const data: CostEstimateResponse = await response.json();
  return data;
}

/**
 * Pobiera listę dostępnych modeli AI z cenami
 *
 * @returns Promise z listą modeli
 * @throws Error jeśli request się nie powiedzie
 *
 * @example
 * ```ts
 * const models = await getAvailableModels();
 * console.log(`Available models: ${models.length}`);
 * models.forEach(m => console.log(`${m.model}: $${m.inputCost}/$${m.outputCost}`));
 * ```
 */
export async function getAvailableModels(): Promise<AvailableModel[]> {
  const response = await fetch("/api/jobs/estimate", {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;

    if (response.status === 401) {
      throw new Error("Musisz być zalogowany aby pobrać listę modeli");
    }

    throw new Error(`Nie udało się pobrać listy modeli: ${errorMessage}`);
  }

  const data: AvailableModelsResponse = await response.json();
  return data.models;
}
