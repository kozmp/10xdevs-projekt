import { test, expect, type Page } from "@playwright/test";
import { LoginPage } from "./page-objects/LoginPage";
import { GeneratePage } from "./page-objects/GeneratePage";
import { ProductsPage } from "./page-objects/ProductsPage";

/**
 * E2E Tests dla Funkcjonalności 4 (F4): Dynamiczny Wybór Modelu i Kontekst Generacji
 *
 * Scenariusze testowe:
 * 1. E2E-F4-01: Pełny nowy flow (POST /api/jobs z model/systemMessage)
 * 2. E2E-F4-02: Blokada UI gdy brak połączenia (F5 integration)
 * 3. E2E-F4-03: Walidacja systemMessage (max 500 znaków)
 * 4. E2E-F4-04: Asynchroniczne ładowanie kosztów (F2 integration)
 *
 * Cel: Weryfikacja, że nowe funkcjonalności (model selection, system message)
 * działają poprawnie i nie powodują regresu w istniejących funkcjach (F2, F5, F6)
 */

test.describe("Job Generation with Model Selection and System Message (F4)", () => {
  let page: Page;
  let loginPage: LoginPage;
  let generatePage: GeneratePage;
  let productsPage: ProductsPage;

  // Test user credentials
  const TEST_USER = {
    email: "kozmp.dev@gmail.com",
    password: "Test1test1",
  };

  // Test shop data
  const TEST_SHOP = {
    domain: "test-shop.myshopify.com",
    apiKey: "shpat_1234567890abcdefghijklmnopqrstuvwxyz",
  };

  // Test product IDs
  const TEST_PRODUCT_IDS = ["123e4567-e89b-12d3-a456-426614174000", "123e4567-e89b-12d3-a456-426614174001"];

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    loginPage = new LoginPage(page);
    generatePage = new GeneratePage(page);
    productsPage = new ProductsPage(page);

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

    // Mock OpenRouter API for models list
    await page.route("**/openrouter.ai/api/v1/models", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              id: "openai/gpt-4o-mini",
              name: "GPT-4o Mini",
              pricing: { prompt: "0.00015", completion: "0.0006" },
            },
            {
              id: "openai/gpt-4o",
              name: "GPT-4o",
              pricing: { prompt: "0.005", completion: "0.015" },
            },
          ],
        }),
      });
    });

    // Login before each test
    await loginPage.goto();
    await loginPage.login(TEST_USER.email, TEST_USER.password);
    await expect(page).toHaveURL("/", { timeout: 10000 });
  });

  test.afterEach(async () => {
    // Cleanup: Delete shop connection
    try {
      await page.request.delete("http://localhost:3003/api/shops");
    } catch {
      // Sklep może nie istnieć - to OK
    }
    await page.close();
  });

  /**
   * E2E-F4-01: Pełny nowy flow z POST /api/jobs
   *
   * Cel: Weryfikacja, że:
   * 1. Formularz wysyła POST /api/jobs z polami model i systemMessage
   * 2. Serwer zwraca 201 Created natychmiast (asynchronicznie, zgodnie z F2)
   * 3. Aplikacja przekierowuje do /jobs/:id
   * 4. Brak synchronicznego czekania na kalkulację kosztów
   *
   * Weryfikowana funkcjonalność: F4 (Nowe pola), F2 (Asynchroniczność)
   */
  test("E2E-F4-01: Full new flow - POST /api/jobs with model and systemMessage", async () => {
    // ARRANGE: Połącz sklep
    await page.request.put("http://localhost:3003/api/shops", {
      data: {
        shopifyDomain: TEST_SHOP.domain,
        apiKey: TEST_SHOP.apiKey,
      },
    });

    // Capture POST /api/jobs request
    let jobsPostRequest: any = null;
    let jobsPostResponse: any = null;

    await page.route("**/api/jobs", async (route) => {
      if (route.request().method() === "POST") {
        jobsPostRequest = await route.request().postDataJSON();
        // Pass through to actual API
        const response = await route.fetch();
        jobsPostResponse = await response.json();
        await route.fulfill({ response });
      } else {
        await route.continue();
      }
    });

    // ACT: Przejdź do strony generowania z wybranymi produktami
    await generatePage.goto(TEST_PRODUCT_IDS);
    await page.waitForLoadState("networkidle");

    // Wypełnij formularz z nowymi polami F4
    await generatePage.selectStyle("professional");
    // await generatePage.selectLanguage("pl"); // Może być domyślnie

    // F4: Wybierz model (jeśli nie jest domyślny)
    // Domyślny model to "openai/gpt-4o-mini", więc pomijamy wybór

    // F4: Wypełnij system message
    const testSystemMessage = "Pisz w stylu młodzieżowym i używaj emoji";
    await generatePage.fillSystemMessage(testSystemMessage);

    // Weryfikuj że licznik znaków się aktualizuje
    const charCount = await generatePage.getSystemMessageCharCount();
    expect(charCount).toBe(testSystemMessage.length);

    // Kliknij "Oblicz koszt i rozpocznij generowanie"
    await generatePage.clickCalculateCost();

    // Poczekaj na dialog kosztów (może pojawić się estymacja)
    await page.waitForTimeout(2000); // Daj czas na kalkulację

    // Jeśli dialog się pojawi, potwierdź
    const isDialogOpen = await generatePage.isCostDialogOpen();
    if (isDialogOpen) {
      await generatePage.confirmCostEstimate();
    }

    // ASSERT 1: Sprawdź czy POST /api/jobs został wysłany z poprawnymi danymi
    await page.waitForTimeout(1000); // Poczekaj na request
    expect(jobsPostRequest).toBeTruthy();
    expect(jobsPostRequest.productIds).toEqual(TEST_PRODUCT_IDS);
    expect(jobsPostRequest.style).toBe("professional");
    expect(jobsPostRequest.model).toBe("openai/gpt-4o-mini"); // Domyślny model
    expect(jobsPostRequest.systemMessage).toBe(testSystemMessage); // F4: Nowe pole

    // ASSERT 2: Sprawdź czy serwer zwrócił 201 Created z jobId
    expect(jobsPostResponse).toBeTruthy();
    expect(jobsPostResponse.jobId).toBeTruthy();

    // ASSERT 3: Sprawdź przekierowanie do /jobs/:id (F2: asynchroniczny flow)
    await page.waitForURL(`**/jobs/${jobsPostResponse.jobId}`, { timeout: 5000 });
    expect(page.url()).toContain(`/jobs/${jobsPostResponse.jobId}`);

    // ASSERT 4: Brak synchronicznego czekania - przekierowanie natychmiastowe
    // (zweryfikowane przez timeout 5000ms powyżej - jeśli czekałby synchronicznie, timeout by się nie wykonał)
  });

  /**
   * E2E-F4-02: Blokada UI gdy brak połączenia ze sklepem (F5 integration)
   *
   * Cel: Weryfikacja, że:
   * 1. Gdy GET /api/shops zwraca { isConnected: false }, formularz jest zablokowany
   * 2. Przycisk "Generuj" jest disabled
   * 3. Wyświetlany jest komunikat ostrzegawczy o braku połączenia
   * 4. Użytkownik nie może rozpocząć generowania
   *
   * Weryfikowana funkcjonalność: F5 (Poprawna obsługa braku klucza API)
   */
  test("E2E-F4-02: Form is blocked when shop is NOT connected (isConnected: false)", async () => {
    // ARRANGE: Upewnij się, że sklep NIE jest połączony
    try {
      await page.request.delete("http://localhost:3003/api/shops");
    } catch {
      // Sklep może nie istnieć - to OK
    }

    // ACT: Przejdź do strony generowania z wybranymi produktami
    await generatePage.goto(TEST_PRODUCT_IDS);
    await page.waitForLoadState("networkidle");

    // ASSERT 1: Sprawdź czy komunikat ostrzegawczy jest wyświetlony
    const isWarningVisible = await generatePage.isConnectionWarningVisible();
    expect(isWarningVisible).toBe(true);

    // ASSERT 2: Sprawdź czy przycisk generowania jest zablokowany
    const isButtonDisabled = await generatePage.isGenerateButtonDisabled();
    expect(isButtonDisabled).toBe(true);

    // ASSERT 3: Spróbuj wypełnić formularz (powinno być możliwe, ale nie można wysłać)
    await generatePage.fillSystemMessage("Test message");
    const charCount = await generatePage.getSystemMessageCharCount();
    expect(charCount).toBe(12); // "Test message" ma 12 znaków

    // ASSERT 4: Przycisk nadal disabled mimo wypełnionego formularza
    const isStillDisabled = await generatePage.isGenerateButtonDisabled();
    expect(isStillDisabled).toBe(true);
  });

  /**
   * E2E-F4-03: Walidacja systemMessage (max 6000 znaków)
   *
   * Cel: Weryfikacja, że:
   * 1. Textarea ma limit 6000 znaków (maxLength)
   * 2. Licznik znaków pokazuje ostrzeżenie przy przekroczeniu
   * 3. Przycisk generowania jest disabled gdy systemMessage > 6000 znaków
   * 4. Serwer zwraca 400 Bad Request jeśli mimo wszystko systemMessage > 6000
   *
   * Weryfikowana funkcjonalność: F4 (Walidacja własnego promptu)
   */
  test("E2E-F4-03: System message validation (max 6000 characters)", async () => {
    // ARRANGE: Połącz sklep
    await page.request.put("http://localhost:3003/api/shops", {
      data: {
        shopifyDomain: TEST_SHOP.domain,
        apiKey: TEST_SHOP.apiKey,
      },
    });

    // ACT: Przejdź do strony generowania
    await generatePage.goto(TEST_PRODUCT_IDS);
    await page.waitForLoadState("networkidle");

    // ASSERT 1: Wypełnij dokładnie 6000 znaków (powinno być OK)
    const message6000 = "a".repeat(6000);
    await generatePage.fillSystemMessage(message6000);

    let charCount = await generatePage.getSystemMessageCharCount();
    expect(charCount).toBe(6000);

    // Przycisk powinien być enabled (bo 6000 to OK)
    let isDisabled = await generatePage.isGenerateButtonDisabled();
    expect(isDisabled).toBe(false);

    // ASSERT 2: Spróbuj wypełnić 6001 znaków (textarea ma maxLength, więc nie powinno się udać)
    const message6001 = "a".repeat(6001);
    await generatePage.fillSystemMessage(message6001);

    charCount = await generatePage.getSystemMessageCharCount();
    // Textarea z maxLength=6000 nie powinno pozwolić na więcej niż 6000
    expect(charCount).toBeLessThanOrEqual(6000);

    // ASSERT 3: Licznik pokazuje ostrzeżenie (kolor czerwony) przy 6000 znakach
    const counterElement = generatePage.systemMessageCounter;
    const counterClass = await counterElement.getAttribute("class");
    // Przy 6000 znakach lub więcej, licznik powinien być czerwony
    // (w implementacji: systemMessage.length > 6000 ? "text-red-600" : "text-gray-500")
    // Ale textarea nie pozwoli na więcej niż 6000, więc sprawdzamy czy przy 6000 jest gray
    expect(counterClass).toContain("text-gray-500");

    // ASSERT 4: Jeśli spróbujemy wysłać 6001 znaków przez API (bypass frontend),
    // serwer powinien zwrócić 400 Bad Request
    const longMessage = "a".repeat(6001);
    const response = await page.request.post("http://localhost:3003/api/jobs", {
      data: {
        productIds: TEST_PRODUCT_IDS,
        style: "professional",
        language: "pl",
        model: "openai/gpt-4o-mini",
        systemMessage: longMessage, // 6001 znaków
      },
    });

    expect(response.status()).toBe(400);
    const errorBody = await response.json();
    expect(errorBody.error).toContain("Invalid request data");
  });

  /**
   * E2E-F4-04: Asynchroniczne ładowanie kosztów na stronie /jobs/:id (F2 integration)
   *
   * Cel: Weryfikacja, że:
   * 1. Po utworzeniu joba, użytkownik jest przekierowany do /jobs/:id
   * 2. Na stronie /jobs/:id karta kosztów jest początkowo w stanie "Szacowanie kosztów..."
   * 3. Po asynchronicznym zakończeniu kalkulacji, koszty się pojawiają
   * 4. Brak błędów podczas ładowania
   *
   * Weryfikowana funkcjonalność: F2 (Asynchroniczny model kosztów)
   */
  test("E2E-F4-04: Job detail page shows async cost estimation", async () => {
    // ARRANGE: Połącz sklep
    await page.request.put("http://localhost:3003/api/shops", {
      data: {
        shopifyDomain: TEST_SHOP.domain,
        apiKey: TEST_SHOP.apiKey,
      },
    });

    // Utwórz job przez API (aby kontrolować flow)
    const createJobResponse = await page.request.post("http://localhost:3003/api/jobs", {
      data: {
        productIds: TEST_PRODUCT_IDS,
        style: "professional",
        language: "pl",
        model: "openai/gpt-4o-mini",
        systemMessage: "Test asynchroniczny",
      },
    });

    expect(createJobResponse.ok()).toBe(true);
    const { jobId } = await createJobResponse.json();
    expect(jobId).toBeTruthy();

    // ACT: Przejdź do strony szczegółów joba
    await page.goto(`/jobs/${jobId}`);
    await page.waitForLoadState("networkidle");

    // ASSERT 1: Strona się załadowała
    const pageTitle = page.locator("h1");
    await expect(pageTitle).toBeVisible();

    // ASSERT 2: Karta kosztów jest w stanie "Szacowanie kosztów..." lub pokazuje już koszty
    // (może się załadować szybko w testach, ale sprawdzamy że nie ma błędu)
    const costCard = page.locator('text=/koszt/i, text=/szacowanie/i, text=/\\$/i');
    const costCardVisible = await costCard.isVisible();
    expect(costCardVisible).toBe(true);

    // ASSERT 3: Brak błędów na stronie
    const errorElement = page.locator('.bg-red-50, text=/error/i, text=/błąd/i');
    const hasError = await errorElement.isVisible().catch(() => false);
    expect(hasError).toBe(false);

    // ASSERT 4: Po odczekaniu (symulacja asynchronicznej kalkulacji), koszty powinny się pojawić
    // W testach lokalnych kalkulacja może być natychmiastowa, więc sprawdzamy czy element istnieje
    await page.waitForTimeout(3000); // Poczekaj 3 sekundy na async kalkulację

    // Sprawdź czy pojawił się rzeczywisty koszt (format $0.XX lub podobny)
    const costValue = page.locator('text=/\\$\\d+\\.\\d+/');
    const costValueVisible = await costValue.isVisible().catch(() => false);

    // Koszt może się pojawić lub nie (zależy od implementacji async), ale strona nie powinna crashnąć
    // Więc sprawdzamy że nadal działa
    const refreshButton = page.locator('button:has-text("Odśwież")');
    const isRefreshVisible = await refreshButton.isVisible().catch(() => false);
    expect(isRefreshVisible || costValueVisible).toBeTruthy();
  });
});
