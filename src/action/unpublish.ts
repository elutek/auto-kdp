import { ActionResult } from '../util/action-result.js';
import { debug } from '../util/utils.js';
import { Urls, maybeClosePage } from './action-utils.js';
import { Book } from '../book/book.js';
import { ActionParams } from '../util/action-params.js';
import { Timeouts } from '../util/timeouts.js';

export async function unpublish(book: Book, params: ActionParams): Promise<ActionResult> {
    const verbose = params.verbose;

    if (params.dryRun) {
        debug(book, verbose, 'Unpublishing (dry run)');
        return new ActionResult(true);
    }

    const url = Urls.BOOKSHELF_URL;
    debug(book, verbose, 'Unpublishing at url: ' + url);

    if (book.canEditCriticalMetadata() || !book.isLive() || book.id == '' || book.titleId == '' || book.asin == '' || book.isbn == '') {
        debug(book, verbose, 'Cannot unpublish: the book does not seem to have been published')
        return new ActionResult(true);
    }
    if (book.isUnpublished()) {
        debug(book, verbose, 'Cannog unpublish: the book is already unpublished');
        return new ActionResult(false);
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
    await page.waitForTimeout(Timeouts.SEC_5);

    // Opening menu
    // NOTE: the id below is correct, but sometimes it is just not 
    // working. I observed actions scrape:unpublish not working while
    // remove-series-title:unpublish seems to work perfectly. 
    // Maybe something with the mouse or combinations of timeouts.
    id = `#zme-indie-bookshelf-dual-print-actions-${book.pubStatus.toLowerCase()}-book-actions-${book.id}-other-actions-announce`;
    debug(book, verbose, `Opening menu id=` + id);
    await page.focus(id, Timeouts.SEC_10);
    await page.tap(id, Timeouts.SEC_10);
    //await page.waitForTimeout(Timeouts.SEC_HALF);

    // Click unpublish.
    id = `#print_unpublish-${book.titleId}`;
    debug(book, verbose, 'Clicking Unpublish id=' + id);
    await page.focus(id, Timeouts.SEC_10);
    try {
        await page.click(id, Timeouts.SEC_10);
    } catch (e) {
        console.log("I tried to click unpublish but that failed");
        await page.click(id, Timeouts.SEC_10);
    }
    await page.waitForTimeout(Timeouts.SEC_1);

    // Click confimration
    debug(book, verbose, 'Clicking confirmation');
    id = '#confirm-unpublish-announce';
    await page.focus(id, Timeouts.SEC_10);
    await page.click(id, Timeouts.SEC_10);
    await page.waitForTimeout(Timeouts.SEC_10);

    debug(book, verbose, 'Unpublishing done');

    await maybeClosePage(params, page);
    return new ActionResult(true);
}
