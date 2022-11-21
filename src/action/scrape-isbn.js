import { ActionResult } from '../action-result.js';
import { debug } from '../utils.js';
import { Timeouts, Urls } from './utils.js';

export async function scrapeIsbn(book, params) {
  const verbose = params.verbose;

  if (params.dryRun) {
    debug(verbose, 'Getting ISBN (dry run)');
    return new ActionResult(true);
  }
  if (book.isbn != '') {
    debug(verbose, 'Already have ISBN: ' + book.isbn);
    return new ActionResult(true);
  }

  const url = Urls.EDIT_PAPERBACK_CONTENT.replace('$id', book.id);
  debug(verbose, 'Getting ISBN at url: ' + url);
  const page = await params.browser.newPage();

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: Timeouts.MIN_1 });
  await page.waitForTimeout(Timeouts.SEC_1);  // Just in case.
  debug(verbose, 'Page loaded');

  // get ISBN
  await page.waitForSelector(
    '#free-print-isbn-accordion-row span[data-path="view.free_isbn"]',
    { visible: true, timeout: Timeouts.MIN_1 });
  debug(verbose, 'Wait done');
  let isbn = await page.$eval(
    '#free-print-isbn-accordion-row span[data-path="view.free_isbn"]',
    el => el.innerText, { timeout: Timeouts.MIN_3 });

  debug(verbose, 'Got ISBN: ' + isbn);
  book.isbn = isbn;

  if (!params.keepOpen) {
    await page.close();
  }

  return new ActionResult(isbn != '');
}
