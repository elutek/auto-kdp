import { Book } from '../book/book.js';
import { ActionResult } from '../util/action-result.js';
import { debug } from '../util/utils.js';
import { Urls, maybeClosePage } from './action-utils.js';
import { ActionParams } from '../util/action-params.js';
import { Timeouts } from '../util/timeouts.js';

export async function assignIsbn(book: Book, params: ActionParams): Promise<ActionResult> {
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

  await page.goto(url, Timeouts.MIN_1);
  await page.waitForTimeout(Timeouts.SEC_1);  // Just in case.
  debug(book, verbose, 'Page loaded');

  // if no ISBN, get one.
  // TODO: Support providing your own ISBN.
  if (book.isbn == '' && !book.wasEverPublished) {
    // Click 'Get a free KDP ISBN'
    await page.click('#free-print-isbn-btn-announce', Timeouts.MIN_3);
    await page.waitForTimeout(Timeouts.SEC_1);  // Just in case.

    // Confirm that this ISBN can only be used on Amazon.
    await page.click('#print-isbn-confirm-button-announce', Timeouts.MIN_3);
    debug(book, verbose, 'Getting ISBN/5');
    await page.waitForSelectorVisible('#free-print-isbn-accordion-row span[data-path="view.free_isbn"]', Timeouts.MIN_3);
    debug(book, verbose, 'Getting ISBN/6');
    await page.waitForTimeout(Timeouts.SEC_2);  // Just in case.
    debug(book, verbose, 'Getting ISBN/7');
    const isbn = await page.evalValue('#free-print-isbn-accordion-row span[data-path="view.free_isbn"]', el => el.innerText, Timeouts.SEC_30);
    debug(book, verbose, 'Got ISBN: ' + isbn);
    book.isbn = isbn;

    if (isbn == '') {
      debug(book, verbose, 'Could not get ISBN! This happens often that Amazon did assign ISBN but failed to display it here. Action scrapeIsbn solves it.')
    }
  }

  return new ActionResult(book.isbn != '');
}
