import { Timeouts, Urls, clearTextField, debug } from './utils.js';

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
    await page.waitForTimeout(Timeouts.SEC_2);

    if (!book.wasEverPublished) {

        // Title
        debug(verbose, 'Updating title');
        let id = '#data-print-book-title';
        await page.waitForSelector(id);
        if (!isNew) await clearTextField(page, id);
        await page.type(id, book.title);

        // TODO: Support subtitle
        // TODO: Support series
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

    // Description
    debug(verbose, 'Updating description');
    //id = '#data-print-book-description';
    let id = '#cke_18'; // Click button 'source'
    await page.waitForSelector(id);
    await page.click(id);
    id = '#cke_1_contents > textarea';
    await page.waitForSelector(id);
    if (!isNew) await clearTextField(page, id);
    await page.type(id, book.description);

    // Whether public domain
    // TODO: Support public domain case. 
    debug(verbose, 'Selecting whether public domain');
    await page.waitForSelector('#non-public-domain');
    await page.click('#non-public-domain');

    // Keywords
    debug(verbose, 'Updating keywords');
    if (book.keyword0 != '') {
        id = '#data-print-book-keywords-0';
        await page.waitForSelector(id);
        if (!isNew) await clearTextField(page, id);
        await page.type(id, book.keyword0);
    }

    if (book.keyword1 != '') {
        id = '#data-print-book-keywords-1';
        await page.waitForSelector(id);
        if (!isNew) await clearTextField(page, id);
        await page.type(id, book.keyword1);
    }

    if (book.keyword2 != '') {
        id = '#data-print-book-keywords-2';
        await page.waitForSelector(id);
        if (!isNew) await clearTextField(page, id);
        await page.type(id, book.keyword2);
    }

    if (book.keyword3 != '') {
        id = '#data-print-book-keywords-3';
        await page.waitForSelector(id);
        if (!isNew) await clearTextField(page, id);
        await page.type(id, book.keyword3);
    }

    if (book.keyword4 != '') {
        id = '#data-print-book-keywords-4';
        await page.waitForSelector(id);
        if (!isNew) await clearTextField(page, id);
        await page.type(id, book.keyword4);
    }

    if (book.keyword5 != '') {
        id = '#data-print-book-keywords-5';
        await page.waitForSelector(id);
        if (!isNew) await clearTextField(page, id);
        await page.type(id, book.keyword5);
    }

    if (book.keyword6 != '') {
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
    await page.click('#data-print-book-is-adult-content input[value=\'false\']');

    // Save
    debug(verbose, 'Saving');
    await page.click('#save-announce');
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
