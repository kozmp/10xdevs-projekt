import type { APIRoute } from "astro";
import { z } from "zod";
import { guardApiFeature } from "@/features/api-helpers";

export const prerender = false;

const ForgotPasswordSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email").min(1, "Email jest wymagany"),
});

export const POST: APIRoute = async (context) => {
  // Feature flag guard - sprawdź czy auth feature jest włączony
  const guardResponse = guardApiFeature(context, "auth", {
    disabledStatus: 503,
    disabledMessage: "Resetowanie hasła jest tymczasowo niedostępne",
    allowAnonymous: true, // Forgot password endpoint musi być dostępny dla niezalogowanych
  });
  if (guardResponse) return guardResponse;

  // Destructure context after guard check
  const { request, locals } = context;

  try {
    const body = await request.json();

    const validation = ForgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return new Response(JSON.stringify({ error: validation.error.errors[0].message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { email } = validation.data;

    // Wysłanie linku resetującego przez Supabase Auth
    await locals.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.PUBLIC_APP_URL}/reset-password`,
    });

    // Zawsze zwracamy sukces (nawet jeśli email nie istnieje - bezpieczeństwo)
    return new Response(
      JSON.stringify({
        message: "Jeśli konto z tym adresem istnieje, wysłano link resetujący",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Forgot password error:", err);
    return new Response(JSON.stringify({ error: "Błąd serwera" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
