import { ActionParams } from '../util/action-params.js';
import { ActionResult } from '../util/action-result.js';
import { debug, error } from '../util/utils.js';
import { Urls, maybeClosePage } from './action-utils.js';
import { Book } from '../book/book.js';
import { Timeouts } from '../util/timeouts.js';

export async function scrapeAmazonCoverImageUrl(book: Book, params: ActionParams): Promise<ActionResult> {
  const verbose = params.verbose;

  if (params.dryRun) {
    debug(book, verbose, 'Scraping cover (dry run)');
    return new ActionResult(true);
  }
  const url = Urls.AMAZON_PRODUCT_URL + book.asin;
  debug(book, verbose, 'Scraping cover at product url: ' + url);

  if (book.asin == '') {
    debug(book, verbose, 'NOT scraping cover: no ASIN');
    return new ActionResult(false).doNotRetry();
  }

  const page = await params.browser.newPage();

  const text = await page.getRawContent(url, Timeouts.MIN_3);
  const resultUrl = doScrapeAmazonCoverImageUrl(text, book, verbose);
  const success = resultUrl != null && resultUrl != '';

  if (success) {
    debug(book, verbose, 'Cover image url: ' + resultUrl);
    book.coverImageUrl = resultUrl;
  } else {
    error(book, "Cover image url not found!");
  }

  await maybeClosePage(params, page);
  return new ActionResult(success);
}

export function doScrapeAmazonCoverImageUrl(text: string, book: Book, verbose: boolean) {
  if (text == null || text == undefined) {
    return null;
  }
  /* Istanbul skip next */
  debug(book, verbose, 'Got response of length ' + text.length);

  const regex = /<img .*?src="https:\/\/m.media-amazon.com\/images\/I\/([a-zA-Z0-9_\.\-]*.jpg)"/gm;
  const urls: string[] = [];

  for (const extractedUrls of text.matchAll(regex)) {
    urls.push(extractedUrls[1]);
  }

  if (urls.length == 0) {
    return null;
  }
  if (urls.length > 1) {
    error(book, "Expecting one URL but multiple ofund:\n\t" + urls.join("\n\t"));
  }
  return urls[0];
}
