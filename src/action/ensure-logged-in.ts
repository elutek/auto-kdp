import { Urls, maybeClosePage } from './action-utils.js';
import { ActionParams } from '../util/action-params.js';
import { ActionResult } from '../util/action-result.js';
import { Timeouts } from '../util/timeouts.js';

export async function ensureLoggedIn(params: ActionParams): Promise<ActionResult> {
  const page = await params.browser.newPage();
  await page.goto(Urls.CREATE_PAPERBACK, Timeouts.MIN_1);

  // This is a fake creation, just to trigger signin (bookshelf is not enough)
  await page.waitForSelector('#data-print-book-title', Timeouts.SEC_15);

  await maybeClosePage(params, page, true);

  return new ActionResult(true);
}
