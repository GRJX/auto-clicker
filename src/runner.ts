import { chromium } from 'playwright';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Action } from './types.ts';

type RunOpts = {
  actionName: string;
  stateName?: string;
  loops?: number;
  durationMs?: number;
  headed: boolean;
};

export async function runLoop(opts: RunOpts): Promise<number> {
  const cwd = process.cwd();
  const actionPath = path.resolve(cwd, 'actions', `${opts.actionName}.ts`);
  await assertExists(actionPath, `action not found: ${actionPath}`);

  let statePath: string | undefined;
  if (opts.stateName) {
    statePath = path.resolve(cwd, 'state', `${opts.stateName}.json`);
    await assertExists(statePath, `state not found: ${statePath}`);
  }

  const mod = await import(pathToFileURL(actionPath).href);
  const action: Action = mod.default;
  if (typeof action !== 'function') {
    throw new Error(`action "${opts.actionName}" must default-export an async function`);
  }

  const browser = await chromium.launch({ headless: !opts.headed });
  const runsRoot = path.resolve(cwd, 'runs', new Date().toISOString().replace(/[:.]/g, '-'));

  const start = Date.now();
  const deadline = opts.durationMs ? start + opts.durationMs : Infinity;
  const maxLoops = opts.loops ?? Infinity;

  const durations: number[] = [];
  let ok = 0;
  let fail = 0;
  let i = 0;

  try {
    while (i < maxLoops && Date.now() < deadline) {
      i++;
      const iterStart = Date.now();
      const context = await browser.newContext({
        ...(statePath ? { storageState: statePath } : {}),
        ...(process.env.BASE_URL ? { baseURL: process.env.BASE_URL } : {}),
      });
      const page = await context.newPage();
      let traceStarted = false;
      try {
        await context.tracing.start({ screenshots: true, snapshots: true });
        traceStarted = true;
        await action(page, { iteration: i });
        const dur = Date.now() - iterStart;
        durations.push(dur);
        ok++;
        console.log(`#${i}\tok\t${dur}ms`);
        await context.tracing.stop();
      } catch (e: any) {
        const dur = Date.now() - iterStart;
        durations.push(dur);
        fail++;
        const msg = e?.message?.split('\n')[0] ?? String(e);
        console.log(`#${i}\tfail\t${dur}ms\t${msg}`);
        if (traceStarted) {
          const dir = path.join(runsRoot, String(i));
          await fs.mkdir(dir, { recursive: true });
          await context.tracing.stop({ path: path.join(dir, 'trace.zip') }).catch(() => {});
        }
      } finally {
        await context.close().catch(() => {});
      }
    }
  } finally {
    await browser.close().catch(() => {});
  }

  const total = ok + fail;
  const sorted = [...durations].sort((a, b) => a - b);
  const pct = (q: number) =>
    sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))] : 0;
  const elapsed = Date.now() - start;
  console.log(
    `\n${total} runs  ok=${ok} fail=${fail}  p50=${pct(0.5)}ms p95=${pct(0.95)}ms  elapsed=${elapsed}ms`,
  );
  if (fail > 0) console.log(`failed traces: ${runsRoot}`);
  return fail > 0 ? 1 : 0;
}

async function assertExists(p: string, msg: string): Promise<void> {
  try {
    await fs.access(p);
  } catch {
    throw new Error(msg);
  }
}
