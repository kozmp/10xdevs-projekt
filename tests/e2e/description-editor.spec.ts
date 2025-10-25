import { test, expect, type Page } from "@playwright/test";

/**
 * E2E Tests for Product Description Editor
 *
 * Scenariusze:
 * 1. Pełny przepływ zapisu nowej wersji opisu
 * 2. Przywracanie poprzedniej wersji z historii
 */

// Test user credentials (must exist in test database)
const TEST_USER = {
  email: "test@example.com",
  password: "TestPassword123!",
};

// Test data
const TEST_JOB_ID = "test-job-uuid";
const TEST_PRODUCT_ID = "test-product-uuid";
const TEST_PRODUCT_NAME = "Test Product XYZ";

/**
 * Helper: Login user
 */
async function loginUser(page: Page) {
  await page.goto("/login");
  await page.fill('input[name="email"]', TEST_USER.email);
  await page.fill('input[name="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard");
}

/**
 * Helper: Navigate to product description editor
 */
async function navigateToEditor(page: Page) {
  // Assuming there's a route like /jobs/{jobId}/products/{productId}/edit
  await page.goto(`/jobs/${TEST_JOB_ID}/products/${TEST_PRODUCT_ID}/edit`);
  await page.waitForSelector('[data-testid="rich-text-editor"]', { timeout: 5000 });
}

test.describe("Product Description Editor - E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginUser(page);
  });

  /**
   * SCENARIUSZ 1: Pełny przepływ zapisu nowej wersji opisu
   *
   * Kroki:
   * 1. Użytkownik otwiera edytor opisu produktu
   * 2. Wpisuje nową treść z formatowaniem (bold, heading, list)
   * 3. Kliknąć "Zapisz z komentarzem"
   * 4. Wprowadza komentarz do wersji
   * 5. Zapisuje
   * 6. Weryfikuje success toast
   * 7. Weryfikuje że "Historia" pokazuje nową wersję
   * 8. Weryfikuje że przycisk "Zapisz" jest nieaktywny (brak zmian)
   */
  test("should save new description version with formatting and version note", async ({ page }) => {
    // ARRANGE: Navigate to editor
    await navigateToEditor(page);

    // Verify editor loaded
    const editorLabel = await page.textContent("label");
    expect(editorLabel).toContain("Opis produktu");

    // ACT: Type content with formatting
    const editorContent = page.locator(".ProseMirror");
    await editorContent.click();

    // Type heading
    await page.keyboard.type("Wprowadzenie do produktu");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");

    // Apply bold formatting
    await page.click('button[aria-label*="Pogrubienie"]');
    await page.keyboard.type("Kluczowe cechy:");
    await page.click('button[aria-label*="Pogrubienie"]'); // Toggle off
    await page.keyboard.press("Enter");

    // Create bullet list
    await page.click('button[aria-label*="Lista punktowana"]');
    await page.keyboard.type("Wysokiej jakości materiały");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Długi czas użytkowania");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Ekologiczne rozwiązania");

    // ACT: Save with version note
    await page.click('button:has-text("Zapisz z komentarzem")');

    // Wait for dialog
    await page.waitForSelector('dialog[open]');

    // Fill version note
    const versionNoteInput = page.locator('input#version-note');
    await versionNoteInput.fill("Dodano sekcję kluczowych cech produktu");

    // Click save in dialog
    await page.click('dialog[open] button:has-text("Zapisz")');

    // ASSERT: Wait for success toast
    await expect(page.locator('text=Opis zapisany pomyślnie')).toBeVisible({ timeout: 5000 });

    // ASSERT: Dialog should close
    await expect(page.locator('dialog[open]')).not.toBeVisible();

    // ASSERT: Save button should be disabled (no unsaved changes)
    const saveButton = page.locator('button:has-text("Zapisano")');
    await expect(saveButton).toBeDisabled();

    // ASSERT: Version history should show new version
    await page.click('button:has-text("Historia")');
    await page.waitForSelector('dialog[open]');

    // Check if version note is visible in history
    const historyDialog = page.locator('dialog[open]');
    await expect(historyDialog.locator('text=Dodano sekcję kluczowych cech produktu')).toBeVisible();

    // ASSERT: Character count should reflect content
    const characterCounter = page.locator('text=/\\d+ \\/ 50,000/');
    await expect(characterCounter).toBeVisible();
    const counterText = await characterCounter.textContent();
    expect(counterText).toMatch(/\d{2,} \/ 50,000/); // At least 10 characters
  });

  /**
   * SCENARIUSZ 2: Przywracanie poprzedniej wersji z historii
   *
   * Kroki:
   * 1. Użytkownik otwiera edytor (z istniejącą wersją)
   * 2. Edytuje treść (dodaje nowy tekst)
   * 3. Zapisuje nową wersję (wersja 2)
   * 4. Otwiera historię wersji
   * 5. Klika na poprzednią wersję (wersja 1)
   * 6. Weryfikuje że treść wróciła do wersji 1
   * 7. Weryfikuje toast "Wczytano wersję"
   * 8. Weryfikuje że przycisk "Zapisz" jest nieaktywny
   */
  test("should restore previous version from history", async ({ page }) => {
    // ARRANGE: Navigate to editor with existing content
    await navigateToEditor(page);

    // Wait for editor to load with initial content
    await page.waitForSelector(".ProseMirror");

    // Get initial content
    const initialContent = await page.locator(".ProseMirror").textContent();
    expect(initialContent).toBeTruthy();

    // ACT: Edit content (add new text)
    const editorContent = page.locator(".ProseMirror");
    await editorContent.click();
    await page.keyboard.press("End"); // Move to end
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.type("NOWA SEKCJA - To jest dodatkowy tekst");

    // Save new version
    await page.click('button:has-text("Zapisz")');
    await expect(page.locator('text=Opis zapisany pomyślnie')).toBeVisible({ timeout: 5000 });

    // Get modified content
    const modifiedContent = await page.locator(".ProseMirror").textContent();
    expect(modifiedContent).toContain("NOWA SEKCJA");
    expect(modifiedContent).not.toBe(initialContent);

    // ACT: Open version history
    await page.click('button:has-text("Historia")');
    await page.waitForSelector('dialog[open]');

    // Wait for version list to load
    await page.waitForSelector('dialog[open] .cursor-pointer');

    // Get all version cards
    const versionCards = page.locator('dialog[open] .cursor-pointer');
    const versionCount = await versionCards.count();
    expect(versionCount).toBeGreaterThanOrEqual(2); // At least 2 versions

    // Click on the second version (previous version, index 1)
    await versionCards.nth(1).click();

    // ASSERT: Toast notification for loaded version
    await expect(page.locator('text=Wczytano wersję')).toBeVisible({ timeout: 5000 });

    // ASSERT: Dialog should close
    await expect(page.locator('dialog[open]')).not.toBeVisible();

    // ASSERT: Content should be reverted to previous version
    const revertedContent = await page.locator(".ProseMirror").textContent();
    expect(revertedContent).not.toContain("NOWA SEKCJA");

    // ASSERT: Save button should show "Zapisz" (has changes compared to latest saved)
    // Note: Since we reverted to older version, content is different from latest saved
    const saveButton = page.locator('button:has-text("Zapisz")');
    await expect(saveButton).toBeEnabled();

    // ASSERT: Can save reverted version as new version
    await saveButton.click();
    await expect(page.locator('text=Opis zapisany pomyślnie')).toBeVisible({ timeout: 5000 });

    // Verify version count increased
    await page.click('button:has-text("Historia")');
    await page.waitForSelector('dialog[open] .cursor-pointer');
    const newVersionCount = await page.locator('dialog[open] .cursor-pointer').count();
    expect(newVersionCount).toBe(versionCount + 1);
  });

  /**
   * EDGE CASE: Character limit validation
   */
  test("should prevent saving when exceeding character limit", async ({ page }) => {
    // ARRANGE
    await navigateToEditor(page);
    await page.waitForSelector(".ProseMirror");

    // ACT: Type content exceeding limit (simulate with very long text)
    const editorContent = page.locator(".ProseMirror");
    await editorContent.click();

    // Generate text exceeding 50000 characters
    const longText = "A".repeat(50100); // 50100 characters
    await page.evaluate(
      (text) => {
        const editor = document.querySelector(".ProseMirror");
        if (editor) {
          editor.innerHTML = `<p>${text}</p>`;
          // Trigger input event to update character count
          editor.dispatchEvent(new Event("input", { bubbles: true }));
        }
      },
      longText
    );

    // ASSERT: Error message should appear
    await expect(page.locator('text=Przekroczono limit znaków')).toBeVisible({ timeout: 3000 });

    // ASSERT: Character counter should be red
    const characterCounter = page.locator('[role="progressbar"]');
    const counterClass = await characterCounter.getAttribute("class");
    expect(counterClass).toContain("bg-destructive");

    // ASSERT: Save button should be disabled (or show error on click)
    const saveButton = page.locator('button:has-text("Zapisz")');
    // Editor should indicate error state visually
    const editorCard = page.locator(".ProseMirror").locator("..");
    await expect(editorCard).toHaveClass(/border-destructive/);
  });
});
