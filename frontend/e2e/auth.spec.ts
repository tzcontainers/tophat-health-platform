import { expect, test } from '@playwright/test';

test.describe('Route protection', () => {
    test('candidate route redirects to login when unauthenticated', async ({ page }) => {
        await page.goto('/candidate/dashboard');
        await expect(page).toHaveURL(/\/login\?redirect=%2Fcandidate%2Fdashboard/);
    });

    test('client route redirects to login when unauthenticated', async ({ page }) => {
        await page.goto('/client/dashboard');
        await expect(page).toHaveURL(/\/login\?redirect=%2Fclient%2Fdashboard/);
    });

    test('admin route redirects to login when unauthenticated', async ({ page }) => {
        await page.goto('/admin/dashboard');
        await expect(page).toHaveURL(/\/login\?redirect=%2Fadmin%2Fdashboard/);
    });

    test('candidate can sign in and access candidate dashboard', async ({ page }) => {
        await page.goto('/candidate/dashboard');
        await page.getByLabel('Email address').fill('amara.jones@example.com');
        await page.getByLabel('Password').fill('password');
        await page.getByRole('button', { name: 'Sign in' }).click();
        await expect(page).toHaveURL(/\/candidate\/dashboard/);
        await expect(page.getByRole('heading', { name: 'Candidate overview' })).toBeVisible();
    });

    test('client can sign in and access client dashboard', async ({ page }) => {
        await page.goto('/client/dashboard');
        await page.getByLabel('Email address').fill('admin@nhs-trust.com');
        await page.getByLabel('Password').fill('password');
        await page.getByRole('button', { name: 'Sign in' }).click();
        await expect(page).toHaveURL(/\/client\/dashboard/);
        await expect(page.getByRole('heading', { name: 'Client overview' })).toBeVisible();
    });

    test('admin can sign in and access admin dashboard', async ({ page }) => {
        await page.goto('/admin/dashboard');
        await page.getByLabel('Email address').fill('admin@tophat.com');
        await page.getByLabel('Password').fill('password');
        await page.getByRole('button', { name: 'Sign in' }).click();
        await expect(page).toHaveURL(/\/admin\/dashboard/);
        await expect(page.getByRole('heading', { name: 'Operations overview' })).toBeVisible();
    });
});
