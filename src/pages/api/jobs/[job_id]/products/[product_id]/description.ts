import type { APIRoute } from "astro";
import type { SaveDescriptionCommand } from "../../../../../../types";
import { saveDescriptionSchema, descriptionVersionResponseSchema } from "../../../../../../lib/schemas/description";
import { DescriptionVersionService } from "../../../../../../lib/services/description-version.service";

/**
 * PUT /api/jobs/{job_id}/products/{product_id}/description
 *
 * Zapisuje nową wersję opisu produktu z obsługą wersjonowania.
 * Wymaga autoryzacji. RLS zapewnia, że użytkownik ma dostęp tylko do swoich jobów.
 *
 * Request body: SaveDescriptionCommand
 * Response: DescriptionVersionDTO
 */
export const prerender = false;

export const PUT: APIRoute = async ({ params, request, locals }) => {
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

    // 2. Walidacja parametrów URL
    const { job_id: jobId, product_id: productId } = params;

    if (!jobId || !productId) {
      return new Response(
        JSON.stringify({
          error: "Missing required URL parameters: job_id and product_id",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Walidacja UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(jobId) || !uuidRegex.test(productId)) {
      return new Response(
        JSON.stringify({
          error: "Invalid UUID format for job_id or product_id",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 3. Parsowanie i walidacja body
    const body = await request.json();
    const validation = saveDescriptionSchema.safeParse(body);

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

    // 4. Zapis wersji opisu przez serwis
    const service = new DescriptionVersionService(locals.supabase);

    try {
      // Mapujemy walidowane dane na SaveDescriptionCommand
      const command: SaveDescriptionCommand = {
        content: validation.data.content,
        format: validation.data.format,
        versionNote: validation.data.versionNote,
      };

      const descriptionVersion = await service.saveDescriptionVersion(jobId, productId, command);

      // 5. Walidacja odpowiedzi
      const responseValidation = descriptionVersionResponseSchema.safeParse(descriptionVersion);

      if (!responseValidation.success) {
        console.error("Invalid description version data format:", responseValidation.error);
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

      return new Response(JSON.stringify(descriptionVersion), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : "Unknown error";

      // Rozróżnienie między 404 (not found) a 403 (forbidden)
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

      // Inne błędy serwisu
      console.error("Service error in PUT /api/jobs/.../description:", serviceError);
      return new Response(
        JSON.stringify({
          error: "Failed to save description version",
          details: errorMessage,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (err) {
    console.error("Error in PUT /api/jobs/.../description:", err);
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
 * GET /api/jobs/{job_id}/products/{product_id}/description
 *
 * Pobiera wszystkie wersje opisu produktu (najnowsze pierwsze).
 * Wymaga autoryzacji. RLS zapewnia dostęp tylko do własnych produktów.
 *
 * Response: DescriptionVersionDTO[]
 */
export const GET: APIRoute = async ({ params, locals }) => {
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

    // 2. Walidacja parametrów URL
    const { product_id: productId } = params;

    if (!productId) {
      return new Response(
        JSON.stringify({
          error: "Missing required URL parameter: product_id",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 3. Pobierz wersje z serwisu
    const service = new DescriptionVersionService(locals.supabase);
    const versions = await service.getDescriptionVersions(productId);

    return new Response(JSON.stringify(versions), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in GET /api/jobs/.../description:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch description versions",
        details: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
