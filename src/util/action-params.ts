import { Browser } from 'puppeteer';

export class ActionParams {
    public verbose: boolean = false;
    public keepOpen: boolean = false;
    public dryRun: boolean = false;
    public browser: Browser = null;
}
