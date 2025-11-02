import type { APIRoute } from "astro";
import { z } from "zod";
import { createJobSchema } from "../../../lib/schemas/job";
import { JobService } from "../../../lib/services/job.service";
import type { CreateJobCommand } from "../../../types";

export const prerender = false;

const GetJobsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  page: z.coerce.number().min(1).optional().default(1),
});

export const GET: APIRoute = async ({ request, url, locals }) => {
  try {
    // Walidacja parametrów
    const params = Object.fromEntries(url.searchParams);
    const validation = GetJobsQuerySchema.safeParse(params);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid query parameters",
          details: validation.error.errors,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { limit, page } = validation.data;

    // Pobierz zadania z bazy danych
    const { data: jobs, error } = await locals.supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error("Jobs fetch error:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch jobs" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Pobierz całkowitą liczbę zadań
    const { count, error: countError } = await locals.supabase.from("jobs").select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Jobs count error:", countError);
      return new Response(JSON.stringify({ error: "Failed to fetch jobs count" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        data: jobs,
        meta: {
          total: count,
          page,
          limit,
          pages: Math.ceil((count || 0) / limit),
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Jobs API error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * POST /api/jobs
 *
 * Tworzy nowy job (zlecenie generowania opisów produktów).
 * Asynchronicznie kalkuluje koszty w tle (nieblokująco).
 *
 * Request body: CreateJobCommand
 * Response: JobResponseDTO (201 Created)
 */
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

    // 2. Pobierz shop_id użytkownika (RLS)
    const { data: shop, error: shopError } = await locals.supabase
      .from("shops")
      .select("shop_id")
      .eq("shop_id", locals.user.id) // Zakładamy że user.id === shop_id (lub należy zmapować)
      .single();

    if (shopError || !shop) {
      return new Response(
        JSON.stringify({
          error: "Shop not found - Please connect your shop first",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 3. Parsowanie i walidacja body
    const body = await request.json();
    const validation = createJobSchema.safeParse(body);

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

    // 4. Utwórz job przez JobService
    const jobService = new JobService(locals.supabase);
    const command: CreateJobCommand = validation.data;

    try {
      const job = await jobService.createJob(command, shop.shop_id);

      // 5. Wywołaj asynchroniczną kalkulację kosztów (nie czekamy na wynik)
      // UWAGA: W produkcji lepiej użyć kolejki (np. Supabase Edge Functions + pg_notify)
      jobService.calculateInitialCostEstimate(job.id, command.model).catch((err) => {
        console.error(`[POST /api/jobs] Failed to calculate cost estimate for job ${job.id}:`, err);
      });

      // 6. Zwróć odpowiedź natychmiast (nieblokująco)
      return new Response(
        JSON.stringify({
          jobId: job.id,
          status: job.status,
        }),
        {
          status: 201,
          headers: {
            "Content-Type": "application/json",
            Location: `/api/jobs/${job.id}`,
          },
        }
      );
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : "Unknown error";

      // Rozróżnienie błędów
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
      console.error("Service error in POST /api/jobs:", serviceError);
      return new Response(
        JSON.stringify({
          error: "Failed to create job",
          details: errorMessage,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (err) {
    console.error("Error in POST /api/jobs:", err);
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
