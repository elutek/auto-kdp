#!/usr/bin/env node

import { program } from 'commander';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

import { BookFile } from './src/book-file.js';
import { ExecuteBookActions } from './src/book-action-executor.js';
import { debug } from './src/utils.js';

// Action
import { scrapeAmazonCoverImageUrl } from './src/action/scrape-amazon-cover-image-url.js';
import { scrapeIsbn } from './src/action/scrape-isbn.js';
import { isMetadataUpdateNeeded } from './src/action/is-metadata-update-needed.js';
import { isPricingUpdateNeeded } from './src/action/is-pricing-update-needed.js';
import { scrape } from './src/action/scrape.js';
import { produceManuscript } from './src/action/produce-manuscript.js';
import { ensureLoggedIn } from './src/action/ensure-logged-in.js';
import { updatePricing } from './src/action/update-pricing.js';
import { updateBookMetadata } from './src/action/update-book-metadata.js';
import { updateContentMetadata } from './src/action/update-content-metadata.js';
import { updateContent } from './src/action/update-content.js';
import { publish } from './src/action/publish.js';

import pkg from 'sleep';
import { setSeriesTitle } from './src/action/set-series-title.js';
import { unpublish } from './src/action/unpublish.js';
import { archive } from './src/action/archive.js';
const { sleep } = pkg;


async function executeBookActionCallback(action, book, params) {
  debug(book, params.verbose, '@@@@ ' + action + ' @@@@');

  switch (action) {
    case 'archive': return await archive(book, params); break;
    case 'book-metadata': return await updateBookMetadata(book, params); break;
    case 'content': return await updateContent(book, params); break;
    case 'content-metadata': return await updateContentMetadata(book, params); break;
    case 'force-publish': return await publish(book, params, true /*force*/); break;
    case 'pricing': return await updatePricing(book, params); break;
    case 'produce-manuscript': return await produceManuscript(book, params); break;
    case 'publish': return await publish(book, params); break;
    case 'remove-series-title': return await setSeriesTitle(book, params, true); break;
    case 'scrape': return await scrape(book, params);
    case 'scrape-amazon-image': return await scrapeAmazonCoverImageUrl(book, params); break;
    case 'scrape-isbn': return await scrapeIsbn(book, params); break;
    case 'set-series-title': return await setSeriesTitle(book, params); break;
    case 'updateMetadataIfNeeded': return await isMetadataUpdateNeeded(book, params);
    case 'updatePricingIfNeeded': return await isPricingUpdateNeeded(book, params);
    case 'unpublish': return await unpublish(book, params); break;
  }
  throw new Error('Unknown action: ' + action);
}

async function _startBrowser(bookList, headlessOverride, userDataDir, verbose) {
  let headless = headlessOverride != null ? headlessOverride :
    // Headless is not overriden: the default is whether there is a "content" action
    // which for an unknown reason does not work in a headless mode.
    !bookList.containsContentAction();

  const browser = await puppeteer.launch(
    { headless: headless, defaultViewport: null, userDataDir: userDataDir });

  return browser;
}

async function processOneBook(bookFile, bookList, book, params) {
  const verbose = params.verbose;
  debug(book, verbose, "");
  debug(book, verbose, "--- START ----------------------- ");
  debug(book, verbose, "\n" + book.toString());

  const startTime = performance.now();
  await ExecuteBookActions(book, bookFile, bookList, (a, b, p) => executeBookActionCallback(a, b, p), params);
  const durationSeconds = (performance.now() - startTime) / 1000;

  debug(book, verbose, `DONE took ${Math.round(durationSeconds)} secs`);
  return durationSeconds;
}


async function mainWithOptions(booksCsvFile, booksConfigFile, contentDir, userDataDir, keepOpen, headlessOverride, dryRun, verbose) {
  if (dryRun) {
    console.log('This is DRY RUN');
  }

  //
  // Read books
  //
  if (verbose) {
    console.log(`Using \n` +
      `\tbooks CSV file: ${booksCsvFile}\n` +
      `\tbook config file: ${booksConfigFile}\n` +
      `\tbooks content dir ${contentDir}\n` +
      `\tuser data dir ${userDataDir}\n` +
      `\tkeepOpen: ${keepOpen}\n` +
      `\tdryRun: ${dryRun}\n` +
      `\tverbose: ${verbose}`);
  }
  let bookFile = new BookFile(booksCsvFile, booksConfigFile, contentDir);
  let bookList = await bookFile.readBooksAsync();
  if (verbose) {
    console.log(`Found total ${bookList.size()} books, to process:`, bookList.getBooksToProcess());
  }

  //
  // Start browser and login. After this succeeds we should finally close the browser.
  //
  if (verbose) {
    console.debug('Starting browser');
  }
  let browser = await _startBrowser(bookList, headlessOverride, userDataDir, verbose);
  if (verbose) {
    console.debug('Browser started');
  }

  const params = {
    browser: browser,
    keepOpen: keepOpen,
    dryRun: dryRun,
    verbose: verbose
  }

  try {
    //
    // Login.
    // 
    if (verbose) {
      console.debug('Logging in');
    }
    await ensureLoggedIn(params);
    if (verbose) {
      console.debug('Logged in');
    }

    //
    // Process all books, write useful stats.
    //
    let numConsecutiveFastOperations = 0;
    for (let book of bookList.books) {
      if (book.action != '') {
        const durationSeconds = await processOneBook(bookFile, bookList, book, params);

        //
        // Handle many consecutive fast operations
        //
        if (durationSeconds <= 2.0) {
          numConsecutiveFastOperations++;
          if (numConsecutiveFastOperations > 200) {
            // Take a little break.
            console.log("Too many fast operations - sleeping for 30s");
            sleep(30);
            numConsecutiveFastOperations = 0;
          }
        } else {
          numConsecutiveFastOperations = 0;
        }
      }
    }
  } finally {
    if (!keepOpen) {
      await browser.close();
    }
  }
  if (verbose) {
    console.log('We are done');
  }
};

async function main() {
  program
    .requiredOption('-f, --books <file>', 'CSV file that contains info for all books', 'books.csv')
    .requiredOption('-c, --config <file>', 'Books config file', 'books.conf')
    .requiredOption('-d, --content-dir <file>', 'Books content directory', '.')
    .requiredOption('-u, --user-data <dir>', 'User data dir to store cookies, etc', './user_data')
    .option('-k, --keep-open', false)
    .option('-h, --headless <yes|no>', '')
    .option('-d, --dry-run', false)
    .option('-v, --verbose', false);

  program.parse();

  const opts = program.opts();

  let headlessStr = opts.headless != undefined && opts.headless != null ? opts.headless : '';
  let headlessOverride = headlessStr == 'yes' || headlessStr == 'true' ? true : (headlessStr == 'no' || headlessStr == 'false' ? false : null);
  let dryRun = opts.dryRun != undefined && opts.dryRun != null ? opts.dryRun : false;
  let keepOpen = opts.keepOpen != undefined && opts.keepOpen != null ? opts.keepOpen : false;
  let verbose = opts.verbose != undefined && opts.verbose != null ? opts.verbose : false;

  process.on("unhandledRejection", (error) => {
    console.error(error);
    throw error;
  });

  await mainWithOptions(opts.books, opts.config, opts.contentDir, opts.userData, keepOpen, headlessOverride, dryRun, verbose);
}

(async () => { main() })();

