import { FullConfig } from "@playwright/test";

/**
 * Global setup for Playwright tests
 *
 * Runs once before all tests.
 * Authentication is handled per-test via LoginPage to ensure test isolation.
 */
export default async function globalSetup(config: FullConfig) {
  console.log("🚀 Konfiguracja środowiska testowego...\n");

  // Verify required environment variables
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;
  const username = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Brak konfiguracji Supabase w zmiennych środowiskowych");
  }

  if (!username || !password) {
    throw new Error("Brak danych użytkownika E2E w zmiennych środowiskowych");
  }

  console.log("✅ Weryfikacja zmiennych środowiskowych zakończona pomyślnie\n");
}
