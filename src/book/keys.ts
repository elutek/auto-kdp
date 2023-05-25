export var Keys = {
    // Directive about what to do with the book, e.g create it or click publish.
    ACTION: 'action',
    SIGNATURE: 'signature', // For uniqueness
    NOTES: 'notes', // Ignored field, for custom notes, e.g "abandoned"

    //
    // Book metadata provided by the author
    //
    AUTHOR_FIRST_NAME: 'authorFirstName',
    AUTHOR_LAST_NAME: 'authorLastName',
    DESCRIPTION: 'description',
    ILLUSTRATOR_FIRST_NAME: 'illustratorFirstName',
    ILLUSTRATOR_LAST_NAME: 'illustratorLastName',
    KEYWORD0: 'keyword0',
    KEYWORD1: 'keyword1',
    KEYWORD2: 'keyword2',
    KEYWORD3: 'keyword3',
    KEYWORD4: 'keyword4',
    KEYWORD5: 'keyword5',
    KEYWORD6: 'keyword6',
    LANGUAGE: 'language',
    SERIES_TITLE: 'seriesTitle',
    SCRAPED_SERIES_TITLE: 'scrapedSeriesTitle',
    SUBTITLE: 'subtitle',
    TITLE: 'title',
    PRICE_AU: 'priceAu',
    PRICE_CA: 'priceCa',
    PRICE_EUR: 'priceEur',
    PRICE_GBP: 'priceGbp',
    PRICE_JP: 'priceJp',
    PRICE_PL: 'pricePl',
    PRICE_SE: 'priceSe',
    PRICE_USD: 'priceUsd',
    PRIMARY_MARKETPLACE: 'primaryMarketplace',

    //
    // Content selections
    //

    // ISBN. Can be provided by the user, or obtained by KDP.
    // Note that once it is obtained, the book record cannot be deleted.
    // TODO: Currently only obtaining from KDP is supported, i.e. if ISBN is empty, 
    // we will request one.
    ISBN: 'isbn',

    // black-and-cream|black-and-white|standard-color|premium-color
    PAPER_COLOR: 'paperColor',

    // Trim (in inches): 5x8 | 5.25x8 | 5.5x8.5 | 6x9 | 8.5x8.5
    // TODO: Support more sizes.
    PAPER_TRIM: 'paperTrim',

    // yes|no
    PAPER_BLEED: 'paperBleed',

    // matte|glossy
    PAPER_COVER_FINISH: 'paperCoverFinish',

    // BISAC category. Find it on  https://bisg.org/page/BISACEdition.
    // For example on page https://bisg.org/page/JuvenileFiction it shows
    // JUV014000 is JUVENILE FICTION / Girls & Women.
    // Specify JUV014000 here. Amazon requires at least one category,
    // at most two.
    CATEGORY1: 'category1',
    CATEGORY2: 'category2',

    // Local files containing the manuscript and cover, and a command
    // to automatically genertate them.
    COVER_FILE: 'coverLocalFile',
    MANUSCRIPT_CREATION_COMMAND: 'manuscriptCreationCommand',
    MANUSCRIPT_FILE: 'manuscriptLocalFile',

    // Amazon's unique id. This look like '059035342X' and the product can be
    // found on page https://www.amazon.com/dp/<asin>.
    ASIN: 'asin',

    // Another unique assigned by KDP.
    ID: 'id',
    // Yet another ID used by KDP and shows up in some minor 
    // contexts.
    TITLE_ID: 'titleId',

    // Link to cover image scraped. Can be used to create an affiliate
    // link to the book.
    COVER_IMAGE_URL: 'coverImageUrl',

    // Information after the book is published.
    PUB_DATE: 'pubDate',
    PUB_STATUS: 'pubStatus',
    PUB_STATUS_DETAIL: 'pubStatusDetail',

    // Set to true on the first time when we publish. After publishing
    // we cannot remove it - the record stays forever, but stops showing
    // as available.
    WAS_EVER_PUBLISHED: 'wasEverPublished',
};
