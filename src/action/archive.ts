import { Book } from '../book/book.js';
import { ActionResult } from '../util/action-result.js';
import { debug, error } from '../util/utils.js';
import { Urls, clickSomething, maybeClosePage } from './action-utils.js';
import { ActionParams } from '../util/action-params.js';
import { Timeouts } from '../util/timeouts.js';

export async function archive(book: Book, params: ActionParams): Promise<ActionResult> {
    const verbose = params.verbose;

    if (params.dryRun) {
        debug(book, verbose, 'Archiving (dry run)');
        return new ActionResult(true);
    }

    const url = Urls.BOOKSHELF_URL;
    debug(book, verbose, 'Archiving at url: ' + url);

    if (book.isLive()) {
        debug(book, verbose, 'Cannot archive: the book is live. Unpublish it first.');
        return new ActionResult(true);
    }
    if (!book.isUnpublished()) {
        debug(book, verbose, 'Cannot archive: the book has never been published');
        return new ActionResult(true);
    }

    // Open the page
    let page = await params.browser.newPage();
    await page.goto(url, Timeouts.MIN_3);
    await page.waitForTimeout(Timeouts.SEC_1);  // Just in case.

    // Type the search query.
    debug(book, verbose, 'Querying for the book');
    let id = '#podbookshelftable-search-input';
    await page.clearTextField(id, Timeouts.SEC_10);
    await page.type(id, book.id, Timeouts.SEC_10);

    // Click search button.
    debug(book, verbose, 'Clicking Search');
    id = '#podbookshelftable-search-button-submit .a-button-input';
    await page.focus(id, Timeouts.SEC_10);
    await page.click(id, Timeouts.SEC_10);

    await page.waitForTimeout(Timeouts.SEC_1);

    // Opening menu
    debug(book, verbose, 'Opening menu');
    id = `#zme-indie-bookshelf-dual-print-actions-draft-book-actions-${book.id}-other-actions-announce`;
    await page.tap(id, Timeouts.SEC_10);

    // Click archive.
    await clickSomething(`#print_archive_title-${book.titleId}`, 'Archive (from menu)', page, book, verbose);
    await page.waitForTimeout(Timeouts.SEC_3);

    // Click confimration
    debug(book, verbose, 'Clicking Archive to confirm');
    await page.click('#archive-title-ok-announce', Timeouts.SEC_10);
    await page.waitForTimeout(Timeouts.SEC_5);

    debug(book, verbose, 'Archiving done');

    await maybeClosePage(params, page);
    return new ActionResult(true);
}
