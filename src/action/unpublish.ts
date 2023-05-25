import { ActionResult } from '../util/action-result.js';
import { debug } from '../util/utils.js';
import { Timeouts, Urls, clearTextField, maybeClosePage } from './action-utils.js';
import { Book } from '../book/book.js';
import { ActionParams } from '../util/action-params.js';

export async function unpublish(book: Book, params: ActionParams): Promise<ActionResult> {
    const verbose = params.verbose;

    if (params.dryRun) {
        debug(book, verbose, 'Unpublishing (dry run)');
        return new ActionResult(true);
    }

    const url = Urls.BOOKSHELF_URL;
    debug(book, verbose, 'Unpublishing at url: ' + url);

    if (!book.wasEverPublished) {
        debug(book, verbose, 'unpublishing - not needed, has never been published');
        // publishing not needed.
        return new ActionResult(true);
    }
    if (book.id == '' || book.titleId == '' || book.asin == '' || book.isbn == '') {
        debug(book, verbose, 'Cannog unpublish, not sure what to do, this book does not seem to have basic publishing information, maybe never published or needs scraping first?');
        return new ActionResult(false);
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
    await page.click(id);
    await page.waitForTimeout(Timeouts.SEC_5);

    // Opening menu
    // NOTE: the id below is correct, but sometimes it is just not 
    // working. I observed actions scrape:unpublish not working while
    // remove-series-title:unpublish seems to work perfectly. 
    // Maybe something with the mouse or combinations of timeouts.
    id = `#zme-indie-bookshelf-dual-print-actions-${book.pubStatus.toLowerCase()}-book-actions-${book.id}-other-actions-announce`;
    debug(book, verbose, `Opening menu id=` + id);
    await page.waitForSelector(id, { timeout: Timeouts.SEC_10 });
    await page.focus(id);
    await page.tap(id);
    //await page.waitForTimeout(Timeouts.SEC_HALF);

    // Click unpublish.
    id = `#print_unpublish-${book.titleId}`;
    debug(book, verbose, 'Clicking Unpublish id=' + id);
    await page.waitForSelector(id, { timeout: Timeouts.SEC_10 });
    await page.focus(id);
    try {
        await page.click(id);
    } catch (e) {
        console.log("I tried to click unpublish but that failed");
        await page.click(id);
    }
    await page.waitForTimeout(Timeouts.SEC_1);

    // Click confimration
    debug(book, verbose, 'Clicking confirmation');
    id = '#confirm-unpublish-announce';
    await page.waitForSelector(id, { timeout: Timeouts.SEC_30 });
    await page.focus(id);
    await page.click(id);
    await page.waitForTimeout(Timeouts.SEC_10);

    debug(book, verbose, 'Unpublishing done');

    await maybeClosePage(params, page);
    return new ActionResult(true);
}
