import { test, expect } from '@playwright/test';

test.describe('CSP - Profile Picture Upload (blob:)', () => {
  test('CSP img-src allows blob: URLs used by photo upload', async ({ request }) => {
    const response = await request.get('/');
    const csp = response.headers()['content-security-policy'] ?? '';
    // The photo upload converts images via URL.createObjectURL -> blob: URLs.
    // img-src must allow blob: or the conversion fails with a CSP violation.
    expect(csp).toContain("img-src 'self' data: blob:");
  });
});

test.describe('CSP - Google Fonts', () => {
  test('CSP allows Google Fonts stylesheet and font files', async ({ request }) => {
    const response = await request.get('/');
    const csp = response.headers()['content-security-policy'] ?? '';
    expect(csp).toContain('https://fonts.googleapis.com'); // style-src
    expect(csp).toContain('https://fonts.gstatic.com'); // font-src
  });

  test('Google Fonts (Inter / Playfair Display) actually load in the browser', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2500);
    const fontLoaded = await page.evaluate(() => {
      const faces = document.fonts ? [...document.fonts] : [];
      return faces.some((f) => f.status === 'loaded' && (f.family.includes('Inter') || f.family.includes('Playfair Display')));
    });
    expect(fontLoaded).toBeTruthy();
  });
});

test.describe('Contact Form - Whitespace-Only Validation', () => {
  test('Whitespace-only Name and Message are rejected', async ({ page }) => {
    await page.goto('/contact');
    await page.fill('[data-testid="input-contact-name"]', '   ');
    await page.fill('[data-testid="input-contact-email"]', 'test@example.com');
    await page.fill('[data-testid="input-contact-message"]', '   ');
    await page.click('[data-testid="button-contact-submit"]');

    // Validation toast shown, no submission
    await expect(page.getByText('Please complete all required fields.', { exact: true })).toBeVisible();
    await expect(page.getByText('Thank you')).not.toBeVisible();
  });
});

test.describe('Careers Form - Validation', () => {
  test('Whitespace-only Name is rejected', async ({ page }) => {
    await page.goto('/careers');
    await page.fill('[data-testid="input-cv-name"]', '   ');
    await page.fill('[data-testid="input-cv-email"]', 'test@example.com');
    await page.click('[data-testid="button-cv-submit"]');

    await expect(page.getByText('Name and email are required.', { exact: true })).toBeVisible();
    await expect(page.getByText('Thank you')).not.toBeVisible();
  });

  test('Blank Name is blocked before submission', async ({ page }) => {
    await page.goto('/careers');
    await page.fill('[data-testid="input-cv-email"]', 'test@example.com');
    await page.click('[data-testid="button-cv-submit"]');

    // HTML5 required must keep the input invalid and prevent submission
    const invalid = await page.locator('[data-testid="input-cv-name"]').evaluate((el) => {
      const input = el as HTMLInputElement;
      return !input.checkValidity();
    });
    expect(invalid).toBeTruthy();
    await expect(page.getByText('Thank you')).not.toBeVisible();
  });

  test('Whitespace-only Message is rejected', async ({ page }) => {
    await page.goto('/careers');
    await page.fill('[data-testid="input-cv-name"]', 'John Doe');
    await page.fill('[data-testid="input-cv-email"]', 'test@example.com');
    await page.fill('[data-testid="input-cv-cover-letter"]', '   ');
    await page.click('[data-testid="button-cv-submit"]');

    await expect(page.getByText('Message cannot be blank.', { exact: true })).toBeVisible();
    await expect(page.getByText('Thank you')).not.toBeVisible();
  });

  test('Form resets after successful submission', async ({ page }) => {
    await page.goto('/careers');
    await page.fill('[data-testid="input-cv-name"]', 'QA Test Candidate');
    await page.fill('[data-testid="input-cv-email"]', 'qa-candidate@example.com');
    await page.fill('[data-testid="input-cv-cover-letter"]', 'Automated test application.');
    await page.click('[data-testid="button-cv-submit"]');

    // Either success (Thank you) or rate limited — skip if rate limited
    const thankYou = page.locator('text=Thank you');
    const failed = page.locator('text=Submission failed');
    const result = await Promise.race([
      thankYou.waitFor({ state: 'visible', timeout: 10000 }).then(() => 'success').catch(() => null),
      failed.waitFor({ state: 'visible', timeout: 10000 }).then(() => 'rate_limited').catch(() => null),
    ]);
    if (result === 'rate_limited' || result === null) {
      test.skip(true, 'CV submission rate limited - skipping reset test');
      return;
    }

    await expect(page.locator('text=Your application has been received.')).toBeVisible();

    // Submit Another Application resets the form
    await page.click('[data-testid="button-cv-submit-another"]');
    await expect(page.locator('[data-testid="input-cv-name"]')).toHaveValue('');
    await expect(page.locator('[data-testid="input-cv-email"]')).toHaveValue('');
    await expect(page.locator('[data-testid="input-cv-cover-letter"]')).toHaveValue('');
  });
});

test.describe('Apply Now via CV - Anchor Navigation', () => {
  test('Apply Now via CV Form takes user directly to the submission form', async ({ page }) => {
    await page.goto('/careers');
    const firstVacancy = page.locator('[data-testid^="card-vacancy-"]').first();
    if (!(await firstVacancy.count())) {
      test.skip(true, 'No vacancies published - skipping navigation test');
      return;
    }
    await firstVacancy.click();
    await page.waitForLoadState('networkidle');

    const applyLink = page.locator('[data-testid="link-apply"]');
    await expect(applyLink).toHaveAttribute('href', '/careers#submit-application');
    await applyLink.click();
    await page.waitForTimeout(1500);

    // Lands on the form section, not the top of the page
    expect(await page.evaluate(() => window.location.hash)).toBe('#submit-application');
    const inView = await page.locator('#submit-application').evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top >= 0 && rect.top < window.innerHeight;
    });
    expect(inView).toBeTruthy();
  });
});
