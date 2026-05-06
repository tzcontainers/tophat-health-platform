import { expect, test } from '@playwright/test';

test.describe('Public pages', () => {
    test('homepage loads', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('heading', { name: 'Healthcare staffing operations, organized end to end.' })).toBeVisible();
    });

    test('job listing page loads', async ({ page }) => {
        await page.goto('/jobs');
        await expect(page.getByRole('heading', { name: 'Open healthcare roles' })).toBeVisible();
    });

    test('job detail page loads', async ({ page }) => {
        await page.goto('/jobs/00000000-0000-0000-0000-000000000101');
        await expect(page.getByRole('heading', { name: 'Band 6 RMN - Prison Nurse' })).toBeVisible();
    });

    test('login page loads', async ({ page }) => {
        await page.goto('/login');
        await expect(page.getByRole('heading', { name: 'Sign in', exact: true })).toBeVisible();
    });
});
