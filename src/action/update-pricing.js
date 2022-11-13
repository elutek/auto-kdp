import { Timeouts, Urls, clearTextField, debug } from './utils.js';

async function updatePriceIfNeeded(newPrice, currency, id, page, verbose) {
  const oldPriceStr = (await page.$eval(id, x => x.value)) || '';
  const newPriceStr = '' + newPrice;
  if (newPriceStr != oldPriceStr) {
    debug(verbose, `Updating price ${currency}: from ${oldPriceStr} to ${newPriceStr}`);
    await page.waitForSelector(id);
    await clearTextField(page, id);
    await page.waitForTimeout(Timeouts.SEC_1);
    await page.type(id, newPriceStr);
    await page.waitForTimeout(Timeouts.SEC_1);
  } else {
    debug(verbose, `Updating price ${currency} - not needed`);
  }
}

export async function updatePricing(book, params) {
  if (params.dryRun) {
    debug(verbose, 'Updating pricing (dry run)');
    return true;
  }

  const verbose = params.verbose;

  // Publishing happens on the pricing page.
  const url = Urls.EDIT_PAPERBACK_PRICING.replace('$id', book.id);
  if (verbose) {
    debug(verbose, 'Updating pricing at url:' + url);
  }
  const page = await params.browser.newPage();

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: Timeouts.MIN_1 });
  await page.waitForTimeout(Timeouts.SEC_1);  // Just in case.

  await updatePriceIfNeeded(book.priceUsd, 'USD', '#data-pricing-print-us-price-input input', page, verbose);
  await updatePriceIfNeeded(book.priceGbp, 'GBP', '#data-pricing-print-uk-price-input input', page, verbose);
  await updatePriceIfNeeded(book.priceEur, 'DE/EUR', '#data-pricing-print-de-price-input input', page, verbose);
  await updatePriceIfNeeded(book.priceEur, 'FR/EUR', '#data-pricing-print-fr-price-input input', page, verbose);
  await updatePriceIfNeeded(book.priceEur, 'ES/EUR', '#data-pricing-print-es-price-input input', page, verbose);
  await updatePriceIfNeeded(book.priceEur, 'IT/EUR', '#data-pricing-print-it-price-input input', page, verbose);
  await updatePriceIfNeeded(book.priceEur, 'NL/EUR', '#data-pricing-print-nl-price-input input', page, verbose);
  await updatePriceIfNeeded(book.pricePl, 'PL', '#data-pricing-print-pl-price-input input', page, verbose);
  await updatePriceIfNeeded(book.priceSe, 'PL', '#data-pricing-print-se-price-input input', page, verbose);
  await updatePriceIfNeeded(book.priceJp, 'JP', '#data-pricing-print-jp-price-input input', page, verbose);
  await updatePriceIfNeeded(book.priceCa, 'CA', '#data-pricing-print-ca-price-input input', page, verbose);
  await updatePriceIfNeeded(book.priceAu, 'AU', '#data-pricing-print-au-price-input input', page, verbose);

  await page.waitForTimeout(Timeouts.SEC_2);

  // Save
  debug(verbose, 'Saving');
  await page.click('#save-announce');
  await page.waitForSelector(
    '#potter-success-alert-bottom div div', { visible: true });
  await page.waitForTimeout(Timeouts.SEC_1);  // Just in case.

  if (!params.keepOpen) {
    await page.close();
  }

  return true;
}
