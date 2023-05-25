import { Book } from '../book/book.js';
import { ActionResult } from '../util/action-result.js';
import { debug } from '../util/utils.js';
import { Timeouts, Urls, maybeClosePage } from './action-utils.js';
import { ActionParams } from '../util/action-params.js';

export async function scrapeIsbn(book: Book, params: ActionParams): Promise<ActionResult> {
  const verbose = params.verbose;

  if (params.dryRun) {
    debug(book, verbose, 'Getting ISBN (dry run)');
    return new ActionResult(true);
  }
  if (book.isbn != '') {
    debug(book, verbose, 'Already have ISBN: ' + book.isbn);
    return new ActionResult(true);
  }

  const url = Urls.EDIT_PAPERBACK_CONTENT.replace('$id', book.id);
  debug(book, verbose, 'Getting ISBN at url: ' + url);
  const page = await params.browser.newPage();

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: Timeouts.MIN_1 });
  await page.waitForTimeout(Timeouts.SEC_1);  // Just in case.
  debug(book, verbose, 'Page loaded');

  // get ISBN
  await page.waitForSelector(
    '#free-print-isbn-accordion-row span[data-path="view.free_isbn"]',
    { visible: true, timeout: Timeouts.MIN_1 });
  debug(book, verbose, 'Wait done');
  let isbn = await page.$eval(
    '#free-print-isbn-accordion-row span[data-path="view.free_isbn"]',
    el => el.innerText, { timeout: Timeouts.MIN_3 });

  debug(book, verbose, 'Got ISBN: ' + isbn);
  book.isbn = isbn;

  await maybeClosePage(params, page);
  return new ActionResult(isbn != '');
}
