import type { APIRoute } from "astro";
import { guardApiFeature } from "@/features/api-helpers";

export const prerender = false;

export const POST: APIRoute = async ({ locals, ...context }) => {
  // Feature flag guard - sprawdź czy auth feature jest włączony
  const guardResponse = guardApiFeature(context as any, 'auth', {
    disabledStatus: 503,
    disabledMessage: 'Wylogowanie jest tymczasowo niedostępne'
  });
  if (guardResponse) return guardResponse;
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
    console.error("Logout error:", err);
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
