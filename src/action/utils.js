import * as fs from 'fs';

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

export async function clearTextField(page, id, fast = false) {
    await page.focus(id);
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(fast ? 300 : 1000);
}

export function fileExists(path) {
    try {
        if (fs.existsSync(path)) {
            return true;
        }
    } catch (err) {
        console.error(err);
    }
    return false;
}

export async function waitForElements(page, ids) {
    for (const id of ids) {
        await page.waitForSelector(id);
    }
    await page.waitForTimeout(Timeouts.SEC_1); // Just in case.
}

export async function maybeClosePage(params, page) {
    if (!params.keepOpen || numOpenTabs(params.browser) > 20) {
        console.log("Closing page");
        await page.close();
    }
}

async function numOpenTabs(browser) {
    const n = (await browser.pages()).length;
    console.log("Number of open tabs = " + n);
    return n;
}