import { Page } from 'puppeteer';

import { debug } from '../util/utils.js';
import { Timeouts, Urls, maybeClosePage, waitForElements } from './action-utils.js';
import { ActionResult } from '../util/action-result.js';
import { Book } from '../book/book.js';
import { ActionParams } from '../util/action-params.js';

async function priceNeedsUpdate(newPrice: number, currency: string, id: string, page: Page, verbose: boolean, book: Book) {
  const oldPriceStr = (await page.$eval(id, x => (x as HTMLInputElement).value)) || '';
  const newPriceStr = '' + newPrice;
  let needsUpdate = newPriceStr != oldPriceStr;
  if (verbose) {
    if (needsUpdate) {
      debug(book, verbose, `Price ${currency} - needs update from ${oldPriceStr} to ${newPriceStr}`);
    } else {
      debug(book, verbose, `Price ${currency} - ok, got ${oldPriceStr}`);
    }
  }
  return needsUpdate;
}

export async function isPricingUpdateNeeded(book: Book, params: ActionParams): Promise<ActionResult> {
  const verbose = params.verbose;

  if (params.dryRun) {
    debug(book, verbose, 'Checking if pricing needs update (dry run)');
    return new ActionResult(true);
  }

  const url = Urls.EDIT_PAPERBACK_PRICING.replace('$id', book.id);
  debug(book, verbose, 'Checking if pricing needs update at url: ' + url);
  const page = await params.browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: Timeouts.MIN_1 });
  await page.waitForTimeout(Timeouts.SEC_1);  // Just in case.

  // Wait for all selectors
  await waitForElements(page, [
    '#data-pricing-print-us-price-input input',
    '#data-pricing-print-uk-price-input input',
    '#data-pricing-print-de-price-input input',
    '#data-pricing-print-fr-price-input input',
    '#data-pricing-print-es-price-input input',
    '#data-pricing-print-it-price-input input',
    '#data-pricing-print-nl-price-input input',
    '#data-pricing-print-pl-price-input input',
    '#data-pricing-print-se-price-input input',
    '#data-pricing-print-jp-price-input input',
    '#data-pricing-print-ca-price-input input',
    '#data-pricing-print-au-price-input input',
  ]);

  let needsUpdate =
    (await priceNeedsUpdate(book.priceUsd, 'USD', '#data-pricing-print-us-price-input input', page, verbose, book)) ||
    (await priceNeedsUpdate(book.priceGbp, 'GBP', '#data-pricing-print-uk-price-input input', page, verbose, book)) ||
    (await priceNeedsUpdate(book.priceEur, 'DE/EUR', '#data-pricing-print-de-price-input input', page, verbose, book)) ||
    (await priceNeedsUpdate(book.priceEur, 'FR/EUR', '#data-pricing-print-fr-price-input input', page, verbose, book)) ||
    (await priceNeedsUpdate(book.priceEur, 'ES/EUR', '#data-pricing-print-es-price-input input', page, verbose, book)) ||
    (await priceNeedsUpdate(book.priceEur, 'IT/EUR', '#data-pricing-print-it-price-input input', page, verbose, book)) ||
    (await priceNeedsUpdate(book.priceEur, 'NL/EUR', '#data-pricing-print-nl-price-input input', page, verbose, book)) ||
    (await priceNeedsUpdate(book.pricePl, 'PL', '#data-pricing-print-pl-price-input input', page, verbose, book)) ||
    (await priceNeedsUpdate(book.priceSe, 'PL', '#data-pricing-print-se-price-input input', page, verbose, book)) ||
    (await priceNeedsUpdate(book.priceJp, 'JP', '#data-pricing-print-jp-price-input input', page, verbose, book)) ||
    (await priceNeedsUpdate(book.priceCa, 'CA', '#data-pricing-print-ca-price-input input', page, verbose, book)) ||
    (await priceNeedsUpdate(book.priceAu, 'AU', '#data-pricing-print-au-price-input input', page, verbose, book));

  debug(book, verbose, 'Needs update: ' + needsUpdate);

  await maybeClosePage(params, page);
  return new ActionResult(true).setNextActions('pricing:publish:scrape');
}

