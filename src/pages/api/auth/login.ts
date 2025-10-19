import type { APIRoute } from "astro";
import { z } from "zod";

export const prerender = false;

const LoginSchema = z.object({
  email: z.string().email("Nieprawidłowy format email"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();

    const validation = LoginSchema.safeParse(body);
    if (!validation.success) {
      return new Response(JSON.stringify({ error: validation.error.errors[0].message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { email, password } = validation.data;

    const { data, error } = await locals.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Generyczny komunikat błędu dla bezpieczeństwa
      return new Response(JSON.stringify({ error: "Nieprawidłowy email lub hasło" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Sprawdź czy email jest zweryfikowany (jeśli wymagane)
    if (data.user?.email_confirmed_at === null && import.meta.env.PUBLIC_REQUIRE_EMAIL_VERIFICATION === "true") {
      return new Response(JSON.stringify({ error: "Konto wymaga weryfikacji email" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Ustaw ciasteczka sesji
    const {
      data: { session },
      error: sessionError,
    } = await locals.supabase.auth.setSession({
      access_token: data.session!.access_token,
      refresh_token: data.session!.refresh_token,
    });

    if (sessionError) {
      console.error("Session error:", sessionError);
      return new Response(JSON.stringify({ error: "Błąd podczas ustawiania sesji" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        message: "Logowanie pomyślne",
        user: {
          id: data.user!.id,
          email: data.user!.email!,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Login error:", err);
    return new Response(JSON.stringify({ error: "Błąd serwera, spróbuj ponownie" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
