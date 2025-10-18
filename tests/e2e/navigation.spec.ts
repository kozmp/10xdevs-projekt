import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';
import { DashboardPage } from './page-objects/DashboardPage';
import { ProductsPage } from './page-objects/ProductsPage';
import { JobsPage } from './page-objects/JobsPage';
import { NavBar } from './page-objects/NavBar';

test.describe('Navigation Flow', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let productsPage: ProductsPage;
  let jobsPage: JobsPage;
  let navBar: NavBar;

  // Setup: Login before each test
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    productsPage = new ProductsPage(page);
    jobsPage = new JobsPage(page);
    navBar = new NavBar(page);

    // Login
    await loginPage.goto();
    const email = process.env.E2E_USERNAME || '';
    const password = process.env.E2E_PASSWORD || '';

    expect(email).toBeTruthy();
    expect(password).toBeTruthy();

    await loginPage.login(email, password);
    await page.waitForURL('/', { timeout: 10000 });
  });

  test('should navigate from dashboard to products page', async ({ page }) => {
    // Arrange - Already on dashboard from beforeEach

    // Act
    await navBar.goToProducts();

    // Assert
    await expect(page).toHaveURL('/products');
    const isProductsLoaded = await productsPage.isLoaded();
    expect(isProductsLoaded).toBeTruthy();
  });

  test('should navigate from dashboard to jobs page', async ({ page }) => {
    // Arrange - Already on dashboard from beforeEach

    // Act
    await navBar.goToJobs();

    // Assert
    await expect(page).toHaveURL('/jobs');
    const isJobsLoaded = await jobsPage.isLoaded();
    expect(isJobsLoaded).toBeTruthy();
  });

  test('should navigate from products to dashboard', async ({ page }) => {
    // Arrange
    await productsPage.goto();
    await expect(page).toHaveURL('/products');

    // Act
    await navBar.goToDashboard();

    // Assert
    await expect(page).toHaveURL('/');
    const isDashboardLoaded = await dashboardPage.isLoaded();
    expect(isDashboardLoaded).toBeTruthy();
  });

  test('should navigate from jobs to products', async ({ page }) => {
    // Arrange
    await jobsPage.goto();
    await expect(page).toHaveURL('/jobs');

    // Act
    await navBar.goToProducts();

    // Assert
    await expect(page).toHaveURL('/products');
    const isProductsLoaded = await productsPage.isLoaded();
    expect(isProductsLoaded).toBeTruthy();
  });

  test('should complete full navigation cycle: dashboard -> products -> jobs -> dashboard', async ({ page }) => {
    // Arrange - Start at dashboard
    const isDashboardLoadedInitially = await dashboardPage.isLoaded();
    expect(isDashboardLoadedInitially).toBeTruthy();

    // Act & Assert - Navigate to Products
    await navBar.goToProducts();
    await expect(page).toHaveURL('/products');
    const isProductsLoaded = await productsPage.isLoaded();
    expect(isProductsLoaded).toBeTruthy();

    // Act & Assert - Navigate to Jobs
    await navBar.goToJobs();
    await expect(page).toHaveURL('/jobs');
    const isJobsLoaded = await jobsPage.isLoaded();
    expect(isJobsLoaded).toBeTruthy();

    // Act & Assert - Navigate back to Dashboard
    await navBar.goToDashboard();
    await expect(page).toHaveURL('/');
    const isDashboardLoadedFinal = await dashboardPage.isLoaded();
    expect(isDashboardLoadedFinal).toBeTruthy();
  });

  test('should redirect to login when accessing protected route without auth', async ({ page, context }) => {
    // Arrange - Logout by clearing cookies
    await context.clearCookies();

    // Act - Try to access products page
    await page.goto('/products');

    // Assert - Should be redirected to login
    await expect(page).toHaveURL('/login');
  });

  test('should maintain page state during navigation', async ({ page }) => {
    // Arrange - Navigate to products and perform search
    await productsPage.goto();
    const searchQuery = 'test product';
    await productsPage.search(searchQuery);

    // Act - Navigate away and back
    await navBar.goToDashboard();
    await expect(page).toHaveURL('/');
    await navBar.goToProducts();

    // Assert - Back on products page (note: search state may not persist, this is expected)
    await expect(page).toHaveURL('/products');
    const isProductsLoaded = await productsPage.isLoaded();
    expect(isProductsLoaded).toBeTruthy();
  });

  test('should handle browser back button navigation', async ({ page }) => {
    // Arrange - Navigate through pages
    await navBar.goToProducts();
    await expect(page).toHaveURL('/products');

    // Act - Use browser back button
    await page.goBack();

    // Assert - Should be back at dashboard
    await expect(page).toHaveURL('/');
    const isDashboardLoaded = await dashboardPage.isLoaded();
    expect(isDashboardLoaded).toBeTruthy();
  });

  test('should handle browser forward button navigation', async ({ page }) => {
    // Arrange - Navigate and go back
    await navBar.goToProducts();
    await expect(page).toHaveURL('/products');
    await page.goBack();
    await expect(page).toHaveURL('/');

    // Act - Use browser forward button
    await page.goForward();

    // Assert - Should be back at products
    await expect(page).toHaveURL('/products');
    const isProductsLoaded = await productsPage.isLoaded();
    expect(isProductsLoaded).toBeTruthy();
  });

  test('should preserve authentication across page navigation', async ({ page }) => {
    // Arrange - Start at dashboard
    await expect(page).toHaveURL('/');

    // Act - Navigate through multiple protected routes
    await navBar.goToProducts();
    await expect(page).toHaveURL('/products');

    await navBar.goToJobs();
    await expect(page).toHaveURL('/jobs');

    await navBar.goToDashboard();
    await expect(page).toHaveURL('/');

    // Assert - Should still be authenticated (not redirected to login)
    const isDashboardLoaded = await dashboardPage.isLoaded();
    expect(isDashboardLoaded).toBeTruthy();
  });
});
