import { test, expect } from '@playwright/test';

const urls = ['/Nike', '/this-does-not-exist', '/dit?failed/failedusp=drive_link'];

for (const url of urls) {
  test(`404 page renders for ${url}`, async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', e => jsErrors.push(e.message));
    await page.goto(url);
    await expect(page.getByRole('heading', { name: '404', exact: true })).toBeVisible();
    await expect(page.getByText('Page Not Found')).toBeVisible();
    await expect(page.getByRole('link', { name: /Return Home/i })).toBeVisible();
    expect(jsErrors).toEqual([]);
  });
}
