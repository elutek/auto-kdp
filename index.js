#!/usr/bin/env node

import * as fs from 'fs';
import { program } from 'commander';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

import { BookFile } from './src/book-file.js';
import { ExecuteBookActions } from './src/book-action-executor.js';

// Action
import { scrapeAmazonCoverImageUrl } from './src/action/scrape-amazon-cover-image-url.js';
import { scrapeIsbn } from './src/action/scrape-isbn.js';
import { isMetadataUpdateNeeded } from './src/action/is-metadata-update-needed.js';
import { scrape } from './src/action/scrape.js';
import { produceManuscript } from './src/action/produce-manuscript.js';
import { ensureLoggedIn } from './src/action/ensure-logged-in.js';
import { updatePricing } from './src/action/update-pricing.js';
import { updateBookMetadata } from './src/action/update-book-metadata.js';
import { updateContentMetadata } from './src/action/update-content-metadata.js';
import { updateContent } from './src/action/update-content.js';
import { publish } from './src/action/publish.js';


async function executeBookActionCallback(action, book, params) {
  _debug(params.verbose, 'Executing book action: ' + action);

  if (action == 'updateMetadataIfNeeded') {
    return await isMetadataUpdateNeeded(book, params);
  } else if (action == 'scrape') {
    return await scrape(book, params);
  }

  let success = false;
  switch (action) {
    case 'book-metadata': success = await updateBookMetadata(book, params); break;
    case 'content-metadata': success = await updateContentMetadata(book, params); break;
    case 'scrapeIsbn': success = await scrapeIsbn(book, params); break;
    case 'produceManuscript': success = await produceManuscript(book, params); break;
    case 'content': success = await updateContent(book, params); break;
    case 'pricing': success = await updatePricing(book, params); break;
    case 'publish': success = await publish(book, params); break;
    case 'scrapeAmazonCoverImageUrl': success = await scrapeAmazonCoverImageUrl(book, params); break;
    default:
      throw new Error('Unknown action: ' + action);
  }
  return { success: success, nextActions: '' };
}

async function _doProcessOneBook(bookFile, bookList, book, params) {
  const results = await ExecuteBookActions(book, (a, b, p) => executeBookActionCallback(a, b, p), params);
  if (results.numSuccesses > 0) {
    _debug(params.verbose, `Writing ${bookList.size()} books`)
    await bookFile.writeBooksAsync(bookList);
  } else {
    _debug(params.verbose, 'No need to update books');
  }
  return results.result;
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

async function mainWithOptions(booksCsvFile, booksConfigFile, contentDir, userDataDir, keepOpen, headlessOverride, dryRun, verbose) {
  _debug(verbose && dryRun, 'This is DRY RUN');

  //
  // Read books
  //
  _debug(verbose, `Using books CSV file: ${booksCsvFile}, config file ${booksConfigFile}, content dir ${contentDir}`);
  let bookFile = new BookFile(booksCsvFile, booksConfigFile, contentDir);
  let bookList = await bookFile.readBooksAsync();
  _debug(verbose, `Read ${bookList.size()} books, have ${bookList.getNumBooksToProcess()} to process`);

  //
  // Start browser and login. After this succeeds we should finally close the browser.
  //
  _debug(verbose, 'Starting browser');
  let browser = await _startBrowser(bookList, headlessOverride, userDataDir, verbose);
  _debug(verbose, 'Browser started');

  try {
    let params = {
      browser: browser,
      keepOpen: keepOpen,
      dryRun: dryRun,
      verbose: verbose
    }

    //
    // Login.
    // 
    _debug(verbose, 'Logging in');
    await ensureLoggedIn(params);
    _debug(verbose, 'Logged in');


    //
    // Process all books, write useful stats.
    //
    let totalToProcess = bookList.getNumBooksToProcess();
    let numProcessed = 0;
    let totalSeconds = 0;
    for (let book of bookList.books) {
      if (book.action != '') {

        //
        // Print current stats
        //
        let progressPerc = Math.round(10 * 100 * numProcessed / totalToProcess) / 10;
        let etaMin = numProcessed == 0 ? 0 : Math.round(((totalToProcess - numProcessed) * totalSeconds / numProcessed) / 60);
        console.log(verbose, `\n=== Processed ${numProcessed}/${totalToProcess} (${progressPerc}%), ETA: ${etaMin}min ===`);

        //
        // Process one book. Measure how long.
        //
        _debug(verbose, book);
        const startTime = performance.now();
        const isSuccess = await _doProcessOneBook(bookFile, bookList, book, params);
        const durationSeconds = (performance.now() - startTime) / 1000;
        _debug(`Book processing ${isSuccess ? 'OK' : 'FAILED'}, took ${Math.round(durationSeconds)} secs`);

        // Update stats
        totalSeconds += durationSeconds;
        numProcessed++;
      }
    }
  } finally {
    if (!keepOpen) {
      await browser.close();
    }
  }
  _debug(verbose, 'We are done');
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
  const verbose = opts.verbose;
  let headlessStr = opts.headless != null ? opts.headless : '';
  let headlessOverride = headlessStr == 'yes' || headlessStr == 'true' ? true : (headlessStr == 'no' || headlessStr == 'false' ? false : null);

  process.on("unhandledRejection", (error) => {
    console.error(error);
    throw error;
  });

  await mainWithOptions(opts.books, opts.config, opts.contentDir, opts.userData, opts.keepOpen, headlessOverride, opts.dryRun, verbose);
}

function _debug(verbose, ...message) {
  // TODO: this is silly, we need a proper logger.
  if (verbose && message != null && message.length > 0) {
    console.debug(message[0], message.join(" "));
  }
}


(async () => { main() })();

