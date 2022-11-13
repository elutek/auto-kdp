import { Timeouts, Urls, clearTextField, debug, normalizeText } from './utils.js';
import pkg from 'sleep';
const { sleep } = pkg;

// This function also creates a book.
export async function updateBookMetadata(book, params) {
    const verbose = params.verbose;

    if (params.dryRun) {
        debug(verbose, 'Updating book (dry run)');
        return true;
    }

    if (!book.canBeCreated()) {
        console.error('Some required fields missing - cannot create/update the book');
        return false;
    }

    const isNew = book.id == '';
    const url = isNew ? Urls.CREATE_PAPERBACK : Urls.EDIT_PAPERBACK_DETAILS.replace('$id', book.id);

    debug(verbose, (isNew ? 'Creating' : 'Updating') + ' at url: ' + url);

    const page = await params.browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: Timeouts.MIN_1 });
    await page.waitForTimeout(Timeouts.SEC_1);

    let id = '';

    if (!book.wasEverPublished) {

        // This fields can only be updated if the book
        // has never been published. After publishing, they
        // are set in stone.

        // Title
        debug(verbose, 'Updating title');
        id = '#data-print-book-title';
        await page.waitForSelector(id);
        if (!isNew) await clearTextField(page, id);
        await page.type(id, book.title);

        // TODO: Support subtitle
        // TODO: Support edition number

        // Author first name
        debug(verbose, 'Updating author');
        id = '#data-print-book-primary-author-first-name';
        await page.waitForSelector(id);
        if (!isNew) await clearTextField(page, id);
        await page.type(id, book.authorFirstName);

        // Author last name
        id = '#data-print-book-primary-author-last-name';
        await page.waitForSelector(id);
        if (!isNew) await clearTextField(page, id);
        await page.type(id, book.authorLastName);

        // Illustrator's first name
        if (book.illustratorFirstName != '' && book.illustratorLastName != '') {
            debug(verbose, 'Updating illustrator');
            id = '#data-print-book-contributors-0-first-name';
            await page.waitForSelector(id);
            if (!isNew) await clearTextField(page, id);
            await page.type(id, book.illustratorFirstName);

            // Illustrator's last name
            id = '#data-print-book-contributors-0-last-name';
            await page.waitForSelector(id);
            if (!isNew) await clearTextField(page, id);
            await page.type(id, book.illustratorLastName);

            // Illustrator's role.
            id = '#data-print-book-contributors-0-role-native';
            await page.waitForSelector(id);
            await page.select(id, 'illustrator');
        }
    }

    // Series title.
    if (book.seriesTitle != null && book.seriesTitle != '') {
        debug(verbose, 'Getting series title');
        id = '#series_title';
        await page.waitForSelector(id);
        const existingSeriesTitle = (await page.$eval(id, x => x.textContent.trim())) || '';

        if (existingSeriesTitle != '') {
            debug(verbose, 'Series title already set: ' + existingSeriesTitle);
            if (existingSeriesTitle != book.seriesTitle) {
                throw 'Cannot change series title. Please edit your series manually';
            }
        } else {
            debug(verbose, 'Series title not set. Updating it');

            debug(verbose, 'Clicking Add Series');
            id = '#add_series_button #a-autoid-2-announce';
            await page.waitForSelector(id);
            await page.click(id, { timeout: Timeouts.SEC_30 });
            await page.waitForTimeout(Timeouts.SEC_1);

            debug(verbose, 'Clicking Select Series for Existing series');
            id = '#react-aui-modal-content-1 span[data-test-id="modal-button-create-or-select-existing"] button';
            await page.waitForSelector(id);
            await page.click(id, { timeout: Timeouts.SEC_30 });
            await page.waitForTimeout(Timeouts.SEC_1);

            let searchQuery = book.seriesTitle.replace('?', ' ').trim();
            debug(verbose, 'Type search query: ' + searchQuery);
            id = '#react-aui-modal-content-1 input[type="search"]';
            await page.waitForSelector(id);
            await page.type(id, searchQuery);

            debug(verbose, 'Click Search');
            id = '#react-aui-modal-content-1 input[type="submit"]';
            await page.waitForSelector(id);
            await page.click(id, { timeout: Timeouts.SEC_30 });
            await page.waitForTimeout(Timeouts.SEC_1);

            debug(verbose, 'Clicking on our series (we assume we have only one as a result of the search)');
            id = '#react-aui-modal-content-1 .a-list-item button';
            await page.waitForSelector(id);
            await page.click(id, { timeout: Timeouts.SEC_30 });
            await page.waitForTimeout(Timeouts.SEC_1);

            debug(verbose, 'Clicking Main Content');
            id = '#react-aui-modal-content-1 span[aria-label="Main content"] button';
            await page.waitForSelector(id);
            await page.click(id, { timeout: Timeouts.SEC_30 });
            await page.waitForTimeout(Timeouts.SEC_1);

            debug(verbose, 'Clicking Confirm and continue');
            id = '#react-aui-modal-content-1 button';
            await page.waitForSelector(id);
            await page.click(id, { timeout: Timeouts.SEC_30 });
            await page.waitForTimeout(Timeouts.SEC_10);

            debug(verbose, 'Clicking Done');
            id = '#react-aui-modal-footer-1 input[type="submit"]';
            await page.waitForSelector(id);
            await page.click(id, { timeout: Timeouts.SEC_30 });
            await page.waitForTimeout(Timeouts.SEC_5);
        }
    }

    // Description - first check if update is needed. The typing
    // is pretty slow so we avoid it if not necessary.
    id = '#cke_18'; // Click button 'source'
    await page.click(id, { timeout: Timeouts.SEC_5 }); // Click button 'source'
    const oldDescription = normalizeText(await page.$eval('#cke_1_contents > textarea', x => x.value) || '');
    if (normalizeText(oldDescription) != normalizeText(book.description)) {
        // Description needs to be updated.
        debug(verbose, 'Updating description');
        //id = '#data-print-book-description';
        await page.waitForSelector(id);
        await page.click(id, { timeout: Timeouts.SEC_5 });
        id = '#cke_1_contents > textarea';
        await page.waitForSelector(id);
        if (!isNew) await clearTextField(page, id);
        await page.type(id, book.description);
    } else {
        debug(verbose, 'Updating description - not needed');
    }

    // Whether public domain
    // TODO: Support public domain case. 
    debug(verbose, 'Selecting whether public domain');
    await page.waitForSelector('#non-public-domain');
    await page.click('#non-public-domain', { timeout: Timeouts.SEC_5 });

    // Keywords - typing is slow so we first  check an update is needed.
    debug(verbose, 'Updating keywords');
    const oldKeyword0 = (await page.$eval('#data-print-book-keywords-0', x => x.value)) || '';
    const oldKeyword1 = (await page.$eval('#data-print-book-keywords-1', x => x.value)) || '';
    const oldKeyword2 = (await page.$eval('#data-print-book-keywords-2', x => x.value)) || '';
    const oldKeyword3 = (await page.$eval('#data-print-book-keywords-3', x => x.value)) || '';
    const oldKeyword4 = (await page.$eval('#data-print-book-keywords-4', x => x.value)) || '';
    const oldKeyword5 = (await page.$eval('#data-print-book-keywords-5', x => x.value)) || '';
    const oldKeyword6 = (await page.$eval('#data-print-book-keywords-6', x => x.value)) || '';

    if (book.keyword0 != oldKeyword0) {
        id = '#data-print-book-keywords-0';
        await page.waitForSelector(id);
        if (!isNew) await clearTextField(page, id);
        await page.type(id, book.keyword0);
    }

    if (book.keyword1 != oldKeyword1) {
        id = '#data-print-book-keywords-1';
        await page.waitForSelector(id);
        if (!isNew) await clearTextField(page, id);
        await page.type(id, book.keyword1);
    }

    if (book.keyword2 != oldKeyword2) {
        id = '#data-print-book-keywords-2';
        await page.waitForSelector(id);
        if (!isNew) await clearTextField(page, id);
        await page.type(id, book.keyword2);
    }

    if (book.keyword3 != oldKeyword3) {
        id = '#data-print-book-keywords-3';
        await page.waitForSelector(id);
        if (!isNew) await clearTextField(page, id);
        await page.type(id, book.keyword3);
    }

    if (book.keyword4 != oldKeyword4) {
        id = '#data-print-book-keywords-4';
        await page.waitForSelector(id);
        if (!isNew) await clearTextField(page, id);
        await page.type(id, book.keyword4);
    }

    if (book.keyword5 != oldKeyword5) {
        id = '#data-print-book-keywords-5';
        await page.waitForSelector(id);
        if (!isNew) await clearTextField(page, id);
        await page.type(id, book.keyword5);
    }

    if (book.keyword6 != oldKeyword6) {
        id = '#data-print-book-keywords-6';
        await page.waitForSelector(id);
        if (!isNew) await clearTextField(page, id);
        await page.type(id, book.keyword6);
    }

    // Categories
    debug(verbose, 'Selecting categories');
    id = '#data-print-book-categories-1-bisac';
    await page.waitForSelector(id);
    await page.$eval(id, (el, book) => {
        if (el) {
            el.value = book.category1;
        }
    }, book);
    id = '#data-print-book-categories-2-bisac';
    await page.waitForSelector(id);
    await page.$eval(id, (el, book) => {
        if (el) {
            el.value = book.category2;
        }
    }, book);

    // Whether adult content
    // TODO: We automatically select it is not adult content. Support for adult content would have to be added.
    await page.click('#data-print-book-is-adult-content input[value=\'false\']', { timeout: Timeouts.SEC_1 });

    // Save
    debug(verbose, 'Saving');
    await page.click('#save-announce', { timeout: Timeouts.SEC_5 });
    if (isNew) {
        await page.waitForNavigation();
    } else {
        await page.waitForSelector('#potter-success-alert-bottom div div', { visible: true });
        await page.waitForTimeout(Timeouts.SEC_2);
    }

    let isSuccess = true;
    if (isNew) {
        // Get id.
        const url = page.url();
        const splits = url.split('/');
        let index = splits.indexOf('paperback');
        if (index >= 0 && index + 1 < splits.length) {
            book.id = splits[index + 1];
            debug(verbose, 'Got book id: ' + book.id);
        } else {
            console.error('ERROR: could not get paperback id!!! from url: ' + url);
            isSuccess = false;
        }
    }

    if (!params.keepOpen) {
        await page.close();
    }

    return isSuccess;
}
