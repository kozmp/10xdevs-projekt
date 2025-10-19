import type { APIRoute } from "astro";
import { z } from "zod";

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
