import { ActionResult } from '../action-result.js';
import { debug, stripPrefix } from '../utils.js';
import { Timeouts, Urls, maybeClosePage } from './utils.js';

export async function scrapeAmazonCoverImageUrl(book, params) {
  const verbose = params.verbose;

  if (params.dryRun) {
    debug(verbose, 'Scraping cover (dry run)');
    return new ActionResult(true);
  }
  const url = Urls.AMAZON_PRODUCT_URL + book.asin;
  debug(verbose, 'Scraping cover at product url: ' + url);

  if (book.asin == '') {
    debug(verbose, 'NOT scraping cover: no ASIN');
    return new ActionResult(false).doNotRetry();
  }

  const page = await params.browser.newPage();

  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: Timeouts.MIN_3 });
  await page.waitForTimeout(Timeouts.SEC_1);  // Just in case.

  // Get raw content
  const text = await response.text();
  const resultUrl = doScrapeAmazonCoverImageUrl(text, verbose);
  const success = resultUrl != null && resultUrl != '';

  if (success) {
    debug(verbose, 'Cover image url: ' + resultUrl);
    book.coverImageUrl = resultUrl;
  } else {
    console.error("Cover image url not found!");
  }

  await maybeClosePage(params, page);
  return new ActionResult(success);
}

export function doScrapeAmazonCoverImageUrl(text, verbose = false) {
  if (text == null || text == undefined) {
    return null;
  }
  /* Istanbul skip next */
  debug(verbose, 'Got response of length ' + text.length);
  const mainUrlRe = /"mainUrl":"([^"]+?)"/;
  const mainUrls = text.match(mainUrlRe);
  if (mainUrls == null) {
    return null;
  }
  /* Istanbul skip next */
  for (let i = 0; i < mainUrls.length; ++i) {
    debug(verbose, "    Matched: " + mainUrls[i]);
  }
  return mainUrls && mainUrls.length > 1 && mainUrls[1] && mainUrls[1] != '' &&
    mainUrls[1].startsWith(Urls.AMAZON_IMAGE_URL) ? stripPrefix(mainUrls[1], Urls.AMAZON_IMAGE_URL) : (
    mainUrls[1].startsWith(Urls.AMAZON_IMAGE_URL2) ? stripPrefix(mainUrls[1], Urls.AMAZON_IMAGE_URL2) : null);
}