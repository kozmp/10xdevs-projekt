import { FullConfig } from "@playwright/test";

/**
 * Global teardown for Playwright tests
 *
 * Runs once after all tests complete.
 */
export default async function globalTeardown(config: FullConfig) {
  console.log("\n🧹 Zakończenie testów...\n");

  // Add any cleanup logic here if needed in the future
  // For now, each test handles its own cleanup

  console.log("✅ Czyszczenie zakończone pomyślnie\n");
}
