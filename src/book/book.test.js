import { Keys } from './keys';
import { Book } from './book';
import { makeOkTestBook, makeMap } from '../util/test-utils';

test('create book without defaults', () => {
    let book = new Book(
        makeMap(
            Keys.ACTION, 'test_action',
            Keys.ASIN, 'test_asin',
            Keys.AUTHOR_FIRST_NAME, 'test_author_first_name',
            Keys.AUTHOR_LAST_NAME, 'test_author_last_name',
            Keys.CATEGORY1, 'test_cat1',
            Keys.CATEGORY2, 'test_cat2',
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
            Keys.LANGUAGE, 'test_language',
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
            Keys.PRIMARY_MARKETPLACE, 'Amazon.pl',
            Keys.PUB_DATE, 'test_pub_date',
            Keys.PUB_STATUS, 'test_pub_status',
            Keys.PUB_STATUS_DETAIL, 'test_pub_status_detail',
            Keys.SIGNATURE, 'test_signature',
            Keys.TITLE, 'test_title',
            Keys.SUBTITLE, 'test_subtitle',
            Keys.SERIES_TITLE, 'test_series_title',
            Keys.SCRAPED_SERIES_TITLE, 'test_scraped_series_title',
            Keys.WAS_EVER_PUBLISHED, 'false',
        ),
        makeMap(),
        'content/dir');

    expect(book.action).toEqual('test_action');
    expect(book.asin).toEqual('test_asin');
    expect(book.authorFirstName).toEqual('test_author_first_name');
    expect(book.authorLastName).toEqual('test_author_last_name');
    expect(book.category1).toEqual('test_cat1');
    expect(book.category2).toEqual('test_cat2');
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
    expect(book.language).toEqual('test_language');
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
    expect(book.primaryMarketplace).toEqual('Amazon.pl');
    expect(book.pubDate).toEqual('test_pub_date');
    expect(book.pubStatus).toEqual('test_pub_status');
    expect(book.pubStatusDetail).toEqual('test_pub_status_detail');
    expect(book.title).toEqual('test_title');
    expect(book.subtitle).toEqual('test_subtitle');
    expect(book.seriesTitle).toEqual('test_series_title');
    expect(book.scrapedSeriesTitle).toEqual('test_scraped_series_title');
    expect(book.wasEverPublished).toEqual(false);
    expect(book.signature).toEqual('test_signature');
});

test('create book with defaults', () => {
    let book = new Book(
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
            Keys.WAS_EVER_PUBLISHED, 'false',
        ),
        makeMap(
            Keys.AUTHOR_FIRST_NAME, 'bad bad bad',
            Keys.AUTHOR_LAST_NAME, 'bad bad very bad',
            Keys.CATEGORY1, 'test_cat1',
            Keys.CATEGORY2, 'test_cat2',
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
            Keys.LANGUAGE, 'test_language',
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
            Keys.PRIMARY_MARKETPLACE, 'Amazon.pl',
            Keys.SIGNATURE, 'test_signature',
            Keys.TITLE, 'test_title',
            Keys.SUBTITLE, 'test_subtitle',
            Keys.SERIES_TITLE, 'test_series_title',
            Keys.SCRAPED_SERIES_TITLE, 'test_scraped_series_title',
        ),
        'content/dir');

    expect(book.action).toEqual('test_action');
    expect(book.asin).toEqual('test_asin');
    expect(book.authorFirstName).toEqual('test_author_first_name');
    expect(book.authorLastName).toEqual('test_author_last_name');
    expect(book.category1).toEqual('test_cat1');
    expect(book.category2).toEqual('test_cat2');
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
    expect(book.language).toEqual('test_language');
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
    expect(book.primaryMarketplace).toEqual('Amazon.pl');
    expect(book.pubDate).toEqual('test_pub_date');
    expect(book.pubStatus).toEqual('test_pub_status');
    expect(book.pubStatusDetail).toEqual('test_pub_status_detail');
    expect(book.title).toEqual('test_title');
    expect(book.subtitle).toEqual('test_subtitle');
    expect(book.scrapedSeriesTitle).toEqual('test_scraped_series_title');
    expect(book.wasEverPublished).toEqual(false);
    expect(book.signature).toEqual('test_signature');
});

test('detects missing key', () => {
    createBookWithMissingAuthor = () =>
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
                Keys.WAS_EVER_PUBLISHED, 'false',
            ),
            makeMap(
                Keys.CATEGORY1, 'test_cat1',
                Keys.CATEGORY2, 'test_cat2',
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
                Keys.LANGUAGE, 'test_language',
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
                Keys.PRIMARY_MARKETPLACE, 'test_marketplace',
                Keys.SIGNATURE, 'test_signature',
                Keys.TITLE, 'test_title',
                Keys.SUBTITLE, 'test_subtitle',
                Keys.SERIES_TITLE, 'test_series_title',
                Keys.SCRAPED_SERIES_TITLE, 'test_scraped_series_title',
            ),
            'content/dir');
    expect(() => createBookWithMissingAuthor()).toThrow(/not found.*author/);
});

test('create book with resolution', () => {
    let book = new Book(
        makeMap(
            Keys.ACTION, '${prefix}action',
            Keys.ASIN, '${prefix}asin',
            Keys.AUTHOR_FIRST_NAME, '${prefix}author_first_name',
            Keys.AUTHOR_LAST_NAME, '${prefix}author_last_name',
            Keys.COVER_IMAGE_URL, '${prefix}cover_image_url',
            Keys.ID, '${prefix}id',
            Keys.TITLE_ID, 'test_title_id',
            Keys.ILLUSTRATOR_FIRST_NAME, '${prefix}illustrator_first_name',
            Keys.ILLUSTRATOR_LAST_NAME, '${prefix}illustrator_last_name',
            Keys.MANUSCRIPT_CREATION_COMMAND, 'make ${title}',
            Keys.ISBN, '${prefix}isbn',
            Keys.PUB_DATE, '${prefix}pub_date',
            Keys.PUB_STATUS, '${prefix}pub_status',
            Keys.PUB_STATUS_DETAIL, '${prefix}pub_status_detail',
            Keys.WAS_EVER_PUBLISHED, 'false',
        ),
        makeMap(
            'prefix', "test_",
            'price', "2.17",
            Keys.CATEGORY1, '${prefix}cat1',
            Keys.CATEGORY2, '${prefix}cat2',
            Keys.COVER_FILE, '${prefix}cover_file',
            Keys.DESCRIPTION, '${prefix}description',
            Keys.KEYWORD0, '${prefix}keyword0',
            Keys.KEYWORD1, '${prefix}keyword1',
            Keys.KEYWORD2, '${prefix}keyword2',
            Keys.KEYWORD3, '${prefix}keyword3',
            Keys.KEYWORD4, '${prefix}keyword4',
            Keys.KEYWORD5, '${prefix}keyword5',
            Keys.KEYWORD6, '${prefix}keyword6',
            Keys.LANGUAGE, '${prefix}language',
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
            Keys.PRIMARY_MARKETPLACE, '${prefix}marketplace',
            Keys.SIGNATURE, '${prefix}signature',
            Keys.TITLE, '${prefix}title',
            Keys.SUBTITLE, '${prefix}subtitle',
            Keys.SERIES_TITLE, '${prefix}series_title',
            Keys.SCRAPED_SERIES_TITLE, 'test_scraped_series_title',
        ),
        'content/dir');

    expect(book.action).toEqual('test_action');
    expect(book.asin).toEqual('test_asin');
    expect(book.authorFirstName).toEqual('test_author_first_name');
    expect(book.authorLastName).toEqual('test_author_last_name');
    expect(book.category1).toEqual('test_cat1');
    expect(book.category2).toEqual('test_cat2');
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
    expect(book.language).toEqual('test_language');
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
    expect(book.primaryMarketplace).toEqual('test_marketplace');
    expect(book.pubDate).toEqual('test_pub_date');
    expect(book.pubStatus).toEqual('test_pub_status');
    expect(book.pubStatusDetail).toEqual('test_pub_status_detail');
    expect(book.title).toEqual('test_title');
    expect(book.subtitle).toEqual('test_subtitle');
    expect(book.seriesTitle).toEqual('test_series_title');
    expect(book.scrapedSeriesTitle).toEqual('test_scraped_series_title');
    expect(book.wasEverPublished).toEqual(false);
    expect(book.signature).toEqual('test_signature');
});

test('detects bad resolution', () => {
    createBookWithDefaultId = () =>
        new Book(
            makeMap(
            ),
            makeMap(
                'x', "${y}",
                'y', '${x}',
                Keys.ID, 'test_id',
            ),
            'content/dir');
    expect(() => createBookWithDefaultId()).toThrow('Cannot have default for key: id');
});

test('detects bad resolution', () => {
    createBookWithDefaultId = () =>
        new Book(
            makeMap(
                'xyz', '${nonexistent_var}',
            ),
            makeMap(
            ),
            'content/dir');
    expect(() => createBookWithDefaultId()).toThrow(/Could not resolve keys:.*xyz/);
});


test('isFullyLive', () => {
    let book = makeOkTestBook();
    book.wasEverPublished = true;
    book.pubStatus = 'Publishing';

    expect(book.isFullyLive()).toEqual(false);

    book.pubStatus = 'LIVE';
    book.pubStatusDetail = 'some updates pending';

    expect(book.isFullyLive()).toEqual(false);

    book.pubStatusDetail = '';

    expect(book.isFullyLive()).toEqual(false);

    book.scrapedSeriesTitle = 'ok';

    expect(book.isFullyLive()).toEqual(true);
});

test('canBeCreated', () => {
    let book = makeOkTestBook();

    book.authorLastName = '';
    expect(book.canBeCreated()).toEqual(false);

    book.authorLastName = 'Smith';
    expect(book.canBeCreated()).toEqual(true);
});

test('canRewriteAction', () => {
    expect(makeOkTestBook('blah').action).toEqual('blah');
    expect(makeOkTestBook('all').action).toMatch(/metadata.*content.*publish/);
    expect(makeOkTestBook('update-published-book').action).toMatch(/metadata.*pricing.*publish/);
});

test('can handle first action', () => {
    {
        let book = makeOkTestBook('a1:a2:a3');
        expect(book.hasAction()).toEqual(true);
        expect(book.getFirstAction()).toEqual('a1');
        expect(book.popFirstAction()).toEqual('a1');
        expect(book.action).toEqual('a2:a3');
    }
    {
        let book = makeOkTestBook('a1:a2');
        expect(book.hasAction()).toEqual(true);
        expect(book.getFirstAction()).toEqual('a1');
        expect(book.popFirstAction()).toEqual('a1');
        expect(book.action).toEqual('a2');
    }
    {
        let book = makeOkTestBook('a1');
        expect(book.hasAction()).toEqual(true);
        expect(book.getFirstAction()).toEqual('a1');
        expect(book.popFirstAction()).toEqual('a1');
        expect(book.action).toEqual('');
    }
    {
        let book = makeOkTestBook('');
        expect(book.hasAction()).toEqual(false);
        expect(book.getFirstAction()).toEqual('');
        expect(book.popFirstAction()).toEqual('');
        expect(book.action).toEqual('');
    }
})

test('getDataToWrite', () => {
    const book = makeOkTestBook('my-action');
    expect(book.getDataToWrite()).toEqual({
        "action": "my-action",
        "asin": "test_asin",
        "authorFirstName": "test_author_first_name",
        "authorLastName": "test_author_last_name",
        "category1": "test_cat1",
        "category2": "test_cat2",
        "coverImageUrl": "test_cover_image_url",
        "coverLocalFile": "test_cover_file",
        "description": "test_description",
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
        "language": "test_language",
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
        "primaryMarketplace": "test_marketplace",
        "pubDate": "test_pub_date",
        "pubStatus": "test_pub_status",
        "pubStatusDetail": "test_pub_status_detail",
        "scrapedSeriesTitle": "test_scraped_series_title",
        "seriesTitle": "test_series_title",
        "signature": "test_signature",
        "subtitle": "test_subtitle",
        "title": "test_title",
        "wasEverPublished": false,
    });
});

test('toString', () => {
    const book = makeOkTestBook('my-action');
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
       language = test_language
       seriesTitle = test_series_title
       scrapedSeriesTitle = test_scraped_series_title
       subtitle = test_subtitle
       title = test_title
       priceAu = 1.1
       priceCa = 2.1
       priceEur = 3.1
       priceGbp = 4.1
       priceJp = 5.1
       pricePl = 6.1
       priceSe = 7.1
       priceUsd = 8.1
       primaryMarketplace = test_marketplace
       isbn = test_isbn
       paperColor = premium-color
       paperTrim = 6x9
       paperBleed = no
       paperCoverFinish = glossy
       category1 = test_cat1
       category2 = test_cat2
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
       wasEverPublished = false
`.replaceAll(" ", ""));
});
