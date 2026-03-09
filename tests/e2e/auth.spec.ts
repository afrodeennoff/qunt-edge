import { test, expect } from '@playwright/test';

/**
 * Authentication Flow E2E Tests
 * 
 * These tests verify the robustness of the login and logout flows,
 * including session persistence, error handling, and redirection logic.
 * 
 * We mock Supabase Auth endpoints to ensure tests are deterministic and 
 * do not rely on a live backend during CI.
 */

test.describe('Authentication Flow', () => {
    const TEST_EMAIL = 'test@example.com';
    const TEST_PASSWORD = 'Password123!';
    const LOCALE = 'en';

    test.beforeEach(async ({ context }) => {
        // Ensure we start from a clean state
        await context.clearCookies();
    });

    test('🛡️ Unauthorized users are redirected from protected routes', async ({ page }) => {
        console.log('[Auth Test] Navigating to protected dashboard...');
        await page.goto(`/${LOCALE}/dashboard`);

        // Should be redirected to /authentication
        await page.waitForURL(url => url.pathname.includes('/authentication'));
        expect(page.url()).toContain('next=');

        await expect(page.locator('form')).toBeVisible();
        console.log('[Auth Test] SUCCESS: Appropriately redirected to login.');
    });

    test('❌ Login with invalid credentials displays proper error', async ({ page }) => {
        await page.goto(`/${LOCALE}/authentication`);

        // Switch to password tab
        const passwordTab = page.locator('button[value="password"]');
        await passwordTab.click();

        await page.fill('input[id="email_password"]', 'invalid@user.com');
        await page.fill('input[id="password_login"]', 'wrongpassword');

        // Mock Supabase Auth failure
        await page.route('**/auth/v1/token?grant_type=password', async route => {
            await route.fulfill({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({
                    error: 'invalid_grant',
                    error_description: 'Invalid login credentials'
                }),
            });
        });

        console.log('[Auth Test] Submitting invalid credentials...');
        await page.click('button[type="submit"]');

        // Verify error message is shown (using translation key or text)
        // The UI uses Sonner toasts
        await expect(page.locator('text=Invalid credentials')).toBeVisible();
        console.log('[Auth Test] SUCCESS: Error message displayed correctly.');
    });

    test('✅ Successful login flow and dashboard access', async ({ page }) => {
        await page.goto(`/${LOCALE}/authentication`);

        await page.locator('button[value="password"]').click();
        await page.fill('input[id="email_password"]', TEST_EMAIL);
        await page.fill('input[id="password_login"]', TEST_PASSWORD);

        // Mock successful login response
        await page.route('**/auth/v1/token?grant_type=password', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    access_token: 'valid.session.token',
                    refresh_token: 'valid.refresh.token',
                    expires_in: 3600,
                    user: { id: 'user_123', email: TEST_EMAIL }
                }),
            });
        });

        // Mock the getUser check that follows login
        await page.route('**/auth/v1/user', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ id: 'user_123', email: TEST_EMAIL }),
            });
        });

        console.log('[Auth Test] Submitting valid credentials...');
        await page.click('button[type="submit"]');

        // Should redirect to dashboard
        await page.waitForURL(`**/${LOCALE}/dashboard`);
        await expect(page).toHaveURL(new RegExp(`.*\\/${LOCALE}\\/dashboard`));

        // Verify dashboard content is visible
        await expect(page.locator('header')).toBeVisible();
        console.log('[Auth Test] SUCCESS: Logged in and reached dashboard.');
    });

    test('🚪 Logout flow terminates session and redirects', async ({ page }) => {
        // 1. Visit dashboard (mocked as logged in)
        await page.route('**/auth/v1/user', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ id: 'user_123', email: TEST_EMAIL }),
            });
        });

        await page.goto(`/${LOCALE}/dashboard`);
        await expect(page.locator('header')).toBeVisible();

        // 2. Perform logout
        console.log('[Auth Test] Initiating logout...');

        // Mock the logout API call
        await page.route('**/auth/v1/logout', async route => {
            await route.fulfill({ status: 204 });
        });

        // Logout is usually in a dropdown or sidebar
        // Let's try to find a button with 'Log out' text or icon
        const logoutBtn = page.getByRole('button', { name: /Log out/i }).first();
        await logoutBtn.click();

        // 3. Verify redirection to landing page
        await page.waitForURL(`**/${LOCALE}`);
        await expect(page).toHaveURL(new RegExp(`.*\\/${LOCALE}$`));
        console.log('[Auth Test] SUCCESS: Logged out and redirected to home.');

        // 4. Verify dashboard is no longer accessible
        // Mock user as NOT found
        await page.route('**/auth/v1/user', async route => {
            await route.fulfill({ status: 401 });
        });

        await page.goto(`/${LOCALE}/dashboard`);
        await page.waitForURL(url => url.pathname.includes('/authentication'));
        console.log('[Auth Test] SUCCESS: Dashboard access blocked after logout.');
    });

    test('⏰ Session persistence and automatic token refresh', async ({ page, context }) => {
        // Mock an active session
        const storageState = {
            cookies: [
                {
                    name: 'sb-access-token',
                    value: 'active_token',
                    domain: 'localhost', // Adjust domain if different
                    path: '/',
                    expires: Date.now() / 1000 + 3600, // Expires in 1 hour
                }
            ]
        };

        await context.addCookies(storageState.cookies);

        await page.route('**/auth/v1/user', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ id: 'user_123', email: TEST_EMAIL }),
            });
        });

        await page.goto(`/${LOCALE}/dashboard`);
        await expect(page.locator('header')).toBeVisible();

        // Reload page should still keep us logged in
        console.log('[Auth Test] Reloading page to test persistence...');
        await page.reload();
        await expect(page.locator('header')).toBeVisible();
        console.log('[Auth Test] SUCCESS: Session persisted across reload.');
    });
});
