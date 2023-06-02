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

    if (!book.wasEverPublished) {
        debug(book, verbose, 'Archiving - not needed, has never been published');
        // publishing not needed.
        return new ActionResult(true);
    }
    if (book.id == '' || book.titleId == '' || book.asin == '' || book.isbn == '') {
        error(book, 'Cannot archive , not sure what to do, this book does not seem to have basic publishing information, maybe never published or needs scraping first?');
        return new ActionResult(false).doNotRetry();
    }
    if (book.pubStatus.toLowerCase() != 'draft') {
        error(book, 'Can only archive book with pubStatus=DRAFT but got: ' + book.pubStatus);
        return new ActionResult(false).doNotRetry();
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
    await clickSomething(`#print_archive_title-${book.titleId}`, 'Archive', page, book, verbose);

    // Click confimration
    debug(book, verbose, 'Clicking confirmation');
    id = '#archive-title-ok-announce';
    await page.focus(id, Timeouts.SEC_10);
    await page.click(id, Timeouts.SEC_10);
    await page.waitForTimeout(Timeouts.SEC_5);

    debug(book, verbose, 'Archiving done');

    await maybeClosePage(params, page);
    return new ActionResult(true);
}
