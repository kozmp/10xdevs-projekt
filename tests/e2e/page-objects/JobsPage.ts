import { Page, Locator } from '@playwright/test';

export class JobsPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly refreshButton: Locator;
  readonly statusFilter: Locator;
  readonly jobsTable: Locator;
  readonly pagination: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1:has-text("Historia zleceń")');
    this.refreshButton = page.locator('button:has-text("Odśwież")');
    this.statusFilter = page.locator('[role="combobox"]').or(page.locator('select'));
    this.jobsTable = page.locator('table');
    this.pagination = page.locator('nav').or(page.locator('div:has(button:has-text("Previous"), button:has-text("Next"))'));
  }

  async goto() {
    await this.page.goto('/jobs');
  }

  async isLoaded(): Promise<boolean> {
    return await this.pageTitle.isVisible();
  }

  async filterByStatus(status: string) {
    await this.statusFilter.selectOption(status);
  }

  async clickJobRow(index: number) {
    const row = this.jobsTable.locator('tbody tr').nth(index);
    await row.click();
  }
}
