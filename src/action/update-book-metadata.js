import { ActionResult } from '../action-result.js';
import { debug, arraysEqual, normalizeText, normalizeSearchQuery } from '../utils.js';
import { Timeouts, Urls, clearTextField, waitForElements } from './utils.js';

// This function also creates a book.
export async function updateBookMetadata(book, params) {
  const verbose = params.verbose;

  if (params.dryRun) {
    debug(verbose, 'Updating book (dry run)');
    return new ActionResult(true);
  }

  if (!book.canBeCreated()) {
    console.error('Fields missing - cannot create/update the book');
    return new ActionResult(false).doNotRetry();
  }

  const isNew = book.id == '';
  const url = isNew ? Urls.CREATE_PAPERBACK : Urls.EDIT_PAPERBACK_DETAILS.replace('$id', book.id);

  debug(verbose, (isNew ? 'Creating' : 'Updating') + ' at url: ' + url);

  const page = await params.browser.newPage();
  let response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: Timeouts.MIN_1 });

  if (response.status() == 500) {
    console.log('KDP returned internal erorr (500).');
    if (!params.keepOpen) {
      await page.close();
    }
    return new ActionResult(false).doNotRetry();
  }

  await page.waitForTimeout(Timeouts.SEC_1); // Just in case.

  await waitForElements(page, [
    '#data-print-book-title',
    '#data-print-book-primary-author-first-name',
    '#data-print-book-primary-author-last-name',
    '#data-print-book-contributors-0-first-name',
    '#data-print-book-contributors-0-last-name',
    '#data-print-book-contributors-0-role-native',
    '#series_title',
    '#cke_18',
    '#non-public-domain',
    '#data-print-book-keywords-0',
    '#data-print-book-keywords-1',
    '#data-print-book-keywords-2',
    '#data-print-book-keywords-3',
    '#data-print-book-keywords-4',
    '#data-print-book-keywords-5',
    '#data-print-book-keywords-6',
    '#data-print-book-categories-1-bisac',
    '#data-print-book-categories-2-bisac',
    '#data-print-book-is-adult-content input[value=\'false\']',
    '#book-setup-navigation-bar-details-link .a-alert-content',
  ]);

  let id = '';
  let wasModified = isNew;

  if (!book.wasEverPublished) {

    // This fields can only be updated if the book
    // has never been published. After publishing, they
    // are set in stone.

    // Title
    debug(verbose, 'Updating title');
    id = '#data-print-book-title';
    if (!isNew) await clearTextField(page, id);
    await page.type(id, book.title);

    // TODO: Support subtitle
    // TODO: Support edition number

    // Author first name
    debug(verbose, 'Updating author');
    id = '#data-print-book-primary-author-first-name';
    if (!isNew) await clearTextField(page, id);
    await page.type(id, book.authorFirstName);

    // Author last name
    id = '#data-print-book-primary-author-last-name';
    if (!isNew) await clearTextField(page, id);
    await page.type(id, book.authorLastName);

    // Illustrator's first name
    if (book.illustratorFirstName != '' && book.illustratorLastName != '') {
      debug(verbose, 'Updating illustrator');
      id = '#data-print-book-contributors-0-first-name';
      if (!isNew) await clearTextField(page, id);
      await page.type(id, book.illustratorFirstName);

      // Illustrator's last name
      id = '#data-print-book-contributors-0-last-name';
      if (!isNew) await clearTextField(page, id);
      await page.type(id, book.illustratorLastName);

      // Illustrator's role.
      id = '#data-print-book-contributors-0-role-native';
      await page.select(id, 'illustrator');
    }
  }

  // Series title (only for non-new books)
  if (isNew) {
    debug(verbose, 'Skipping series title for new books');
  } else {
    debug(verbose, 'Getting series title');
    id = '#series_title';
    const existingSeriesTitle = (await page.$eval(id, x => x.textContent.trim())) || '';
    debug(verbose, `Current series title: ${existingSeriesTitle}`);

    if (book.seriesTitle == existingSeriesTitle) {
      debug(verbose, `Updating series title - not needed, got ${existingSeriesTitle}`);
    } else if (book.seriesTitle != '' && existingSeriesTitle == '') {
      debug(verbose, `Updating series title to ${book.seriesTitle}`);
      wasModified = true;
      const result = await updateSeriesTitle(page, book, verbose);
      if (!result) {
        return new ActionResult(false);
      }
    } else if (book.seriesTitle == '' && existingSeriesTitle != '') {
      debug(verbose, `Removing book from series ${book.seriesTitle}`);
      wasModified = true;
      await removeSeriesTitle(page, book, verbose);
    } else {
      // The hard case - we need to modify series title.
      // We cannot modify - we need to remove from the series, and
      // add to a different one.
      wasModified = true;
      await removeSeriesTitle(page, book, verbose);
      const result = await updateSeriesTitle(page, book, verbose);
      if (!result) {
        return new ActionResult(false);
      }
    }
  }

  // Description - first check if update is needed. The typing
  // is pretty slow so we avoid it if not necessary.
  id = '#cke_18'; // Button 'Source' to switch to HTML editing.

  console.log(`Waiting for Source button (${id})`)
  await page.waitForSelector(id);
  console.log(`Clicking Source button`);
  await page.click(id, { timeout: Timeouts.SEC_5 });
  id = '#cke_1_contents > textarea';
  console.log(`Waiting for textarea (${id})`)
  await page.waitForSelector(id, { timeout: Timeouts.SEC_5 });
  const oldDescription = normalizeText(await page.$eval('#cke_1_contents > textarea', x => x.value) || '');

  if (normalizeText(oldDescription) != normalizeText(book.description)) {
    // Description needs to be updated.
    debug(verbose, `Updating description from\n\t${oldDescription}\n\tto\n\t${book.description}`);
    wasModified = true;

    console.log(`Cleaning textarea`)
    if (!isNew) await clearTextField(page, id);

    console.log(`Typing new description`)
    await page.type(id, book.description);
  } else {
    debug(verbose, 'Updating description - not needed');
  }

  // Whether public domain
  // TODO: Support public domain case. 
  if (isNew) {
    debug(verbose, 'Selecting whether public domain');
    await page.click('#non-public-domain', { timeout: Timeouts.SEC_5 });
  }

  // Keywords - typing is slow so we first  check an update is needed.
  const oldKeyword0 = isNew ? '' : (await page.$eval('#data-print-book-keywords-0', x => x.value)) || '';
  const oldKeyword1 = isNew ? '' : (await page.$eval('#data-print-book-keywords-1', x => x.value)) || '';
  const oldKeyword2 = isNew ? '' : (await page.$eval('#data-print-book-keywords-2', x => x.value)) || '';
  const oldKeyword3 = isNew ? '' : (await page.$eval('#data-print-book-keywords-3', x => x.value)) || '';
  const oldKeyword4 = isNew ? '' : (await page.$eval('#data-print-book-keywords-4', x => x.value)) || '';
  const oldKeyword5 = isNew ? '' : (await page.$eval('#data-print-book-keywords-5', x => x.value)) || '';
  const oldKeyword6 = isNew ? '' : (await page.$eval('#data-print-book-keywords-6', x => x.value)) || '';

  if (book.keyword0 != oldKeyword0) {
    debug(verbose, `Updating keyword0 from ${oldKeyword0} to ${book.keyword0}`);
    id = '#data-print-book-keywords-0';
    if (!isNew) await clearTextField(page, id);
    await page.type(id, book.keyword0);
    wasModified = true;
  } else {
    debug(verbose, `Updating keyword0 - not needed, got ${oldKeyword0}`);
  }

  if (book.keyword1 != oldKeyword1) {
    debug(verbose, 'Updating keyword1');
    debug(verbose, `Updating keyword1 from ${oldKeyword1} to ${book.keyword1}`);
    id = '#data-print-book-keywords-1';
    if (!isNew) await clearTextField(page, id);
    await page.type(id, book.keyword1);
    wasModified = true;
  } else {
    debug(verbose, `Updating keyword1 - not needed, got ${oldKeyword1}`);
  }

  if (book.keyword2 != oldKeyword2) {
    debug(verbose, `Updating keyword2 from ${oldKeyword2} to ${book.keyword2}`);
    id = '#data-print-book-keywords-2';
    if (!isNew) await clearTextField(page, id);
    await page.type(id, book.keyword2);
    wasModified = true;
  } else {
    debug(verbose, `Updating keyword2 - not needed, got ${oldKeyword2}`);
  }


  if (book.keyword3 != oldKeyword3) {
    debug(verbose, `Updating keyword3 from ${oldKeyword3} to ${book.keyword3}`);
    id = '#data-print-book-keywords-3';
    if (!isNew) await clearTextField(page, id);
    await page.type(id, book.keyword3);
    wasModified = true;
  } else {
    debug(verbose, `Updating keyword3 - not needed, got ${oldKeyword3}`);
  }

  if (book.keyword4 != oldKeyword4) {
    debug(verbose, `Updating keyword4 from ${oldKeyword4} to ${book.keyword4}`);
    id = '#data-print-book-keywords-4';
    if (!isNew) await clearTextField(page, id);
    await page.type(id, book.keyword4);
    wasModified = true;
  } else {
    debug(verbose, `Updating keyword4 - not needed, got ${oldKeyword4}`);
  }

  if (book.keyword5 != oldKeyword5) {
    debug(verbose, `Updating keyword5 from ${oldKeyword5} to ${book.keyword5}`);
    id = '#data-print-book-keywords-5';
    if (!isNew) await clearTextField(page, id);
    await page.type(id, book.keyword5);
    wasModified = true;
  } else {
    debug(verbose, `Updating keyword5 - not needed, got ${oldKeyword5}`);
  }

  if (book.keyword6 != oldKeyword6) {
    debug(verbose, `Updating keyword6 from ${oldKeyword6} to ${book.keyword6}`);
    id = '#data-print-book-keywords-6';
    if (!isNew) await clearTextField(page, id);
    await page.type(id, book.keyword6);
    wasModified = true;
  } else {
    debug(verbose, `Updating keyword6 - not needed, got ${oldKeyword6}`);
  }

  // Categories
  const category1 = isNew ? '' : (await page.$eval('#data-print-book-categories-1-bisac', x => x.value)) || '';
  const category2 = isNew ? '' : (await page.$eval('#data-print-book-categories-2-bisac', x => x.value)) || '';
  const hasCategoriesSorted = [category1, category2].filter((x) => x != null && x != '').sort();
  const needCategoriesSorted = [book.category1, book.category2].filter((x) => x != null && x != '').sort();
  const categoryNeedsUpdate = !arraysEqual(hasCategoriesSorted, needCategoriesSorted);

  if (isNew || categoryNeedsUpdate) {
    debug(verbose, 'Updating categories');
    id = '#data-print-book-categories-1-bisac';
    await page.$eval(id, (el, book) => {
      if (el) {
        el.value = book.category1;
      }
    }, book);
    id = '#data-print-book-categories-2-bisac';
    await page.$eval(id, (el, book) => {
      if (el) {
        el.value = book.category2;
      }
    }, book);
    wasModified = true;
  } else {
    debug(verbose, `Selecting categories - not needed, got ${category1}, ${category2}`);
  }

  // Whether adult content
  // TODO: We automatically select it is not adult content. Support for adult content would have to be added.
  if (isNew) {
    await page.click('#data-print-book-is-adult-content input[value=\'false\']', { timeout: Timeouts.SEC_1 });
  }

  // Check status of the book metadata
  id = '#book-setup-navigation-bar-details-link .a-alert-content';
  const metadataStatus = await page.$eval(id, x => x.textContent.trim()) || '';
  let isMetadataStatusOk = metadataStatus == 'Complete';
  debug(verbose, 'Book metadata status: ' + (isMetadataStatusOk ? 'OK' : metadataStatus));

  // Save
  let isSuccess = true;
  if (wasModified || !isMetadataStatusOk) {
    debug(verbose, 'Saving');
    await page.click('#save-announce', { timeout: Timeouts.SEC_30 });
    if (isNew) {
      await page.waitForNavigation();
    } else {
      await page.waitForSelector('#potter-success-alert-bottom div div', { visible: true });
      await page.waitForTimeout(Timeouts.SEC_2);
    }

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
  } else {
    debug(verbose, 'Saving - not needed');
  }

  if (!params.keepOpen) {
    try {
      console.log("Closing");
      await page.close();
    } catch (e) {
      console.log('Could not close page: ', e);
    }
  }

  console.log("Closed");

  return new ActionResult(isSuccess);
}

async function updateSeriesTitle(page, book, verbose) {
  if (book.seriesTitle == '') {
    throw 'Cannot set series title - it is already empty'
  }
  let id = '';

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

  let searchQuery = normalizeSearchQuery(book.seriesTitle)

  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; ++attempt) {
    try {
      debug(verbose, 'Typing search query: ' + searchQuery);
      id = '#react-aui-modal-content-1 input[type="search"]';
      await page.waitForSelector(id);
      await page.type(id, searchQuery);

      debug(verbose, 'Click Search for the series');
      id = '#react-aui-modal-content-1 input[type="submit"]';
      await page.waitForSelector(id);
      await page.click(id, { timeout: Timeouts.SEC_30 });
      await page.waitForTimeout(Timeouts.SEC_1);

      debug(verbose, 'Clicking on our series (we assume we have only one as a result of the search)');
      id = '#react-aui-modal-content-1 .a-list-item button';
      await page.waitForSelector(id);
      await page.click(id, { timeout: Timeouts.SEC_30 });
      await page.waitForTimeout(Timeouts.SEC_1);

      // We are done.
      attempt = maxAttempts;
    } catch (e) {
      // Failure - search results did not return any results.
      if (attempt < maxAttempts) {
        debug(verbose, 'Failed - retrying');
      } else {
        debug(verbose, 'Failed - failing');
        return false;
      }
    }
  }

  debug(verbose, 'Clicking Main Content');
  id = '#react-aui-modal-content-1 span[aria-label="Main content"] button';
  await page.waitForSelector(id);
  await page.click(id, { timeout: Timeouts.SEC_30 });
  await page.waitForTimeout(Timeouts.SEC_1);

  debug(verbose, 'Clicking Confirm and continue');
  id = '#react-aui-modal-content-1 button';
  await page.waitForSelector(id);
  await page.click(id, { timeout: Timeouts.SEC_30 });

  debug(verbose, 'Waiting for the "Saving" message to disappear');
  await page.waitForTimeout(Timeouts.SEC_5);

  debug(verbose, 'Clicking Done');
  id = '#react-aui-modal-footer-1 input[type="submit"]';
  await page.waitForSelector(id);
  await page.click(id, { timeout: Timeouts.SEC_30 });
  await page.waitForTimeout(Timeouts.SEC_1);

  debug(verbose, 'Clicking in the page');
  id = '#a-page';
  await page.waitForSelector(id);
  await page.click(id, { timeout: Timeouts.SEC_10 });
  await page.waitForTimeout(Timeouts.SEC_1);
  await page.focus(id);

  return true;
}

async function removeSeriesTitle(page, book, verbose) {
  let id = '';

  debug(verbose, 'Clicking Remove from Series');
  id = '#a-autoid-1-announce';
  await page.waitForSelector(id);
  await page.click(id, { timeout: Timeouts.SEC_30 });
  await page.waitForTimeout(Timeouts.SEC_1);

  debug(verbose, 'Clicking Remove from Series (confirmation)');
  id = '#react-aui-modal-footer-1 span[aria-label="Remove from series"] button';
  await page.waitForSelector(id);
  await page.click(id, { timeout: Timeouts.SEC_30 });
  await page.waitForTimeout(Timeouts.SEC_10);

  debug(verbose, 'Clicking Done');
  id = '#react-aui-modal-footer-1 input[type="submit"]';
  await page.waitForSelector(id);
  await page.click(id, { timeout: Timeouts.SEC_30 });
  await page.waitForTimeout(Timeouts.SEC_1);
}