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
  if (params.verbose) {
    console.log('Executing book action: ' + action);
  }

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
    if (params.verbose) {
      console.log(`Writing ${bookList.size()} books`);
    }
    await bookFile.writeBooksAsync(bookList);
  } else {
    if (params.verbose) {
      console.debug('No need to update books');
    }
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
  if (verbose && dryRun) {
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
      `\tverbose; ${verbose}`);
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
        let etaHrs = 0;
        if (etaMin >= 60) {
          etaHrs = Math.floor(etaMin / 60);
          etaMin -= etaHrs * 60;
        }
        if (verbose) {
          console.log(`\n=== Processed ${numProcessed}/${totalToProcess} (${progressPerc}%), ETA: ${etaHrs}h ${etaMin}m ===`);
        }

        //
        // Process one book. Measure how long.
        //
        if (verbose) {
          console.log(book);
        }
        const startTime = performance.now();
        const isSuccess = await _doProcessOneBook(bookFile, bookList, book, params);
        const durationSeconds = (performance.now() - startTime) / 1000;
        console.log(`Book processing ${isSuccess ? 'OK' : 'FAILED'}, took ${Math.round(durationSeconds)} secs`);

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
  const verbose = opts.verbose;
  let headlessStr = opts.headless != null ? opts.headless : '';
  let headlessOverride = headlessStr == 'yes' || headlessStr == 'true' ? true : (headlessStr == 'no' || headlessStr == 'false' ? false : null);

  process.on("unhandledRejection", (error) => {
    console.error(error);
    throw error;
  });

  await mainWithOptions(opts.books, opts.config, opts.contentDir, opts.userData, opts.keepOpen, headlessOverride, opts.dryRun, verbose);
}

(async () => { main() })();

