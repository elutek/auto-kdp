import { ActionResult } from '../action-result.js';
import { debug } from '../utils.js';
import { Timeouts, Urls, clearTextField } from './utils.js';

var globalBookshelfPage = null;

export async function scrape(book, params) {
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
  await page.waitForSelector(id, { timeout: Timeouts.SEC_10 });
  await clearTextField(page, id, true);
  await page.type(id, book.id);

  // Click search button.
  debug(book, verbose, 'Clicking Search');
  id = '#podbookshelftable-search-button-submit .a-button-input';
  await page.waitForSelector(id, { timeout: Timeouts.SEC_10 });
  await page.focus(id);
  await page.click(id, { timeout: Timeouts.SEC_1 });

  // Get ASIN from the search result.
  if (book.asin == '') {
    debug(book, verbose, 'Getting ASIN');
    id = '#zme-indie-bookshelf-dual-print-price-asin-' + book.id;
    await page.waitForSelector(id, { timeout: Timeouts.SEC_5 });
    const rawAsin = await page.$eval(id, el => el.innerText) || "";
    const asin = _stripPrefix(rawAsin.trim(), 'ASIN:').trim();
    debug(book, verbose, 'Got ASIN: ' + asin);
    book.asin = asin;
  }

  // Get pubStatus from the search result.
  debug(book, verbose, 'Getting pubStatus');
  id = '[id="' + book.id + '-status"] .element-popover-text > span';
  await page.waitForSelector(id);
  const pubStatus = await page.$eval(id, el => el.innerText.trim());
  book.pubStatus = pubStatus.trim();
  debug(book, verbose, 'Got pubStatus: ' + pubStatus);

  // Get pubStatusDetail from the search result (it's right after
  // the pubStatus).
  debug(book, verbose, 'Getting pubStatusDetail');
  id = '[id="' + book.id + '-status"] .element-popover-text';
  await page.waitForSelector(id);
  let pubStatusDetail = await page.$eval(id, el => el.innerText.trim()) || "";
  if (pubStatusDetail.startsWith(pubStatus)) {
    pubStatusDetail = pubStatusDetail.substr(pubStatus.length).trim();
  }
  book.pubStatusDetail = pubStatusDetail;
  debug(book, verbose, 'Got pubStatusDetail: ' + pubStatusDetail);

  // Get publication date
  if (pubStatus == 'LIVE') {
    debug(book, verbose, 'Getting pubDate');
    id = '#zme-indie-bookshelf-dual-print-status-release-date-' + book.id;
    await page.waitForSelector(id);
    const pubDate = await page.$eval(id, el => el.innerText.trim()) || "";
    book.pubDate = _formatDate(_stripPrefix(pubDate, 'Submitted on ').trim(), book);
    debug(book, verbose, `Got pubDate ${book.pubDate} (${pubDate})`);
  } else {
    book.pubDate = '';
  }

  // Get titleId
  {
    debug(book, verbose, 'Getting title id');
    id = `img[id="${book.id}"]`;
    await page.waitForSelector(id);
    const imgDataSource = await page.$eval(id, el => el.getAttribute('data-source').trim()) || "";
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
      await page.waitForSelector(id, { timeout: Timeouts.SEC_HALF });
      await page.waitForTimeout(Timeouts.SEC_HALF);
      await page.bringToFront();
      await page.focus(id);
      scrapedSeriesTitle = await page.$eval(id, el => el.innerText.trim()) || "";
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

async function _getScrapePage(url, params) {
  if (globalBookshelfPage == null) {
    globalBookshelfPage = await params.browser.newPage();

    await globalBookshelfPage.goto(url, { waitUntil: 'domcontentloaded', timeout: Timeouts.MIN_3 });
    await globalBookshelfPage.waitForTimeout(Timeouts.SEC_1);  // Just in case.
  }
  return globalBookshelfPage;
}

function _formatDate(str, book) {
  try {
    return new Date(str).toDateString();
  } catch (e) {
    error(book, 'Cannot parse date: ' + str, e);
    return '';
  }
}

function _stripPrefix(str, prefix) {
  if (str == null || str == undefined || str.length <= str.prefix || !str.startsWith(prefix)) {
    return str;
  }
  return str.substr(prefix.length);
}
