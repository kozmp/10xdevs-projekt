import type { APIRoute } from "astro";
import { costEstimateRequestSchema, costEstimateResponseSchema } from "../../../lib/schemas/cost-estimate";
import { CostEstimateService } from "../../../lib/services/cost-estimate.service";
import type { CostEstimateRequest } from "../../../types";

/**
 * POST /api/jobs/estimate
 *
 * Kalkuluje koszty generowania opisów produktów przed rozpoczęciem joba.
 * Wymaga autoryzacji. RLS zapewnia dostęp tylko do własnych produktów.
 *
 * Request body: CostEstimateRequest
 * Response: CostEstimateResponse
 */
export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // 1. Weryfikacja autoryzacji
    if (!locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized - Please log in",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 2. Parsowanie i walidacja body
    const body = await request.json();
    const validation = costEstimateRequestSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request data",
          details: validation.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 3. Kalkulacja kosztów przez serwis
    const service = new CostEstimateService(locals.supabase);

    try {
      const costEstimateRequest: CostEstimateRequest = {
        productIds: validation.data.productIds,
        style: validation.data.style,
        language: validation.data.language,
        model: validation.data.model,
      };

      const estimate = await service.estimateCost(costEstimateRequest, locals.user.id);

      // 4. Walidacja odpowiedzi
      const responseValidation = costEstimateResponseSchema.safeParse(estimate);

      if (!responseValidation.success) {
        console.error("Invalid cost estimate response format:", responseValidation.error);
        return new Response(
          JSON.stringify({
            error: "Internal server error - Invalid response format",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response(JSON.stringify(estimate), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : "Unknown error";

      // Rozróżnienie między 404 (not found) a 403 (forbidden) a 500 (server error)
      if (errorMessage.includes("not found") || errorMessage.includes("access denied")) {
        return new Response(
          JSON.stringify({
            error: errorMessage,
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (errorMessage.includes("Unsupported model")) {
        return new Response(
          JSON.stringify({
            error: errorMessage,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Inne błędy serwisu
      console.error("Service error in POST /api/jobs/estimate:", serviceError);
      return new Response(
        JSON.stringify({
          error: "Failed to calculate cost estimate",
          details: errorMessage,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (err) {
    console.error("Error in POST /api/jobs/estimate:", err);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * GET /api/jobs/estimate/models
 *
 * Zwraca listę dostępnych modeli z cenami
 * (opcjonalny endpoint dla UI)
 */
export const GET: APIRoute = async ({ locals }) => {
  try {
    // Weryfikacja autoryzacji
    if (!locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized - Please log in",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const models = CostEstimateService.getAvailableModels();

    return new Response(JSON.stringify({ models }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in GET /api/jobs/estimate/models:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch available models",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
