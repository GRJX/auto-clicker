import type { Page } from 'playwright';
import type { Action } from '../src/types.ts';

const action: Action = async (page: Page) => {
  await page.goto('https://reportportal.custom-tools.dictuy.iesprd.ictu-sr.nl/ui/');
  await page.getByRole('link').filter({ hasText: 'Launches' }).click();
  await page.getByRole('link', { name: 'To investigate' }).click();
  // The nth donut icon for the whole page (start at 0).
  await page.locator('div.gridRow__grid-row-wrapper--xj8DG > div > div > div > div > div > a').nth(1).click();
  await page.locator('div.defectType__defect-type-labels--MnnIu').first().hover();
  await page.locator('div.defectType__edit-icon--Qj4X4').first().waitFor({ state: 'visible' });
  await page.locator('div.defectType__edit-icon--Qj4X4').first().click();
  await page.getByTitle('System Issue').click();
  await page.locator('#modal-root').getByRole('textbox').fill('Execution in the pipeline was aborted. Rest of the test are failed.');
  await page.getByRole('button', { name: 'Apply' }).click();
};

export default action;
