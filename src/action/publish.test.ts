import { makeOkTestBook } from "../util/test-utils.js";
import { ActionParams } from "../util/action-params.js";
import { publish } from "./publish.js";
import { OnePageFakeBrowser, FakePage } from "../util/fake-browser.js";

test('publishDryRun', async () => {
    const book = makeOkTestBook();
    const browser = new OnePageFakeBrowser([]);
    const params: ActionParams = {
        browser: browser,
        keepOpen: false,
        dryRun: true,
        verbose: true
    };

    const actionResult = await publish(book, params);
    expect(actionResult.success).toBe(true);
});

test('alreadyPublished', async () => {
    const book = makeOkTestBook();
    const browser = new OnePageFakeBrowser([]);
    const params: ActionParams = {
        browser: browser,
        keepOpen: false,
        dryRun: false,
        verbose: true
    };

    book.wasEverPublished = true;
    book.pubStatus = 'LIVE';
    book.pubStatusDetail = '';

    const actionResult = await publish(book, params);
    expect(actionResult.success).toBe(true);
});

test('publishingInProgressA', async () => {
    const book = makeOkTestBook();
    const browser = new OnePageFakeBrowser([]);
    const params: ActionParams = {
        browser: browser,
        keepOpen: false,
        dryRun: false,
        verbose: true
    };

    book.wasEverPublished = true;
    book.pubStatus = 'IN REVIEW';
    book.pubStatusDetail = '';

    const actionResult = await publish(book, params);
    expect(actionResult.success).toBe(true);
});

test('publishingInProgressB', async () => {
    const book = makeOkTestBook();
    const browser = new OnePageFakeBrowser([]);
    const params: ActionParams = {
        browser: browser,
        keepOpen: false,
        dryRun: false,
        verbose: true
    };

    book.wasEverPublished = true;
    book.pubStatus = 'LIVE';
    book.pubStatusDetail = 'Updates publishing';

    const actionResult = await publish(book, params);
    expect(actionResult.success).toBe(true);
});


test('canPublish', async () => {

    //
    // Setup
    //

    const book = makeOkTestBook();
    const browser = new OnePageFakeBrowser([
        "Complete", // Metadata status
        "Complete", // Content status
        "Complete", // Pricing status
    ]);
    const params: ActionParams = {
        browser: browser,
        keepOpen: false,
        dryRun: false,
        verbose: true
    };

    //
    // Action
    //

    const actionResult = await publish(book, params);

    //
    // Verify
    //

    expect(actionResult).not.toBe(null);
    expect(actionResult.success).toBe(true);

    // Make sure the browser did what we wanted.
    expect(params.browser.pages().length).toBe(1);
    const page = params.browser.pages()[0] as FakePage;
    expect(page.performedActions).toEqual([
        'goto:https://kdp.amazon.com/en_US/title-setup/paperback/test_id/pricing?ref_=kdp_BS_D_ta_pr',
        'eval:Complete',
        'eval:Complete',
        'eval:Complete',
        'click',
        'nav',
        'close'
    ]);
    expect(page.closed).toBe(true);
});

test('cannotPublish', async () => {

    //
    // Setup
    //

    const book = makeOkTestBook();
    const browser = new OnePageFakeBrowser([
        "In progress", // Metadata status
        "Complete", // Content status
        "Complete", // Pricing status
    ]);
    const params: ActionParams = {
        browser: browser,
        keepOpen: false,
        dryRun: false,
        verbose: true
    };

    //
    // Action
    //

    const actionResult = await publish(book, params);

    //
    // Verify
    //

    expect(actionResult).not.toBe(null);
    expect(actionResult.success).toBe(false);

    // Make sure the browser did what we wanted.
    expect(params.browser.pages().length).toBe(1);
    const page = params.browser.pages()[0] as FakePage;
    expect(page.performedActions).toEqual([
        'goto:https://kdp.amazon.com/en_US/title-setup/paperback/test_id/pricing?ref_=kdp_BS_D_ta_pr',
        'eval:In progress',
        'eval:Complete',
        'eval:Complete',
        'close'
    ]);

    expect(page.closed).toBe(true);
});