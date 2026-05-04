import type { Page } from 'playwright';
import type { Action } from '../src/types.ts';

const action: Action = async (page: Page) => {
  await page.goto('https://reportportal.custom-tools.dictuy.iesprd.ictu-sr.nl/ui/');
  await page.getByRole('link').filter({ hasText: 'Launches' }).click();
  await page.getByRole('link', { name: 'To investigate' }).click();
  await page.locator('#app > div > div > div > div > div.layout__content--y1ANI > div.scrollWrapper__scroll-component--L3JSO > div.scrollWrapper__scrolling-content--FGvAS.scrollWrapper__with-footer--lyezV > div.layout__scrolling-content--u4qiC > div.layout__page-container--O1S09 > div > div:nth-child(2) > div.grid__grid--W4yQA > div:nth-child(11) > div > div.launchSuiteGrid__ti-col--qV5Sv.gridCell__grid-cell--EIqeC.gridCell__align-left--DFXWN > div > div.defectStatistics__desktop-visible--GBQS6 > div > a > div.donutChart__chart-container--CaV6D').first().click();
  await page.getByText('To Investigate').nth(4).click();
  await page.getByTitle('System Issue').click();
  await page.locator('#modal-root').getByRole('textbox').fill('Execution was aborted, due to two master pipeline branches.');
  await page.getByRole('button', { name: 'Apply' }).click();
};

export default action;
