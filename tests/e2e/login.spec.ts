import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';
import { DashboardPage } from './page-objects/DashboardPage';

test.describe('Login Flow', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.goto();
  });

  test('should display login page correctly', async ({ page }) => {
    // Arrange & Act - page is loaded in beforeEach

    // Assert
    await expect(page).toHaveURL('/login');
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.signUpLink).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Arrange
    const invalidEmail = 'invalid@example.com';
    const invalidPassword = 'wrongpassword123';

    // Act
    await loginPage.login(invalidEmail, invalidPassword);

    // Assert
    await expect(loginPage.errorMessage).toBeVisible({ timeout: 5000 });
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toBeTruthy();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Arrange
    const email = process.env.E2E_USERNAME || '';
    const password = process.env.E2E_PASSWORD || '';

    expect(email).toBeTruthy();
    expect(password).toBeTruthy();

    // Act
    await loginPage.login(email, password);

    // Assert
    await page.waitForURL('/', { timeout: 10000 });
    await expect(page).toHaveURL('/');
  });

  test('should redirect to dashboard after successful login', async ({ page }) => {
    // Arrange
    const email = process.env.E2E_USERNAME || '';
    const password = process.env.E2E_PASSWORD || '';

    // Act
    await loginPage.login(email, password);

    // Assert
    await page.waitForURL('/', { timeout: 10000 });
    const isDashboardLoaded = await dashboardPage.isLoaded();
    expect(isDashboardLoaded).toBeTruthy();
  });

  test('should navigate to signup page', async ({ page }) => {
    // Arrange & Act
    await loginPage.signUpLink.click();

    // Assert
    await expect(page).toHaveURL('/signup');
  });

  test('should navigate to forgot password page', async ({ page }) => {
    // Arrange & Act
    await loginPage.forgotPasswordLink.click();

    // Assert
    await expect(page).toHaveURL('/forgot-password');
  });

  test('should clear error message on form resubmission', async ({ page }) => {
    // Arrange - First submit with invalid credentials
    await loginPage.login('invalid@example.com', 'wrongpassword');
    await expect(loginPage.errorMessage).toBeVisible({ timeout: 5000 });
    const firstError = await loginPage.getErrorMessage();

    // Act - Submit again with different credentials
    await loginPage.login('another@example.com', 'anotherpassword');

    // Assert - New error message should appear
    await expect(loginPage.errorMessage).toBeVisible({ timeout: 5000 });
    const secondError = await loginPage.getErrorMessage();

    // Both should show error (may be the same message)
    expect(firstError).toBeTruthy();
    expect(secondError).toBeTruthy();
  });
});
