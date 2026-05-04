#!/usr/bin/env node
import { Command } from 'commander';
import { runLoop } from './runner.ts';
import { saveLogin } from './login.ts';
import { recordAction } from './record.ts';
import { listAll } from './list.ts';

const program = new Command();
program.name('auto-clicker').description('Replay Playwright-recorded actions in a loop');

program
  .command('login <name>')
  .description('Open a headed browser, log in manually, save storage state')
  .option('--url <url>', 'starting URL')
  .action(async (name: string, opts: { url?: string }) => {
    await saveLogin(name, opts.url);
  });

program
  .command('record <name>')
  .description('Record a browser session via playwright codegen and save as an action')
  .option('--state <state>', 'storage state to load before recording')
  .option('--url <url>', 'starting URL')
  .action(async (name: string, opts: { state?: string; url?: string }) => {
    await recordAction(name, opts.state, opts.url);
  });

program
  .command('run <action>')
  .description('Replay an action in a loop')
  .option('--state <state>', 'storage state to load (optional)')
  .option('--loops <n>', 'number of iterations', (v) => parseInt(v, 10))
  .option('--duration <d>', 'max duration, e.g. 30s, 10m, 1h')
  .option('--headless', 'run headless (default: headed)')
  .action(async (action: string, opts: { state?: string; loops?: number; duration?: string; headless?: boolean }) => {
    if (!opts.loops && !opts.duration) {
      console.error('error: at least one of --loops or --duration is required');
      process.exit(2);
    }
    const code = await runLoop({
      actionName: action,
      stateName: opts.state,
      loops: opts.loops,
      durationMs: opts.duration ? parseDuration(opts.duration) : undefined,
      headed: !opts.headless,
    });
    process.exit(code);
  });

program.command('list').description('List recorded actions and saved states').action(listAll);

program.parseAsync(process.argv).catch((err) => {
  console.error(err?.stack ?? err);
  process.exit(1);
});

function parseDuration(s: string): number {
  const m = /^(\d+)(ms|s|m|h)$/.exec(s.trim());
  if (!m) throw new Error(`invalid duration: ${s} (use e.g. 30s, 10m, 1h)`);
  const n = parseInt(m[1], 10);
  const u = m[2];
  return u === 'ms' ? n : u === 's' ? n * 1000 : u === 'm' ? n * 60_000 : n * 3_600_000;
}
