import { ActionResult } from '../action-result.js';
import { debug, error, arraysEqual, cleanupHtmlForAmazonDescription, clipLen } from '../utils.js';
import { Timeouts, Urls, clearTextField, maybeClosePage, waitForElements } from './utils.js';

// This function also creates a book.
export async function updateBookMetadata(book, params) {
  const verbose = params.verbose;

  if (params.dryRun) {
    debug(book, verbose, 'Updating book (dry run)');
    return new ActionResult(true);
  }

  if (!book.canBeCreated()) {
    error(book, 'Fields missing - cannot create/update the book');
    return new ActionResult(false).doNotRetry();
  }

  const isNew = book.id == '';
  const url = isNew ? Urls.CREATE_PAPERBACK : Urls.EDIT_PAPERBACK_DETAILS.replace('$id', book.id);

  debug(book, verbose, (isNew ? 'Creating' : 'Updating') + ' at url: ' + url);

  const page = await params.browser.newPage();
  let response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: Timeouts.MIN_1 });

  if (response.status() == 500) {
    error(book, 'KDP returned internal erorr (500).');
    await maybeClosePage(params, page);
    return new ActionResult(false).doNotRetry();
  }

  await page.waitForTimeout(Timeouts.SEC_1); // Just in case.

  await waitForElements(page, [
    '#data-print-book-title',
    '#data-print-book-subtitle',
    '#data-print-book-primary-author-first-name',
    '#data-print-book-primary-author-last-name',
    '#data-print-book-contributors-0-first-name',
    '#data-print-book-contributors-0-last-name',
    '#data-print-book-contributors-0-role-native',
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

  if (!book.wasEverPublished) {

    // This fields can only be updated if the book
    // has never been published. After publishing, they
    // are set in stone.

    // Title
    const title = await page.$eval('#data-print-book-title', x => x.value)
    if (title != book.title) {
      debug(book, verbose, 'Updating title');
      id = '#data-print-book-title';
      if (!isNew) await clearTextField(page, id);
      await page.type(id, book.title);
    } else {
      debug(book, verbose, 'Updating title - not needed, got ' + title);
    }

    // Subtitle
    const subtitle = await page.$eval('#data-print-book-subtitle', x => x.value)
    if (subtitle != book.subtitle) {
      debug(book, verbose, 'Updating subtitle');
      id = '#data-print-book-subtitle';
      if (!isNew) await clearTextField(page, id);
      if (book.subtitle != '') {
        await page.type(id, book.subtitle);
      }
    } else {
      debug(book, verbose, 'Updating subtitle - not needed, got ' + subtitle)
    }

    // Edition number - TODO, currently not supported

    // Author first name
    id = '#data-print-book-primary-author-first-name';
    const authorFirstName = await page.$eval(id, x => x.value);
    if (authorFirstName != book.authorFirstName) {
      debug(book, verbose, 'Updating author\'s first name');
      if (!isNew) await clearTextField(page, id);
      await page.type(id, book.authorFirstName);
    } else {
      debug(book, verbose, 'Updating author\'s first name - not needed, got ' + authorFirstName);
    }

    // Author last name
    id = '#data-print-book-primary-author-last-name';
    const authorLastName = await page.$eval(id, x => x.value);
    if (authorLastName != book.authorLastName) {
      debug(book, verbose, 'Updating author\'s last name');
      if (!isNew) await clearTextField(page, id);
      await page.type(id, book.authorLastName);
    } else {
      debug(book, verbose, 'Updating author\'s last name - not needed, got ' + authorLastName);
    }

    // Illustrator's first name
    id = '#data-print-book-contributors-0-first-name';
    const illustratorFirstName = await page.$eval(id, x => x.value);
    if (illustratorFirstName != book.illustratorFirstName) {
      debug(book, verbose, 'Updating illustrator\'s first name');
      if (!isNew) await clearTextField(page, id);
      if (book.illustratorFirstName != '') {
        await page.type(id, book.illustratorFirstName);
      }
    } else {
      debug(book, verbose, 'Updating illustrator\'s first name - not needed, got ' + illustratorFirstName);
    }

    // Illustrator's last name
    id = '#data-print-book-contributors-0-last-name';
    const illustratorLastName = await page.$eval('#data-print-book-contributors-0-last-name', x => x.value);
    if (illustratorLastName != book.illustratorLastName) {
      debug(book, verbose, 'Updating illustrator\'s last name');
      if (!isNew) await clearTextField(page, id);
      if (book.illustratorLastName != '') {
        await page.type(id, book.illustratorLastName);
      }
    } else {
      debug(book, verbose, 'Updating illustrator\'s last name - not needed, got ' + illustratorLastName);
    }

    // Illustrator's role.
    if (book.illustratorFirstName != '' || book.illustratorLastName != '') {
      id = '#data-print-book-contributors-0-role-native';
      await page.select(id, 'illustrator');
    }
  }

  // Description
  id = '#cke_18'; // Button 'Source' to switch to HTML editing.
  debug(book, verbose, `Waiting for Source button (${id})`)
  await page.waitForSelector(id);
  debug(book, verbose, `Clicking Source button`);
  await page.click(id, { timeout: Timeouts.SEC_5 });
  id = '#cke_1_contents > textarea';
  debug(book, verbose, `Waiting for textarea (${id})`)
  await page.waitForSelector(id, { timeout: Timeouts.SEC_5 });
  const oldDescription = cleanupHtmlForAmazonDescription(await page.$eval('#cke_1_contents > textarea', x => x.value) || '');
  const newDescription = cleanupHtmlForAmazonDescription(book.description);
  if (oldDescription != newDescription) {
    // Description needs to be updated.
    debug(book, verbose, `Updating description from \n\t${oldDescription}\n\tto\n\t${newDescription}`);

    debug(book, verbose, `Cleaning textarea`)
    if (!isNew) await clearTextField(page, id);

    debug(book, verbose, `Typing new description`)
    await page.type(id, newDescription);
  } else {
    debug(book, verbose, 'Updating description - not needed, got ' + clipLen(oldDescription));
  }

  // Whether public domain
  // TODO: Support public domain case. 
  debug(book, verbose, 'Selecting whether public domain');
  await page.click('#non-public-domain', { timeout: Timeouts.SEC_5 });

  // Keywords - typing is slow so we first  check an update is needed.
  const oldKeyword0 = isNew ? '' : (await page.$eval('#data-print-book-keywords-0', x => x.value)) || '';
  const oldKeyword1 = isNew ? '' : (await page.$eval('#data-print-book-keywords-1', x => x.value)) || '';
  const oldKeyword2 = isNew ? '' : (await page.$eval('#data-print-book-keywords-2', x => x.value)) || '';
  const oldKeyword3 = isNew ? '' : (await page.$eval('#data-print-book-keywords-3', x => x.value)) || '';
  const oldKeyword4 = isNew ? '' : (await page.$eval('#data-print-book-keywords-4', x => x.value)) || '';
  const oldKeyword5 = isNew ? '' : (await page.$eval('#data-print-book-keywords-5', x => x.value)) || '';
  const oldKeyword6 = isNew ? '' : (await page.$eval('#data-print-book-keywords-6', x => x.value)) || '';

  if (book.keyword0 != oldKeyword0) {
    debug(book, verbose, `Updating keyword0 from ${oldKeyword0} to ${book.keyword0}`);
    id = '#data-print-book-keywords-0';
    if (!isNew) await clearTextField(page, id);
    await page.type(id, book.keyword0);
  } else {
    debug(book, verbose, `Updating keyword0 - not needed, got ${oldKeyword0}`);
  }

  if (book.keyword1 != oldKeyword1) {
    debug(book, verbose, 'Updating keyword1');
    debug(book, verbose, `Updating keyword1 from ${oldKeyword1} to ${book.keyword1}`);
    id = '#data-print-book-keywords-1';
    if (!isNew) await clearTextField(page, id);
    await page.type(id, book.keyword1);
  } else {
    debug(book, verbose, `Updating keyword1 - not needed, got ${oldKeyword1}`);
  }

  if (book.keyword2 != oldKeyword2) {
    debug(book, verbose, `Updating keyword2 from ${oldKeyword2} to ${book.keyword2}`);
    id = '#data-print-book-keywords-2';
    if (!isNew) await clearTextField(page, id);
    await page.type(id, book.keyword2);
  } else {
    debug(book, verbose, `Updating keyword2 - not needed, got ${oldKeyword2}`);
  }


  if (book.keyword3 != oldKeyword3) {
    debug(book, verbose, `Updating keyword3 from ${oldKeyword3} to ${book.keyword3}`);
    id = '#data-print-book-keywords-3';
    if (!isNew) await clearTextField(page, id);
    await page.type(id, book.keyword3);
  } else {
    debug(book, verbose, `Updating keyword3 - not needed, got ${oldKeyword3}`);
  }

  if (book.keyword4 != oldKeyword4) {
    debug(book, verbose, `Updating keyword4 from ${oldKeyword4} to ${book.keyword4}`);
    id = '#data-print-book-keywords-4';
    if (!isNew) await clearTextField(page, id);
    await page.type(id, book.keyword4);
  } else {
    debug(book, verbose, `Updating keyword4 - not needed, got ${oldKeyword4}`);
  }

  if (book.keyword5 != oldKeyword5) {
    debug(book, verbose, `Updating keyword5 from ${oldKeyword5} to ${book.keyword5}`);
    id = '#data-print-book-keywords-5';
    if (!isNew) await clearTextField(page, id);
    await page.type(id, book.keyword5);
  } else {
    debug(book, verbose, `Updating keyword5 - not needed, got ${oldKeyword5}`);
  }

  if (book.keyword6 != oldKeyword6) {
    debug(book, verbose, `Updating keyword6 from ${oldKeyword6} to ${book.keyword6}`);
    id = '#data-print-book-keywords-6';
    if (!isNew) await clearTextField(page, id);
    await page.type(id, book.keyword6);
  } else {
    debug(book, verbose, `Updating keyword6 - not needed, got ${oldKeyword6}`);
  }

  // Categories
  const category1 = isNew ? '' : (await page.$eval('#data-print-book-categories-1-bisac', x => x.value)) || '';
  const category2 = isNew ? '' : (await page.$eval('#data-print-book-categories-2-bisac', x => x.value)) || '';
  const hasCategoriesSorted = [category1, category2].filter((x) => x != null && x != '').sort();
  const needCategoriesSorted = [book.category1, book.category2].filter((x) => x != null && x != '').sort();
  const categoryNeedsUpdate = !arraysEqual(hasCategoriesSorted, needCategoriesSorted);

  if (isNew || categoryNeedsUpdate) {
    debug(book, verbose, 'Updating categories');
    id = '#data-print-book-categories-1-bisac';
    await page.$eval(id, (el, book) => {
      if (el) {
        el.value = book.category1;
      } else {
        error(book, 'Could not update category 1');
        throw Error('Could not update category 1');
      }
    }, book);
    id = '#data-print-book-categories-2-bisac';
    await page.$eval(id, (el, book) => {
      if (el) {
        el.value = book.category2;
      } else {
        error(book, 'Could not update category 2');
        throw Error('Could not update category 2');
      }
    }, book);
  } else {
    debug(book, verbose, `Selecting categories - not needed, got ${category1}, ${category2}`);
  }

  // Whether adult content
  // TODO: We automatically select it is not adult content. Support for adult content would have to be added.
  await page.click('#data-print-book-is-adult-content input[value=\'false\']', { timeout: Timeouts.SEC_1 });

  // Check status of the book metadata
  id = '#book-setup-navigation-bar-details-link .a-alert-content';
  const metadataStatus = await page.$eval(id, x => x.textContent.trim()) || '';
  let isMetadataStatusOk = metadataStatus == 'Complete';
  debug(book, verbose, 'Book metadata status: ' + (isMetadataStatusOk ? 'OK' : metadataStatus));

  // Save
  let isSuccess = true;
  debug(book, verbose, 'Saving');
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
      debug(book, verbose, 'Got book id: ' + book.id);
    } else {
      error(book, 'ERROR: could not get paperback id from url: ' + url);
      isSuccess = false;
    }
  }

  await maybeClosePage(params, page);
  return new ActionResult(isSuccess);
}
