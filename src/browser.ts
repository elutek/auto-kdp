import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { Browser, Page } from 'puppeteer';
import { Timeouts } from './util/timeouts.js';

export interface BrowserInterface {
    newPage(): Promise<PageInterface>;
    pages(): Array<PageInterface>;
    close(): Promise<void>;
}

export interface PageInterface {
    url(): string;
    goto(url: string, timeoutMillis: number): Promise<number>;
    getRawContent(url: string, timeoutMillis: number): Promise<string>;
    waitForSelector(id: string, timeoutMillis: number): Promise<void>;
    waitForSelectorVisible(id: string, timeoutMillis: number): Promise<void>;
    waitForTimeout(timeoutMillis: number): Promise<void>;
    waitForNavigation(timeoutMillis: number): Promise<void>;
    selectFile(fileSelectorId: string, fileToSelect: string, timeoutMillis: number): Promise<void>;
    click(id: string, timeoutMillis: number): Promise<void>;
    hover(id: string, timeoutMillis: number): Promise<void>;
    tap(id: string, timeoutMillis: number): Promise<void>;
    type(id: string, text: string, timeoutMillis: number): Promise<void>;
    focus(id: string, timeoutMillis: number): Promise<void>;
    bringToFront(): Promise<void>;
    select(id: string, value: string, timeoutMillis: number): Promise<void>;
    evalValue(id: string, fun: (x: HTMLElement) => string, timeoutMillis: number): Promise<string>;
    updateValue(id: string, value: string): Promise<void>;
    clearTextField(id: string, timeoutMillis: number): Promise<void>;
    close(): Promise<void>;
    hasElement(id: string, timeoutMillis: number): Promise<boolean>;
}

export class PuppeteerBrowser implements BrowserInterface {
    private _browser: Browser;
    private _pages = new Array<PageInterface>();

    constructor(browser: Browser) {
        this._browser = browser;
    }

    pages(): Array<PageInterface> {
        return this._pages;
    }

    async newPage(): Promise<PageInterface> {
        const newPage = new PuppeteerPage(await this._browser.newPage());
        this._pages.push(newPage);
        return newPage;
    }

    async close() {
        await this._browser.close();
    }

    static async create(headless: boolean, userDataDir: string): Promise<BrowserInterface> {
        return new PuppeteerBrowser(await puppeteer
            .use(StealthPlugin())
            .launch({
                headless: headless ? 'new' : false,
                defaultViewport: null,
                userDataDir: userDataDir
            }));
    }
}

export class PuppeteerPage implements PageInterface {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    url(): string {
        return this.page.url();
    }

    async waitForNavigation(timeoutMillis: number): Promise<void> {
        await this.page.waitForNavigation({ timeout: timeoutMillis });
    }

    async waitForSelector(id: string, timeoutMillis: number) {
        await this.page.waitForSelector(id, { timeout: timeoutMillis });
    }

    async waitForSelectorVisible(id: string, timeoutMillis: number) {
        await this.page.waitForSelector(id, { timeout: timeoutMillis, visible: true });
    }

    async waitForTimeout(timeoutMillis: number) {
        await this.page.waitForTimeout(timeoutMillis);
    }

    async selectFile(fileSelectorId: string, fileToSelect: string, timeoutMillis: number): Promise<void> {
        const futureCoverFileChooser = this.page.waitForFileChooser({ timeout: timeoutMillis })
        await this.page.click(fileSelectorId);
        const coverFileChooser = await futureCoverFileChooser;
        await coverFileChooser.accept([fileToSelect]);
    }

    async goto(url: string, timeoutMillis: number): Promise<number> {
        await this.page.waitForTimeout(Timeouts.SEC_1); // Just in case.
        const response = await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMillis });
        await this.page.waitForTimeout(Timeouts.SEC_1); // Just in case.
        return response.status();
    }

    async getRawContent(url: string, timeoutMillis: number): Promise<string> {
        const response = await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMillis });
        return await response.text();
    }

    async bringToFront() {
        await this.page.bringToFront();
    }

    async select(id: string, value: string, timeoutMillis: number) {
        await this.waitForSelector(id, timeoutMillis);
        await this.page.select(id, value);
    }

    async evalValue(id: string, fun: (x: HTMLElement) => string, timeoutMillis: number): Promise<string> {
        try {
            await this.waitForSelector(id, timeoutMillis);
        } catch (TimeoutError) {
            return '';
        }
        return await this.page.$eval(id, fun) || "";
    }

    async focus(id: string, timeoutMillis: number) {
        await this.waitForSelector(id, timeoutMillis);
        await this.page.focus(id);
    }

    async click(id: string, timeoutMillis: number) {
        //console.log("Waiting for id = " + id);
        await this.waitForSelector(id, timeoutMillis);
        console.log("Clicking at id = " + id);
        await this.page.click(id);
        //console.log("Clicked");
    }

    async hover(id: string, timeoutMillis: number) {
        console.log("Hovering on id = " + id);
        await this.waitForSelector(id, timeoutMillis);
        await this.page.hover(id);
    }

    async tap(id: string, timeoutMillis: number) {
        await this.waitForSelector(id, timeoutMillis);
        await this.page.tap(id);
    }

    async type(id: string, text: string, timeoutMillis: number) {
        await this.waitForSelector(id, timeoutMillis);
        await this.page.type(id, text);
    }

    async clearTextField(id: string, timeoutMillis: number) {
        await this.waitForSelector(id, timeoutMillis);
        await this.page.focus(id);
        await this.page.keyboard.down('Control');
        await this.page.keyboard.press('A');
        await this.page.keyboard.up('Control');
        await this.page.keyboard.press('Backspace');
        await this.page.waitForTimeout(Timeouts.SEC_HALF);
    }

    async updateValue(id: string, value: string) {
        await this.page.$eval(id, (el: HTMLInputElement, value: string) => {
            if (el) {
                el.value = value;
            } else {
                throw Error('Could not update ' + id);
            }
        }, value);
    }

    async close() {
        await this.page.close();
    }

    async hasElement(id: string, timeoutMillis: number): Promise<boolean> {
        try {
            await this.waitForSelector(id, timeoutMillis);
            return true;
        } catch (e) {
            return false;
        }
    }
}
