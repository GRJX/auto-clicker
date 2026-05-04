import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://reportportal.custom-tools.dictuy.iesprd.ictu-sr.nl/ui/#login');
  await page.getByRole('textbox', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Login' }).fill('superadmin');
  await page.getByRole('textbox', { name: 'Login' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('erebus');
  await page.getByRole('textbox', { name: 'Password' }).press('Enter');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link').filter({ hasText: 'Launches' }).click();
  await page.getByRole('link', { name: 'To investigate' }).click();
  await page.getByRole('link', { name: '302', exact: true }).click();
  await page.getByText('To Investigate').first().click();
});