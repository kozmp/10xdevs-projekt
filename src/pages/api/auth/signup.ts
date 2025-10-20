import type { APIRoute } from "astro";
import { signupSchema } from "@/lib/schemas/auth";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { guardApiFeature } from "@/features/api-helpers";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, ...context }) => {
  // Feature flag guard - sprawdź czy auth feature jest włączony
  const guardResponse = guardApiFeature(context as any, 'auth', {
    disabledStatus: 503,
    disabledMessage: 'Rejestracja jest tymczasowo niedostępna'
  });
  if (guardResponse) return guardResponse;
  try {
    // 1. Parsowanie i walidacja danych wejściowych
    const body = await request.json();
    const validatedData = signupSchema.parse(body);

    // 2. Inicjalizacja klienta Supabase
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    // 3. Rejestracja użytkownika
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
      },
    });

    // 4. Obsługa błędów rejestracji
    if (error) {
      console.error("Signup error:", error);

      // Mapowanie błędów Supabase na przyjazne dla użytkownika komunikaty
      const userMessage =
        error.message === "User already registered" ? "Użytkownik o tym adresie email już istnieje" : error.message;

      return new Response(
        JSON.stringify({
          error: userMessage,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 5. Sukces - zwróć informację o konieczności weryfikacji email
    return new Response(
      JSON.stringify({
        user: data.user,
        requiresEmailVerification: true,
        message: "Sprawdź swoją skrzynkę email, aby potwierdzić rejestrację.",
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Signup processing error:", err);

    // Obsługa błędów walidacji
    if (err instanceof Error) {
      return new Response(
        JSON.stringify({
          error: err.message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Nieznany błąd
    return new Response(
      JSON.stringify({
        error: "Wystąpił błąd podczas rejestracji. Spróbuj ponownie później.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
