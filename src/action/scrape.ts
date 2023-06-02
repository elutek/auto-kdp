import { Book } from '../book/book.js';
import { ActionResult } from '../util/action-result.js';
import { debug, error, stripPrefix } from '../util/utils.js';
import { Urls } from './action-utils.js';
import { ActionParams } from '../util/action-params.js';
import { PageInterface } from '../browser.js';
import { Timeouts } from '../util/timeouts.js';

var globalBookshelfPage: PageInterface = null;

export async function scrape(book: Book, params: ActionParams): Promise<ActionResult> {
  const verbose = params.verbose

  if (params.dryRun) {
    debug(book, verbose, 'Scraping (dry run)');
    return new ActionResult(true);
  }

  const url = Urls.BOOKSHELF_URL;
  debug(book, verbose, 'Scraping at url: ' + url);

  if (book.id == '') {
    debug(book, verbose, 'NOT scraping - need book id for that');
    return new ActionResult(false).doNotRetry();
  }

  // We scrape *a lot*. For scrape we will keep a special 
  // page used only for scraping.
  const page = await _getScrapePage(url, params);
  await page.bringToFront();

  // Type the search query.
  debug(book, verbose, 'Querying for the book');
  let id = '#podbookshelftable-search-input';
  await page.clearTextField(id, Timeouts.SEC_5);
  await page.type(id, book.id, Timeouts.SEC_5);

  // Click search button.
  debug(book, verbose, 'Clicking Search');
  id = '#podbookshelftable-search-button-submit .a-button-input';
  await page.focus(id, Timeouts.SEC_10);
  await page.click(id, Timeouts.SEC_10);

  // Get ASIN from the search result.
  if (book.asin == '') {
    debug(book, verbose, 'Getting ASIN');
    id = '#zme-indie-bookshelf-dual-print-price-asin-' + book.id;
    const rawAsin = await page.evalValue(id, el => el.innerText, Timeouts.SEC_10);
    const asin = stripPrefix(rawAsin.trim(), 'ASIN:').trim();
    debug(book, verbose, 'Got ASIN: ' + asin);
    book.asin = asin;
  }

  // Get pubStatus from the search result.
  debug(book, verbose, 'Getting pubStatus');
  id = '[id="' + book.id + '-status"] .element-popover-text > span';
  const pubStatus = await page.evalValue(id, el => el.innerText.trim(), Timeouts.SEC_10);
  book.pubStatus = pubStatus.trim();
  debug(book, verbose, 'Got pubStatus: ' + pubStatus);

  // Get pubStatusDetail from the search result (it's right after
  // the pubStatus).
  debug(book, verbose, 'Getting pubStatusDetail');
  id = '[id="' + book.id + '-status"] .element-popover-text';
  let pubStatusDetail = await page.evalValue(id, el => el.innerText.trim(), Timeouts.SEC_10);
  if (pubStatusDetail.startsWith(pubStatus)) {
    pubStatusDetail = pubStatusDetail.substr(pubStatus.length).trim();
  }
  book.pubStatusDetail = pubStatusDetail;
  debug(book, verbose, 'Got pubStatusDetail: ' + pubStatusDetail);

  // Get publication date
  if (pubStatus == 'LIVE') {
    debug(book, verbose, 'Getting pubDate');
    id = '#zme-indie-bookshelf-dual-print-status-release-date-' + book.id;
    const pubDate = await page.evalValue(id, el => el.innerText.trim(), Timeouts.SEC_10);
    book.pubDate = _formatDate(stripPrefix(pubDate, 'Submitted on ').trim(), book);
    debug(book, verbose, `Got pubDate ${book.pubDate} (${pubDate})`);
  } else {
    book.pubDate = '';
  }

  // Get titleId
  {
    debug(book, verbose, 'Getting title id');
    id = `img[id="${book.id}"]`;
    const imgDataSource = await page.evalValue(id, x => (x as HTMLElement).getAttribute('data-source').trim(), Timeouts.SEC_10);
    const regexp = /amazon[^\\]*\/CAPS-SSE\/kdp_print\/[a-zA-Z0-9]{1,5}\/([a-zA-Z0-9]{1,20})\/KDP/m;
    const match = imgDataSource.match(regexp);
    if (match == null || match.length <= 1) {
      debug(book, verbose, 'Could not match img data-source: ' + imgDataSource);
    } else {
      book.titleId = match[1];
      debug(book, verbose, 'Got title id: ' + book.titleId);
    }
  }

  // Get series title.
  // TODO: Needs to be update wrt subtitle.
  debug(book, verbose, 'Getting series title');
  id = '#zme-indie-bookshelf-dual-metadata-series_title-' + book.id + ' > a';
  let scrapedSeriesTitle = '';
  let attempt = 1;
  for (; attempt < 10; ++attempt) {
    try {
      await page.bringToFront();
      await page.focus(id, Timeouts.SEC_10);
      scrapedSeriesTitle = await page.evalValue(id, el => el.innerText.trim(), Timeouts.SEC_10);
    } catch (e) {
    }
    if (scrapedSeriesTitle != 'SERIES_TITLE') {
      // We only repeat if we get that magical "SERIES_TITLE" string, which means the title has not loaded yet.
      break;
    }
  }

  if (scrapedSeriesTitle == book.seriesTitle.toLowerCase()) {
    book.scrapedSeriesTitle = 'ok';
  } else if (scrapedSeriesTitle == '') {
    book.scrapedSeriesTitle = 'missing should be: ' + book.seriesTitle;
  } else {
    book.scrapedSeriesTitle = 'mismatch - got ' + scrapedSeriesTitle + ' but expecting ' + book.seriesTitle.toLowerCase();
  }

  debug(book, verbose, 'Got scraped series title: ' + scrapedSeriesTitle + ' - ' + book.scrapedSeriesTitle);


  /* We do not close this special page.
    await maybeClosePage(params, page);
  */

  let nextActions = !book.isFullyLive() && book.numActions() == 1 && book.getFirstAction() == 'scrape' ? 'scrape' : '';
  debug(book, verbose, `Next actions: ${nextActions}`);
  return new ActionResult(true).setNextActions(nextActions);
}

async function _getScrapePage(url: string, params: ActionParams): Promise<PageInterface> {
  if (globalBookshelfPage == null) {
    globalBookshelfPage = await params.browser.newPage();

    await globalBookshelfPage.goto(url, Timeouts.MIN_3);
    await globalBookshelfPage.waitForTimeout(Timeouts.SEC_1);  // Just in case.
  }
  return globalBookshelfPage;
}

function _formatDate(str: string, book: Book) {
  try {
    return new Date(str).toDateString();
  } catch (e) {
    error(book, 'Cannot parse date: ' + str, e);
    return '';
  }
}

