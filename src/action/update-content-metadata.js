import { ActionResult } from '../action-result.js';
import { debug, error } from '../utils.js'
import { Timeouts, Urls, maybeClosePage } from './action-utils.js';

export async function updateContentMetadata(book, params) {
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

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: Timeouts.MIN_1 });
  await page.waitForTimeout(Timeouts.SEC_1);  // Just in case.
  debug(book, verbose, 'Loaded');

  // if no ISBN, get one.
  // TODO: Support providing your own ISBN.
  if (book.isbn == '' && !book.wasEverPublished) {
    // Click 'Get a free KDP ISBN'
    debug(book, verbose, 'Getting ISBN/1');
    await page.waitForSelector('#free-print-isbn-btn-announce', { timeout: Timeouts.MIN_3 });
    debug(book, verbose, 'Getting ISBN/2');
    await page.click('#free-print-isbn-btn-announce', { timeout: Timeouts.MIN_3 });
    debug(book, verbose, 'Getting ISBN/3');
    await page.waitForSelector('#print-isbn-confirm-button-announce', { timeout: Timeouts.MIN_3 });
    debug(book, verbose, 'Getting ISBN/4');
    await page.waitForTimeout(Timeouts.SEC_1);  // Just in case.

    // Confirm that this ISBN can only be used on Amazon.
    await page.click('#print-isbn-confirm-button-announce', { timeout: Timeouts.MIN_3 });
    debug(book, verbose, 'Getting ISBN/5');
    await page.waitForSelector('#free-print-isbn-accordion-row span[data-path="view.free_isbn"]',
      { visible: true, timeout: Timeouts.MIN_3 });
    debug(book, verbose, 'Getting ISBN/6');
    await page.waitForTimeout(Timeouts.SEC_2);  // Just in case.
    debug(book, verbose, 'Getting ISBN/7');
    const isbn = await page.$eval('#free-print-isbn-accordion-row span[data-path="view.free_isbn"]',
      el => el.innerText, { timeout: Timeouts.MIN_3 });
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
    await page.waitForSelector(id);
    await page.click(id);

    // Print option: bleed
    debug(book, verbose, 'Selecting bleed');
    if (book.paperBleed == 'yes') {
      id = '#a-autoid-5-announce'; // Bleed (PDF only)
    } else if (book.paperBleed == 'no') {
      id = '#a-autoid-4-announce'; // No bleed
    } else {
      throw new Error('Unrecognized value for bleed: ' + book.paperBleed);
    }
    await page.waitForSelector(id);
    await page.click(id);

    // Print option: glossy paper.
    debug(book, verbose, 'Selecting glossy paper');
    if (book.paperCoverFinish == 'glossy') {
      id = '#a-autoid-7-announce'; // Glossy
    } else if (book.paperCoverFinish == 'matte') {
      id = '#a-autoid-6-announce'; // Matte
    } else {
      throw new Error('Unrecognized value for paper finish: ' + book.paperCoverFinish);
    }
    await page.waitForSelector(id);
    await page.click(id);

    // Select trim. First click 'select different size' 
    debug(book, verbose, 'Selecting trim');
    id = '#trim-size-btn-announce';
    await page.waitForSelector(id);
    await page.click(id);

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
    await page.waitForSelector(id);
    await page.focus(id);

    debug(book, verbose, 'got focus');
    await page.waitForTimeout(Timeouts.SEC_1);
    await page.click(id);
    await page.waitForTimeout(Timeouts.SEC_1);
  }

  // Save
  debug(book, verbose, 'Saving metadata');
  await page.click('#save-announce');
  await page.waitForSelector('#potter-success-alert-bottom div div', { visible: true });
  await page.waitForTimeout(Timeouts.SEC_1);  // Just in case.

  await maybeClosePage(params, page);
  return new ActionResult(true);
}
