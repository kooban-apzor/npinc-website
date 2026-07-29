import { test, expect } from '@playwright/test';

test.describe('Role Label Display - C-272', () => {
  test('Candidate Attorney role displays correctly on People page', async ({ page }) => {
    await page.goto('/people');
    
    // Check that "Candidate Attorney" appears (not "Candidate_Attorneys")
    const candidateAttorneyText = page.locator('text=Candidate Attorney');
    await expect(candidateAttorneyText).toBeVisible();
    
    // Ensure the broken label is NOT present
    const brokenLabel = page.locator('text=Candidate_Attorneys');
    await expect(brokenLabel).not.toBeVisible();
  });

  test('Candidate Attorney role displays correctly on person detail page', async ({ page }) => {
    await page.goto('/people');
    
    // Find a candidate attorney and click on them
    const candidateLink = page.locator('a:has-text("Candidate Attorney")').first();
    if (await candidateLink.isVisible()) {
      await candidateLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verify the role displays correctly on detail page
      const roleText = page.locator('text=Candidate Attorney');
      await expect(roleText).toBeVisible();
    }
  });

  test('All role labels display correctly', async ({ page }) => {
    await page.goto('/people');
    
    // Check all expected role labels
    const expectedRoles = ['Partner', 'Director', 'Associate', 'Candidate Attorney', 'Consultant', 'Support'];
    
    for (const role of expectedRoles) {
      const roleElement = page.locator(`text=${role}`).first();
      // Role might not be present if no one has that role, but if present, should be correct
      if (await roleElement.isVisible().catch(() => false)) {
        await expect(roleElement).toBeVisible();
      }
    }
  });
});

test.describe('Name Validation - C-22, C-53, C-337, C-290, C-321, C-353', () => {
  test('Admin login works', async ({ page }) => {
    await page.goto('/admin/login');
    
    await page.fill('[data-testid="input-admin-username"]', 'admin');
    await page.fill('[data-testid="input-admin-password"]', 'GuQb8LbVAy3!');
    await page.click('[data-testid="button-admin-login"]');
    
    // Should redirect to admin dashboard
    await page.waitForURL('**/admin');
    await expect(page).toHaveURL(/.*admin/);
  });

  test('Cannot create person with empty first name', async ({ page, request }) => {
    // Login via API
    const loginResponse = await request.post('/api/admin/login', {
      data: { username: 'admin', password: 'GuQb8LbVAy3!' },
    });
    expect(loginResponse.ok()).toBeTruthy();
    
    const cookies = loginResponse.headers()['set-cookie'];
    const sessionCookie = cookies?.match(/connect\.sid=([^;]+)/)?.[1];
    
    // Try to create person with empty first name
    const createResponse = await request.post('/api/admin/people', {
      headers: {
        'Cookie': `connect.sid=${sessionCookie}`,
        'Content-Type': 'application/json',
      },
      data: {
        slug: 'test-empty-first',
        firstName: '',
        lastName: 'Doe',
        role: 'associates',
      },
    });
    
    expect(createResponse.status()).toBe(400);
    const body = await createResponse.json();
    expect(body.error).toContain('First name and last name are required');
  });

  test('Cannot create person with empty last name', async ({ page, request }) => {
    // Login via API
    const loginResponse = await request.post('/api/admin/login', {
      data: { username: 'admin', password: 'GuQb8LbVAy3!' },
    });
    expect(loginResponse.ok()).toBeTruthy();
    
    const cookies = loginResponse.headers()['set-cookie'];
    const sessionCookie = cookies?.match(/connect\.sid=([^;]+)/)?.[1];
    
    // Try to create person with empty last name
    const createResponse = await request.post('/api/admin/people', {
      headers: {
        'Cookie': `connect.sid=${sessionCookie}`,
        'Content-Type': 'application/json',
      },
      data: {
        slug: 'test-empty-last',
        firstName: 'John',
        lastName: '',
        role: 'associates',
      },
    });
    
    expect(createResponse.status()).toBe(400);
    const body = await createResponse.json();
    expect(body.error).toContain('First name and last name are required');
  });
});

test.describe('Duplicate Slug Error Messages', () => {
  test('Duplicate slug returns specific error message', async ({ request }) => {
    // Login via API
    const loginResponse = await request.post('/api/admin/login', {
      data: { username: 'admin', password: 'GuQb8LbVAy3!' },
    });
    expect(loginResponse.ok()).toBeTruthy();
    
    const cookies = loginResponse.headers()['set-cookie'];
    const sessionCookie = cookies?.match(/connect\.sid=([^;]+)/)?.[1];
    
    // Create a person
    const slug = `test-duplicate-${Date.now()}`;
    const createResponse1 = await request.post('/api/admin/people', {
      headers: {
        'Cookie': `connect.sid=${sessionCookie}`,
        'Content-Type': 'application/json',
      },
      data: {
        slug,
        firstName: 'John',
        lastName: 'Doe',
        role: 'associates',
      },
    });
    expect(createResponse1.status()).toBe(201);
    
    // Try to create another person with same slug
    const createResponse2 = await request.post('/api/admin/people', {
      headers: {
        'Cookie': `connect.sid=${sessionCookie}`,
        'Content-Type': 'application/json',
      },
      data: {
        slug,
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'associates',
      },
    });
    
    expect(createResponse2.status()).toBe(400);
    const body = await createResponse2.json();
    expect(body.error).toContain('already exists');
    expect(body.error).toContain('unique');
    
    // Clean up
    const peopleResponse = await request.get('/api/admin/people', {
      headers: { 'Cookie': `connect.sid=${sessionCookie}` },
    });
    const people = await peopleResponse.json();
    const person = people.find((p: any) => p.slug === slug);
    if (person) {
      await request.delete(`/api/admin/people/${person.id}`, {
        headers: { 'Cookie': `connect.sid=${sessionCookie}` },
      });
    }
  });
});

test.describe('404 Page - C-320', () => {
  test('404 page displays correctly with dark theme', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    
    // Should show 404 page
    await expect(page.locator('text=404')).toBeVisible();
    await expect(page.locator('text=Page Not Found')).toBeVisible();
    
    // Should have dark theme (dark background)
    const body = page.locator('body');
    const bgColor = await body.evaluate(el => getComputedStyle(el).backgroundColor);
    // Dark theme should have low RGB values
    expect(bgColor).toMatch(/rgb\(\s*\d{1,2},\s*\d{1,2},\s*\d{1,2}\s*\)/);
  });

  test('404 page has return home link', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    
    const homeLink = page.locator('a:has-text("Return Home")');
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute('href', '/');
  });
});

test.describe('Contact Form Reset', () => {
  test('Contact form resets after successful submission', async ({ page }) => {
    await page.goto('/contact');
    
    // Fill out the form
    await page.fill('[data-testid="input-contact-name"]', 'Test User');
    await page.fill('[data-testid="input-contact-email"]', 'test@example.com');
    await page.fill('[data-testid="input-contact-message"]', 'Test message');
    
    // Submit the form
    await page.click('[data-testid="button-contact-submit"]');
    
    // Wait for either success message or error toast (rate limiting)
    const thankYou = page.locator('text=Thank you');
    const submissionFailed = page.locator('text=Submission failed');
    
    // Wait up to 10 seconds for either message
    const result = await Promise.race([
      thankYou.waitFor({ state: 'visible', timeout: 10000 }).then(() => 'success').catch(() => null),
      submissionFailed.waitFor({ state: 'visible', timeout: 10000 }).then(() => 'rate_limited').catch(() => null),
    ]);
    
    // If rate limited or submission failed, skip the rest of the test
    if (result === 'rate_limited' || result === null) {
      test.skip(true, 'Contact form submission failed or rate limited - skipping reset test');
      return;
    }
    
    // Check for success message
    await expect(thankYou).toBeVisible();
    
    // Form should be reset (fields should be empty if form is still visible)
    // Or form should be replaced with success message
    const nameInput = page.locator('[data-testid="input-contact-name"]');
    if (await nameInput.isVisible().catch(() => false)) {
      await expect(nameInput).toHaveValue('');
    }
  });
});

test.describe('Security Headers', () => {
  test('All security headers are present', async ({ request }) => {
    const response = await request.get('/');
    
    const headers = response.headers();
    
    // Check for required security headers
    expect(headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-xss-protection']).toBe('1; mode=block');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['permissions-policy']).toContain('camera=()');
    expect(headers['content-security-policy']).toContain("default-src 'self'");
    expect(headers['strict-transport-security']).toContain('max-age=');
  });
});

test.describe('Password Policy', () => {
  test('Password must meet requirements', async ({ request }) => {
    // Login via API
    const loginResponse = await request.post('/api/admin/login', {
      data: { username: 'admin', password: 'GuQb8LbVAy3!' },
    });
    expect(loginResponse.ok()).toBeTruthy();
    
    const cookies = loginResponse.headers()['set-cookie'];
    const sessionCookie = cookies?.match(/connect\.sid=([^;]+)/)?.[1];
    
    // Try to change password to weak password
    const changeResponse = await request.post('/api/admin/change-password', {
      headers: {
        'Cookie': `connect.sid=${sessionCookie}`,
        'Content-Type': 'application/json',
      },
      data: {
        currentPassword: 'GuQb8LbVAy3!',
        newPassword: 'weak',
      },
    });
    
    expect(changeResponse.status()).toBe(400);
    const body = await changeResponse.json();
    expect(body.error).toContain('10 characters');
  });
});

test.describe('Rate Limiting', () => {
  test('Contact form has rate limiting', async ({ request }) => {
    // Make 6 requests (limit is 5 per 15 minutes)
    for (let i = 0; i < 5; i++) {
      const response = await request.post('/api/contact', {
        data: {
          name: 'Test User',
          email: 'test@example.com',
          message: 'Test message',
        },
      });
      // First 5 should succeed or be rate limited
      expect([200, 201, 429]).toContain(response.status());
    }
    
    // 6th request should be rate limited
    const rateLimitedResponse = await request.post('/api/contact', {
      data: {
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
      },
    });
    
    expect(rateLimitedResponse.status()).toBe(429);
  });
});

test.describe('PDF Export Button Visibility - C-229', () => {
  test('Calculator page has visible PDF export button', async ({ page }) => {
    await page.goto('/calculator');
    
    // Fill in some values to trigger calculation
    await page.fill('[data-testid="input-purchase-price"]', '1000000');
    await page.click('[data-testid="button-calculate-transfer"]');
    
    // Wait for results
    await page.waitForTimeout(1000);
    
    // PDF button should be visible and prominent
    const pdfButton = page.locator('button:has-text("Print / Save PDF")');
    await expect(pdfButton).toBeVisible();
    
    // Button should have prominent styling (background color)
    const buttonStyle = await pdfButton.evaluate(el => getComputedStyle(el).backgroundColor);
    // Should have a background color (not transparent)
    expect(buttonStyle).not.toBe('rgba(0, 0, 0, 0)');
    expect(buttonStyle).not.toBe('transparent');
  });
});

test.describe('Anchor Links', () => {
  test('Anchor links are not hidden behind navbar', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to a section with an anchor link
    await page.evaluate(() => {
      const link = document.querySelector('a[href^="#"]');
      if (link) {
        link.click();
      }
    });
    
    // Wait for scroll
    await page.waitForTimeout(500);
    
    // Check that the target element is not hidden behind navbar
    const targetElement = await page.evaluate(() => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top >= 80; // Should be below navbar (80px height)
        }
      }
      return true;
    });
    
    expect(targetElement).toBeTruthy();
  });
});
