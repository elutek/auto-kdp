import { Timeouts, Urls, debug } from './utils.js';

export async function publish(book, params) {
  const verbose = params.verbose;

  if (params.dryRun) {
    debug(verbose, 'Publishing (dry run)');
    return true;
  }

  const url = Urls.EDIT_PAPERBACK_PRICING.replace('$id', book.id);
  debug(verbose, 'Publishing at url: ' + url);
  const page = await params.browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: Timeouts.MIN_3 });
  await page.waitForTimeout(Timeouts.SEC_1);  // Just in case.

  debug(verbose, 'Clicking publish');
  await page.waitForSelector('#save-and-publish-announce', { timeout: Timeouts.MIN_1 });
  await page.click('#save-and-publish-announce', { timeout: Timeouts.MIN_1 });
  await page.waitForNavigation({ timeout: Timeouts.MIN_1 });
  await page.waitForTimeout(Timeouts.SEC_1);  // Just in case.

  book.wasEverPublished = 'true';

  if (!params.keepOpen) {
    await page.close();
  }

  return true;
}
