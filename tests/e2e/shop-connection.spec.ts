import { test, expect, type Page } from "@playwright/test";
import { LoginPage } from "./page-objects/LoginPage";
import { ShopSettingsPage } from "./page-objects/ShopSettingsPage";

/**
 * E2E Tests dla Zarządzania Połączeniem ze Sklepem Shopify (F3)
 *
 * Scenariusze testowe:
 * 1. E2E-F3-01: Pomyślne dodanie klucza API Shopify
 * 2. E2E-F3-02: Walidacja nieprawidłowego formatu domeny
 * 3. E2E-F3-03: Walidacja nieprawidłowego formatu klucza API
 * 4. E2E-F3-04: Obsługa błędu weryfikacji API (nieprawidłowy klucz)
 * 5. E2E-F3-05: Aktualizacja istniejącego klucza API
 * 6. E2E-F3-06: Usunięcie połączenia ze sklepem
 *
 * Architektura:
 * - PUT /api/shops tworzy/aktualizuje połączenie
 * - DELETE /api/shops usuwa połączenie
 * - Shopify API jest mockowany na poziomie network requestów
 */

test.describe("Shop Connection Management (F3)", () => {
  let page: Page;
  let loginPage: LoginPage;
  let shopSettingsPage: ShopSettingsPage;

  // Test user credentials
  const TEST_USER = {
    email: "kozmp.dev@gmail.com",
    password: "Test1test1",
  };

  // Test shop data
  const TEST_SHOP = {
    domain: "test-shop.myshopify.com",
    apiKey: "shpat_1234567890abcdefghijklmnopqrstuvwxyz",
    invalidDomain: "invalid-domain",
    invalidApiKey: "invalid_key_format",
  };

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    loginPage = new LoginPage(page);
    shopSettingsPage = new ShopSettingsPage(page);

    // Cleanup przed testem - usuń sklep jeśli istnieje
    const context = await browser.newContext();
    const cleanupPage = await context.newPage();
    await cleanupPage.goto("http://localhost:3003/login");
    await cleanupPage.fill("#email", TEST_USER.email);
    await cleanupPage.fill("#password", TEST_USER.password);
    await cleanupPage.click('button[type="submit"]');
    await cleanupPage.waitForTimeout(2000);
    try {
      await cleanupPage.request.delete("http://localhost:3003/api/shops");
    } catch {
      // Ignore if shop doesn't exist
    }
    await cleanupPage.close();
    await context.close();

    // Mock Shopify API requests (zarówno success jak i error)
    await page.route("**/admin/api/**", async (route) => {
      const url = route.request().url();
      const headers = route.request().headers();

      // Sprawdź czy to request z prawidłowym API key
      const authHeader = headers["x-shopify-access-token"] || headers["authorization"];
      const isProdRequest = url.includes(TEST_SHOP.domain);

      if (authHeader === TEST_SHOP.apiKey && isProdRequest) {
        // Success - prawidłowy klucz API
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            shop: {
              id: 123456,
              name: "Test Shop",
              domain: TEST_SHOP.domain,
              email: "shop@example.com",
            },
          }),
        });
      } else {
        // Error - nieprawidłowy klucz API lub domena
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({
            errors: "Unauthorized - Invalid API credentials",
          }),
        });
      }
    });

    // Login przed każdym testem
    await loginPage.goto();
    await loginPage.login(TEST_USER.email, TEST_USER.password);
    await expect(page).toHaveURL("/", { timeout: 10000 });
    await page.waitForLoadState("networkidle");
  });

  test.afterEach(async () => {
    // Cleanup: Usuń sklep jeśli został utworzony
    try {
      await page.request.delete("http://localhost:3003/api/shops");
    } catch (error) {
      // Ignore cleanup errors
      console.log("Cleanup: Shop deletion skipped (may not exist)");
    }
    await page.close();
  });

  /**
   * E2E-F3-01: Pomyślne dodanie klucza API Shopify
   *
   * Weryfikuje że:
   * 1. Użytkownik może otworzyć modal połączenia
   * 2. Wypełnienie formularza prawidłowymi danymi
   * 3. Backend weryfikuje klucz przez Shopify API (mockowany)
   * 4. Połączenie zostaje zapisane w bazie
   * 5. Toast sukcesu jest wyświetlany
   * 6. Status zmienia się na "Connected"
   */
  test("E2E-F3-01: should successfully connect Shopify store with valid credentials", async () => {
    // ARRANGE: Przejdź do strony ustawień sklepu
    await shopSettingsPage.goto();

    // ASSERT: Sklep nie jest połączony
    const isConnected = await shopSettingsPage.isShopConnected();
    expect(isConnected).toBe(false);

    // Przycisk "Connect Shopify Store" powinien być widoczny
    await expect(shopSettingsPage.connectButton).toBeVisible();

    // ACT 1: Otwórz modal połączenia
    await shopSettingsPage.openConnectionModal();

    // ASSERT: Modal jest otwarty
    await expect(shopSettingsPage.modal).toBeVisible();
    await expect(shopSettingsPage.modalTitle).toContainText("Connect Shopify Store");

    // ACT 2: Wypełnij formularz
    await shopSettingsPage.fillConnectionForm(TEST_SHOP.domain, TEST_SHOP.apiKey);

    // ACT 3: Wyślij formularz
    await shopSettingsPage.submitConnectionForm();

    // ASSERT: Toast sukcesu jest wyświetlany
    await shopSettingsPage.waitForToast("Shop connected successfully", 10000);

    // ASSERT: Modal się zamyka
    await expect(shopSettingsPage.modal).toBeHidden({ timeout: 5000 });

    // ASSERT: Status zmienia się na "Connected"
    await page.waitForTimeout(1000); // Czekaj na aktualizację UI
    const isNowConnected = await shopSettingsPage.isShopConnected();
    expect(isNowConnected).toBe(true);

    // ASSERT: Domena sklepu jest wyświetlana
    const displayedDomain = await shopSettingsPage.getShopDomain();
    expect(displayedDomain).toBe(TEST_SHOP.domain);

    // ASSERT: Przyciski "Update API Key" i "Refresh" są widoczne
    await expect(shopSettingsPage.updateApiKeyButton).toBeVisible();
    await expect(shopSettingsPage.refreshButton).toBeVisible();
  });

  /**
   * E2E-F3-02: Walidacja nieprawidłowego formatu domeny
   *
   * Weryfikuje że:
   * 1. Frontend waliduje format domeny (Zod schema)
   * 2. Błąd walidacji jest wyświetlany użytkownikowi
   * 3. Formularz nie jest wysyłany
   */
  test("E2E-F3-02: should show validation error for invalid domain format", async () => {
    // ARRANGE
    await shopSettingsPage.goto();
    await shopSettingsPage.openConnectionModal();

    // ACT: Wypełnij formularz z nieprawidłową domeną
    await shopSettingsPage.fillConnectionForm(TEST_SHOP.invalidDomain, TEST_SHOP.apiKey);
    await shopSettingsPage.submitConnectionForm();

    // ASSERT: Błąd walidacji jest wyświetlany
    await page.waitForTimeout(500); // Czekaj na walidację
    const validationError = await shopSettingsPage.getValidationError();
    expect(validationError).toContain("Invalid Shopify domain format");

    // ASSERT: Modal pozostaje otwarty
    await expect(shopSettingsPage.modal).toBeVisible();

    // ASSERT: Brak toastu sukcesu
    const toastCount = await shopSettingsPage.toast.count();
    expect(toastCount).toBe(0);
  });

  /**
   * E2E-F3-03: Walidacja nieprawidłowego formatu klucza API
   *
   * Weryfikuje że:
   * 1. Frontend waliduje format klucza API (musi zaczynać się od "shpat_")
   * 2. Błąd walidacji jest wyświetlany
   */
  test("E2E-F3-03: should show validation error for invalid API key format", async () => {
    // ARRANGE
    await shopSettingsPage.goto();
    await shopSettingsPage.openConnectionModal();

    // ACT: Wypełnij formularz z nieprawidłowym kluczem API
    await shopSettingsPage.fillConnectionForm(TEST_SHOP.domain, TEST_SHOP.invalidApiKey);
    await shopSettingsPage.submitConnectionForm();

    // ASSERT: Błąd walidacji jest wyświetlany
    await page.waitForTimeout(500);
    const validationError = await shopSettingsPage.getValidationError();
    expect(validationError).toContain("API key must start with 'shpat_'");

    // ASSERT: Modal pozostaje otwarty
    await expect(shopSettingsPage.modal).toBeVisible();
  });

  /**
   * E2E-F3-04: Obsługa błędu weryfikacji API (nieprawidłowy klucz)
   *
   * Weryfikuje że:
   * 1. Backend weryfikuje klucz przez Shopify API
   * 2. Błąd weryfikacji (401) jest obsługiwany
   * 3. Komunikat błędu jest wyświetlany użytkownikowi
   * 4. Połączenie NIE jest zapisywane
   */
  test("E2E-F3-04: should show API error for invalid credentials", async () => {
    // ARRANGE
    const invalidApiKey = "shpat_invalid1234567890abcdefghijklmnopqrstuvwxyz"; // Prawidłowy format, ale niepoprawne credentials
    await shopSettingsPage.goto();
    await shopSettingsPage.openConnectionModal();

    // ACT: Wypełnij formularz z nieprawidłowym kluczem (przejdzie walidację Zod, ale nie Shopify)
    await shopSettingsPage.fillConnectionForm(TEST_SHOP.domain, invalidApiKey);
    await shopSettingsPage.submitConnectionForm();

    // ASSERT: Błąd API jest wyświetlany (w modalu lub jako toast)
    await page.waitForTimeout(2000); // Czekaj na odpowiedź API

    // Może być w modalu jako API error
    const apiError = await shopSettingsPage.getApiError();
    const hasApiError = apiError && apiError.includes("Shopify API key verification failed");

    // Lub jako toast
    const toastVisible = await page.locator('[data-sonner-toast], [role="status"]').count();

    expect(hasApiError || toastVisible > 0).toBeTruthy();

    // ASSERT: Modal pozostaje otwarty (aby użytkownik mógł poprawić dane)
    await expect(shopSettingsPage.modal).toBeVisible();

    // ASSERT: Sklep NIE został połączony
    await shopSettingsPage.cancelModal();
    const isConnected = await shopSettingsPage.isShopConnected();
    expect(isConnected).toBe(false);
  });

  /**
   * E2E-F3-05: Aktualizacja istniejącego klucza API
   *
   * Weryfikuje że:
   * 1. Użytkownik może zaktualizować istniejący klucz API
   * 2. Domena nie może być zmieniona (disabled)
   * 3. Nowy klucz jest weryfikowany i zapisywany
   */
  test("E2E-F3-05: should update existing API key", async () => {
    // ARRANGE: Najpierw połącz sklep
    await shopSettingsPage.goto();
    await shopSettingsPage.connectShop(TEST_SHOP.domain, TEST_SHOP.apiKey);
    await shopSettingsPage.waitForToast("Shop connected successfully");

    // Poczekaj na zamknięcie modala
    await expect(shopSettingsPage.modal).toBeHidden({ timeout: 5000 });

    // ACT: Otwórz modal aktualizacji
    await shopSettingsPage.openUpdateModal();

    // ASSERT: Modal tytuł zmieniony na "Update"
    await expect(shopSettingsPage.modalTitle).toContainText("Update Shopify Connection");

    // ASSERT: Pole domeny jest disabled
    await expect(shopSettingsPage.shopifyDomainInput).toBeDisabled();

    // ACT: Wprowadź nowy klucz API (ten sam w mockach, ale symulujemy update)
    const newApiKey = TEST_SHOP.apiKey; // W prawdziwym scenariuszu byłby inny
    await shopSettingsPage.apiKeyInput.fill(newApiKey);
    await shopSettingsPage.submitConnectionForm();

    // ASSERT: Toast sukcesu aktualizacji
    await shopSettingsPage.waitForToast("Shop connected successfully", 5000);

    // ASSERT: Modal się zamyka
    await expect(shopSettingsPage.modal).toBeHidden({ timeout: 5000 });

    // ASSERT: Sklep nadal połączony
    const isConnected = await shopSettingsPage.isShopConnected();
    expect(isConnected).toBe(true);
  });

  /**
   * E2E-F3-06: Usunięcie połączenia ze sklepem
   *
   * Weryfikuje że:
   * 1. Użytkownik może rozłączyć sklep
   * 2. Potwierdzenie rozłączenia jest wymagane
   * 3. Sklep jest usuwany z bazy (wraz z produktami i jobami - CASCADE)
   * 4. Toast sukcesu jest wyświetlany
   * 5. Status zmienia się na "Not Connected"
   */
  test("E2E-F3-06: should disconnect shop and show confirmation", async () => {
    // ARRANGE: Najpierw połącz sklep
    await shopSettingsPage.goto();
    await shopSettingsPage.connectShop(TEST_SHOP.domain, TEST_SHOP.apiKey);
    await shopSettingsPage.waitForToast("Shop connected successfully");
    await expect(shopSettingsPage.modal).toBeHidden({ timeout: 5000 });

    // Sprawdź że sklep jest połączony
    let isConnected = await shopSettingsPage.isShopConnected();
    expect(isConnected).toBe(true);

    // ACT 1: Otwórz modal aktualizacji i kliknij "Disconnect"
    await shopSettingsPage.openUpdateModal();
    await expect(shopSettingsPage.disconnectButton).toBeVisible();
    await shopSettingsPage.disconnectButton.click();

    // ASSERT: Potwierdzenie rozłączenia jest wyświetlane
    await expect(shopSettingsPage.confirmDisconnectButton).toBeVisible({ timeout: 2000 });

    // Sprawdź czy komunikat ostrzegawczy jest widoczny
    await expect(page.locator("text=/remove all jobs and generated descriptions/i")).toBeVisible();

    // ACT 2: Potwierdź rozłączenie
    await shopSettingsPage.confirmDisconnectButton.click();

    // ASSERT: Toast sukcesu rozłączenia
    await shopSettingsPage.waitForToast("Shop disconnected successfully", 10000);

    // ASSERT: Modal się zamyka
    await expect(shopSettingsPage.modal).toBeHidden({ timeout: 5000 });

    // ASSERT: Status zmienia się na "Not Connected"
    await page.waitForTimeout(1000);
    isConnected = await shopSettingsPage.isShopConnected();
    expect(isConnected).toBe(false);

    // ASSERT: Przycisk "Connect Shopify Store" jest ponownie widoczny
    await expect(shopSettingsPage.connectButton).toBeVisible();

    // ASSERT: Domena nie jest wyświetlana
    const displayedDomain = await shopSettingsPage.getShopDomain();
    expect(displayedDomain).toBeNull();
  });

  /**
   * E2E-F3-07: Anulowanie rozłączenia (Cancel flow)
   *
   * Weryfikuje że:
   * 1. Użytkownik może anulować operację rozłączenia
   * 2. Sklep pozostaje połączony
   */
  test("E2E-F3-07: should cancel disconnect operation", async () => {
    // ARRANGE: Połącz sklep
    await shopSettingsPage.goto();
    await shopSettingsPage.connectShop(TEST_SHOP.domain, TEST_SHOP.apiKey);
    await shopSettingsPage.waitForToast("Shop connected successfully");
    await expect(shopSettingsPage.modal).toBeHidden({ timeout: 5000 });

    // ACT: Otwórz modal i kliknij Disconnect
    await shopSettingsPage.openUpdateModal();
    await shopSettingsPage.disconnectButton.click();
    await expect(shopSettingsPage.confirmDisconnectButton).toBeVisible();

    // ACT: Anuluj operację
    const cancelButton = page.locator('button:has-text("Cancel")').last();
    await cancelButton.click();

    // ASSERT: Formularz wraca do normalnego widoku (nie confirmation)
    await expect(shopSettingsPage.confirmDisconnectButton).toBeHidden({ timeout: 2000 });
    await expect(shopSettingsPage.disconnectButton).toBeVisible();

    // ACT: Zamknij modal
    await shopSettingsPage.cancelModal();

    // ASSERT: Sklep nadal połączony
    const isConnected = await shopSettingsPage.isShopConnected();
    expect(isConnected).toBe(true);
  });
});
