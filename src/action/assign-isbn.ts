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
  if (book.isbn == '' && book.canEditCriticalMetadata()) {
    // Click 'Get a free KDP ISBN'
    await page.click('div[data-a-accordion-row-name="free"] .a-button-input', Timeouts.SEC_30)
    await page.waitForTimeout(Timeouts.SEC_1);

    // Click confirmation button
    await page.click('#free-isbn-confirm-button-announce', Timeouts.SEC_30)
    await page.waitForTimeout(Timeouts.SEC_1);

    // Confirm that this ISBN can only be used on Amazon.
    await page.waitForSelectorVisible('.potter-print-isbn-display span:nth-child(2)', Timeouts.MIN_1);
    debug(book, verbose, 'Wait done');
    let isbn = await page.evalValue('.potter-print-isbn-display span:nth-child(2)', el => el.innerText, Timeouts.SEC_10);

    debug(book, verbose, 'Got ISBN: ' + isbn);
    book.isbn = isbn;

    if (isbn == '') {
      debug(book, verbose, 'Could not get ISBN! This happens often that Amazon did assign ISBN but failed to display it here. Action scrapeIsbn solves it.')
    }
  }

  return new ActionResult(book.isbn != '');
}
