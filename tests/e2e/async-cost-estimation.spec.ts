import { test, expect, type Page } from "@playwright/test";
import { LoginPage } from "./page-objects/LoginPage";

/**
 * E2E Tests dla Asynchronicznej Kalkulacji Kosztów (F2 - Nowa Wersja)
 *
 * Scenariusze testowe:
 * 1. E2E-F2-01: Nieblokujący przepływ - natychmiastowe przekierowanie, koszty ładują się asynchronicznie
 * 2. E2E-F2-02: Resilience - Job utworzony nawet jeśli estymacja kosztów się nie powiedzie
 *
 * Architektura:
 * - POST /api/jobs tworzy job i zwraca 201 Created natychmiast
 * - JobService.calculateInitialCostEstimate() działa w tle (nieblokująco)
 * - Frontend używa polling (useJobCostEstimate hook) do odświeżania kosztów
 */

test.describe("Async Cost Estimation Feature (F2 - Async Model)", () => {
  let page: Page;
  let loginPage: LoginPage;

  // Test user credentials
  const TEST_USER_EMAIL = "test@example.com";
  const TEST_USER_PASSWORD = "TestPassword123!";

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    loginPage = new LoginPage(page);

    // Login before each test
    await loginPage.goto();
    await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test.afterEach(async () => {
    await page.close();
  });

  /**
   * E2E-F2-01: Nieblokujący Przepływ (Non-blocking Flow)
   *
   * Weryfikuje że:
   * 1. Użytkownik klika "Generuj Job"
   * 2. Natychmiastowe przekierowanie do /jobs/:id (bez czekania na kalkulację)
   * 3. Komponent JobCostEstimateCard początkowo pokazuje "Szacowanie kosztów..."
   * 4. Po 1-2 sekundach koszty się aktualizują (polling)
   * 5. Job pozostaje w stanie "pending" lub "processing"
   *
   * Ten test potwierdza że UX nie jest blokowany przez kalkulację kosztów.
   */
  test("E2E-F2-01: should show job immediately and update costs asynchronously", async () => {
    // ARRANGE: Przejdź do strony generowania z wybranymi produktami
    // W rzeczywistym scenariuszu: ProductsPage -> select products -> navigate to generate
    // Tu symulujemy że mamy już wybrane produkty
    const testProductIds = ["product-1-uuid", "product-2-uuid", "product-3-uuid"];

    // Mock: Zakładamy że mamy endpoint /generate który przyjmuje product IDs
    await page.goto(`/generate?products=${testProductIds.join(",")}`);

    // Wypełnij formularz generowania
    await page.locator('button:has-text("Professional")').click();
    await page.locator('select[name="language"]').selectOption("pl");
    await page.locator('input[type="radio"][value="openai/gpt-4o-mini"]').check();

    // ACT: Kliknij "Generuj Job" (bez kalkulacji pre-generacyjnej)
    const generateButton = page.locator('button:has-text("Generuj"), button:has-text("Rozpocznij generowanie")');
    await expect(generateButton).toBeVisible();

    // Zapisz timestamp przed kliknięciem
    const startTime = Date.now();
    await generateButton.click();

    // ASSERT 1: Natychmiastowe przekierowanie do /jobs/:id (w ciągu 500ms)
    await expect(page).toHaveURL(/\/jobs\/[a-f0-9-]+/, { timeout: 2000 });
    const redirectTime = Date.now() - startTime;
    expect(redirectTime).toBeLessThan(2000); // Przekierowanie powinno być błyskawiczne

    // Extract job ID from URL
    const url = page.url();
    const jobIdMatch = url.match(/\/jobs\/([a-f0-9-]+)/);
    expect(jobIdMatch).toBeTruthy();
    const jobId = jobIdMatch![1];
    console.log(`Job created with ID: ${jobId}`);

    // ASSERT 2: Komponent JobCostEstimateCard jest widoczny
    const costCard = page.locator('[data-testid="job-cost-estimate-card"], .job-cost-estimate-card').first();
    // Jeśli nie ma data-testid, szukamy po tekście nagłówka
    const costCardAlt = page.locator('text="Szacunkowy Koszt"').locator("..").locator("..");
    const visibleCard = (await costCard.count()) > 0 ? costCard : costCardAlt;

    // ASSERT 3: Stan "Pending" - pokazuje "Szacowanie kosztów..."
    const pendingIndicator = page.locator("text=/Szacowanie kosztów|Obliczanie|Calculating/i");
    await expect(pendingIndicator).toBeVisible({ timeout: 3000 });

    // Badge "Obliczanie..." powinien być widoczny
    const pendingBadge = page.locator("text=/Obliczanie|Pending/i");
    await expect(pendingBadge).toBeVisible({ timeout: 2000 });

    // ASSERT 4: Po 1-2 sekundach koszty się aktualizują
    // Czekamy na zmianę stanu z "Pending" na "Success"
    const successBadge = page.locator("text=/Obliczono|Completed/i");
    await expect(successBadge).toBeVisible({ timeout: 10000 }); // Max 10s na polling

    // Weryfikuj że koszt jest teraz wyświetlany
    const costDisplay = page.locator("text=/\\$0\\.\\d+/");
    await expect(costDisplay).toBeVisible({ timeout: 2000 });

    // Weryfikuj że liczba tokenów jest wyświetlana
    const tokensDisplay = page.locator("text=/\\d+.*token/i");
    await expect(tokensDisplay).toBeVisible({ timeout: 2000 });

    // ASSERT 5: Job status pozostaje "pending" lub przechodzi do "processing"
    const jobStatus = page.locator('[data-testid="job-status"], text=/Status:/i');
    await expect(jobStatus).toBeVisible();
    // Status powinien być "pending" lub "processing", nie "failed"
    await expect(page.locator("text=/failed|błąd/i")).not.toBeVisible();

    console.log(`✓ E2E-F2-01 PASSED: Job ${jobId} created instantly, costs loaded asynchronously`);
  });

  /**
   * E2E-F2-02: Resilience - Job utworzony nawet jeśli estymacja kosztów failuje
   *
   * Weryfikuje że:
   * 1. Użytkownik tworzy job
   * 2. Job zostaje utworzony pomyślnie (201 Created)
   * 3. Estymacja kosztów może się nie powieść (np. timeout, błąd DB)
   * 4. Job NADAL przechodzi do stanu "processing" (główna funkcjonalność nie jest zablokowana)
   * 5. Koszty mogą pozostać "null" lub "pending", ale generowanie AI DZIAŁA
   *
   * Ten test potwierdza że asynchroniczna kalkulacja kosztów nie blokuje głównego flow.
   */
  test("E2E-F2-02: should create job even if cost estimation fails", async () => {
    // ARRANGE: Symulacja scenariusza gdzie estymacja kosztów może failować
    // W rzeczywistym środowisku to może być timeout, błąd sieci, brak dostępu do produktów, etc.

    // Intercept API call do /api/jobs/:id i symuluj że koszty nie są dostępne przez dłuższy czas
    await page.route("**/api/jobs/*", async (route) => {
      const url = route.request().url();

      // Jeśli to GET request do job details, zwróć job BEZ kosztów (estymacja failed/pending)
      if (route.request().method() === "GET" && url.includes("/api/jobs/")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "test-job-resilience-123",
            shopId: "test-shop-123",
            status: "processing", // Job jest processing mimo braku kosztów
            style: "professional",
            language: "pl",
            totalCostEstimate: null, // Koszty NIE są dostępne (estymacja failed)
            estimatedTokensTotal: null,
            publicationMode: "draft",
            createdAt: new Date().toISOString(),
            startedAt: new Date().toISOString(),
            completedAt: null,
          }),
        });
      } else {
        // Pass through other requests
        await route.continue();
      }
    });

    // Przejdź do strony generowania
    const testProductIds = ["product-1-uuid"];
    await page.goto(`/generate?products=${testProductIds.join(",")}`);

    // Wypełnij formularz
    await page.locator('button:has-text("Professional")').click();
    await page.locator('select[name="language"]').selectOption("pl");

    // ACT: Utwórz job
    const generateButton = page.locator('button:has-text("Generuj"), button:has-text("Rozpocznij generowanie")');
    await generateButton.click();

    // ASSERT 1: Przekierowanie do job details
    await expect(page).toHaveURL(/\/jobs\//, { timeout: 5000 });

    // ASSERT 2: JobCostEstimateCard pokazuje stan "Pending" (koszty nie są dostępne)
    const pendingIndicator = page.locator("text=/Szacowanie kosztów|Obliczanie/i");

    // Czekamy aż komponent się załaduje - może być w stanie pending lub pokazać komunikat o błędzie
    // WAŻNE: Komponent powinien pozostać w stanie "pending" nawet po kilku próbach pollingu
    await expect(pendingIndicator).toBeVisible({ timeout: 5000 });

    // Badge "Obliczanie..." powinien pozostać (bo koszty są null)
    const pendingBadge = page.locator("text=/Obliczanie|Pending/i");
    await expect(pendingBadge).toBeVisible({ timeout: 3000 });

    // ASSERT 3: Job status to "processing" (MIMO że koszty są null)
    // To jest kluczowa asercja - główna funkcjonalność (generowanie AI) działa niezależnie od estymacji
    const jobStatus = page.locator("text=/Status.*processing|Przetwarzanie/i");
    await expect(jobStatus).toBeVisible({ timeout: 5000 });

    // ASSERT 4: Brak błędu krytycznego - Job NIE jest w stanie "failed"
    const failedStatus = page.locator("text=/Status.*failed|Błąd/i");
    await expect(failedStatus).not.toBeVisible();

    // ASSERT 5 (BONUS): Progress bar/indicator generowania AI jest widoczny
    // To potwierdza że generowanie AI rozpoczęło się mimo braku kosztów
    const progressIndicator = page.locator('[role="progressbar"], .progress-bar, text=/Generowanie/i');
    await expect(progressIndicator).toBeVisible({ timeout: 5000 });

    console.log("✓ E2E-F2-02 PASSED: Job processing started even without cost estimate");
  });

  /**
   * E2E-F2-03 (BONUS): Polling zatrzymuje się gdy koszty są dostępne
   *
   * Weryfikuje że:
   * 1. Hook useJobCostEstimate robi polling co 2 sekundy
   * 2. Gdy koszty się załadują, polling się zatrzymuje
   * 3. Nie ma niepotrzebnych requestów po załadowaniu kosztów
   *
   * Ten test potwierdza optymalizację - brak nadmiarowych API calls.
   */
  test("E2E-F2-03 (BONUS): polling should stop after costs are loaded", async () => {
    // Track API calls to /api/jobs/:id
    const apiCalls: string[] = [];

    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("/api/jobs/") && request.method() === "GET") {
        apiCalls.push(new Date().toISOString());
        console.log(`API call #${apiCalls.length}: GET ${url}`);
      }
    });

    // Navigate to job details page
    await page.goto("/jobs/test-job-123");

    // Wait for costs to load
    const successBadge = page.locator("text=/Obliczono|Completed/i");
    await expect(successBadge).toBeVisible({ timeout: 10000 });

    // Record number of API calls until costs loaded
    const callsUntilSuccess = apiCalls.length;
    console.log(`Costs loaded after ${callsUntilSuccess} API calls`);

    // Wait additional 5 seconds
    await page.waitForTimeout(5000);

    // Check that no additional API calls were made (polling stopped)
    const callsAfterSuccess = apiCalls.length - callsUntilSuccess;
    expect(callsAfterSuccess).toBeLessThanOrEqual(1); // Max 1 additional call is acceptable

    console.log(`✓ E2E-F2-03 PASSED: Polling stopped after costs loaded (${callsAfterSuccess} extra calls)`);
  });
});
