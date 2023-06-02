import { ActionResult } from '../util/action-result.js';
import { debug, error } from '../util/utils.js'
import { Urls, maybeClosePage } from './action-utils.js';
import { Book } from '../book/book.js';
import { ActionParams } from '../util/action-params.js';
import { Timeouts } from '../util/timeouts.js';

export async function updateContentMetadata(book: Book, params: ActionParams): Promise<ActionResult> {
  const verbose = params.verbose;

  if (params.dryRun) {
    debug(book, verbose, 'Updating content metadata (dry run)');
    return new ActionResult(true);
  }

  if (book.wasEverPublished) {
    error(book, 'Cannot republish content of a published book');
    return new ActionResult(false).doNotRetry();
  }

  const url = Urls.EDIT_PAPERBACK_CONTENT.replace('$id', book.id);
  debug(book, verbose, 'Updating content metadata at url: ' + url);
  const page = await params.browser.newPage();

  await page.goto(url, Timeouts.MIN_1);
  await page.waitForTimeout(Timeouts.SEC_1);  // Just in case.
  debug(book, verbose, 'Loaded');

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

  if (!book.wasEverPublished) {
    let id = '';

    // Print option: color print on white paper
    debug(book, verbose, 'Selecting paper color: ' + book.paperColor);
    if (book.paperColor == 'black-and-cream') {
      id = '#a-autoid-0-announce';
    } else if (book.paperColor == 'black-and-white') {
      id = '#a-autoid-1-announce';
    } else if (book.paperColor == 'standard-color') {
      id = '#a-autoid-2-announce';
    } else if (book.paperColor == 'premium-color') {
      id = '#a-autoid-3-announce';
    } else {
      throw new Error('Unrecognized value for paper color: ' + book.paperColor);
    }
    await page.click(id, Timeouts.SEC_5);

    // Print option: bleed
    debug(book, verbose, 'Selecting bleed');
    if (book.paperBleed == 'yes') {
      id = '#a-autoid-5-announce'; // Bleed (PDF only)
    } else if (book.paperBleed == 'no') {
      id = '#a-autoid-4-announce'; // No bleed
    } else {
      throw new Error('Unrecognized value for bleed: ' + book.paperBleed);
    }
    await page.click(id, Timeouts.SEC_5);

    // Print option: glossy paper.
    debug(book, verbose, 'Selecting glossy paper');
    if (book.paperCoverFinish == 'glossy') {
      id = '#a-autoid-7-announce'; // Glossy
    } else if (book.paperCoverFinish == 'matte') {
      id = '#a-autoid-6-announce'; // Matte
    } else {
      throw new Error('Unrecognized value for paper finish: ' + book.paperCoverFinish);
    }
    await page.click(id, Timeouts.SEC_5);

    // Select trim. First click 'select different size' 
    debug(book, verbose, 'Selecting trim');
    id = '#trim-size-btn-announce';
    await page.click(id, Timeouts.SEC_5);

    // Select trim size.
    debug(book, verbose, 'Selecting trim: ' + book.paperTrim);
    if (book.paperTrim == '5x8') {
      id = '#trim-size-popular-option-0-0-announce';
    } else if (book.paperTrim == '5.25x8') {
      id = '#trim-size-popular-option-0-1-announce';
    } else if (book.paperTrim == '5.5x8.5') {
      id = '#trim-size-popular-option-0-2-announce';
    } else if (book.paperTrim == '6x9') {
      id = '#trim-size-popular-option-0-3-announce';
    } else if (book.paperTrim == '8.5x8.5') {
      id = '#trim-size-nonstandard-option-0-3-announce';
    } else {
      throw new Error('Unrecognized value for paper trim: ' + book.paperTrim);
    }
    // TODO: Support more trim sizes
    await page.focus(id, Timeouts.SEC_5);

    debug(book, verbose, 'got focus');
    await page.click(id, Timeouts.SEC_5);
  }

  // Save
  debug(book, verbose, 'Saving metadata');
  await page.click('#save-announce', Timeouts.SEC_5);
  await page.waitForSelectorVisible('#potter-success-alert-bottom div div', Timeouts.SEC_1);
  await page.waitForTimeout(Timeouts.SEC_1);  // Just in case.

  await maybeClosePage(params, page);
  return new ActionResult(true);
}
