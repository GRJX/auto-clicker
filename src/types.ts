import type { Page } from 'playwright';

export type ActionContext = { iteration: number };
export type Action = (page: Page, ctx: ActionContext) => Promise<void>;
