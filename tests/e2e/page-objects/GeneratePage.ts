import { Page, Locator } from '@playwright/test';

export class GeneratePage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly styleCards: Locator;
  readonly languageSelect: Locator;
  readonly generateButton: Locator;
  readonly progressBar: Locator;
  readonly errorMessage: Locator;
  readonly summary: Locator;
  readonly results: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1:has-text("Generowanie opisów")');
    this.styleCards = page.locator('[role="radiogroup"]').or(page.locator('div:has-text("Styl komunikacji")').locator('..').locator('button'));
    this.languageSelect = page.locator('select, [role="combobox"]');
    this.generateButton = page.locator('button:has-text("Generuj opisy")');
    this.progressBar = page.locator('[role="progressbar"]');
    this.errorMessage = page.locator('.bg-red-50');
    this.summary = page.locator('.bg-green-50:has-text("Podsumowanie")');
    this.results = page.locator('h3:has-text("Wyniki")');
  }

  async goto(productIds: string[]) {
    await this.page.goto(`/generate?ids=${productIds.join(',')}`);
  }

  async isLoaded(): Promise<boolean> {
    return await this.pageTitle.isVisible();
  }

  async selectStyle(style: 'professional' | 'casual' | 'technical') {
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
}
