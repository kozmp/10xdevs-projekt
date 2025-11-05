import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";
import { AUTH_ROUTES, isPublicPath } from "../lib/auth/routes-config";

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // 1. Inicjalizacja Supabase dla każdego żądania
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // 2. Zapisz instancję Supabase w locals dla późniejszego użycia
  locals.supabase = supabase;

  // 3. Dodaj nagłówki CORS dla API
  locals.corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // 4. Obsługa OPTIONS dla CORS
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: locals.corsHeaders,
    });
  }

  // 5. Sprawdź czy to żądanie API
  const isApiRequest = url.pathname.startsWith("/api/");

  // 6. Sprawdź czy ścieżka jest publiczna
  if (isPublicPath(url.pathname)) {
    return next();
  }

  // 7. Pobierz informacje o użytkowniku
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // 8. Obsługa błędów autoryzacji
  if (error) {
    // Import logger dynamically to avoid circular dependencies
    const { logger } = await import("@/lib/utils/logger");
    logger.error("Auth error", error);
    locals.user = null;

    if (isApiRequest) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized - Please log in",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            ...locals.corsHeaders,
          },
        }
      );
    }
    return redirect(AUTH_ROUTES.LOGIN);
  }

  // 9. Zapisz informacje o użytkowniku lub obsłuż brak autoryzacji
  if (user) {
    locals.user = {
      id: user.id,
      email: user.email,
    };
    return next();
  }

  // 10. Brak autoryzacji
  if (isApiRequest) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized - Please log in",
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          ...locals.corsHeaders,
        },
      }
    );
  }
  return redirect(AUTH_ROUTES.LOGIN);
});
