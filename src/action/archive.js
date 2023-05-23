import { ActionResult } from '../action-result.js';
import { debug } from '../utils.js';
import { Timeouts, Urls, clearTextField, maybeClosePage } from './utils.js';

export async function archive(book, params) {
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
        error(book, verbose, 'Cannog archive , not sure what to do, this book does not seem to have basic publishing information, maybe never published or needs scraping first?');
        return new ActionResult(false).doNotRetry();
    }
    if (book.pubStatus.toLowerCase() != 'draft') {
        error(book, verbose, 'Can only archive book with pubStatus=DRAFT but got: ' + book.pubStatus);
        return new ActionResult(false).doNotRetry();
    }

    // Open the page
    let page = await params.browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: Timeouts.MIN_3 });
    await page.waitForTimeout(Timeouts.SEC_1);  // Just in case.

    // Type the search query.
    debug(book, verbose, 'Querying for the book');
    let id = '#podbookshelftable-search-input';
    await page.waitForSelector(id, { timeout: Timeouts.SEC_10 });
    await clearTextField(page, id, true);
    await page.type(id, book.id);

    // Click search button.
    debug(book, verbose, 'Clicking Search');
    id = '#podbookshelftable-search-button-submit .a-button-input';
    await page.waitForSelector(id, { timeout: Timeouts.SEC_10 });
    await page.focus(id);
    await page.click(id, { timeout: Timeouts.SEC_3 });

    // Opening menu
    debug(book, verbose, 'Opening menu');
    id = `#zme-indie-bookshelf-dual-print-actions-draft-book-actions-${book.id}-other-actions-announce`;
    await page.waitForSelector(id, { timeout: Timeouts.SEC_10 });
    await page.focus(id);
    await page.hover(id);
    await page.tap(id);
    await page.waitForTimeout(Timeouts.SEC_1);

    // Click archive.
    debug(book, verbose, 'Clicking Archive');
    id = `#print_archive_title-${book.titleId}`;
    await page.waitForSelector(id, { timeout: Timeouts.SEC_10 });
    await page.focus(id);
    await page.click(id, { timeout: Timeouts.SEC_10 });
    await page.waitForTimeout(Timeouts.SEC_1);

    // Click confimration
    debug(book, verbose, 'Clicking confirmation');
    id = '#archive-title-ok-announce';
    await page.waitForSelector(id, { timeout: Timeouts.SEC_30 });
    await page.focus(id);
    await page.click(id, { timeout: Timeouts.SEC_10 });
    await page.waitForTimeout(Timeouts.SEC_10);

    debug(book, verbose, 'Archiving done');

    await maybeClosePage(params, page);
    return new ActionResult(true);
}
