import * as fs from 'fs';

import { Keys, ALL_MARKETPLACES } from './keys.js';
import { resolveAllValues } from './resolve.js';
import { copyMap, clipLen, isPositiveInt } from '../util/utils.js';

// List of keys for which there cannot be a "default" value.
// Reasons are that these field are unique or assigned from Amazon.
// These are the only keys that AutoKDP can update.
const _KEYS_WITH_NO_DEFAULT = [
  Keys.ACTION,
  Keys.ASIN,
  Keys.COVER_IMAGE_URL,
  Keys.ID,
  Keys.ISBN,
  Keys.PUB_DATE,
  Keys.PUB_STATUS,
  Keys.PUB_STATUS_DETAIL,
  Keys.TITLE_ID,
  Keys.WAS_EVER_PUBLISHED,
  Keys.SCRAPED_SERIES_TITLE
];

export class Book {

  private origData: Map<string, string>;

  // Fields that AutoKdp is not allowed to update
  public action: string;
  public asin: string;
  public coverImageUrl: string;
  public id: string;
  public isbn: string;
  public pubDate: string;
  public pubStatus: string;
  public pubStatusDetail: string;
  public titleId: string;
  public wasEverPublished: boolean;
  public scrapedSeriesTitle: string;

  // Fields that AutoKdp is not allowed to update
  readonly authorFirstName: string;
  readonly authorLastName: string;
  readonly category1: string;
  readonly category2: string;
  readonly newCategory1: string;
  readonly newCategory2: string;
  readonly newCategory3: string;
  readonly coverLocalFile: string;
  readonly description: string;
  readonly illustratorFirstName: string;
  readonly illustratorLastName: string;
  readonly keyword0: string;
  readonly keyword1: string;
  readonly keyword2: string;
  readonly keyword3: string;
  readonly keyword4: string;
  readonly keyword5: string;
  readonly keyword6: string;
  readonly language: string;
  readonly manuscriptCreationCommand: string;
  readonly manuscriptLocalFile: string;
  readonly notes: string;
  readonly priceAu: number;
  readonly priceCa: number;
  readonly priceEur: number;
  readonly priceGbp: number;
  readonly priceJp: number;
  readonly pricePl: number;
  readonly priceSe: number;
  readonly priceUsd: number;
  readonly primaryMarketplace: string;
  readonly seriesTitle: string;
  readonly title: string;
  readonly subtitle: string;
  readonly edition: string;
  readonly signature: string;
  readonly paperColor: string;
  readonly paperTrim: string;
  readonly paperBleed: string;
  readonly paperCoverFinish: string;

  constructor(data: Map<string, string>, defaults: Map<string, string>, contentDir: string, allDataMaps: Array<Map<string, string>>) {
    // Check for illegal defaults.
    for (const k of _KEYS_WITH_NO_DEFAULT) {
      if (defaults.has(k)) {
        throw 'Cannot have default for key: ' + k;
      }
    }

    // Save all the original data for later writing it out
    this.origData = copyMap(data);

    // Combine defaults with data.
    let mergedDataMap = new Map<string, string>();
    for (const [key, val] of defaults) {
      mergedDataMap.set(key, val);
    }
    for (const [key, val] of data) {
      mergedDataMap.set(key, val);
    }

    let unresolvedKeys = new Set<string>();
    let resolvedDataMap = resolveAllValues(mergedDataMap, unresolvedKeys, allDataMaps);

    // Check if everything was resolved
    if (unresolvedKeys.size > 0) {
      throw 'Could not resolve keys: ' + Array.from(unresolvedKeys);
    }

    // Retrieve all required values.
    let getValue = (x: string) => {
      if (!resolvedDataMap.has(x)) {
        if (x == 'category1' || x == 'category2') {
          // Permit category1 or category2 be missing because they are getting deprecated.
          return '';
        }
        throw 'Key not found: ' + x;
      }
      let val = resolvedDataMap.get(x);
      if (val.startsWith("file:")) {
        const fileName = val.substring("file:".length);
        try {
          val = fs.readFileSync(fileName, { encoding: 'utf-8' });
        } catch (e) {
          /* istanbul ignore next */
          throw new Error("Could not read file: " + fileName + " to set the value of " + x);
        }
      }
      return val;
    }
    let parseFloatOrNull = (x: string | null) => x == null || x == '' ? null : parseFloat(x);

    // Fields that AutoKdp is allowed to update
    this.action = getValue(Keys.ACTION);
    this.asin = getValue(Keys.ASIN);
    this.id = getValue(Keys.ID);
    this.titleId = getValue(Keys.TITLE_ID);
    this.isbn = getValue(Keys.ISBN);
    this.pubDate = getValue(Keys.PUB_DATE);
    this.pubStatus = getValue(Keys.PUB_STATUS);
    this.pubStatusDetail = getValue(Keys.PUB_STATUS_DETAIL);
    this.wasEverPublished = getValue(Keys.WAS_EVER_PUBLISHED) == 'true';
    this.scrapedSeriesTitle = getValue(Keys.SCRAPED_SERIES_TITLE);
    this.coverImageUrl = getValue(Keys.COVER_IMAGE_URL);

    // Fields that AutoKdp is not allowed to update
    this.authorFirstName = getValue(Keys.AUTHOR_FIRST_NAME);
    this.authorLastName = getValue(Keys.AUTHOR_LAST_NAME);
    this.category1 = getValue(Keys.CATEGORY1);
    this.category2 = getValue(Keys.CATEGORY2);
    this.newCategory1 = getValue(Keys.NEW_CATEGORY1);
    this.newCategory2 = getValue(Keys.NEW_CATEGORY2);
    this.newCategory3 = getValue(Keys.NEW_CATEGORY3);
    this.coverLocalFile = contentDir + '/' + getValue(Keys.COVER_FILE);
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
    if (!ALL_MARKETPLACES.includes(this.primaryMarketplace)) {
      throw new Error("Unrecognized primary marketplace: " + this.primaryMarketplace)
    }
    this.seriesTitle = getValue(Keys.SERIES_TITLE);
    this.title = getValue(Keys.TITLE);
    this.subtitle = getValue(Keys.SUBTITLE);
    this.edition = getValue(Keys.EDITION);
    if (this.edition != '' && !isPositiveInt(this.edition)) {
      throw new Error("Edition must be a positive integer, but got: " + this.edition)
    }
    this.signature = getValue(Keys.SIGNATURE);
    this.paperColor = getValue(Keys.PAPER_COLOR);
    this.paperTrim = getValue(Keys.PAPER_TRIM);
    this.paperBleed = getValue(Keys.PAPER_BLEED);
    this.paperCoverFinish = getValue(Keys.PAPER_COVER_FINISH);

    // Handle special actions
    if (this.action == 'all') {
      this.action = 'book-metadata:assign-isbn:produce-manuscript:content:scrape-isbn:pricing:set-series-title:scrape:publish:scrape:scrape-amazon-image';
    } else if (this.action == 'all-but-no-publish') {
      this.action = 'book-metadata:assign-isbn:produce-manuscript:content:scrape-isbn:pricing:set-series-title:scrape';
    }
  }

  getPriceForMarketplace(marketplace: string): number {
    switch (marketplace) {
      case "us": return this.priceUsd;
      case "uk": return this.priceGbp;
      case "de":
      case "fr":
      case "fr":
      case "es":
      case "it":
      case "nl":
        return this.priceEur;
      case "pl":
        return this.pricePl;
      case "se":
        return this.priceSe;
      case "jp":
        return this.priceJp;
      case "ca":
        return this.priceCa;
      case "au":
        return this.priceAu;
    }
    throw new Error("Unrecognized marketplace: " + marketplace);
  }

  getPreservedKey(key: string): string {
    return this.origData.get(key);
  }

  hasOldCategories() {
    return this.category1 != '' && this.category2 != '';
  }

  hasNewCategories() {
    return this.newCategory1 != '' && this.newCategory2 != '' && this.newCategory3 != '';
  }

  canBeCreated() {
    return this.title != '' && this.authorFirstName != '' && this.authorLastName != '' &&
      this.description != '' && (this.hasOldCategories() || this.hasNewCategories());
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
    return this.signature;
  }

  toString() {
    let result = "";
    for (const k in Keys) {
      const key = Keys[k];
      let val = this[key];
      if (val != null && typeof val === "string") {
        val = clipLen(val as string, 200);
      }
      result += "    " + key + " = " + val + "\n";
    }
    /*
    result += `Preserved keys (${this.origData.size})\n`;
    for (const [key, val] of this.origData) {
      result += "    " + key + " = " + val + "\n";
    }
    */
    return result;
  }
}

