import { Page, Locator } from "@playwright/test";

export class ProductsPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly searchInput: Locator;
  readonly filterDropdown: Locator;
  readonly refreshButton: Locator;
  readonly productsTable: Locator;
  readonly bulkActionsBar: Locator;
  readonly generateButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1:has-text("Produkty")');
    this.searchInput = page.locator('input[placeholder*="Szukaj"]');
    this.filterDropdown = page.locator('button:has-text("Filter")').or(page.locator('[role="combobox"]'));
    this.refreshButton = page.locator('button:has-text("Odśwież")');
    this.productsTable = page.locator("table");
    this.bulkActionsBar = page.locator('div:has-text("selected")');
    this.generateButton = page.locator('button:has-text("Generuj")');
  }

  async goto() {
    await this.page.goto("/products");
  }

  async isLoaded(): Promise<boolean> {
    return await this.pageTitle.isVisible();
  }

  async search(query: string) {
    await this.searchInput.fill(query);
  }

  async selectProduct(index: number) {
    const checkbox = this.page.locator('input[type="checkbox"]').nth(index + 1);
    await checkbox.check();
  }

  async getSelectedCount(): Promise<number> {
    const text = await this.bulkActionsBar.textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }
}
