import { Timeouts, Urls, debug } from './utils.js';

export async function scrape(book, params) {
  const verbose = params.verbose

  if (params.dryRun) {
    debug(verbose, 'Scraping (dry run)');
    return true;
  }

  const url = Urls.BOOKSHELF_URL;
  debug(verbose, 'Scraping at url: ' + url);

  if (book.id == '') {
    debug(verbose, 'NOT scraping - need book id for that');
    return;
  }

  const page = await params.browser.newPage();

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: Timeouts.MIN_3 });
  await page.waitForTimeout(Timeouts.SEC_1);  // Just in case.

  // Type the search query.
  debug(verbose, 'Querying for the book');
  let id = '#podbookshelftable-search-input';
  await page.waitForSelector(id, { timeout: Timeouts.MIN_1 });
  await page.type(id, book.id);

  // Click search button.
  debug(verbose, 'Clicking Search');
  id = '#podbookshelftable-search-button-submit .a-button-input';
  await page.waitForSelector(id, { timeout: Timeouts.MIN_1 });
  await page.click(id);

  // Get ASIN from the search result.
  debug(verbose, 'Getting ASIN');
  id = '#zme-indie-bookshelf-dual-print-price-asin-' + book.id;
  await page.waitForSelector(id);
  const rawAsin = await page.$eval(id, el => el.innerText);
  const asin = _stripPrefix(rawAsin.trim(), 'ASIN:').trim();
  debug(verbose, 'Got ASIN: ' + asin);
  book.asin = asin;

  // Get pubStatus from the search result.
  debug(verbose, 'Getting pubStatus');
  id = '[id="' + book.id + '-status"] .element-popover-text > span';
  await page.waitForSelector(id);
  const pubStatus = await page.$eval(id, el => el.innerText.trim());
  book.pubStatus = pubStatus;
  debug(verbose, 'Got pubStatus: ' + pubStatus);

  // Get pubStatusDetail from the search result (it's right after
  // the pubStatus).
  debug(verbose, 'Getting pubStatusDetail');
  id = '[id="' + book.id + '-status"] .element-popover-text';
  await page.waitForSelector(id);
  let pubStatusDetail = await page.$eval(id, el => el.innerText.trim());
  if (pubStatusDetail.startsWith(pubStatus)) {
    pubStatusDetail = pubStatusDetail.substr(pubStatus.length).trim();
  }
  book.pubStatusDetail = pubStatusDetail;
  debug(verbose, 'Got pubStatusDetail: ' + pubStatusDetail);

  // Get publication date
  if (pubStatus == 'LIVE') {
    debug(verbose, 'Getting pubDate');
    id = '#zme-indie-bookshelf-dual-print-status-release-date-' + book.id;
    await page.waitForSelector(id);
    const pubDate = await page.$eval(id, el => el.innerText.trim());
    book.pubDate = _formatDate(_stripPrefix(pubDate, 'Submitted on ').trim());
    debug(verbose, `Got pubDate ${book.pubDate} (${pubDate})`);
  } else {
    book.pubDate = '';
  }

  if (!params.keepOpen) {
    await page.close();
  }

  return true;
}

function _formatDate(str) {
  try {
    return new Date(str).toDateString();
  } catch (e) {
    console.error('Cannot parse date: ' + str, e);
    return '';
  }
}

function _stripPrefix(str, prefix) {
  if (str == null || str == undefined || str.length <= str.prefix || !str.startsWith(prefix)) {
    return str;
  }
  return str.substr(prefix.length);
}
