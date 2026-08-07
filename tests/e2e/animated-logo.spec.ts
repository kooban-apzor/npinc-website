import { test, expect } from '@playwright/test';

test.describe('Animated Navbar Logo', () => {
  test('logo link is visible, clickable, and still navigates home', async ({ page }) => {
    await page.goto('/people');
    const logo = page.getByTestId('link-logo');
    await expect(logo).toBeVisible();
    await logo.click();
    await page.waitForURL('**/');
    await expect(page).toHaveURL(/\/$/);
  });

  test('logo remains visible across a full 12s animation cycle (no crash)', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/');
    const logo = page.getByTestId('link-logo');
    await expect(logo).toBeVisible();
    await expect(logo.getByTestId('img-logo-animated')).toBeAttached();
    await page.waitForTimeout(13000);
    await expect(logo).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('prefers-reduced-motion renders the static PNG without animation hooks', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/');
    const logo = page.getByTestId('link-logo');
    await expect(logo).toBeVisible();
    await expect(logo.getByTestId('img-logo-static')).toBeAttached();
    await expect(logo.getByTestId('img-logo-animated')).toHaveCount(0);
    await context.close();
  });
});
