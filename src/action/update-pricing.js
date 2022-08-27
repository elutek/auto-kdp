import { Timeouts, Urls, clearTextField, debug } from './utils.js';

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

  let id = '';

  if (book.priceUsd != null && book.priceUsd > 0) {
    debug(verbose, 'Updating price USD: ' + book.priceUsd);
    id = '#data-pricing-print-us-price-input input';
    await page.waitForSelector(id);
    await clearTextField(page, id);
    await page.waitForTimeout(Timeouts.SEC_1);
    await page.type(id, '' + book.priceUsd);
    await page.waitForTimeout(Timeouts.SEC_2);
  }

  // Open other markets window.
  // id = '#data-pricing-print-expander > a';
  // await page.waitForSelector(id);
  // await page.click(id);

  if (book.priceGbp != null && book.priceGbp > 0) {
    debug(verbose, 'Updating price GBP: ' + book.priceGbp);
    id = '#data-pricing-print-uk-price-input input';
    await page.waitForSelector(id, { visible: true });
    await clearTextField(page, id);
    await page.type(id, '' + book.priceGbp);
    await page.waitForTimeout(Timeouts.SEC_2);
  }

  // TODO: separate priceEur into price per country
  if (book.priceEur != null && book.priceEur > 0) {
    debug(verbose, 'Updating price DE/EUR: ' + book.priceEur);
    id = '#data-pricing-print-de-price-input input';
    await page.waitForSelector(id, { visible: true });
    await clearTextField(page, id);
    await page.type(id, '' + book.priceEur);
    await page.waitForTimeout(Timeouts.SEC_2);

    debug(verbose, 'Updating price FR/EUR: ' + book.priceEur);
    id = '#data-pricing-print-fr-price-input input';
    await page.waitForSelector(id, { visible: true });
    await clearTextField(page, id);
    await page.type(id, '' + book.priceEur);
    await page.waitForTimeout(Timeouts.SEC_2);

    debug(verbose, 'Updating price ES/EUR: ' + book.priceEur);
    id = '#data-pricing-print-es-price-input input';
    await page.waitForSelector(id, { visible: true });
    await clearTextField(page, id);
    await page.type(id, '' + book.priceEur);
    await page.waitForTimeout(Timeouts.SEC_2);

    debug(verbose, 'Updating price IT/EUR: ' + book.priceEur);
    id = '#data-pricing-print-it-price-input input';
    await page.waitForSelector(id, { visible: true });
    await clearTextField(page, id);
    await page.type(id, '' + book.priceEur);
    await page.waitForTimeout(Timeouts.SEC_2);

    debug(verbose, 'Updating price NL/EUR: ' + book.priceEur);
    id = '#data-pricing-print-nl-price-input input';
    await page.waitForSelector(id, { visible: true });
    await clearTextField(page, id);
    await page.type(id, '' + book.priceEur);
    await page.waitForTimeout(Timeouts.SEC_2);
  }

  if (book.pricePl != null && book.pricePl > 0) {
    debug(verbose, 'Updating price PL: ' + book.pricePl);
    id = '#data-pricing-print-pl-price-input input';
    await page.waitForSelector(id, { visible: true });
    await clearTextField(page, id);
    await page.type(id, '' + book.pricePl);
    await page.waitForTimeout(Timeouts.SEC_2);
  }

  if (book.priceSe != null && book.priceSe > 0) {
    debug(verbose, 'Updating price SE: ' + book.priceSe);
    id = '#data-pricing-print-se-price-input input';
    await page.waitForSelector(id, { visible: true });
    await clearTextField(page, id);
    await page.type(id, '' + book.priceSe);
    await page.waitForTimeout(Timeouts.SEC_2);
  }

  if (book.priceJp != null && book.priceJp > 0) {
    debug(verbose, 'Updating price JP: ' + book.priceJp);
    id = '#data-pricing-print-jp-price-input input';
    await page.waitForSelector(id, { visible: true });
    await clearTextField(page, id);
    await page.type(id, '' + book.priceJp);
    await page.waitForTimeout(Timeouts.SEC_2);
  }

  if (book.priceCa != null && book.priceCa > 0) {
    debug(verbose, 'Updating price CA: ' + book.priceCa);
    id = '#data-pricing-print-ca-price-input input';
    await page.waitForSelector(id, { visible: true });
    await clearTextField(page, id);
    await page.type(id, '' + book.priceCa);
    await page.waitForTimeout(Timeouts.SEC_2);
  }

  if (book.priceAu != null && book.priceAu > 0) {
    debug(verbose, 'Updating price AU: ' + book.priceCa);
    id = '#data-pricing-print-au-price-input input';
    await page.waitForSelector(id, { visible: true });
    await clearTextField(page, id);
    await page.type(id, '' + book.priceAu);
    await page.waitForTimeout(Timeouts.SEC_2);
  }

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
