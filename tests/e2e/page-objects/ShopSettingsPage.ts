import { Page, Locator } from "@playwright/test";

/**
 * Page Object dla strony ustawień sklepu (/shop-settings)
 *
 * Reprezentuje elementy i akcje dostępne na stronie zarządzania połączeniem Shopify
 */
export class ShopSettingsPage {
  readonly page: Page;

  // Status Card Elements
  readonly connectionStatusBadge: Locator;
  readonly shopDomainDisplay: Locator;
  readonly connectButton: Locator;
  readonly updateApiKeyButton: Locator;
  readonly refreshButton: Locator;

  // Modal Elements
  readonly modal: Locator;
  readonly modalTitle: Locator;
  readonly shopifyDomainInput: Locator;
  readonly apiKeyInput: Locator;
  readonly modalSubmitButton: Locator;
  readonly modalCancelButton: Locator;
  readonly disconnectButton: Locator;
  readonly confirmDisconnectButton: Locator;

  // Error/Success Messages
  readonly apiErrorMessage: Locator;
  readonly validationError: Locator;
  readonly toast: Locator;

  constructor(page: Page) {
    this.page = page;

    // Status Card
    this.connectionStatusBadge = page.getByTestId('connection-badge');
    this.shopDomainDisplay = page.locator('text=Shop Domain:').locator('..').locator('span.font-medium');
    this.connectButton = page.getByTestId('connect-button');
    this.updateApiKeyButton = page.getByTestId('update-api-key-button');
    this.refreshButton = page.getByTestId('refresh-button');

    // Modal (Dialog)
    this.modal = page.getByTestId('shop-connection-modal');
    this.modalTitle = page.getByTestId('modal-title');
    this.shopifyDomainInput = page.getByTestId('shopify-domain-input');
    this.apiKeyInput = page.getByTestId('api-key-input');
    this.modalSubmitButton = page.getByTestId('submit-button');
    this.modalCancelButton = page.getByTestId('cancel-button');
    this.disconnectButton = page.getByTestId('disconnect-button');
    this.confirmDisconnectButton = page.getByTestId('confirm-disconnect-button');

    // Messages
    this.apiErrorMessage = this.modal.locator('[role="alert"]').first();
    this.validationError = page.getByTestId('domain-error').or(page.getByTestId('apikey-error'));
    this.toast = page.locator('[data-sonner-toast], [role="status"], .sonner-toast');
  }

  /**
   * Przejdź do strony ustawień sklepu
   */
  async goto() {
    await this.page.goto("/shop-settings");
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Sprawdź czy sklep jest połączony
   */
  async isShopConnected(): Promise<boolean> {
    try {
      const badgeText = await this.connectionStatusBadge.textContent();
      return badgeText?.includes("Connected") || false;
    } catch {
      return false;
    }
  }

  /**
   * Otwórz modal połączenia
   */
  async openConnectionModal() {
    await this.connectButton.click();
    await this.modal.waitFor({ state: "visible" });
  }

  /**
   * Otwórz modal aktualizacji klucza API
   */
  async openUpdateModal() {
    await this.updateApiKeyButton.click();
    await this.modal.waitFor({ state: "visible" });
  }

  /**
   * Wypełnij formularz połączenia ze sklepem
   */
  async fillConnectionForm(shopifyDomain: string, apiKey: string) {
    await this.shopifyDomainInput.fill(shopifyDomain);
    await this.apiKeyInput.fill(apiKey);
  }

  /**
   * Wyślij formularz połączenia
   */
  async submitConnectionForm() {
    await this.modalSubmitButton.click();
  }

  /**
   * Połącz sklep (pełny flow)
   */
  async connectShop(shopifyDomain: string, apiKey: string) {
    await this.openConnectionModal();
    await this.fillConnectionForm(shopifyDomain, apiKey);
    await this.submitConnectionForm();
  }

  /**
   * Zaktualizuj klucz API (pełny flow)
   */
  async updateApiKey(apiKey: string) {
    await this.openUpdateModal();
    await this.apiKeyInput.fill(apiKey);
    await this.submitConnectionForm();
  }

  /**
   * Rozłącz sklep (pełny flow)
   */
  async disconnectShop() {
    await this.disconnectButton.click();
    await this.confirmDisconnectButton.waitFor({ state: "visible" });
    await this.confirmDisconnectButton.click();
  }

  /**
   * Anuluj operację w modalu
   */
  async cancelModal() {
    await this.modalCancelButton.click();
    await this.modal.waitFor({ state: "hidden" });
  }

  /**
   * Pobierz tekst błędu API
   */
  async getApiError(): Promise<string | null> {
    try {
      return await this.apiErrorMessage.textContent();
    } catch {
      return null;
    }
  }

  /**
   * Pobierz tekst błędu walidacji
   */
  async getValidationError(): Promise<string | null> {
    try {
      const errors = await this.validationError.allTextContents();
      return errors.join(", ");
    } catch {
      return null;
    }
  }

  /**
   * Poczekaj na toast notification
   */
  async waitForToast(text?: string, timeout = 5000): Promise<void> {
    if (text) {
      await this.toast.filter({ hasText: text }).waitFor({ state: "visible", timeout });
    } else {
      await this.toast.first().waitFor({ state: "visible", timeout });
    }
  }

  /**
   * Pobierz tekst z toast notification
   */
  async getToastText(): Promise<string | null> {
    try {
      return await this.toast.first().textContent();
    } catch {
      return null;
    }
  }

  /**
   * Pobierz wyświetlaną domenę sklepu
   */
  async getShopDomain(): Promise<string | null> {
    try {
      return await this.shopDomainDisplay.textContent();
    } catch {
      return null;
    }
  }

  /**
   * Odśwież dane sklepu
   */
  async refreshShopData() {
    await this.refreshButton.click();
  }
}
