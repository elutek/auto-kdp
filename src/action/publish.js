import { Timeouts, Urls, debug, waitForElements } from './utils.js';

export async function publish(book, params) {
  const verbose = params.verbose;

  if (params.dryRun) {
    debug(verbose, 'Publishing (dry run)');
    return true;
  }

  if (book.wasEverPublished && book.pubStatus == 'LIVE' && book.pubStatusDetail == '') {
    // Publishing not needed.
    return true;
  }

  const url = Urls.EDIT_PAPERBACK_PRICING.replace('$id', book.id);
  debug(verbose, 'Publishing at url: ' + url);
  const page = await params.browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: Timeouts.MIN_3 });
  await page.waitForTimeout(Timeouts.SEC_1);  // Just in case.

  await waitForElements(page, [
    '#book-setup-navigation-bar-details-link .a-alert-content',
    '#book-setup-navigation-bar-content-link .a-alert-content',
    '#book-setup-navigation-bar-pricing-link .a-alert-content',
  ]);

  debug(verbose, 'Checking if we can publish');

  let id = '#book-setup-navigation-bar-details-link .a-alert-content';
  const metadataStatus = await page.$eval(id, x => x.textContent.trim()) || '';

  id = '#book-setup-navigation-bar-content-link .a-alert-content';
  const contentStatus = await page.$eval(id, x => x.textContent.trim()) || '';

  id = '#book-setup-navigation-bar-pricing-link .a-alert-content';
  const pricingStatus = await page.$eval(id, x => x.textContent.trim()) || '';

  let ok = (metadataStatus == 'Complete') && contentStatus == 'Complete' && pricingStatus == 'Complete';

  let isSucess = ok;
  if (ok) {
    debug(verbose, 'Metadata, content and pricing status: OK');
    debug(verbose, 'Clicking publish');
    await page.waitForSelector('#save-and-publish-announce', { timeout: Timeouts.MIN_1 });
    await page.click('#save-and-publish-announce', { timeout: Timeouts.MIN_1 });
    await page.waitForNavigation({ timeout: Timeouts.MIN_1 });
    await page.waitForTimeout(Timeouts.SEC_1);  // Just in case.

    book.wasEverPublished = 'true';
  } else {
    debug(verbose, `Cannot publish! Metadata: ${metadataStatus}, content: ${contentStatus}, pricing: ${pricingStatus}`);
  }

  if (!params.keepOpen) {
    await page.close();
  }

  return isSucess;
}
