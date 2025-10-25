import { Page, Locator } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly refreshButton: Locator;
  readonly statusCard: Locator;
  readonly productsCountCard: Locator;
  readonly recentJobsTable: Locator;

  // Status Card elements
  readonly statusCardTitle: Locator;
  readonly statusIndicator: Locator;
  readonly statusLabel: Locator;

  // API Key Modal
  readonly apiKeyModal: Locator;
  readonly modalTitle: Locator;

  // Toast notifications
  readonly toast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1:has-text("Dashboard")');
    this.refreshButton = page.locator('button:has-text("Odśwież")');
    this.statusCard = page.locator("section").first();
    this.productsCountCard = page.locator("section").nth(1);
    this.recentJobsTable = page.locator("section").last();

    // Status Card
    this.statusCardTitle = page.locator('text="Status połączenia"');
    this.statusIndicator = page.locator('[aria-label*="Połączono"], [aria-label*="Nieskonfigurowany"]').first();
    this.statusLabel = page.locator('text=/^(Aktywne|Nieskonfigurowany)$/').first();

    // API Key Modal
    this.apiKeyModal = page.locator('[role="dialog"]');
    this.modalTitle = this.apiKeyModal.locator("h2, h3").first();

    // Toast
    this.toast = page.locator('[data-sonner-toast], [role="status"]');
  }

  async goto() {
    await this.page.goto("/");
  }

  async isLoaded(): Promise<boolean> {
    return await this.pageTitle.isVisible();
  }

  async refresh() {
    await this.refreshButton.click();
  }

  /**
   * Sprawdza czy sklep jest połączony (zielony indicator + "Aktywne")
   */
  async isShopConnected(): Promise<boolean> {
    try {
      // Sprawdź aria-label zawierający "Połączono"
      const indicator = this.page.locator('[aria-label="Połączono"]');
      const isVisible = await indicator.isVisible({ timeout: 2000 });
      if (!isVisible) return false;

      // Dodatkowe sprawdzenie - tekst "Aktywne"
      const activeText = await this.page.locator('text="Aktywne"').count();
      return activeText > 0;
    } catch {
      return false;
    }
  }

  /**
   * Sprawdza czy sklep NIE jest połączony (żółty indicator + "Nieskonfigurowany")
   */
  async isShopDisconnected(): Promise<boolean> {
    try {
      const indicator = this.page.locator('[aria-label="Nieskonfigurowany"]');
      const isVisible = await indicator.isVisible({ timeout: 2000 });
      if (!isVisible) return false;

      const disconnectedText = await this.page.locator('text="Nieskonfigurowany"').count();
      return disconnectedText > 0;
    } catch {
      return false;
    }
  }

  /**
   * Sprawdza czy modal konfiguracji API jest otwarty
   */
  async isApiKeyModalOpen(): Promise<boolean> {
    return await this.apiKeyModal.isVisible({ timeout: 3000 });
  }

  /**
   * Czeka na toast z określonym tekstem
   */
  async waitForToast(text: string, timeout = 5000): Promise<void> {
    await this.page.locator(`text=${text}`).waitFor({ timeout });
  }

  /**
   * Pobiera nazwę sklepu z StatusCard (jeśli jest połączony)
   */
  async getShopName(): Promise<string | null> {
    try {
      const shopNameElement = this.page.locator('text=/Sklep: (.+)$/').first();
      const text = await shopNameElement.textContent({ timeout: 2000 });
      return text?.replace("Sklep: ", "") || null;
    } catch {
      return null;
    }
  }

  /**
   * Sprawdza czy wszystkie komponenty Dashboardu są załadowane
   */
  async areAllComponentsLoaded(): Promise<boolean> {
    const title = await this.pageTitle.isVisible();
    const statusCardVisible = await this.statusCardTitle.isVisible();
    const productsCardVisible = await this.productsCountCard.isVisible();
    const jobsTableVisible = await this.recentJobsTable.isVisible();

    return title && statusCardVisible && productsCardVisible && jobsTableVisible;
  }
}
