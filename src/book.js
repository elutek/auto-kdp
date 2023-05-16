import { Keys } from './keys.js';
import { resolveAllValues } from './resolve.js';
import { copyMap, clipLen } from './utils.js';

// List of keys for which there cannot be a "default" value.
// Reasons are that these field are unique or assigned from Amazon.
// These are the only keys that AutoKDP can update.
const _KEYS_WITH_NO_DEFAULT = [
  Keys.ACTION,
  Keys.ID,
  Keys.ISBN,
  Keys.ASIN,
  Keys.WAS_EVER_PUBLISHED,
  Keys.PUB_STATUS,
  Keys.PUB_STATUS_DETAIL,
  Keys.PUB_DATE,
  Keys.COVER_IMAGE_URL,
];

export class Book {

  constructor(data, defaults, contentDir, allDataMaps) {
    // Check for illegal defaults.
    for (const k of _KEYS_WITH_NO_DEFAULT) {
      if (defaults.has(k)) {
        throw 'Cannot have default for key: ' + k;
      }
    }

    // Save all the original data for later writing it out
    this.origData = copyMap(data);

    // Combine defaults with data.
    let mergedDataMap = new Map();
    for (const [key, val] of defaults) {
      mergedDataMap.set(key, val);
    }
    for (const [key, val] of data) {
      mergedDataMap.set(key, val);
    }

    let unresolvedKeys = new Set();
    let resolvedDataMap = resolveAllValues(mergedDataMap, unresolvedKeys, allDataMaps);

    // Check if everything was resolved
    if (unresolvedKeys.size > 0) {
      throw 'Could not resolve keys: ' + Array.from(unresolvedKeys);
    }

    // Preserve all keys in this record as they are
    // so that CSV writer can get them.
    for (const [key, val] of data) {
      this[key] = val;
    }

    // Retrieve all required values.
    let getValue = x => {
      if (!resolvedDataMap.has(x)) {
        throw 'Key not found: ' + x;
      }
      return resolvedDataMap.get(x);
    }
    let parseFloatOrNull = x => x == null || x == '' ? null : parseFloat(x);

    // Fields that AutoKdp is allowed to update
    this.action = getValue(Keys.ACTION);
    this.asin = getValue(Keys.ASIN);
    this.id = getValue(Keys.ID);
    this.isbn = getValue(Keys.ISBN);
    this.pubDate = getValue(Keys.PUB_DATE);
    this.pubStatus = getValue(Keys.PUB_STATUS);
    this.pubStatusDetail = getValue(Keys.PUB_STATUS_DETAIL);
    this.wasEverPublished = getValue(Keys.WAS_EVER_PUBLISHED) == 'true';
    this.scrapedSeriesTitle = getValue(Keys.SCRAPED_SERIES_TITLE);

    // Fields that AutoKdp is not allowed to update
    this.authorFirstName = getValue(Keys.AUTHOR_FIRST_NAME);
    this.authorLastName = getValue(Keys.AUTHOR_LAST_NAME);
    this.category1 = getValue(Keys.CATEGORY1);
    this.category2 = getValue(Keys.CATEGORY2);
    this.coverLocalFile = contentDir + '/' + getValue(Keys.COVER_FILE);
    this.coverImageUrl = getValue(Keys.COVER_IMAGE_URL);
    this.description = getValue(Keys.DESCRIPTION);
    this.illustratorFirstName = getValue(Keys.ILLUSTRATOR_FIRST_NAME);
    this.illustratorLastName = getValue(Keys.ILLUSTRATOR_LAST_NAME);
    this.keyword0 = getValue(Keys.KEYWORD0);
    this.keyword1 = getValue(Keys.KEYWORD1);
    this.keyword2 = getValue(Keys.KEYWORD2);
    this.keyword3 = getValue(Keys.KEYWORD3);
    this.keyword4 = getValue(Keys.KEYWORD4);
    this.keyword5 = getValue(Keys.KEYWORD5);
    this.keyword6 = getValue(Keys.KEYWORD6);
    this.language = getValue(Keys.LANGUAGE);
    this.manuscriptCreationCommand = getValue(Keys.MANUSCRIPT_CREATION_COMMAND);
    this.manuscriptLocalFile = contentDir + '/' + getValue(Keys.MANUSCRIPT_FILE);
    this.notes = getValue(Keys.NOTES);
    this.priceAu = parseFloatOrNull(getValue(Keys.PRICE_AU));
    this.priceCa = parseFloatOrNull(getValue(Keys.PRICE_CA));
    this.priceEur = parseFloatOrNull(getValue(Keys.PRICE_EUR));
    this.priceGbp = parseFloatOrNull(getValue(Keys.PRICE_GBP));
    this.priceJp = parseFloatOrNull(getValue(Keys.PRICE_JP));
    this.pricePl = parseFloatOrNull(getValue(Keys.PRICE_PL));
    this.priceSe = parseFloatOrNull(getValue(Keys.PRICE_SE));
    this.priceUsd = parseFloatOrNull(getValue(Keys.PRICE_USD));
    this.primaryMarketplace = getValue(Keys.PRIMARY_MARKETPLACE);
    this.seriesTitle = getValue(Keys.SERIES_TITLE);
    this.title = getValue(Keys.TITLE);
    this.subtitle = getValue(Keys.SUBTITLE);
    this.signature = getValue(Keys.SIGNATURE);
    this.paperColor = getValue(Keys.PAPER_COLOR);
    this.paperTrim = getValue(Keys.PAPER_TRIM);
    this.paperBleed = getValue(Keys.PAPER_BLEED);
    this.paperCoverFinish = getValue(Keys.PAPER_COVER_FINISH);

    // Handle special actions
    if (this.action == 'all') {
      this.action = 'book-metadata:content-metadata:scrape-isbn:produce-manuscript:content:pricing:set-series-title:scrape:publish:scrape:scrape-amazon-image';
    } else if (this.action == 'update-published-book') {
      this.action = 'book-metadata:pricing:publish:scrape';
    }
  }

  canBeCreated() {
    return this.title != '' && this.authorFirstName != '' && this.authorLastName != '' &&
      this.description != '' && this.category1 != '' && this.category2 != '';
  }

  isFullyLive() {
    return this.wasEverPublished && this.pubStatus == 'LIVE' && this.pubStatusDetail == '' && this.scrapedSeriesTitle.toLowerCase().includes('ok');
  }

  numActions() {
    return this.action.split(':').filter(x => x).length;
  }

  hasAction() {
    return this.numActions() > 0;
  }

  // This constant splitting is inefficient, but is not worth optimizing.
  getFirstAction() {
    let actions = this.action.split(':').filter(x => x);
    return actions.length == 0 ? '' : actions[0];
  }

  popFirstAction() {
    let actions = this.action.split(':').filter(x => x);
    if (actions.length == 0) {
      return '';
    }
    let firstAction = actions.shift();
    this.action = actions.join(':');
    return firstAction;
  }

  getActionList() {
    return this.action.split(':').filter(x => x);
  }

  getDataToWrite() {
    let result = {};
    // First return the original values.
    for (const [key, val] of this.origData) {
      result[key] = val;
    }
    // Override the changed values.
    for (const key of _KEYS_WITH_NO_DEFAULT) {
      result[key] = this[key];
    }
    return result;
  }

  prefix() {
    return this.signature + ":: ";
  }

  toString() {
    let result = "";
    for (const k in Keys) {
      const key = Keys[k];
      const val = clipLen(this[key], 200);
      result += "    " + key + " = " + val + "\n";
    }
    return result;
  }
}

