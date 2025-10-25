import type { APIRoute } from "astro";
import { JobService } from "../../../lib/services/job.service";

export const prerender = false;

/**
 * GET /api/jobs/[id]
 *
 * Pobiera szczegóły joba z bazy danych.
 * Wymaga autoryzacji. RLS zapewnia dostęp tylko do własnych jobów.
 *
 * Response: JobDTO (ze zmienionymi polami camelCase)
 */
export const GET: APIRoute = async ({ locals, params }) => {
  try {
    // 1. Walidacja ID
    if (!params.id) {
      return new Response(
        JSON.stringify({
          error: "Invalid job ID format",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 2. Weryfikacja autoryzacji
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

    // 3. Pobierz job z bazy
    const jobService = new JobService(locals.supabase);
    const job = await jobService.getJob(params.id);

    if (!job) {
      return new Response(
        JSON.stringify({
          error: "Job not found",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 4. Zwróć job (JobDTO używa camelCase)
    return new Response(JSON.stringify(job), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in GET /api/jobs/[id]:", err);
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
