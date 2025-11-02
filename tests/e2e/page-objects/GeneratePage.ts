import { Page, Locator } from "@playwright/test";

export class GeneratePage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly styleCards: Locator;
  readonly languageSelect: Locator;
  readonly generateButton: Locator;
  readonly calculateCostButton: Locator;
  readonly progressBar: Locator;
  readonly errorMessage: Locator;
  readonly summary: Locator;
  readonly results: Locator;
  readonly costDialog: Locator;
  readonly modelSelector: Locator;
  readonly systemMessageTextarea: Locator;
  readonly systemMessageCounter: Locator;
  readonly connectionWarning: Locator;
  readonly noProductsWarning: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1:has-text("Generowanie opisów")');
    this.styleCards = page
      .locator('[role="radiogroup"]')
      .or(page.locator('div:has-text("Styl komunikacji")').locator("..").locator("button"));
    this.languageSelect = page.locator('select, [role="combobox"]');
    this.generateButton = page.locator('button:has-text("Generuj opisy")');
    this.calculateCostButton = page.locator(
      'button:has-text("Oblicz koszt"), button:has-text("rozpocznij generowanie")'
    );
    this.progressBar = page.locator('[role="progressbar"]');
    this.errorMessage = page.locator(".bg-red-50");
    this.summary = page.locator('.bg-green-50:has-text("Podsumowanie")');
    this.results = page.locator('h3:has-text("Wyniki")');
    this.costDialog = page.locator('[role="dialog"]');
    this.modelSelector = page.locator('[role="radiogroup"]:has(input[value*="openai"])');
    this.systemMessageTextarea = page.locator("textarea#system-message");
    this.systemMessageCounter = page.locator("text=/\\d+\\/6000/");
    this.connectionWarning = page.locator("text=/Brak połączenia ze sklepem/i");
    this.noProductsWarning = page.locator("text=/Brak wybranych produktów/i");
  }

  async goto(productIds: string[]) {
    await this.page.goto(`/generate?ids=${productIds.join(",")}`);
  }

  async isLoaded(): Promise<boolean> {
    return await this.pageTitle.isVisible();
  }

  async selectStyle(style: "professional" | "casual" | "technical") {
    // Find the radio button or card for the style
    const styleButton = this.page.locator(`button:has-text("${style}"), input[value="${style}"]`);
    await styleButton.click();
  }

  async selectLanguage(language: string) {
    await this.languageSelect.selectOption(language);
  }

  async clickGenerate() {
    await this.generateButton.click();
  }

  async isGenerating(): Promise<boolean> {
    return await this.progressBar.isVisible();
  }

  async hasError(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  async hasSummary(): Promise<boolean> {
    return await this.summary.isVisible();
  }

  // Cost Estimation Methods
  async selectModel(model: string) {
    const modelRadio = this.page.locator(`input[type="radio"][value="${model}"]`);
    await modelRadio.check();
  }

  async clickCalculateCost() {
    await this.calculateCostButton.click();
  }

  async isCostDialogOpen(): Promise<boolean> {
    return await this.costDialog.isVisible();
  }

  async confirmCostEstimate() {
    const confirmButton = this.costDialog.locator('button:has-text("Potwierdź")');
    await confirmButton.click();
  }

  async cancelCostEstimate() {
    const cancelButton = this.costDialog.locator('button:has-text("Anuluj")');
    await cancelButton.click();
  }

  async getCostFromDialog(): Promise<string | null> {
    const costText = await this.costDialog.locator("text=/\\$0\\.\\d+/").first().textContent();
    return costText;
  }

  // F4: System Message Methods
  async fillSystemMessage(message: string) {
    await this.systemMessageTextarea.fill(message);
  }

  async getSystemMessageCharCount(): Promise<number> {
    const counterText = await this.systemMessageCounter.textContent();
    if (!counterText) return 0;
    const match = counterText.match(/(\d+)\/6000/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async isConnectionWarningVisible(): Promise<boolean> {
    return await this.connectionWarning.isVisible();
  }

  async isNoProductsWarningVisible(): Promise<boolean> {
    return await this.noProductsWarning.isVisible();
  }

  async isGenerateButtonDisabled(): Promise<boolean> {
    return await this.calculateCostButton.isDisabled();
  }
}
