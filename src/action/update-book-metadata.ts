import { ActionResult } from '../util/action-result.js';
import { debug, error, arraysEqual, cleanupHtmlForAmazonDescription, clipLen } from '../util/utils.js';
import { updateTextFieldIfChanged, clickSomething, Timeouts, Urls, clearTextField, maybeClosePage, waitForElements, selectValue, updateTextAreaIfChanged } from './action-utils.js';
import { Book } from '../book/book.js';
import { ActionParams } from '../util/action-params.js';

// This function also creates a book.
export async function updateBookMetadata(book: Book, params: ActionParams): Promise<ActionResult> {
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

  if (!book.wasEverPublished) {

    // This fields can only be updated if the book
    // has never been published. After publishing, they
    // are set in stone.
    await selectValue('#data-print-book-language-native', book.language.toLowerCase(), 'language', page, book, verbose);
    await updateTextFieldIfChanged('#data-print-book-title', book.title, 'title', page, book, verbose);
    await updateTextFieldIfChanged('#data-print-book-subtitle', book.subtitle, 'title', page, book, verbose);
    await updateTextFieldIfChanged('#data-print-book-primary-author-first-name', book.authorFirstName, 'author\'s first name', page, book, verbose);
    await updateTextFieldIfChanged('#data-print-book-primary-author-last-name', book.authorLastName, 'author\'s last name', page, book, verbose);
    await updateTextFieldIfChanged('#data-print-book-contributors-0-first-name', book.illustratorFirstName, 'illustrator\'s first name', page, book, verbose);
    await updateTextFieldIfChanged('#data-print-book-contributors-0-last-name', book.illustratorLastName, 'illustrator\'s last name', page, book, verbose);
    if (book.illustratorFirstName != '' || book.illustratorLastName != '') {
      await selectValue('#data-print-book-contributors-0-role-native', 'illustrator', 'illustrator\'s role', page, book, verbose);
    }
  }

  // Description
  await clickSomething('#cke_18', 'Source button', page, book, verbose);
  await updateTextAreaIfChanged('#cke_1_contents > textarea', book.description, cleanupHtmlForAmazonDescription, 'description', page, book, verbose);

  // Whether public domain
  // TODO: support public domain works
  await clickSomething('#non-public-domain', 'whether public domain', page, book, verbose);

  // Keywords
  await updateTextFieldIfChanged('#data-print-book-keywords-0', book.keyword0, "keyword 0", page, book, verbose);
  await updateTextFieldIfChanged('#data-print-book-keywords-1', book.keyword1, "keyword 1", page, book, verbose);
  await updateTextFieldIfChanged('#data-print-book-keywords-2', book.keyword2, "keyword 2", page, book, verbose);
  await updateTextFieldIfChanged('#data-print-book-keywords-3', book.keyword3, "keyword 3", page, book, verbose);
  await updateTextFieldIfChanged('#data-print-book-keywords-4', book.keyword4, "keyword 4", page, book, verbose);
  await updateTextFieldIfChanged('#data-print-book-keywords-5', book.keyword5, "keyword 5", page, book, verbose);
  await updateTextFieldIfChanged('#data-print-book-keywords-6', book.keyword6, "keyword 6", page, book, verbose);

  // Categories - this field is unusual. We just fill the value we need in a hidden field
  // because manually navigating throught the selection tree woudl be tons of work.
  await waitForElements(page, [
    '#data-print-book-categories-1-bisac',
    '#data-print-book-categories-2-bisac',
  ]);
  const category1 = isNew ? '' : (await page.$eval('#data-print-book-categories-1-bisac', x => (x as HTMLInputElement).value)) || '';
  const category2 = isNew ? '' : (await page.$eval('#data-print-book-categories-2-bisac', x => (x as HTMLInputElement).value)) || '';
  const hasCategoriesSorted = [category1, category2].filter((x) => x != null && x != '').sort();
  const needCategoriesSorted = [book.category1, book.category2].filter((x) => x != null && x != '').sort();
  const categoryNeedsUpdate = !arraysEqual(hasCategoriesSorted, needCategoriesSorted);

  if (isNew || categoryNeedsUpdate) {
    debug(book, verbose, 'Updating categories');
    let id = '#data-print-book-categories-1-bisac';
    await page.$eval(id, (el: HTMLInputElement, book: Book) => {
      if (el) {
        el.value = book.category1;
      } else {
        error(book, 'Could not update category 1');
        throw Error('Could not update category 1');
      }
    }, book);
    id = '#data-print-book-categories-2-bisac';
    await page.$eval(id, (el: HTMLInputElement, book: Book) => {
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
  // TODO: We only support non-adult content.
  await clickSomething('#data-print-book-is-adult-content input[value=\'false\']', 'non-adult content', page, book, verbose);

  // Check status of the book metadata
  {
    const id = '#book-setup-navigation-bar-details-link .a-alert-content';
    await page.waitForSelector(id);
    const metadataStatus = await page.$eval(id, x => x.textContent.trim()) || '';
    let isMetadataStatusOk = metadataStatus == 'Complete';
    debug(book, verbose, 'Book metadata status: ' + (isMetadataStatusOk ? 'OK' : metadataStatus));
  }

  // Save
  let isSuccess = true;
  await clickSomething('#save-announce', 'Save', page, book, verbose);
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
