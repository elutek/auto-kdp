import * as fs from 'fs';
import { Browser, Page } from 'puppeteer';

import { ActionParams } from '../util/action-params.js';
import { Book } from '../book/book.js';
import { clipLen, debug, error } from '../util/utils.js';

export let Timeouts = {
    SEC_QUARTER: 250,
    SEC_HALF: 500,
    SEC_1: 1 * 1000,
    SEC_2: 2 * 1000,
    SEC_5: 5 * 1000,
    SEC_10: 10 * 1000,
    SEC_30: 30 * 1000,
    MIN_1: 1 * 60 * 1000,
    MIN_3: 1 * 60 * 1000,
    MIN_5: 5 * 60 * 1000,
    MIN_10: 10 * 60 * 1000,
    MIN_15: 15 * 60 * 1000,
    MIN_30: 30 * 60 * 1000,
};

export let Urls = {
    AMAZON_IMAGE_URL: 'https://images-na.ssl-images-amazon.com/images/I/',
    AMAZON_IMAGE_URL2: 'https://m.media-amazon.com/images/I/',
    AMAZON_PRODUCT_URL: 'https://www.amazon.com/dp/',
    BOOKSHELF_URL: 'https://kdp.amazon.com/en_US/bookshelf?ref_=kdp_kdp_TAC_TN_bs',
    CREATE_PAPERBACK: 'https://kdp.amazon.com/en_US/title-setup/paperback/new/details?ref_=kdp_kdp_BS_D_cr_ti',
    EDIT_PAPERBACK_CONTENT: 'https://kdp.amazon.com/en_US/title-setup/paperback/$id/content',
    EDIT_PAPERBACK_DETAILS: 'https://kdp.amazon.com/en_US/title-setup/paperback/$id/details?ref_=kdp_BS_D_ta_de',
    EDIT_PAPERBACK_PRICING: 'https://kdp.amazon.com/en_US/title-setup/paperback/$id/pricing?ref_=kdp_BS_D_ta_pr',
};

export async function clearTextField(page: Page, id: string, fast = false) {
    await page.focus(id);
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(fast ? 300 : 1000);
}

export function fileExists(path: string): boolean {
    try {
        if (fs.existsSync(path)) {
            return true;
        }
    } catch (err) {
        console.error(err);
    }
    return false;
}

export async function waitForElements(page: Page, ids: string[]) {
    for (const id of ids) {
        await page.waitForSelector(id);
    }
    await page.waitForTimeout(Timeouts.SEC_1); // Just in case.
}

export async function maybeClosePage(params: ActionParams, page: Page, force: boolean = false) {
    if (!params.keepOpen || force) {
        await page.close();
    } else {
        const n = await numOpenTabs(params.browser);
        if (n > 20) {
            await page.close();
        } else {
            // console.log(`Not closing: have ${n} tab`);
        }
    }
}

async function numOpenTabs(browser: Browser): Promise<number> {
    return (await browser.pages()).length;
}

export async function getTextFieldValue(id: string, page: Page): Promise<string> {
    // debug(book, verbose, `Waiting for the text element (${id})`);
    try {
        await page.waitForSelector(id, { timeout: Timeouts.SEC_2 });
    } catch (TimeoutError) {
        return '';
    }

    // Read the old value.
    const oldValue = await page.$eval(id, x => (x as HTMLInputElement).value) || '';

    return oldValue;
}

export async function updateTextFieldIfChanged(id: string, value: string, fieldHumanName: string, page: Page, book: Book, verbose: boolean): Promise<boolean> {
    // debug(book, verbose, `Waiting for the text element (${id})`);
    await page.waitForSelector(id, { timeout: Timeouts.SEC_10 });

    // Read the old value.
    const oldValue = await page.$eval(id, x => (x as HTMLInputElement).value) || '';

    // If they are the same, we are done.
    if (oldValue == value) {
        debug(book, verbose, `No need to update ${fieldHumanName}, got ${oldValue}`);
        return false;
    }
    // Otherwise, update the value.
    debug(book, verbose, `Updating ${fieldHumanName} from ${oldValue} to ${value}`);
    await clearTextField(page, id);
    if (value != '') {
        await page.type(id, value);
    }

    return true;
}
export async function updateHiddenTextField(id: string, value: string, fieldHumanName: string, page: Page, book: Book, verbose: boolean): Promise<boolean> {
    // debug(book, verbose, `Waiting for the text element (${id})`);
    await page.waitForSelector(id, { timeout: Timeouts.SEC_10 });

    // Read the old value.
    const oldValue = await page.$eval(id, x => (x as HTMLInputElement).value) || '';

    // If they are the same, we are done.
    if (oldValue == value) {
        debug(book, verbose, `No need to update ${fieldHumanName} (hidden), got ${oldValue}`);
        return false;
    }
    // Otherwise, update the value.
    debug(book, verbose, `Updating ${fieldHumanName} (hidden) from ${oldValue} to ${value}`);
    await page.$eval(id, (el: HTMLInputElement, value: string, book: Book, fieldHumanName: string) => {
        if (el) {
            el.value = value;
        } else {
            error(book, 'Could not update ' + fieldHumanName);
            throw Error('Could not update ' + fieldHumanName);
        }
    }, value, book, fieldHumanName);

    return true;
}

export async function selectValue(id: string, value: string, fieldHumanName: string, page: Page, book: Book, verbose: boolean) {
    //debug(book, verbose, `Waiting for the element to select (${id})`);
    await page.waitForSelector(id, { timeout: Timeouts.SEC_10 });
    const oldValue = await page.$eval(id, x => (x as HTMLSelectElement).value);
    if (oldValue != value) {
        debug(book, verbose, `Selecting ${value} for ${fieldHumanName}`);
        await page.select(id, value);
    } else {
        debug(book, verbose, `No need to update ${fieldHumanName}, got ${oldValue}`);
    }
}

export async function clickSomething(id: string, fieldHumanName: string, page: Page, book: Book, verbose: boolean) {
    //debug(book, verbose, `Waiting for the element to click (${id})`);
    await page.waitForSelector(id, { timeout: Timeouts.SEC_10 });
    debug(book, verbose, `Clicking ${fieldHumanName}`);
    await page.click(id);
}

export async function updateTextAreaIfChanged(id: string, value: string, processor: (str: string) => string, fieldHumanName: string, page: Page, book: Book, verbose: boolean) {
    //debug(book, verbose, `Waiting for the text area element (${id})`)
    await page.waitForSelector(id, { timeout: Timeouts.SEC_10 });
    const oldValue = processor(await page.$eval('#cke_1_contents > textarea', x => (x as HTMLTextAreaElement).value) || '');
    const newValue = processor(value);
    if (oldValue != newValue) {
        // Description needs to be updated.
        debug(book, verbose, `Updating ${fieldHumanName} from \n\t${oldValue}\n\tto\n\t${newValue}`);

        debug(book, verbose, `Cleaning textarea`)
        await clearTextField(page, id);
        debug(book, verbose, `Typing new description`)
        await page.type(id, newValue);
    } else {
        debug(book, verbose, `Updating ${fieldHumanName}- not needed, got ${clipLen(oldValue)}`);
    }
}

export async function hasElement(id: string, page: Page, book: Book, verbose: boolean): Promise<boolean> {
    try {
        await page.waitForSelector(id, { timeout: Timeouts.SEC_HALF });
        debug(book, verbose, `Element exists: ${id}`);
        return true;
    } catch (e) {
        debug(book, verbose, `Element does not exist: ${id}`);
        return false;
    }
}