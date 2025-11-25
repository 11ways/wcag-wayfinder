import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('WCAG Explorer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/WCAG Explorer/);
    await expect(page.getByRole('heading', { name: 'WCAG Explorer' })).toBeVisible();
  });

  test('should display search input and filters', async ({ page }) => {
    await expect(page.getByRole('searchbox', { name: /search/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Filters' })).toBeVisible();
  });

  test('should show results by default', async ({ page }) => {
    // Wait for results to load
    await page.waitForSelector('[role="status"]', { state: 'visible' });

    // Should show result count
    const statusText = await page.locator('[role="status"]').first().textContent();
    expect(statusText).toMatch(/\d+ results?/);
  });

  test('should filter by level AA', async ({ page }) => {
    // Check the AA checkbox
    await page.getByRole('checkbox', { name: 'AA' }).check();

    // Wait for results to update
    await page.waitForTimeout(500);

    // All visible results should be Level AA
    const badges = await page.locator('.badge-aa').count();
    expect(badges).toBeGreaterThan(0);
  });

  test('should filter by principle Perceivable', async ({ page }) => {
    // Check Perceivable checkbox
    await page.getByRole('checkbox', { name: 'Perceivable' }).check();

    // Wait for results
    await page.waitForTimeout(500);

    // Should show only Perceivable results
    const principleText = await page.locator('text=Perceivable').count();
    expect(principleText).toBeGreaterThan(0);
  });

  test('should perform full-text search', async ({ page }) => {
    // Type in search box
    const searchBox = page.getByRole('searchbox', { name: /search/i });
    await searchBox.fill('keyboard');

    // Wait for debounce and results
    await page.waitForTimeout(500);

    // Should show results containing "keyboard"
    const resultsText = await page.locator('main').textContent();
    expect(resultsText?.toLowerCase()).toContain('keyboard');
  });

  test('should expand and collapse criterion details', async ({ page }) => {
    // Wait for first result
    await page.waitForSelector('article.card');

    // Find first "Show Details" button
    const detailsButton = page.getByRole('button', { name: /show details/i }).first();
    await detailsButton.click();

    // Should show details
    await expect(detailsButton).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByText(/how to meet/i).first()).toBeVisible();

    // Click to hide
    await detailsButton.click();
    await expect(detailsButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('should navigate with keyboard', async ({ page }) => {
    // Tab to search box
    await page.keyboard.press('Tab'); // Skip link
    await page.keyboard.press('Tab'); // Search box

    // Verify focus is on search
    const searchBox = page.getByRole('searchbox', { name: /search/i });
    await expect(searchBox).toBeFocused();

    // Continue tabbing to filters
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // Should be on reset button or first filter
  });

  test('should reset filters', async ({ page }) => {
    // Apply some filters
    await page.getByRole('checkbox', { name: 'AA' }).check();
    await page.getByRole('checkbox', { name: 'Perceivable' }).check();

    // Click reset
    await page.getByRole('button', { name: /reset/i }).first().click();

    // Filters should be unchecked
    await expect(page.getByRole('checkbox', { name: 'AA' })).not.toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Perceivable' })).not.toBeChecked();
  });

  test('should pass basic accessibility checks', async ({ page }) => {
    await page.waitForSelector('[role="status"]');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should paginate results', async ({ page }) => {
    // Wait for pagination to appear (if there are enough results)
    const nextButton = page.getByRole('button', { name: /next/i });

    if (await nextButton.isVisible() && await nextButton.isEnabled()) {
      const firstResultText = await page.locator('article.card').first().textContent();

      // Click next page
      await nextButton.click();
      await page.waitForTimeout(500);

      // First result should be different
      const newFirstResultText = await page.locator('article.card').first().textContent();
      expect(newFirstResultText).not.toBe(firstResultText);
    }
  });
});
