import { Page } from 'puppeteer';

import { Book } from '../book/book.js';
import { ActionResult } from '../util/action-result.js';
import { debug, normalizeSearchQuery } from '../util/utils.js';
import { Timeouts, Urls, clearTextField, maybeClosePage } from './action-utils.js';
import { ActionParams } from '../util/action-params.js';

// This function also creates a book.
export async function setSeriesTitle(book: Book, params: ActionParams, forceRemoval: boolean = false): Promise<ActionResult> {
    const verbose = params.verbose;

    if (params.dryRun) {
        debug(book, verbose, 'Setting series title book (dry run)');
        return new ActionResult(true);
    }

    if (book.id == '') {
        debug(book, verbose, 'Cannot set title - no id');
        return new ActionResult(true).doNotRetry();
    }

    const url = Urls.EDIT_PAPERBACK_DETAILS.replace('$id', book.id);

    debug(book, verbose, 'Setting series title');

    const page = await params.browser.newPage();
    let response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: Timeouts.MIN_1 });

    if (response.status() == 500) {
        debug(book, verbose, 'KDP returned internal erorr (500).');
        await maybeClosePage(params, page);
        return new ActionResult(false).doNotRetry();
    }

    await page.waitForTimeout(Timeouts.SEC_1); // Just in case.

    let id = '';

    // Series title (only for non-new books)
    debug(book, verbose, 'Getting series title');
    id = '#series_title';
    const existingSeriesTitle = (await page.$eval(id, x => x.textContent.trim())) || '';
    debug(book, verbose, `Current series title: ${existingSeriesTitle}`);

    if (forceRemoval && existingSeriesTitle != '') {
        debug(book, verbose, `Removing book from series ${book.seriesTitle}`);
        await removeSeriesTitle(page, book, verbose);
    } else if (book.seriesTitle == existingSeriesTitle) {
        debug(book, verbose, `Updating series title - not needed, got ${existingSeriesTitle}`);
    } else if (book.seriesTitle != '' && existingSeriesTitle == '') {
        debug(book, verbose, `Updating series title to ${book.seriesTitle}`);
        const result = await updateSeriesTitle(page, book, verbose);
        if (!result) {
            return new ActionResult(false);
        }
    } else if (book.seriesTitle == '' && existingSeriesTitle != '') {
        debug(book, verbose, `Removing book from series ${book.seriesTitle}`);
        await removeSeriesTitle(page, book, verbose);
    } else {
        // The hard case - we need to modify series title.
        // We cannot modify - we need to remove from the series, and
        // add to a different one.
        await removeSeriesTitle(page, book, verbose);
        const result = await updateSeriesTitle(page, book, verbose);
        if (!result) {
            return new ActionResult(false);
        }
    }

    debug(book, verbose, 'Saving - not needed for series title');

    await maybeClosePage(params, page);
    return new ActionResult(true);
}

async function updateSeriesTitle(page, book, verbose) {
    if (book.seriesTitle == '') {
        throw 'Cannot set series title - it is already empty'
    }
    let id = '';
    let modalName = "#react-aui-modal-content-1";
    let footerName = "#react-aui-modal-footer-1";

    debug(book, verbose, 'Clicking Add Series');
    id = '#add_series_button #a-autoid-2-announce';
    await page.waitForSelector(id);
    await page.click(id);
    await page.waitForTimeout(Timeouts.SEC_2);

    debug(book, verbose, 'Clicking Select Series for Existing series');
    try {
        id = modalName + ' span[data-test-id="modal-button-create-or-select-existing"] button';
        await page.waitForSelector(id, { timeout: Timeouts.SEC_5 });
    } catch (e) {
        debug(book, verbose, "Trying 2");
        modalName = "#react-aui-modal-content-2";
        footerName = "#react-aui-modal-footer-2";
        id = modalName + ' span[data-test-id="modal-button-create-or-select-existing"] button';
        await page.waitForSelector(id, { timeout: Timeouts.SEC_10 });
    }
    await page.click(id);
    await page.waitForTimeout(Timeouts.SEC_1);

    let searchQuery = normalizeSearchQuery(book.seriesTitle)

    const maxAttempts = 2;

    for (let attempt = 1; attempt <= maxAttempts; ++attempt) {
        try {
            debug(book, verbose, 'Typing search query: ' + searchQuery);
            id = modalName + ' input[type="search"]';
            if (attempt > 1) {
                await clearTextField(page, id);
            }
            await page.waitForSelector(id);
            await page.focus(id);
            await page.type(id, searchQuery);
            await page.waitForTimeout(Timeouts.SEC_1);

            debug(book, verbose, 'Click Search for the series');
            id = modalName + ' input[type="submit"]';
            await page.waitForSelector(id);
            await page.focus(id);
            await page.click(id);
            await page.waitForTimeout(Timeouts.SEC_2);

            debug(book, verbose, 'Clicking on our series (we assume we have only one as a result of the search)');
            id = modalName + ' .a-list-item button';
            await page.waitForSelector(id, { timeout: Timeouts.SEC_5 });
            await page.focus(id);
            await page.click(id);
            await page.waitForTimeout(Timeouts.SEC_1);

            // We are done.
            attempt = maxAttempts;
        } catch (e) {
            // Failure - search results did not return any results.
            if (attempt < maxAttempts) {
                debug(book, verbose, 'Failed - retrying');
            } else {
                debug(book, verbose, 'Failed - failing');
                return false;
            }
        }
    }

    debug(book, verbose, 'Clicking Main Content');
    id = modalName + ' span[aria-label="Main content"] button';
    await page.waitForSelector(id);
    await page.click(id);
    await page.waitForTimeout(Timeouts.SEC_1);

    debug(book, verbose, 'Clicking Confirm and continue');
    id = modalName + ' button';
    await page.waitForSelector(id);
    await page.click(id);

    debug(book, verbose, 'Waiting for the "Saving" message to disappear');
    await page.waitForTimeout(Timeouts.SEC_5);

    debug(book, verbose, 'Clicking Done');
    id = footerName + ' input[type="submit"]';
    await page.waitForSelector(id);
    await page.click(id);
    await page.waitForTimeout(Timeouts.SEC_1);

    debug(book, verbose, 'Clicking in the page');
    id = '#a-page';
    await page.waitForSelector(id);
    await page.click(id);
    await page.waitForTimeout(Timeouts.SEC_1);
    await page.focus(id);

    return true;
}

async function removeSeriesTitle(page: Page, book: Book, verbose: boolean) {
    let id = '';

    debug(book, verbose, 'Clicking Remove from Series');
    id = '#a-autoid-1-announce';
    await page.waitForSelector(id);
    await page.click(id);
    await page.waitForTimeout(Timeouts.SEC_1);

    debug(book, verbose, 'Clicking Remove from Series (confirmation)');
    try {
        id = '#react-aui-modal-footer-1 span[aria-label="Remove from series"] button';
        await page.waitForSelector(id, { timeout: Timeouts.SEC_5 });
    } catch (e) {
        debug(book, verbose, "Trying 2");
        id = '#react-aui-modal-footer-2 span[aria-label="Remove from series"] button';
        await page.waitForSelector(id);
    }
    await page.click(id);
    await page.waitForTimeout(Timeouts.SEC_10);

    debug(book, verbose, 'Clicking Done');
    try {
        id = '#react-aui-modal-footer-1 input[type="submit"]';
        await page.waitForSelector(id, { timeout: Timeouts.SEC_5 });
    } catch (e) {
        debug(book, verbose, "Trying 2");
        id = '#react-aui-modal-footer-2 input[type="submit"]';
        await page.waitForSelector(id);
    }
    await page.click(id);
    await page.waitForTimeout(Timeouts.SEC_1);
}
