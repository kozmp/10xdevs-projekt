import { Page, Locator } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly refreshButton: Locator;
  readonly statusCard: Locator;
  readonly productsCountCard: Locator;
  readonly recentJobsTable: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1:has-text("Dashboard")');
    this.refreshButton = page.locator('button:has-text("Odśwież")');
    this.statusCard = page.locator("section").first();
    this.productsCountCard = page.locator("section").nth(1);
    this.recentJobsTable = page.locator("section").last();
  }

  async goto() {
    await this.page.goto("/dashboard");
  }

  async isLoaded(): Promise<boolean> {
    return await this.pageTitle.isVisible();
  }

  async refresh() {
    await this.refreshButton.click();
  }
}
