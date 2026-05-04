# auto-clicker

Replay Playwright-recorded browser actions in a loop.

## Setup

```bash
npm install
npx playwright install chromium
```

## CLI

All commands run via `npm start --` (or `npx tsx src/cli.ts`).

### `login <name>`

Open a headed browser, log in manually, save cookies + localStorage to `state/<name>.json`. Press ENTER in the terminal once you're logged in.

```bash
npm start -- login myacc --url https://example.com/login
```

Options:
- `--url <url>` — starting URL.

### `record <name>`

Wrap `playwright codegen`, save the result as `actions/<name>.ts`. Optionally start from a saved state so you don't re-record the login.

```bash
npm start -- record myflow --url https://example.com
npm start -- record myflow --state myacc --url https://example.com
```

Options:
- `--state <state>` — load a saved state before recording.
- `--url <url>` — starting URL.

### `run <action>`

Replay an action repeatedly. Fresh browser context per iteration. On failure, the loop continues and a trace is saved to `runs/<timestamp>/<n>/trace.zip`. Exits non-zero if any iteration failed.

```bash
npm start -- run myflow --loops 50
npm start -- run myflow --state myacc --duration 10m
npm start -- run myflow --loops 100 --duration 30m   # stops at whichever hits first
```

Options:
- `--state <state>` — load a saved state at the start of each iteration (optional). Without it, every iteration starts from an empty browser and the action must log in itself.
- `--loops <n>` — number of iterations.
- `--duration <d>` — max wall time (`30s`, `10m`, `1h`).
- `--headless` — run headless (default: headed).

At least one of `--loops` or `--duration` is required.

### `list`

```bash
npm start -- list
```

## Action contract

Each file in `actions/` default-exports an async function:

```ts
import type { Page } from 'playwright';
import type { Action } from '../src/types.ts';

const action: Action = async (page: Page) => {
  await page.goto('https://example.com');
  // ...recorded steps
};

export default action;
```

The runner owns browser/context lifecycle; the action only owns the steps. Each iteration starts from a fresh browser context, optionally seeded with the storage state passed via `--state`.

### Storage state caveats

`storageState` captures cookies and `localStorage`. It does **not** capture `sessionStorage` and won't survive auth flows that bind to fingerprint, IP, or one-shot tokens. If `--state` doesn't restore a logged-in session, drop it and let the recorded action log in each iteration.

## VS Code Playwright extension

`playwright.config.ts` and a placeholder `tests/example.spec.ts` exist so the Playwright VS Code extension activates and Pick Locator works. Set `BASE_URL` to override the configured base URL.
