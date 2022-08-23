import { Timeouts, Urls } from './utils.js';

export async function ensureLoggedIn(params) {
  const page = await params.browser.newPage();
  await page.goto(
    Urls.CREATE_PAPERBACK, { waitUntil: 'domcontentloaded', timeout: Timeouts.MIN_1});

  // This is a fake creation, just to trigger signin (bookshelf is not enough)
  await page.waitForSelector('#data-print-book-title');

  if (!params.keepOpen) {
    await page.close();
  }
}
