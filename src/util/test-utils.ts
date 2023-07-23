import { Book } from '../book/book.js';
import { Keys } from '../book/keys.js';

export function makeOkTestBook(
        action = 'test_action',
        authorFirstName = 'test_author_first_name',
        authorLastName = 'test_author_last_name',
        primaryMarketplace = 'pl',
        edition = '2') {
    return new Book(
        makeMap(
            Keys.ACTION, action,
            Keys.ASIN, 'test_asin',
            Keys.AUTHOR_FIRST_NAME, authorFirstName,
            Keys.AUTHOR_LAST_NAME, authorLastName,
            Keys.CATEGORY1, 'test_cat1',
            Keys.CATEGORY2, 'test_cat2',
            Keys.NEW_CATEGORY1, 'test_new_cat1',
            Keys.NEW_CATEGORY2, 'test_new_cat2',
            Keys.NEW_CATEGORY3, 'test_new_cat3',
            Keys.COVER_FILE, 'test_cover_file',
            Keys.COVER_IMAGE_URL, 'test_cover_image_url',
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
            Keys.PAPER_BLEED, 'no',
            Keys.PAPER_COLOR, 'premium-color',
            Keys.PAPER_COVER_FINISH, 'glossy',
            Keys.PAPER_TRIM, '6x9',
            Keys.PRICE_AU, '1.1',
            Keys.PRICE_CA, '2.1',
            Keys.PRICE_EUR, '3.1',
            Keys.PRICE_GBP, '4.1',
            Keys.PRICE_JP, '5.1',
            Keys.PRICE_PL, '6.1',
            Keys.PRICE_SE, '7.1',
            Keys.PRICE_USD, '8.1',
            Keys.PRIMARY_MARKETPLACE, primaryMarketplace,
            Keys.PUB_DATE, 'test_pub_date',
            Keys.PUB_STATUS, 'test_pub_status',
            Keys.PUB_STATUS_DETAIL, 'test_pub_status_detail',
            Keys.SIGNATURE, 'test_signature',
            Keys.SUBTITLE, 'test_subtitle',
            Keys.EDITION, edition,
            Keys.TITLE, 'test_title',
            Keys.SERIES_TITLE, 'test_series_title',
            Keys.SCRAPED_SERIES_TITLE, 'test_scraped_series_title',
            Keys.WAS_EVER_PUBLISHED, 'false',
        ),
        makeMap(),
        'content/dir',
        []);
}

export function makeMap(...vals: string[]): Map<string, string> {
    let m = new Map();
    for (let i = 0; i + 1 < vals.length; i += 2) {
        m.set(vals[i], vals[i + 1]);
    }
    return m;

}
