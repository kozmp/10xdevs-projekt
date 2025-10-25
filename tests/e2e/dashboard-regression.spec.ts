import { test, expect, type Page } from "@playwright/test";
import { LoginPage } from "./page-objects/LoginPage";
import { DashboardPage } from "./page-objects/DashboardPage";

/**
 * E2E Tests dla Regresu Dashboardu po wdrożeniu F3 UI
 *
 * Scenariusze testowe:
 * 1. E2E-F5-01: Dashboard bez połączenia (isConnected: false)
 * 2. E2E-F5-02: Dashboard z połączeniem (isConnected: true)
 *
 * Cel: Weryfikacja, że Dashboard działa poprawnie w obu stanach:
 * - Stan NIEPOŁĄCZONY: Sklep nie jest skonfigurowany, modal konfiguracji jest widoczny
 * - Stan POŁĄCZONY: Sklep jest skonfigurowany, wszystkie komponenty ładują się bez błędów
 */

test.describe("Dashboard Regression Tests (F5 - Post F3 Integration)", () => {
  let page: Page;
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  // Test user credentials
  const TEST_USER = {
    email: "kozmp.dev@gmail.com",
    password: "Test1test1",
  };

  // Test shop data (for connected state)
  const TEST_SHOP = {
    domain: "test-shop.myshopify.com",
    apiKey: "shpat_1234567890abcdefghijklmnopqrstuvwxyz",
  };

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);

    // Mock Shopify API requests (success for valid credentials)
    await page.route("**/admin/api/**", async (route) => {
      const headers = route.request().headers();
      const authHeader = headers["x-shopify-access-token"];

      if (authHeader === TEST_SHOP.apiKey) {
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
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ errors: "Unauthorized" }),
        });
      }
    });

    // Login before each test
    await loginPage.goto();
    await loginPage.login(TEST_USER.email, TEST_USER.password);
    await expect(page).toHaveURL("/", { timeout: 10000 });
  });

  test.afterEach(async () => {
    await page.close();
  });

  /**
   * E2E-F5-01: Dashboard bez połączenia (isConnected: false)
   *
   * Cel: Weryfikacja, że Dashboard ładuje się poprawnie gdy sklep NIE jest połączony
   *
   * Weryfikuje że:
   * 1. Strona Dashboard ładuje się bez błędów (nie crashuje)
   * 2. StatusCard wyświetla żółty indicator + "Nieskonfigurowany"
   * 3. Modal konfiguracji klucza API jest widoczny/dostępny
   * 4. Toast informacyjny "Skonfiguruj klucz API" jest wyświetlany
   * 5. Wszystkie komponenty UI są renderowane (nie ma TypeError)
   */
  test("E2E-F5-01: Dashboard loads correctly when shop is NOT connected (isConnected: false)", async () => {
    // ARRANGE: Upewnij się, że sklep nie jest połączony (DELETE /api/shops)
    try {
      await page.request.delete("http://localhost:3003/api/shops");
    } catch {
      // Sklep może nie istnieć - to OK
    }

    // ACT: Odśwież Dashboard
    await dashboardPage.goto();
    await page.waitForLoadState("networkidle");

    // ASSERT 1: Strona się załadowała (bez crashu)
    const isLoaded = await dashboardPage.isLoaded();
    expect(isLoaded).toBe(true);

    // ASSERT 2: Wszystkie komponenty są widoczne
    const allComponentsLoaded = await dashboardPage.areAllComponentsLoaded();
    expect(allComponentsLoaded).toBe(true);

    // ASSERT 3: StatusCard pokazuje stan "Nieskonfigurowany"
    const isDisconnected = await dashboardPage.isShopDisconnected();
    expect(isDisconnected).toBe(true);

    // ASSERT 4: StatusCard pokazuje żółty indicator
    const yellowIndicator = await page.locator('[aria-label="Nieskonfigurowany"]').first();
    await expect(yellowIndicator).toBeVisible();
    await expect(yellowIndicator).toHaveClass(/bg-yellow-500/);

    // ASSERT 5: Toast informacyjny "Skonfiguruj klucz API" jest wyświetlany
    // (może już zniknąć, więc sprawdzamy historię lub obecność)
    const toastCount = await page.locator('text=/Skonfiguruj klucz API/i').count();
    const modalOpen = await dashboardPage.isApiKeyModalOpen();

    // Toast lub modal powinien być widoczny
    expect(toastCount > 0 || modalOpen).toBeTruthy();

    // ASSERT 6: Brak błędów JavaScript (nie crashuje)
    // Sprawdzamy że refresh button jest clickable (aplikacja działa)
    await expect(dashboardPage.refreshButton).toBeVisible();
    await expect(dashboardPage.refreshButton).toBeEnabled();

    // ASSERT 7: Nazwa sklepu NIE jest wyświetlana (bo nie ma połączenia)
    const shopName = await dashboardPage.getShopName();
    expect(shopName).toBeNull();
  });

  /**
   * E2E-F5-02: Dashboard z połączeniem (isConnected: true)
   *
   * Cel: Weryfikacja, że Dashboard działa poprawnie gdy sklep JEST połączony
   *
   * Weryfikuje że:
   * 1. Strona Dashboard ładuje się bez błędów
   * 2. StatusCard wyświetla zielony indicator + "Aktywne"
   * 3. Nazwa sklepu jest wyświetlana
   * 4. ProductsCountCard ładuje się i pokazuje dane
   * 5. RecentJobsTable ładuje się i pokazuje dane
   * 6. Modal konfiguracji NIE jest automatycznie otwierany
   * 7. Wszystkie komponenty renderują się poprawnie
   */
  test("E2E-F5-02: Dashboard loads correctly when shop IS connected (isConnected: true)", async () => {
    // ARRANGE: Połącz sklep przez API
    const connectResponse = await page.request.put("http://localhost:3003/api/shops", {
      data: {
        shopifyDomain: TEST_SHOP.domain,
        apiKey: TEST_SHOP.apiKey,
      },
    });

    expect(connectResponse.ok()).toBe(true);

    // ACT: Odśwież Dashboard
    await dashboardPage.goto();
    await page.waitForLoadState("networkidle");

    // ASSERT 1: Strona się załadowała
    const isLoaded = await dashboardPage.isLoaded();
    expect(isLoaded).toBe(true);

    // ASSERT 2: Wszystkie komponenty są widoczne
    const allComponentsLoaded = await dashboardPage.areAllComponentsLoaded();
    expect(allComponentsLoaded).toBe(true);

    // ASSERT 3: StatusCard pokazuje stan "Aktywne"
    const isConnected = await dashboardPage.isShopConnected();
    expect(isConnected).toBe(true);

    // ASSERT 4: StatusCard pokazuje zielony indicator
    const greenIndicator = await page.locator('[aria-label="Połączono"]').first();
    await expect(greenIndicator).toBeVisible();
    await expect(greenIndicator).toHaveClass(/bg-green-500/);

    // ASSERT 5: Nazwa sklepu jest wyświetlana
    const shopName = await dashboardPage.getShopName();
    expect(shopName).toBe(TEST_SHOP.domain);

    // ASSERT 6: ProductsCountCard jest widoczny i renderuje się poprawnie
    await expect(dashboardPage.productsCountCard).toBeVisible();
    const productsCount = await page.locator('text=/Produkty/i').first();
    await expect(productsCount).toBeVisible();

    // ASSERT 7: RecentJobsTable jest widoczny i renderuje się poprawnie
    await expect(dashboardPage.recentJobsTable).toBeVisible();

    // ASSERT 8: Modal konfiguracji NIE jest automatycznie otwarty
    const modalOpen = await dashboardPage.isApiKeyModalOpen().catch(() => false);
    expect(modalOpen).toBe(false);

    // ASSERT 9: Refresh button działa (aplikacja nie jest crashnięta)
    await expect(dashboardPage.refreshButton).toBeVisible();
    await expect(dashboardPage.refreshButton).toBeEnabled();

    // CLEANUP: Usuń sklep
    await page.request.delete("http://localhost:3003/api/shops");
  });

  /**
   * E2E-F5-03: Dashboard przełączanie stanów (Disconnect → Connect)
   *
   * Cel: Weryfikacja, że Dashboard poprawnie reaguje na zmiany stanu połączenia
   *
   * Weryfikuje że:
   * 1. Przejście ze stanu POŁĄCZONY → NIEPOŁĄCZONY działa poprawnie
   * 2. StatusCard aktualizuje się po disconnect
   * 3. Brak crashów przy zmianie stanu
   */
  test("E2E-F5-03: Dashboard handles state transition (Connected → Disconnected)", async () => {
    // ARRANGE: Połącz sklep
    await page.request.put("http://localhost:3003/api/shops", {
      data: {
        shopifyDomain: TEST_SHOP.domain,
        apiKey: TEST_SHOP.apiKey,
      },
    });

    await dashboardPage.goto();
    await page.waitForLoadState("networkidle");

    // ASSERT: Sklep jest połączony
    let isConnected = await dashboardPage.isShopConnected();
    expect(isConnected).toBe(true);

    // ACT: Usuń sklep (symulacja disconnect)
    await page.request.delete("http://localhost:3003/api/shops");

    // Odśwież Dashboard
    await dashboardPage.refresh();
    await page.waitForLoadState("networkidle");

    // ASSERT: Dashboard się załadował (nie crashnął)
    const isLoaded = await dashboardPage.isLoaded();
    expect(isLoaded).toBe(true);

    // ASSERT: StatusCard pokazuje stan "Nieskonfigurowany"
    const isDisconnected = await dashboardPage.isShopDisconnected();
    expect(isDisconnected).toBe(true);

    // ASSERT: Wszystkie komponenty nadal renderują się
    const allComponentsLoaded = await dashboardPage.areAllComponentsLoaded();
    expect(allComponentsLoaded).toBe(true);
  });
});
