import { chromium } from 'playwright';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';

export async function saveLogin(name: string, url?: string): Promise<void> {
  const stateDir = path.resolve(process.cwd(), 'state');
  await fs.mkdir(stateDir, { recursive: true });
  const out = path.join(stateDir, `${name}.json`);

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  if (url) await page.goto(url);

  console.log('Log in in the browser, then press ENTER here to save state.');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  await rl.question('');
  rl.close();

  await context.storageState({ path: out });
  await browser.close();
  console.log(`saved ${out}`);
}
