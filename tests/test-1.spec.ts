import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://reportportal.custom-tools.dictuy.iesprd.ictu-sr.nl/ui/#login');
  await page.getByRole('textbox', { name: 'Login' }).click();
});