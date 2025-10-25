import { test, expect, type Page } from "@playwright/test";
import { LoginPage } from "./page-objects/LoginPage";
import { GeneratePage } from "./page-objects/GeneratePage";

/**
 * E2E Tests dla Cost Estimation (FR-017/018)
 *
 * Scenariusze testowe:
 * 1. Pełny flow: Wybór produktów → Kalkulacja kosztów → Potwierdzenie → Start generowania
 * 2. Zmiana modelu AI wpływa na kalkulację kosztów
 * 3. Error handling: Brak produktów
 */

test.describe("Cost Estimation Feature (FR-017/018)", () => {
  let page: Page;
  let loginPage: LoginPage;
  let generatePage: GeneratePage;

  // Test user credentials (zakładamy że test user już istnieje w bazie)
  const TEST_USER_EMAIL = "test@example.com";
  const TEST_USER_PASSWORD = "TestPassword123!";

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    loginPage = new LoginPage(page);
    generatePage = new GeneratePage(page);

    // Login before each test
    await loginPage.goto();
    await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test.afterEach(async () => {
    await page.close();
  });

  /**
   * SCENARIUSZ 1: Pełny flow kalkulacji kosztów i rozpoczęcia generowania
   *
   * Kroki:
   * 1. Przejdź do strony generate
   * 2. Wybierz produkty (minimum 2)
   * 3. Wybierz styl (professional), język (pl), model (gpt-4o-mini)
   * 4. Kliknij "Oblicz koszt i rozpocznij generowanie"
   * 5. Zweryfikuj otwarcie dialogu z kalkulacją
   * 6. Sprawdź czy wyświetla się:
   *    - Total cost > 0
   *    - Token breakdown (input + output)
   *    - Estimated duration
   *    - Product count
   * 7. Kliknij "Potwierdź i rozpocznij"
   * 8. Zweryfikuj że dialog się zamyka i rozpoczyna się generowanie
   */
  test("should display cost estimate and start generation on confirmation", async () => {
    // Navigate to generate page with 3 test products
    const testProductIds = ["test-product-1", "test-product-2", "test-product-3"];
    await generatePage.goto(testProductIds);
    await expect(page.locator("h1")).toContainText("Generowanie opisów produktów");

    // Zakładamy że mamy produkty w sklepie - wybieramy 3 produkty
    // (W rzeczywistym scenariuszu to byłoby poprzez ProductsPage -> select -> generate)
    // Tu symulujemy że jesteśmy już na /generate z wybranymi produktami

    // Select style
    await page.locator('button:has-text("Professional")').click();

    // Select language
    await page.locator('select[aria-label*="Język"], select[name*="language"]').selectOption("pl");

    // Select model (should be pre-selected gpt-4o-mini)
    const modelRadio = page.locator('input[type="radio"][value="openai/gpt-4o-mini"]');
    await expect(modelRadio).toBeChecked({ timeout: 5000 });

    // Click "Calculate cost" button
    const calculateButton = page.locator('button:has-text("Oblicz koszt i rozpocznij generowanie")');
    await expect(calculateButton).toBeVisible();
    await calculateButton.click();

    // Wait for calculation to complete and dialog to open
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Szacunkowy Koszt Generowania")).toBeVisible();

    // Verify cost estimate content
    const dialog = page.locator('[role="dialog"]');

    // Total cost should be displayed (format: $0.00XXXX)
    await expect(dialog.locator("text=/\\$0\\.\\d+/")).toBeVisible();

    // Token breakdown
    await expect(dialog.locator("text=Input Tokens")).toBeVisible();
    await expect(dialog.locator("text=Output Tokens")).toBeVisible();

    // Product count
    await expect(dialog.locator("text=/\\d+ produkt/")).toBeVisible();

    // Estimated duration
    await expect(dialog.locator("text=/\\d+s|\\d+m/")).toBeVisible();

    // Model name
    await expect(dialog.locator("text=/gpt-4o-mini/")).toBeVisible();

    // Confirm button should be present
    const confirmButton = dialog.locator('button:has-text("Potwierdź i rozpocznij")');
    await expect(confirmButton).toBeVisible();

    // Click confirm
    await confirmButton.click();

    // Dialog should close
    await expect(dialog).not.toBeVisible({ timeout: 5000 });

    // Generation should start - verify progress bar appears
    await expect(page.locator('[role="progressbar"], .progress-bar')).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=/Generowanie/i")).toBeVisible();
  });

  /**
   * SCENARIUSZ 2: Zmiana modelu AI wpływa na kalkulację kosztów
   *
   * Kroki:
   * 1. Wybierz model gpt-4o-mini i oblicz koszt
   * 2. Zapisz koszt z pierwszej kalkulacji
   * 3. Zamknij dialog
   * 4. Zmień model na gpt-4o (droższy)
   * 5. Ponownie oblicz koszt
   * 6. Zweryfikuj że:
   *    - Koszt się zmienił (wzrósł)
   *    - Liczba tokenów pozostała taka sama
   *    - Model w dialogu to gpt-4o
   */
  test("should recalculate cost when model is changed", async () => {
    const testProductIds = ["test-product-1", "test-product-2"];
    await generatePage.goto(testProductIds);

    // Select professional style + Polish language
    await page.locator('button:has-text("Professional")').click();
    await page.locator('select[aria-label*="Język"], select[name*="language"]').selectOption("pl");

    // First calculation with gpt-4o-mini
    await page.locator('input[type="radio"][value="openai/gpt-4o-mini"]').check();
    await page.locator('button:has-text("Oblicz koszt i rozpocznij generowanie")').click();

    // Wait for dialog
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10000 });

    // Extract first cost
    const firstCostText = await page.locator('[role="dialog"] >> text=/\\$0\\.\\d+/').first().textContent();
    expect(firstCostText).toBeTruthy();
    const firstCost = parseFloat(firstCostText!.replace("$", ""));

    // Extract token count
    const firstTokensText = await page.locator('[role="dialog"] >> text=/\\d+.*tokenów/i').first().textContent();
    expect(firstTokensText).toBeTruthy();

    // Close dialog (cancel button)
    await page.locator('[role="dialog"] >> button:has-text("Anuluj")').click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 3000 });

    // Change to gpt-4o (more expensive model)
    const gpt4oRadio = page.locator('input[type="radio"][value="openai/gpt-4o"]');
    if (await gpt4oRadio.count() > 0) {
      await gpt4oRadio.check();

      // Recalculate
      await page.locator('button:has-text("Oblicz koszt i rozpocznij generowanie")').click();
      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10000 });

      // Extract second cost
      const secondCostText = await page.locator('[role="dialog"] >> text=/\\$0\\.\\d+/').first().textContent();
      expect(secondCostText).toBeTruthy();
      const secondCost = parseFloat(secondCostText!.replace("$", ""));

      // Verify cost increased (gpt-4o is more expensive)
      expect(secondCost).toBeGreaterThan(firstCost);

      // Verify model name changed
      await expect(page.locator('[role="dialog"] >> text=/gpt-4o/i')).toBeVisible();

      // Token count should remain similar (same products/style/language)
      const secondTokensText = await page.locator('[role="dialog"] >> text=/\\d+.*tokenów/i').first().textContent();
      expect(secondTokensText).toBeTruthy();
      // Allow small variance in token estimation
      expect(secondTokensText).toContain(firstTokensText!.match(/\\d+/)?.[0] || "");
    } else {
      console.warn("gpt-4o model not available in test environment, skipping model comparison");
    }
  });

  /**
   * SCENARIUSZ 3: Error handling - brak wybranych produktów
   *
   * Kroki:
   * 1. Przejdź do /generate bez wybranych produktów (0 produktów)
   * 2. Wypełnij formularz (styl, język, model)
   * 3. Kliknij "Oblicz koszt"
   * 4. Zweryfikuj że:
   *    - Przycisk jest disabled ALBO
   *    - Wyświetla się błąd o braku produktów
   */
  test("should show error when no products selected", async () => {
    // Navigate directly to /generate without product selection
    await page.goto("/generate");
    await expect(page.locator("h1")).toContainText("Generowanie opisów produktów");

    // Verify product count is 0
    await expect(page.locator("text=/Wybrane produkty: 0/")).toBeVisible();

    // Try to calculate cost
    const calculateButton = page.locator('button:has-text("Oblicz koszt i rozpocznij generowanie")');

    // Button should be disabled when no products selected
    await expect(calculateButton).toBeDisabled();

    // Alternative: If button is not disabled, clicking should show error
    if (await calculateButton.isEnabled()) {
      await calculateButton.click();

      // Should show error toast or error message
      const errorMessage = page.locator("text=/produkty|products|wymagane|required/i");
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    }
  });

  /**
   * SCENARIUSZ 4 (BONUS): Cancel flow - dialog można zamknąć bez rozpoczynania
   *
   * Kroki:
   * 1. Otwórz dialog z kalkulacją
   * 2. Kliknij "Anuluj"
   * 3. Zweryfikuj że:
   *    - Dialog się zamyka
   * 4. Generowanie NIE rozpoczyna się
   */
  test("should allow canceling cost estimate dialog without starting generation", async () => {
    const testProductIds = ["test-product-1"];
    await generatePage.goto(testProductIds);

    // Setup and calculate
    await page.locator('button:has-text("Professional")').click();
    await page.locator('input[type="radio"][value="openai/gpt-4o-mini"]').check();
    await page.locator('button:has-text("Oblicz koszt i rozpocznij generowanie")').click();

    // Wait for dialog
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 10000 });

    // Click cancel
    await dialog.locator('button:has-text("Anuluj")').click();

    // Dialog should close
    await expect(dialog).not.toBeVisible({ timeout: 3000 });

    // Verify generation did NOT start (no progress bar)
    const progressBar = page.locator('[role="progressbar"], .progress-bar, text=/Generowanie\\.\\.\\.?/i');
    await expect(progressBar).not.toBeVisible();
  });
});
