import { promises as fs } from 'node:fs';
import path from 'node:path';

export async function listAll(): Promise<void> {
  const cwd = process.cwd();
  const actions = await listDir(path.join(cwd, 'actions'), '.ts');
  const states = await listDir(path.join(cwd, 'state'), '.json');
  console.log('Actions:');
  if (actions.length === 0) console.log('  (none)');
  actions.forEach((a) => console.log(`  ${a}`));
  console.log('States:');
  if (states.length === 0) console.log('  (none)');
  states.forEach((s) => console.log(`  ${s}`));
}

async function listDir(dir: string, ext: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir);
    return entries.filter((e) => e.endsWith(ext)).map((e) => e.slice(0, -ext.length)).sort();
  } catch {
    return [];
  }
}
