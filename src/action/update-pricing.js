import { ActionResult } from '../util/action-result.js';
import { debug } from '../util/utils.js'
import { Timeouts, Urls, clearTextField, maybeClosePage, waitForElements } from './action-utils.js';

async function updatePriceIfNeeded(newPrice, currency, id, page, book, verbose) {
  const oldPriceStr = (await page.$eval(id, x => x.value)) || '';
  const newPriceStr = '' + newPrice;
  if (newPriceStr != oldPriceStr) {
    debug(book, verbose, `Updating price ${currency}: from ${oldPriceStr} to ${newPriceStr}`);
    await clearTextField(page, id, true);
    await page.waitForTimeout(Timeouts.SEC_1);
    await page.type(id, newPriceStr);
    await page.waitForTimeout(Timeouts.SEC_2);
    if (id == '#data-pricing-print-' + book.primaryMarketplace + '-price-input input') {
      await page.waitForTimeout(Timeouts.SEC_10);
    }
    return true;
  } else {
    debug(book, verbose, `Updating price ${currency} - not needed (got price ${newPriceStr})`);
    return false;
  }
}

export async function updatePricing(book, params) {
  const verbose = params.verbose;

  if (params.dryRun) {
    debug(book, verbose, 'Updating pricing (dry run)');
    return new ActionResult(true);
  }

  // Publishing happens on the pricing page.
  const url = Urls.EDIT_PAPERBACK_PRICING.replace('$id', book.id);
  if (verbose) {
    debug(book, verbose, 'Updating pricing at url:' + url);
  }
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

  let wasUpdated = false;

  // Primary marketplace.
  let id = '#data-print-book-home-marketplace .a-native-dropdown';
  await page.waitForSelector(id);
  const primaryMarketplace = await page.$eval(id, x => x.value);
  if (primaryMarketplace != book.primaryMarketplace) {
    debug(book, verbose, "Primary marketplace: from " + primaryMarketplace + ' to: ' + book.primaryMarketplace);
    await page.select(id, book.primaryMarketplace);
    await page.waitForTimeout(Timeouts.SEC_2);
  } else {
    debug(book, verbose, "Primary marketplace - update needed");
  }

  // Prices
  // TODO: Update the primary marketplace's price first..
  wasUpdated |= await updatePriceIfNeeded(book.priceUsd, 'USD', '#data-pricing-print-us-price-input input', page, book, verbose);
  await page.waitForTimeout(Timeouts.SEC_5);
  wasUpdated |= await updatePriceIfNeeded(book.priceGbp, 'GBP', '#data-pricing-print-uk-price-input input', page, book, verbose);
  wasUpdated |= await updatePriceIfNeeded(book.priceEur, 'DE/EUR', '#data-pricing-print-de-price-input input', page, book, verbose);
  wasUpdated |= await updatePriceIfNeeded(book.priceEur, 'FR/EUR', '#data-pricing-print-fr-price-input input', page, book, verbose);
  wasUpdated |= await updatePriceIfNeeded(book.priceEur, 'ES/EUR', '#data-pricing-print-es-price-input input', page, book, verbose);
  wasUpdated |= await updatePriceIfNeeded(book.priceEur, 'IT/EUR', '#data-pricing-print-it-price-input input', page, book, verbose);
  wasUpdated |= await updatePriceIfNeeded(book.priceEur, 'NL/EUR', '#data-pricing-print-nl-price-input input', page, book, verbose);
  wasUpdated |= await updatePriceIfNeeded(book.pricePl, 'PL', '#data-pricing-print-pl-price-input input', page, book, verbose);
  wasUpdated |= await updatePriceIfNeeded(book.priceSe, 'PL', '#data-pricing-print-se-price-input input', page, book, verbose);
  wasUpdated |= await updatePriceIfNeeded(book.priceJp, 'JP', '#data-pricing-print-jp-price-input input', page, book, verbose);
  wasUpdated |= await updatePriceIfNeeded(book.priceCa, 'CA', '#data-pricing-print-ca-price-input input', page, book, verbose);
  wasUpdated |= await updatePriceIfNeeded(book.priceAu, 'AU', '#data-pricing-print-au-price-input input', page, book, verbose);

  await page.waitForTimeout(Timeouts.SEC_2);

  // Save
  if (wasUpdated) {
    debug(book, verbose, 'Saving');
    await page.click('#save-announce');
    await page.waitForSelector(
      '#potter-success-alert-bottom div div', { visible: true });
    await page.waitForTimeout(Timeouts.SEC_1);  // Just in case.
  } else {
    debug(book, verbose, 'Saving - not needed, prices were not updated')
  }

  await maybeClosePage(params, page);
  return new ActionResult(true);
}
