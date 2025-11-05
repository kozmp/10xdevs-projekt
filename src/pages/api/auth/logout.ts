import type { APIRoute } from "astro";
import { guardApiFeature } from "@/features/api-helpers";
import { logger } from "@/lib/utils/logger";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  // Feature flag guard - sprawdź czy auth feature jest włączony
  const guardResponse = guardApiFeature(context, "auth", {
    disabledStatus: 503,
    disabledMessage: "Wylogowanie jest tymczasowo niedostępne",
    // Note: allowAnonymous = false (default) - logout wymaga zalogowanego użytkownika
  });
  if (guardResponse) return guardResponse;

  // Destructure context after guard check
  const { locals } = context;

  try {
    const { error } = await locals.supabase.auth.signOut();

    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Logout successful",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    logger.error("Logout error", err);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
