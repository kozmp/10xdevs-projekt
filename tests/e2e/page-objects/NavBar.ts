import { Page, Locator } from "@playwright/test";

export class NavBar {
  readonly page: Page;
  readonly dashboardLink: Locator;
  readonly productsLink: Locator;
  readonly jobsLink: Locator;
  readonly addShopLink: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dashboardLink = page.locator('a[href="/"], a[href="/dashboard"]');
    this.productsLink = page.locator('a[href="/products"]');
    this.jobsLink = page.locator('a[href="/jobs"]');
    this.addShopLink = page.locator('a[href="/add-shop"]');
    this.logoutButton = page.locator('button:has-text("Logout"), button:has-text("Wyloguj")');
  }

  async goToDashboard() {
    await this.dashboardLink.first().click();
  }

  async goToProducts() {
    await this.productsLink.click();
  }

  async goToJobs() {
    await this.jobsLink.click();
  }

  async goToAddShop() {
    await this.addShopLink.click();
  }

  async logout() {
    await this.logoutButton.click();
  }
}
