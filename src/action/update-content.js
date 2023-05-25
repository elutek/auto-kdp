import { ActionResult } from '../action-result.js';
import { debug, error } from '../utils.js'
import { Timeouts, Urls, fileExists, maybeClosePage } from './action-utils.js';

export async function updateContent(book, params) {
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

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: Timeouts.MIN_1 });
    await page.waitForTimeout(Timeouts.SEC_1);  // Just in case.

    // Manuscript
    debug(book, verbose, 'Uploading manuscript');
    const futureManuscriptFileChooser = page.waitForFileChooser();
    await page.click('#data-print-book-publisher-interior-file-upload-browse-button-announce');
    const manuscriptFileChooser = await futureManuscriptFileChooser;
    await manuscriptFileChooser.accept([book.manuscriptLocalFile]);
    debug(book, verbose, 'Waiting for manuscript file chooser');
    await page.waitForSelector('#data-print-book-publisher-interior-file-upload-success',
        { visible: true, timeout: Timeouts.MIN_5 });

    // Select self-uploaded cover.
    debug(book, verbose, 'Selecting PDF cover');
    let id = '#data-print-book-publisher-cover-choice-accordion';
    let selector = id + ' [data-a-accordion-row-name=\'UPLOAD\'] a[data-action=\'a-accordion\']';
    await page.waitForSelector(selector);
    await page.click(selector);
    await page.waitForTimeout(Timeouts.SEC_1);

    // Cover
    debug(book, verbose, 'Uploading cover');
    const futureCoverFileChooser = page.waitForFileChooser();
    await page.click('#data-print-book-publisher-cover-file-upload-browse-button-announce');
    const coverFileChooser = await futureCoverFileChooser;
    await coverFileChooser.accept([book.coverLocalFile]);
    debug(book, verbose, 'Waiting for cover file chooser');
    await page.waitForSelector('#data-print-book-publisher-cover-file-upload-success',
        { visible: true, timeout: Timeouts.MIN_10 });
    await page.waitForTimeout(Timeouts.SEC_2);
    debug(book, verbose, 'Upload done');

    // Click Launch previewer
    debug(book, verbose, 'Clicking Launch Previewer (typically takes 3.5min)');
    await page.waitForSelector('#print-preview-noconfirm-announce');
    debug(book, verbose, 'Clicking Launch Previewer/1');
    await page.click('#print-preview-noconfirm-announce');
    debug(book, verbose, 'Clicking Launch Previewer/2');
    await page.waitForNavigation({ timeout: Timeouts.MIN_15 });
    debug(book, verbose, 'Clicking Launch Previewer/3');
    await page.waitForTimeout(Timeouts.SEC_2);  // Just in case.

    // Click Approve on the preview page.
    debug(book, verbose, 'Clicking Approve');
    await page.waitForSelector('#printpreview_approve_button_enabled a', { timeout: Timeouts.MIN_3 });
    debug(book, verbose, 'Clicking Approve/1');
    await page.click('#printpreview_approve_button_enabled a');
    debug(book, verbose, 'Clicking Approve/2');
    await page.waitForSelector('#save-announce', { visible: true, timeout: Timeouts.MIN_3 });
    debug(book, verbose, 'Clicking Approve/3');
    await page.waitForTimeout(Timeouts.SEC_1);  // Just in case.

    // Save.
    debug(book, verbose, 'Clicking Save');
    await page.click('#save-announce');
    await page.waitForSelector('#potter-success-alert-bottom div div', { visible: true });
    await page.waitForTimeout(500);  // Just in case.

    await maybeClosePage(params, page);
    return new ActionResult(true);
}
