import { ActionResult } from '../util/action-result.js';
import { debug, error } from '../util/utils.js'
import { Urls, fileExists, maybeClosePage } from './action-utils.js';
import { Book } from '../book/book.js';
import { ActionParams } from '../util/action-params.js';
import { Timeouts } from '../util/timeouts.js';

export async function updateContent(book: Book, params: ActionParams): Promise<ActionResult> {
    const verbose = params.verbose;
    if (params.dryRun) {
        debug(book, verbose, 'Updating content (dry run)');
        return new ActionResult(true);
    }

    if (!fileExists(book.manuscriptLocalFile)) {
        error(book, "File does not exist: " + book.manuscriptLocalFile);
        return new ActionResult(false).doNotRetry();
    }
    if (!fileExists(book.coverLocalFile)) {
        error(book, "File does not exist: " + book.coverLocalFile);
        return new ActionResult(false).doNotRetry();
    }

    const url = Urls.EDIT_PAPERBACK_CONTENT.replace('$id', book.id);
    debug(book, verbose, 'Updating content at url: ' + url);
    const page = await params.browser.newPage();

    await page.goto(url, Timeouts.MIN_1);
    await page.waitForTimeout(Timeouts.SEC_1);  // Just in case.

    // Select self-uploaded cover.
    // We upload cover first becasue the manuscript will take a very long time.
    {
        debug(book, verbose, 'Selecting PDF cover option');
        let id = '#data-print-book-publisher-cover-choice-accordion';
        let selector = id + ' [data-a-accordion-row-name=\'UPLOAD\'] a[data-action=\'a-accordion\']';
        await page.click(selector, Timeouts.SEC_1);
        await page.waitForTimeout(Timeouts.SEC_1);
    }

    // Cover
    {
        debug(book, verbose, 'Uploading cover');
        page.selectFile('#data-print-book-publisher-cover-file-upload-browse-button-announce', book.coverLocalFile, Timeouts.MIN_3);
        debug(book, verbose, 'Waiting for cover file chooser');
        await page.waitForSelectorVisible('#data-print-book-publisher-cover-file-upload-success', Timeouts.MIN_15);
        await page.waitForTimeout(Timeouts.SEC_2);
        debug(book, verbose, 'Cover upload done');
    }


    // Manuscript
    {
        debug(book, verbose, 'Uploading manuscript');
        page.selectFile('#data-print-book-publisher-interior-file-upload-browse-button-announce', book.manuscriptLocalFile, Timeouts.MIN_3);
        debug(book, verbose, 'Waiting for manuscript file chooser');
        await page.waitForSelectorVisible('#data-print-book-publisher-interior-file-upload-success', Timeouts.MIN_15);
    }

    // Click Launch previewer
    debug(book, verbose, 'Clicking Launch Previewer (typically takes 3.5min)');
    await page.waitForSelector('#print-preview-noconfirm-announce', Timeouts.SEC_30);
    debug(book, verbose, 'Clicking Launch Previewer/1');
    await page.click('#print-preview-noconfirm-announce', Timeouts.SEC_10);
    debug(book, verbose, 'Clicking Launch Previewer/2');
    await page.waitForNavigation(Timeouts.MIN_15);
    debug(book, verbose, 'Clicking Launch Previewer/3');
    await page.waitForTimeout(Timeouts.SEC_2);  // Just in case.

    // Click Approve on the preview page.
    debug(book, verbose, 'Clicking Approve');
    await page.waitForSelector('#printpreview_approve_button_enabled a', Timeouts.MIN_3);
    debug(book, verbose, 'Clicking Approve/1');
    await page.click('#printpreview_approve_button_enabled a', Timeouts.MIN_1);
    debug(book, verbose, 'Clicking Approve/2');
    await page.waitForSelectorVisible('#save-announce', Timeouts.MIN_3);
    debug(book, verbose, 'Clicking Approve/3');
    await page.waitForTimeout(Timeouts.SEC_1);  // Just in case.

    // Save.
    debug(book, verbose, 'Clicking Save');
    await page.click('#save-announce', Timeouts.MIN_1);
    await page.waitForSelectorVisible('#potter-success-alert-bottom div div', Timeouts.MIN_1);
    await page.waitForTimeout(Timeouts.SEC_1);  // Just in case.

    await maybeClosePage(params, page);
    return new ActionResult(true);
}
