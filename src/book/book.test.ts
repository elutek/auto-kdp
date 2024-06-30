import { Keys } from './keys.js';
import { Book } from './book.js';
import { makeOkTestBook, makeMap } from '../util/test-utils.js';

test('create book with all fields explicitly specified', () => {
    const book = new Book(
        makeMap(
            Keys.ACTION, 'test_action',
            Keys.ASIN, 'test_asin',
            Keys.AUTHOR_FIRST_NAME, 'test_author_first_name',
            Keys.AUTHOR_LAST_NAME, 'test_author_last_name',
            Keys.CATEGORY1, 'test_cat1',
            Keys.CATEGORY2, 'test_cat2',
            Keys.NEW_CATEGORY1, 'test_new_cat1',
            Keys.NEW_CATEGORY2, 'test_new_cat2',
            Keys.NEW_CATEGORY3, 'test_new_cat3',
            Keys.COVER_IMAGE_URL, 'test_cover_image_url',
            Keys.COVER_FILE, 'test_cover_file',
            Keys.DESCRIPTION, 'test_description',
            Keys.ID, 'test_id',
            Keys.TITLE_ID, 'test_title_id',
            Keys.ILLUSTRATOR_FIRST_NAME, 'test_illustrator_first_name',
            Keys.ILLUSTRATOR_LAST_NAME, 'test_illustrator_last_name',
            Keys.ISBN, 'test_isbn',
            Keys.KEYWORD0, 'test_keyword0',
            Keys.KEYWORD1, 'test_keyword1',
            Keys.KEYWORD2, 'test_keyword2',
            Keys.KEYWORD3, 'test_keyword3',
            Keys.KEYWORD4, 'test_keyword4',
            Keys.KEYWORD5, 'test_keyword5',
            Keys.KEYWORD6, 'test_keyword6',
            Keys.LANGUAGE, 'afrikaans',
            Keys.MANUSCRIPT_CREATION_COMMAND, 'test_manuscript_creation_command',
            Keys.MANUSCRIPT_FILE, 'test_manuscript_file',
            Keys.NOTES, 'test_notes',
            Keys.PAPER_BLEED, 'test_paper_bleed',
            Keys.PAPER_COLOR, 'test_paper_color',
            Keys.PAPER_COVER_FINISH, 'test_paper_cover_finish',
            Keys.PAPER_TRIM, 'test_paper_trim',
            Keys.PRICE_AU, '1.1',
            Keys.PRICE_CA, '2.1',
            Keys.PRICE_EUR, '3.1',
            Keys.PRICE_GBP, '4.1',
            Keys.PRICE_JP, '5.1',
            Keys.PRICE_PL, '6.1',
            Keys.PRICE_SE, '7.1',
            Keys.PRICE_USD, '8.1',
            Keys.PRIMARY_MARKETPLACE, 'pl',
            Keys.PUB_DATE, 'test_pub_date',
            Keys.PUB_STATUS, 'test_pub_status',
            Keys.PUB_STATUS_DETAIL, 'test_pub_status_detail',
            Keys.PUBLISH_TIME, '2011-10-05T21:48:00.000Z',
            Keys.SIGNATURE, 'test_signature',
            Keys.TITLE, 'test_title',
            Keys.SUBTITLE, 'test_subtitle',
            Keys.EDITION, '2',
            Keys.SERIES_TITLE, 'test_series_title',
            Keys.SERIES_ID, 'test_series_id',
            Keys.SCRAPED_SERIES_TITLE, 'test_scraped_series_title',
            Keys.SCRAPED_IS_ARCHIVED, 'archived',
        ),
        makeMap(),
        'content/dir',
        []);

    expect(book.action).toEqual('test_action');
    expect(book.asin).toEqual('test_asin');
    expect(book.authorFirstName).toEqual('test_author_first_name');
    expect(book.authorLastName).toEqual('test_author_last_name');
    expect(book.category1).toEqual('test_cat1');
    expect(book.category2).toEqual('test_cat2');
    expect(book.newCategory1).toEqual('test_new_cat1');
    expect(book.newCategory2).toEqual('test_new_cat2');
    expect(book.newCategory3).toEqual('test_new_cat3');
    expect(book.coverLocalFile).toEqual('content/dir/test_cover_file');
    expect(book.coverImageUrl).toEqual('test_cover_image_url');
    expect(book.description).toEqual('test_description');
    expect(book.id).toEqual('test_id');
    expect(book.titleId).toEqual('test_title_id');
    expect(book.illustratorFirstName).toEqual('test_illustrator_first_name');
    expect(book.illustratorLastName).toEqual('test_illustrator_last_name');
    expect(book.isbn).toEqual('test_isbn');
    expect(book.keyword0).toEqual('test_keyword0');
    expect(book.keyword1).toEqual('test_keyword1');
    expect(book.keyword2).toEqual('test_keyword2');
    expect(book.keyword3).toEqual('test_keyword3');
    expect(book.keyword4).toEqual('test_keyword4');
    expect(book.keyword5).toEqual('test_keyword5');
    expect(book.keyword6).toEqual('test_keyword6');
    expect(book.language).toEqual('afrikaans');
    expect(book.manuscriptCreationCommand).toEqual('test_manuscript_creation_command');
    expect(book.manuscriptLocalFile).toEqual('content/dir/test_manuscript_file');
    expect(book.notes).toEqual('test_notes');
    expect(book.paperBleed).toEqual('test_paper_bleed');
    expect(book.paperCoverFinish).toEqual('test_paper_cover_finish');
    expect(book.paperColor).toEqual('test_paper_color');
    expect(book.paperTrim).toEqual('test_paper_trim');
    expect(book.priceAu).toEqual(1.1);
    expect(book.priceCa).toEqual(2.1);
    expect(book.priceEur).toEqual(3.1);
    expect(book.priceGbp).toEqual(4.1);
    expect(book.priceJp).toEqual(5.1);
    expect(book.pricePl).toEqual(6.1);
    expect(book.priceSe).toEqual(7.1);
    expect(book.priceUsd).toEqual(8.1);
    expect(book.primaryMarketplace).toEqual('pl');
    expect(book.pubDate).toEqual('test_pub_date');
    expect(book.pubStatus).toEqual('test_pub_status');
    expect(book.pubStatusDetail).toEqual('test_pub_status_detail');
    expect(book.publishTime.toISOString()).toEqual('2011-10-05T21:48:00.000Z');
    expect(book.title).toEqual('test_title');
    expect(book.subtitle).toEqual('test_subtitle');
    expect(book.edition).toEqual('2');
    expect(book.seriesTitle).toEqual('test_series_title');
    expect(book.seriesId).toEqual('test_series_id');
    expect(book.scrapedSeriesTitle).toEqual('test_scraped_series_title');
    expect(book.scrapedIsArchived).toEqual('archived');
    expect(book.signature).toEqual('test_signature');
});

test('create book with defaults', () => {
    const book = new Book(
        makeMap(
            Keys.ACTION, 'test_action',
            Keys.ASIN, 'test_asin',
            Keys.AUTHOR_FIRST_NAME, 'test_author_first_name',
            Keys.AUTHOR_LAST_NAME, 'test_author_last_name',
            Keys.COVER_IMAGE_URL, 'test_cover_image_url',
            Keys.ID, 'test_id',
            Keys.TITLE_ID, 'test_title_id',
            Keys.ISBN, 'test_isbn',
            Keys.PUB_DATE, 'test_pub_date',
            Keys.PUB_STATUS, 'test_pub_status',
            Keys.PUB_STATUS_DETAIL, 'test_pub_status_detail',
            Keys.PUBLISH_TIME, '2011-10-05T21:48:00.000Z',
            Keys.SCRAPED_SERIES_TITLE, 'test_scraped_series_title',
            Keys.SCRAPED_IS_ARCHIVED, 'archived',
        ),
        makeMap(
            Keys.AUTHOR_FIRST_NAME, 'bad bad bad',
            Keys.AUTHOR_LAST_NAME, 'bad bad very bad',
            Keys.CATEGORY1, 'test_cat1',
            Keys.CATEGORY2, 'test_cat2',
            Keys.NEW_CATEGORY1, 'test_new_cat1',
            Keys.NEW_CATEGORY2, 'test_new_cat2',
            Keys.NEW_CATEGORY3, 'test_new_cat3',
            Keys.COVER_FILE, 'test_cover_file',
            Keys.DESCRIPTION, 'test_description',
            Keys.ILLUSTRATOR_FIRST_NAME, 'test_illustrator_first_name',
            Keys.ILLUSTRATOR_LAST_NAME, 'test_illustrator_last_name',
            Keys.KEYWORD0, 'test_keyword0',
            Keys.KEYWORD1, 'test_keyword1',
            Keys.KEYWORD2, 'test_keyword2',
            Keys.KEYWORD3, 'test_keyword3',
            Keys.KEYWORD4, 'test_keyword4',
            Keys.KEYWORD5, 'test_keyword5',
            Keys.KEYWORD6, 'test_keyword6',
            Keys.LANGUAGE, 'afrikaans',
            Keys.MANUSCRIPT_CREATION_COMMAND, 'make book',
            Keys.MANUSCRIPT_FILE, 'test_manuscript_file',
            Keys.NOTES, 'test_notes',
            Keys.PAPER_BLEED, 'test_paper_bleed',
            Keys.PAPER_COLOR, 'test_paper_color',
            Keys.PAPER_COVER_FINISH, 'test_paper_cover_finish',
            Keys.PAPER_TRIM, 'test_paper_trim',
            Keys.PRICE_AU, '1.1',
            Keys.PRICE_CA, '2.1',
            Keys.PRICE_EUR, '3.1',
            Keys.PRICE_GBP, '4.1',
            Keys.PRICE_JP, '5.1',
            Keys.PRICE_PL, '6.1',
            Keys.PRICE_SE, '7.1',
            Keys.PRICE_USD, '8.1',
            Keys.PRIMARY_MARKETPLACE, 'pl',
            Keys.SIGNATURE, 'test_signature',
            Keys.TITLE, 'test_title',
            Keys.SUBTITLE, 'test_subtitle',
            Keys.EDITION, '2'
        ),
        'content/dir',
        []);

    expect(book.action).toEqual('test_action');
    expect(book.asin).toEqual('test_asin');
    expect(book.authorFirstName).toEqual('test_author_first_name');
    expect(book.authorLastName).toEqual('test_author_last_name');
    expect(book.category1).toEqual('test_cat1');
    expect(book.category2).toEqual('test_cat2');
    expect(book.newCategory1).toEqual('test_new_cat1');
    expect(book.newCategory2).toEqual('test_new_cat2');
    expect(book.newCategory3).toEqual('test_new_cat3');
    expect(book.coverLocalFile).toEqual('content/dir/test_cover_file');
    expect(book.coverImageUrl).toEqual('test_cover_image_url');
    expect(book.description).toEqual('test_description');
    expect(book.id).toEqual('test_id');
    expect(book.titleId).toEqual('test_title_id');
    expect(book.illustratorFirstName).toEqual('test_illustrator_first_name');
    expect(book.illustratorLastName).toEqual('test_illustrator_last_name');
    expect(book.isbn).toEqual('test_isbn');
    expect(book.keyword0).toEqual('test_keyword0');
    expect(book.keyword1).toEqual('test_keyword1');
    expect(book.keyword2).toEqual('test_keyword2');
    expect(book.keyword3).toEqual('test_keyword3');
    expect(book.keyword4).toEqual('test_keyword4');
    expect(book.keyword5).toEqual('test_keyword5');
    expect(book.keyword6).toEqual('test_keyword6');
    expect(book.language).toEqual('afrikaans');
    expect(book.manuscriptCreationCommand).toEqual('make book');
    expect(book.manuscriptLocalFile).toEqual('content/dir/test_manuscript_file');
    expect(book.notes).toEqual('test_notes');
    expect(book.paperBleed).toEqual('test_paper_bleed');
    expect(book.paperCoverFinish).toEqual('test_paper_cover_finish');
    expect(book.paperColor).toEqual('test_paper_color');
    expect(book.paperTrim).toEqual('test_paper_trim');
    expect(book.priceAu).toEqual(1.1);
    expect(book.priceCa).toEqual(2.1);
    expect(book.priceEur).toEqual(3.1);
    expect(book.priceGbp).toEqual(4.1);
    expect(book.priceJp).toEqual(5.1);
    expect(book.pricePl).toEqual(6.1);
    expect(book.priceSe).toEqual(7.1);
    expect(book.priceUsd).toEqual(8.1);
    expect(book.primaryMarketplace).toEqual('pl');
    expect(book.pubDate).toEqual('test_pub_date');
    expect(book.pubStatus).toEqual('test_pub_status');
    expect(book.pubStatusDetail).toEqual('test_pub_status_detail');
    expect(book.publishTime.toISOString()).toEqual('2011-10-05T21:48:00.000Z');
    expect(book.title).toEqual('test_title');
    expect(book.subtitle).toEqual('test_subtitle');
    expect(book.edition).toEqual('2');
    expect(book.scrapedSeriesTitle).toEqual('test_scraped_series_title');
    expect(book.scrapedIsArchived).toEqual('archived');
    expect(book.signature).toEqual('test_signature');
});

test('detects missing key', () => {
    const createBookWithMissingAuthor = () =>
        new Book(
            makeMap(
                Keys.ACTION, 'test_action',
                Keys.ASIN, 'test_asin',
                Keys.COVER_IMAGE_URL, 'test_cover_image_url',
                Keys.ID, 'test_id',
                Keys.TITLE_ID, 'test_title_id',
                Keys.ISBN, 'test_isbn',
                Keys.PUB_DATE, 'test_pub_date',
                Keys.PUB_STATUS, 'test_pub_status',
                Keys.PUB_STATUS_DETAIL, 'test_pub_status_detail',
                Keys.PUBLISH_TIME, '2011-10-05T21:48:00.000Z',
                Keys.SCRAPED_SERIES_TITLE, 'test_scraped_series_title',
                Keys.SCRAPED_IS_ARCHIVED, 'archived',
            ),
            makeMap(
                Keys.CATEGORY1, 'test_cat1',
                Keys.CATEGORY2, 'test_cat2',
                Keys.NEW_CATEGORY1, 'test_new_cat1',
                Keys.NEW_CATEGORY2, 'test_new_cat2',
                Keys.NEW_CATEGORY3, 'test_new_cat3',
                Keys.COVER_FILE, 'test_cover_file',
                Keys.DESCRIPTION, 'test_description',
                Keys.ILLUSTRATOR_FIRST_NAME, 'test_illustrator_first_name',
                Keys.ILLUSTRATOR_LAST_NAME, 'test_illustrator_last_name',
                Keys.KEYWORD0, 'test_keyword0',
                Keys.KEYWORD1, 'test_keyword1',
                Keys.KEYWORD2, 'test_keyword2',
                Keys.KEYWORD3, 'test_keyword3',
                Keys.KEYWORD4, 'test_keyword4',
                Keys.KEYWORD5, 'test_keyword5',
                Keys.KEYWORD6, 'test_keyword6',
                Keys.LANGUAGE, 'afrikaans',
                Keys.MANUSCRIPT_FILE, 'test_manuscript_file',
                Keys.NOTES, 'test_notes',
                Keys.PAPER_BLEED, 'test_paper_bleed',
                Keys.PAPER_COLOR, 'test_paper_color',
                Keys.PAPER_COVER_FINISH, 'test_paper_cover_finish',
                Keys.PAPER_TRIM, 'test_paper_trim',
                Keys.PRICE_AU, '1.1',
                Keys.PRICE_CA, '2.1',
                Keys.PRICE_EUR, '3.1',
                Keys.PRICE_GBP, '4.1',
                Keys.PRICE_JP, '5.1',
                Keys.PRICE_PL, '6.1',
                Keys.PRICE_SE, '7.1',
                Keys.PRICE_USD, '8.1',
                Keys.PRIMARY_MARKETPLACE, 'pl',
                Keys.SIGNATURE, 'test_signature',
                Keys.TITLE, 'test_title',
                Keys.SUBTITLE, 'test_subtitle'
            ),
            'content/dir',
            []);
    expect(() => createBookWithMissingAuthor()).toThrow(/not found.*author/);
});

test('create book with resolution', () => {
    const book = new Book(
        makeMap(
            Keys.ACTION, '${prefix}action',
            Keys.ASIN, '${prefix}asin',
            Keys.AUTHOR_FIRST_NAME, '${prefix}author_first_name',
            Keys.AUTHOR_LAST_NAME, '${prefix}author_last_name',
            Keys.COVER_IMAGE_URL, '${prefix}cover_image_url',
            Keys.ID, '${prefix}id',
            Keys.TITLE_ID, 'test_title_id',
            Keys.EDITION, '2',
            Keys.ILLUSTRATOR_FIRST_NAME, '${prefix}illustrator_first_name',
            Keys.ILLUSTRATOR_LAST_NAME, '${prefix}illustrator_last_name',
            Keys.MANUSCRIPT_CREATION_COMMAND, 'make ${title}',
            Keys.ISBN, '${prefix}isbn',
            Keys.PUB_DATE, '${prefix}pub_date',
            Keys.PUB_STATUS, '${prefix}pub_status',
            Keys.PUB_STATUS_DETAIL, '${prefix}pub_status_detail',
            Keys.PUBLISH_TIME, '2011-10-05T21:48:00.000Z',
            Keys.SCRAPED_SERIES_TITLE, 'test_scraped_series_title',
            Keys.SCRAPED_IS_ARCHIVED, 'archived',
        ),
        makeMap(
            'prefix', "test_",
            'price', "2.17",
            Keys.CATEGORY1, '${prefix}cat1',
            Keys.CATEGORY2, '${prefix}cat2',
            Keys.NEW_CATEGORY1, 'test_new_cat1',
            Keys.NEW_CATEGORY2, 'test_new_cat2',
            Keys.NEW_CATEGORY3, 'test_new_cat3',
            Keys.COVER_FILE, '${prefix}cover_file',
            Keys.DESCRIPTION, '${prefix}description',
            Keys.KEYWORD0, '${prefix}keyword0',
            Keys.KEYWORD1, '${prefix}keyword1',
            Keys.KEYWORD2, '${prefix}keyword2',
            Keys.KEYWORD3, '${prefix}keyword3',
            Keys.KEYWORD4, '${prefix}keyword4',
            Keys.KEYWORD5, '${prefix}keyword5',
            Keys.KEYWORD6, '${prefix}keyword6',
            Keys.LANGUAGE, 'afrikaans',
            Keys.MANUSCRIPT_FILE, '${prefix}manuscript_file',
            Keys.NOTES, '${prefix}notes',
            Keys.PAPER_BLEED, '${prefix}paper_bleed',
            Keys.PAPER_COLOR, '${prefix}paper_color',
            Keys.PAPER_COVER_FINISH, '${prefix}paper_cover_finish',
            Keys.PAPER_TRIM, '${prefix}paper_trim',
            Keys.PRICE_AU, '${price}',
            Keys.PRICE_CA, '${price}',
            Keys.PRICE_EUR, '${price}',
            Keys.PRICE_GBP, '${price}',
            Keys.PRICE_JP, '${price}',
            Keys.PRICE_PL, '${price}',
            Keys.PRICE_SE, '${price}',
            Keys.PRICE_USD, '${price}',
            Keys.PRIMARY_MARKETPLACE, 'de',
            Keys.SIGNATURE, '${prefix}signature',
            Keys.TITLE, '${prefix}title',
            Keys.SUBTITLE, '${prefix}subtitle',
        ),
        'content/dir',
        []);

    expect(book.action).toEqual('test_action');
    expect(book.asin).toEqual('test_asin');
    expect(book.authorFirstName).toEqual('test_author_first_name');
    expect(book.authorLastName).toEqual('test_author_last_name');
    expect(book.category1).toEqual('test_cat1');
    expect(book.category2).toEqual('test_cat2');
    expect(book.newCategory1).toEqual('test_new_cat1');
    expect(book.newCategory2).toEqual('test_new_cat2');
    expect(book.newCategory3).toEqual('test_new_cat3');
    expect(book.coverLocalFile).toEqual('content/dir/test_cover_file');
    expect(book.coverImageUrl).toEqual('test_cover_image_url');
    expect(book.description).toEqual('test_description');
    expect(book.id).toEqual('test_id');
    expect(book.illustratorFirstName).toEqual('test_illustrator_first_name');
    expect(book.illustratorLastName).toEqual('test_illustrator_last_name');
    expect(book.isbn).toEqual('test_isbn');
    expect(book.keyword0).toEqual('test_keyword0');
    expect(book.keyword1).toEqual('test_keyword1');
    expect(book.keyword2).toEqual('test_keyword2');
    expect(book.keyword3).toEqual('test_keyword3');
    expect(book.keyword4).toEqual('test_keyword4');
    expect(book.keyword5).toEqual('test_keyword5');
    expect(book.keyword6).toEqual('test_keyword6');
    expect(book.language).toEqual('afrikaans');
    expect(book.manuscriptCreationCommand).toEqual('make test_title');
    expect(book.manuscriptLocalFile).toEqual('content/dir/test_manuscript_file');
    expect(book.notes).toEqual('test_notes');
    expect(book.paperBleed).toEqual('test_paper_bleed');
    expect(book.paperCoverFinish).toEqual('test_paper_cover_finish');
    expect(book.paperColor).toEqual('test_paper_color');
    expect(book.paperTrim).toEqual('test_paper_trim');
    expect(book.priceAu).toEqual(2.17);
    expect(book.priceCa).toEqual(2.17);
    expect(book.priceEur).toEqual(2.17);
    expect(book.priceGbp).toEqual(2.17);
    expect(book.priceJp).toEqual(2.17);
    expect(book.pricePl).toEqual(2.17);
    expect(book.priceSe).toEqual(2.17);
    expect(book.priceUsd).toEqual(2.17);
    expect(book.primaryMarketplace).toEqual('de');
    expect(book.pubDate).toEqual('test_pub_date');
    expect(book.pubStatus).toEqual('test_pub_status');
    expect(book.pubStatusDetail).toEqual('test_pub_status_detail');
    expect(book.publishTime.toISOString()).toEqual('2011-10-05T21:48:00.000Z');
    expect(book.title).toEqual('test_title');
    expect(book.subtitle).toEqual('test_subtitle');
    expect(book.edition).toEqual('2');
    expect(book.scrapedSeriesTitle).toEqual('test_scraped_series_title');
    expect(book.scrapedIsArchived).toEqual('archived');
    expect(book.signature).toEqual('test_signature');
});

test('detects bad resolution', () => {
    const createBookWithDefaultId = () =>
        new Book(
            makeMap(),
            makeMap(
                'x', "${y}",
                'y', '${x}',
                Keys.ID, 'test_id',
            ),
            'content/dir',
            []);
    expect(() => createBookWithDefaultId()).toThrow('Cannot have default for key: id');
});

test('detects bad resolution', () => {
    const createBookWithDefaultId = () =>
        new Book(
            makeMap('xyz', '${nonexistent_var}',),
            makeMap(),
            'content/dir',
            []);
    expect(() => createBookWithDefaultId()).toThrow(/Could not resolve keys:.*xyz/);
});


function createFullyLiveBook(): Book {
    return makeOkTestBook({
        pubStatus: 'LIVE',
        pubStatusDetail: '',
        scrapedIsArchived: '',
        scrapedSeriesTitle: 'ok',
    });
}

test('isFullyLive', () => {
    {
        let fullyLiveBook = createFullyLiveBook();
        expect(fullyLiveBook.isFullyLive()).toEqual(true);
    }
    {
        const book = createFullyLiveBook();
        book.pubStatus = 'DRAFT';
        expect(book.isFullyLive()).toEqual(false);
    }
    {
        const book = createFullyLiveBook();
        book.pubStatusDetail = 'Updates pending';
        expect(book.isFullyLive()).toEqual(false);
    }
    {
        const book = createFullyLiveBook();
        book.scrapedIsArchived = 'archived';
        expect(book.isFullyLive()).toEqual(false);
    }
    {
        const book = createFullyLiveBook();
        book.scrapedSeriesTitle = 'mismatched';
        expect(book.isFullyLive()).toEqual(false);
    }
});

test('canBeCreated', () => {
    // Set empty author
    expect(makeOkTestBook({ authorFirstName: '' }).canBeCreated()).toEqual(false);
    expect(makeOkTestBook({ authorLastName: '' }).canBeCreated()).toEqual(false);
});

test('canRewriteAction', () => {
    expect(makeOkTestBook({ action: 'blah' }).action).toEqual('blah');
    expect(makeOkTestBook({ action: 'all' }).action).toMatch(/metadata.*content.*publish/); // Just a minimal check.
    expect(makeOkTestBook({ action: 'all-but-no-publish' }).action).toMatch(/metadata.*content/); // Just a minimal check.
});

test('can handle first action', () => {
    {
        const book = makeOkTestBook({ action: 'a1:a2:a3' });
        expect(book.hasAction()).toEqual(true);
        expect(book.getFirstAction()).toEqual('a1');
        expect(book.popFirstAction()).toEqual('a1');
        expect(book.action).toEqual('a2:a3');
    }
    {
        const book = makeOkTestBook({ action: 'a1:a2' });
        expect(book.hasAction()).toEqual(true);
        expect(book.getFirstAction()).toEqual('a1');
        expect(book.popFirstAction()).toEqual('a1');
        expect(book.action).toEqual('a2');
    }
    {
        const book = makeOkTestBook({ action: 'a1' });
        expect(book.hasAction()).toEqual(true);
        expect(book.getFirstAction()).toEqual('a1');
        expect(book.popFirstAction()).toEqual('a1');
        expect(book.action).toEqual('');
    }
    {
        const book = makeOkTestBook({ action: '' });
        expect(book.hasAction()).toEqual(false);
        expect(book.getFirstAction()).toEqual('');
        expect(book.popFirstAction()).toEqual('');
        expect(book.action).toEqual('');
    }
})

test('getPriceForMarketplace', () => {
    let book = makeOkTestBook({
        priceAu: '1.1',
        priceCa: '2.1',
        priceEur: '3.1',
        priceGbp: '4.1',
        priceJp: '5.1',
        pricePl: '6.1',
        priceSe: '7.1',
        priceUsd: '8.1',
    });
    expect(book.getPriceForMarketplace("au")).toBe(1.1);
    expect(book.getPriceForMarketplace("ca")).toBe(2.1);
    expect(book.getPriceForMarketplace("uk")).toBe(4.1);
    expect(book.getPriceForMarketplace("jp")).toBe(5.1);
    expect(book.getPriceForMarketplace("pl")).toBe(6.1);
    expect(book.getPriceForMarketplace("se")).toBe(7.1);
    expect(book.getPriceForMarketplace("us")).toBe(8.1);

    expect(book.getPriceForMarketplace("de")).toBe(3.1);
    expect(book.getPriceForMarketplace("fr")).toBe(3.1);
    expect(book.getPriceForMarketplace("es")).toBe(3.1);
    expect(book.getPriceForMarketplace("it")).toBe(3.1);
    expect(book.getPriceForMarketplace("nl")).toBe(3.1);

    expect(() => book.getPriceForMarketplace("nonexistent")).toThrow(/unrecognized marketplace/i);
})

test('hasOldCategoried', () => {
    {
        // Old categories ok.
        const book = makeOkTestBook({ category1: 'a', category2: 'b', newCategory1: '', newCategory2: '', newCategory3: '' });
        expect(book.hasOldCategories()).toBe(true);
        expect(book.hasNewCategories()).toBe(false);
        expect(book.canBeCreated()).toBe(true);
    }
    {
        // Old categories missing.
        const book = makeOkTestBook({ category1: 'a', category2: '', newCategory1: '', newCategory2: '', newCategory3: '' });
        expect(book.hasOldCategories()).toBe(false);
        expect(book.hasNewCategories()).toBe(false);
        expect(book.canBeCreated()).toBe(false);
    }
    {
        // new categories ok.
        const book = makeOkTestBook({ newCategory1: 'a', newCategory2: 'b', newCategory3: 'c', category1: '', category2: '' });
        expect(book.hasOldCategories()).toBe(false);
        expect(book.hasNewCategories()).toBe(true);
        expect(book.canBeCreated()).toBe(true);
    }
    {
        // new categories missing.
        const book = makeOkTestBook({ newCategory1: 'a', newCategory2: '', newCategory3: 'c', category1: '', category2: '' });
        expect(book.hasOldCategories()).toBe(false);
        expect(book.hasNewCategories()).toBe(false);
        expect(book.canBeCreated()).toBe(false);
    } {
        // both old and new categories ok.
        const book = makeOkTestBook({ newCategory1: 'a', newCategory2: 'b', newCategory3: 'c', category1: 'd', category2: 'e' });
        expect(book.hasOldCategories()).toBe(true);
        expect(book.hasNewCategories()).toBe(true);
        expect(book.canBeCreated()).toBe(true);
    }
})

test('getDataToWrite', () => {
    const book = makeOkTestBook({
        action: 'my-action'
    });
    expect(book.getDataToWrite()).toEqual({
        "action": "my-action",
        "asin": "test_asin",
        "authorFirstName": "test_author_first_name",
        "authorLastName": "test_author_last_name",
        "category1": "test_cat1",
        "category2": "test_cat2",
        "newCategory1": "test_new_cat1",
        "newCategory2": "test_new_cat2",
        "newCategory3": "test_new_cat3",
        "coverImageUrl": "test_cover_image_url",
        "coverLocalFile": "test_cover_file",
        "description": "test_description",
        "edition": "2",
        "id": "test_id",
        "titleId": "test_title_id",
        "illustratorFirstName": "test_illustrator_first_name",
        "illustratorLastName": "test_illustrator_last_name",
        "isbn": "test_isbn",
        "keyword0": "test_keyword0",
        "keyword1": "test_keyword1",
        "keyword2": "test_keyword2",
        "keyword3": "test_keyword3",
        "keyword4": "test_keyword4",
        "keyword5": "test_keyword5",
        "keyword6": "test_keyword6",
        "language": "afrikaans",
        "manuscriptCreationCommand": "test_manuscript_creation_command",
        "manuscriptLocalFile": "test_manuscript_file",
        "notes": "test_notes",
        "paperBleed": "no",
        "paperColor": "premium-color",
        "paperCoverFinish": "glossy",
        "paperTrim": "6x9",
        "priceAu": "1.1",
        "priceCa": "2.1",
        "priceEur": "3.1",
        "priceGbp": "4.1",
        "priceJp": "5.1",
        "pricePl": "6.1",
        "priceSe": "7.1",
        "priceUsd": "8.1",
        "primaryMarketplace": "pl",
        "pubDate": "test_pub_date",
        "pubStatus": "test_pub_status",
        "pubStatusDetail": "test_pub_status_detail",
        "publishTime": "Wed Oct 05 2011 14:48:00 GMT-0700 (Pacific Daylight Time)",
        "scrapedIsArchived": "archived",
        "scrapedSeriesTitle": "test_scraped_series_title",
        "seriesTitle": "test_series_title",
        "seriesId": "test_series_id",
        "signature": "test_signature",
        "subtitle": "test_subtitle",
        "title": "test_title",
    });
});

test('toString', () => {
    const book = makeOkTestBook({
        action: 'my-action'
    });
    expect(book.toString().replaceAll(" ", "")).toEqual(
        `action = my-action
       signature = test_signature
       notes = test_notes
       authorFirstName = test_author_first_name
       authorLastName = test_author_last_name
       description = test_description
       illustratorFirstName = test_illustrator_first_name
       illustratorLastName = test_illustrator_last_name
       keyword0 = test_keyword0
       keyword1 = test_keyword1
       keyword2 = test_keyword2
       keyword3 = test_keyword3
       keyword4 = test_keyword4
       keyword5 = test_keyword5
       keyword6 = test_keyword6
       language = afrikaans
       seriesTitle = test_series_title
       seriesId = test_series_id
       scrapedSeriesTitle = test_scraped_series_title
       subtitle = test_subtitle
       edition = 2 
       title = test_title
       priceAu = 1.1
       priceCa = 2.1
       priceEur = 3.1
       priceGbp = 4.1
       priceJp = 5.1
       pricePl = 6.1
       priceSe = 7.1
       priceUsd = 8.1
       primaryMarketplace = pl 
       isbn = test_isbn
       paperColor = premium-color
       paperTrim = 6x9
       paperBleed = no
       paperCoverFinish = glossy
       category1 = test_cat1
       category2 = test_cat2
       newCategory1 = test_new_cat1
       newCategory2 = test_new_cat2
       newCategory3 = test_new_cat3
       coverLocalFile = content/dir/test_cover_file
       manuscriptCreationCommand = test_manuscript_creation_command
       manuscriptLocalFile = content/dir/test_manuscript_file
       asin = test_asin
       id = test_id
       titleId = test_title_id
       coverImageUrl = test_cover_image_url
       pubDate = test_pub_date
       pubStatus = test_pub_status
       pubStatusDetail = test_pub_status_detail
       publishTime = Wed Oct 05 2011 14:48:00 GMT-0700 (Pacific Daylight Time)
       scrapedIsArchived = archived
`.replaceAll(" ", ""));
});

test('badMarketplace', () => {
    expect(() => makeOkTestBook({ primaryMarketplace: 'BAD_MARKETPLACE' })).toThrow(/Unrecognized primary marketplace/);
});

test('badEdition', () => {
    expect(() => makeOkTestBook({ edition: 'notanumber' })).toThrow(/Edition must/);
    expect(() => makeOkTestBook({ edition: '-1' })).toThrow(/Edition must/);
    expect(() => makeOkTestBook({ edition: '0' })).toThrow(/Edition must/);
});

test('create book in japanese', () => {
    const book = new Book(
        makeMap(
            Keys.ACTION, 'test_action',
            Keys.ASIN, 'test_asin',
            Keys.AUTHOR_WHOLE, 'test_author_whole',
            Keys.AUTHOR_WHOLE_PRONUNCIATION, 'test_author_whole_pronunciation',
            Keys.COVER_FILE, 'test_cover_file',
            Keys.COVER_IMAGE_URL, 'test_cover_image_url',
            Keys.DESCRIPTION, 'test_description',
            Keys.ID, 'test_id',
            Keys.ILLUSTRATOR_WHOLE, 'test_illustrator_whole',
            Keys.ILLUSTRATOR_WHOLE_PRONUNCIATION, 'test_illustrator_whole_pronunciation',
            Keys.ISBN, 'test_isbn',
            Keys.LANGUAGE, 'japanese',
            Keys.MANUSCRIPT_CREATION_COMMAND, 'test_manuscript_creation_command',
            Keys.MANUSCRIPT_FILE, 'test_manuscript_file',
            Keys.NEW_CATEGORY1, 'test_new_cat1',
            Keys.NEW_CATEGORY2, 'test_new_cat2',
            Keys.NEW_CATEGORY3, 'test_new_cat3',
            Keys.NOTES, 'test_notes',
            Keys.PAPER_BLEED, 'test_paper_bleed',
            Keys.PAPER_COLOR, 'test_paper_color',
            Keys.PAPER_COVER_FINISH, 'test_paper_cover_finish',
            Keys.PAPER_TRIM, 'test_paper_trim',
            Keys.PRICE_AU, '1.1',
            Keys.PRICE_CA, '2.1',
            Keys.PRICE_EUR, '3.1',
            Keys.PRICE_GBP, '4.1',
            Keys.PRICE_JP, '5.1',
            Keys.PRICE_PL, '6.1',
            Keys.PRICE_SE, '7.1',
            Keys.PRICE_USD, '8.1',
            Keys.PRIMARY_MARKETPLACE, 'jp',
            Keys.PUBLISH_TIME, '2011-10-05T21:48:00.000Z',
            Keys.PUB_DATE, 'test_pub_date',
            Keys.PUB_STATUS, 'test_pub_status',
            Keys.PUB_STATUS_DETAIL, 'test_pub_status_detail',
            Keys.SCRAPED_IS_ARCHIVED, '',
            Keys.SCRAPED_SERIES_TITLE, 'test_scraped_series_title',
            Keys.SIGNATURE, 'test_signature',
            Keys.SUBTITLE, 'test_subtitle',
            Keys.SUBTITLE_PRONUNCIATION, 'test_subtitle_pronunciation',
            Keys.TITLE, 'test_title',
            Keys.TITLE_ID, 'test_id',
            Keys.TITLE_PRONUNCIATION, 'test_title_pronunciation',
            Keys.AUTHOR_FIRST_NAME, 'test_author_first_name',
            Keys.AUTHOR_LAST_NAME, 'test_author_last_name',
            Keys.ILLUSTRATOR_FIRST_NAME, 'test_illustrator_first_name',
            Keys.ILLUSTRATOR_LAST_NAME, 'test_illustrator_last_name',
        ),
        makeMap(),
        'content/dir',
        []);

    expect(book.language).toEqual('japanese');
    expect(book.primaryMarketplace).toEqual('jp');

    expect(book.title).toEqual('test_title');
    expect(book.titlePronunciation).toEqual('test_title_pronunciation');

    expect(book.subtitle).toEqual('test_subtitle');
    expect(book.subtitlePronunciation).toEqual('test_subtitle_pronunciation');

    expect(book.authorWhole).toEqual('test_author_whole');
    expect(book.authorWholePronunciation).toEqual('test_author_whole_pronunciation');

    expect(book.illustratorWhole).toEqual('test_illustrator_whole');
    expect(book.illustratorWholePronunciation).toEqual('test_illustrator_whole_pronunciation');
});
