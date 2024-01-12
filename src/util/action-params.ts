import { BrowserInterface } from '../browser.js';

export class ActionParams {
    public verbose: boolean = false;
    public keepOpen: boolean = false;
    public dryRun: boolean = false;
    public browser: BrowserInterface = null;
    public scrapeOnly: boolean = false;
}
