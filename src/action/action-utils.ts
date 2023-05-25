import * as fs from 'fs';
import { Browser, Page } from 'puppeteer';

import { ActionParams } from '../util/action-params.js';

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

export async function maybeClosePage(params: ActionParams, page: Page) {
    if (!params.keepOpen) {
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