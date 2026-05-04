import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export async function recordAction(name: string, state?: string, url?: string): Promise<void> {
  const cwd = process.cwd();
  const actionsDir = path.resolve(cwd, 'actions');
  await fs.mkdir(actionsDir, { recursive: true });
  const out = path.join(actionsDir, `${name}.ts`);

  const tmp = path.join(os.tmpdir(), `codegen-${Date.now()}.ts`);
  const args = ['playwright', 'codegen', '--target=playwright-test', '-o', tmp];
  if (state) {
    const statePath = path.resolve(cwd, 'state', `${state}.json`);
    await fs.access(statePath).catch(() => {
      throw new Error(`state not found: ${statePath}`);
    });
    args.push('--load-storage', statePath);
  }
  if (url) args.push(url);

  console.log('Recording — perform the action in the browser, then close it.');
  await new Promise<void>((resolve, reject) => {
    const p = spawn('npx', args, { stdio: 'inherit' });
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`codegen exited ${code}`))));
    p.on('error', reject);
  });

  const raw = await fs.readFile(tmp, 'utf8');
  const startIdx = raw.indexOf('=> {');
  const endIdx = raw.lastIndexOf('});');
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    throw new Error(`could not parse codegen output at ${tmp}`);
  }
  const body = raw.slice(startIdx + '=> {'.length, endIdx).replace(/^\n+|\n+$/g, '');

  const file = `import type { Page } from 'playwright';
import type { Action } from '../src/types.ts';

const action: Action = async (page: Page) => {
${body}
};

export default action;
`;
  await fs.writeFile(out, file);
  await fs.unlink(tmp).catch(() => {});
  console.log(`saved ${out}`);
}
