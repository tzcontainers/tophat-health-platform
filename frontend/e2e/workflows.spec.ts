import { expect, test } from '@playwright/test';

async function login(
    page: import('@playwright/test').Page,
    username: string,
    password: string,
    expectedPath: RegExp
) {
    await page.goto('/login');
    await page.getByLabel('Email address').fill(username);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(expectedPath);
}

test.describe('Critical workflows', () => {
    test('candidate timesheet flow', async ({ page }) => {
        await login(page, 'amara.jones@example.com', 'password', /\/candidate\/dashboard/);
        await page.goto('/candidate/timesheets');
        await page.getByTestId('timesheet-placement-select').selectOption({ index: 1 });
        await page.locator('input[name="weekCommencing"]').fill('2026-05-04');
        await page.locator('input[name="shiftDate"]').fill('2026-05-05');
        await page.locator('input[name="startTime"]').fill('08:00');
        await page.locator('input[name="endTime"]').fill('20:00');
        await page.locator('input[name="breakMinutes"]').fill('60');
        await page.locator('input[name="hoursWorked"]').fill('11');
        await page.getByRole('button', { name: 'Submit timesheet' }).click();
        await expect(page.getByText('Timesheet submitted.')).toBeVisible();
    });

    test('client timesheet approval flow', async ({ page }) => {
        await login(page, 'admin@nhs-trust.com', 'password', /\/client\/dashboard/);
        await page.goto('/client/timesheets');
        const firstApproveButton = page.getByRole('button', { name: 'Approve' }).first();
        await expect(firstApproveButton).toBeVisible();
        await firstApproveButton.click();
        await expect(page.getByText(/Timesheet approved\./)).toBeVisible();
    });

    test('admin compliance review flow', async ({ page }) => {
        await login(page, 'admin@tophat.com', 'password', /\/admin\/dashboard/);
        await page.goto('/admin/compliance');
        await page.getByRole('button', { name: 'Approve first pending' }).click();
        await expect(page.getByText(/Compliance review submitted\.|No pending records to review\./)).toBeVisible();
    });
});
