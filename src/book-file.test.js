import mock from 'mock-fs';
import path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { BookFile } from './book-file';

const BOOKS_CONF = `
authorFirstName = test_author_first_name
authorLastName = test_author_last_name
category1 = test_cat1
category2 = test_cat2
coverLocalFile = test_cover_file_\${name}
description = test_description for \${name}
illustratorFirstName = test_illustrator_first_name
illustratorLastName = test_illustrator_last_name
keyword0 = test \${name}
keyword1 = 
keyword2 =
keyword3 =
keyword4 =
keyword5 =
keyword6 = 
language = test_language
manuscriptCreationCommand = make book_\${name}
manuscriptLocalFile = manuscript/file/\${name}.pdf
notes = test notes
priceAu = 
priceCa = 
priceEur =
priceGbp =
priceJp = 
pricePl = 
priceSe = 
priceUsd = 1.2
paperBleed = test_paper_bleed
paperCoverFinish = test_paper_cover_finish
paperColor = test_paper_color
paperTrim = test_paper_trim
signature = \${name}
seriesTitle = My Series
title = Book for \${name}
`

afterEach(() => {
    mock.restore();
});

test('can read book file', async () => {
    const books_csv =
        `action     ,wasEverPublished,id       ,isbn       ,asin       ,name  ,pubStatus        ,pubDate        ,pubStatusDetail         ,coverImageUrl         ,scrapedSeriesTitle
        test_actionA,false           ,test_idA ,test_isbnA ,test_asinA ,Ava   ,test_pub_statusA ,test_pub_dateA ,test_pub_status_detailA ,test_cover_image_urlA ,scraped_series_titleA
        test_actionB,true            ,test_idB ,test_isbnB ,test_asinB ,Belle ,test_pub_statusB ,test_pub_dateB ,test_pub_status_detailB ,test_cover_image_urlB ,scraped_series_titleB`;

    mock({
        'books.csv': books_csv,
        'books.csv.lock': '',
        'books.conf': BOOKS_CONF,
        'content': { dir: {} },
        'node_modules': mock.load(path.resolve(__dirname, '../node_modules')),
    });

    let bookFile = new BookFile('books.csv', 'books.conf', 'content/dir');
    const bookList = await bookFile.readBooksAsync();
    const books = bookList.books;
    expect(books.length).toEqual(2);
    {
        let book = books[0];
        // Select only a few key fields for checking.
        expect(book.action).toEqual('test_actionA');
        expect(book.asin).toEqual('test_asinA');
        expect(book.authorFirstName).toEqual('test_author_first_name');
        expect(book.authorLastName).toEqual('test_author_last_name');
        expect(book.coverLocalFile).toEqual('content/dir/test_cover_file_Ava');
        expect(book.coverImageUrl).toEqual('test_cover_image_urlA');
        expect(book.description).toEqual('test_description for Ava');
        expect(book.id).toEqual('test_idA');
        expect(book.isbn).toEqual('test_isbnA');
        expect(book.keyword0).toEqual('test Ava');
        expect(book.manuscriptCreationCommand).toEqual('make book_Ava');
        expect(book.manuscriptLocalFile).toEqual('content/dir/manuscript/file/Ava.pdf');
        expect(book.priceUsd).toEqual(1.2);
        expect(book.wasEverPublished).toEqual(false);
        expect(book.signature).toEqual('Ava');
        expect(book.scrapedSeriesTitle).toEqual('scraped_series_titleA');
    }
    {
        let book = books[1];
        expect(book.action).toEqual('test_actionB');
        expect(book.asin).toEqual('test_asinB');
        expect(book.authorFirstName).toEqual('test_author_first_name');
        expect(book.authorLastName).toEqual('test_author_last_name');
        expect(book.coverLocalFile).toEqual('content/dir/test_cover_file_Belle');
        expect(book.coverImageUrl).toEqual('test_cover_image_urlB');
        expect(book.description).toEqual('test_description for Belle');
        expect(book.id).toEqual('test_idB');
        expect(book.isbn).toEqual('test_isbnB');
        expect(book.keyword0).toEqual('test Belle');
        expect(book.manuscriptCreationCommand).toEqual('make book_Belle');
        expect(book.manuscriptLocalFile).toEqual('content/dir/manuscript/file/Belle.pdf');
        expect(book.priceUsd).toEqual(1.2);
        expect(book.wasEverPublished).toEqual(true);
        expect(book.signature).toEqual('Belle');
        expect(book.scrapedSeriesTitle).toEqual('scraped_series_titleB');
    }
});

test('can read book with empty values', async () => {
    const empty_books_csv =
        `action,wasEverPublished,id,isbn,asin,name ,pubStatus,pubDate,pubStatusDetail,coverImageUrl,scrapedSeriesTitle
               ,                ,  ,    ,    ,Belle,         ,       ,               ,             ,`;

    const empty_books_conf = `
authorFirstName =
authorLastName =
category1 =
category2 =
coverLocalFile =
description =
illustratorFirstName =
illustratorLastName =
keyword0 =
keyword1 = 
keyword2 =
keyword3 =
keyword4 =
keyword5 =
keyword6 = 
language =
manuscriptCreationCommand =
manuscriptLocalFile =
notes =
priceAu = 
priceCa = 
priceEur =
priceGbp =
priceJp = 
pricePl = 
priceSe = 
priceUsd =
paperBleed =
paperCoverFinish =
paperColor =
paperTrim =
signature =
title =
seriesTitle =
scrapedSeriesTitle =
`
    mock({
        'books.csv': empty_books_csv,
        'books.csv.lock': '',
        'books.conf': empty_books_conf,
        'content': { dir: {} },
        'node_modules': mock.load(path.resolve(__dirname, '../node_modules')),
    });

    let bookFile = new BookFile('books.csv', 'books.conf', 'content/dir');
    const bookList = await bookFile.readBooksAsync();
    const books = bookList.books;
    expect(books.length).toEqual(1);
    {
        let book = books[0];
        // Select only a few key fields for checking.
        expect(book.action).toEqual('');
        expect(book.asin).toEqual('');
        expect(book.authorFirstName).toEqual('');
        expect(book.authorLastName).toEqual('');
        expect(book.coverLocalFile).toEqual('content/dir/');
        expect(book.coverImageUrl).toEqual('');
        expect(book.description).toEqual('');
        expect(book.id).toEqual('');
        expect(book.isbn).toEqual('');
        expect(book.keyword0).toEqual('');
        expect(book.manuscriptCreationCommand).toEqual('');
        expect(book.manuscriptLocalFile).toEqual('content/dir/');
        expect(book.priceUsd).toBeNull();
        expect(book.wasEverPublished).toEqual(false);
        expect(book.name).toEqual('Belle');
        expect(book.scrapedSeriesTitle).toEqual('');
    }
});

test('detects same id', async () => {
    const books_csv =
        `action,wasEverPublished,id,isbn,asin,name ,pubStatus,pubDate,pubStatusDetail,coverImageUrl,scrapedSeriesTitle
        a      ,false           ,SAMEID,a   ,a   ,Ava  ,a        ,a      ,a              ,a        ,A
        a      ,true            ,SAMEID,b   ,b   ,Belle,b        ,b      ,b              ,b        ,B`;

    mock({
        'books.csv': books_csv,
        'books.csv.lock': '',
        'books.conf': BOOKS_CONF,
        'content': { dir: {} },
        'node_modules': mock.load(path.resolve(__dirname, '../node_modules')),
    });

    let bookFile = new BookFile('books.csv', 'books.conf', 'content/dir');
    expect.assertions(1);
    await expect(bookFile.readBooksAsync()).rejects.toEqual(new Error('Id not unique: SAMEID'));
});

test('detects same isbn', async () => {
    const books_csv =
        `action,wasEverPublished,id,isbn     ,asin,name ,pubStatus,pubDate,pubStatusDetail,coverImageUrl,scrapedSeriesTitle
        a      ,false           ,a  ,SAMEISBN,a   ,Ava  ,a        ,a      ,a              ,a            ,A
        a      ,true            ,b  ,SAMEISBN,b   ,Belle,b        ,b      ,b              ,b            ,B`;

    mock({
        'books.csv': books_csv,
        'books.csv.lock': '',
        'books.conf': BOOKS_CONF,
        'content': { dir: {} },
        'node_modules': mock.load(path.resolve(__dirname, '../node_modules')),
    });

    let bookFile = new BookFile('books.csv', 'books.conf', 'content/dir');
    expect.assertions(1);
    await expect(bookFile.readBooksAsync()).rejects.toEqual(new Error('ISBN not unique: SAMEISBN'));
});

test('detects same signature', async () => {
    const books_csv =
        `action,wasEverPublished,id,isbn,asin,name,pubStatus,pubDate,pubStatusDetail,coverImageUrl,scrapedSeriesTitle
        a      ,false           ,a  ,a  ,a   ,Ava ,a        ,a      ,a              ,a            ,A
        a      ,true            ,b  ,b  ,b   ,Ava ,b        ,b      ,b              ,b            ,B`;

    mock({
        'books.csv': books_csv,
        'books.csv.lock': '',
        'books.conf': BOOKS_CONF,
        'content': { dir: {} },
        'node_modules': mock.load(path.resolve(__dirname, '../node_modules')),
    });

    let bookFile = new BookFile('books.csv', 'books.conf', 'content/dir');
    expect.assertions(1);
    await expect(bookFile.readBooksAsync()).rejects.toEqual(new Error('Signature not unique: Ava'));
});

test('can read and write the book file', async () => {
    const books_csv =
        `action,wasEverPublished,id,isbn,asin,name,pubStatus,pubDate,pubStatusDetail,coverImageUrl,scrapedSeriesTitle
test_actionA,false,test_idA,test_isbnA,test_asinA,Ava,test_pub_statusA,test_pub_dateA,test_pub_status_detailA,test_cover_image_urlA,title_a
test_actionB,true,test_idB,test_isbnB,test_asinB,Belle,test_pub_statusB,test_pub_dateB,test_pub_status_detailB,test_cover_image_urlB,title_b
`;

    mock({
        'books.csv': books_csv,
        'books.csv.new': '',
        'books.csv.lock': '',
        'books.conf': BOOKS_CONF,
        'content': { dir: {} },
        'node_modules': mock.load(path.resolve(__dirname, '../node_modules')),
    });

    let bookFile = new BookFile('books.csv', 'books.conf', 'content/dir');
    const bookList = await bookFile.readBooksAsync();

    // Write the output.
    await expect(await bookFile.writeBooksAsync(bookList)).resolves;

    // Test the file written is the same as the source.
    let books_new = fs.readFileSync('books.csv.new', { encoding: "utf8", flag: "r" });
    expect(books_new).toEqual(books_csv);
});

test('can read book file with an embedded file', async () => {
    const books_csv =
        `description,action     ,wasEverPublished,id       ,isbn       ,asin       ,name  ,pubStatus        ,pubDate        ,pubStatusDetail         ,coverImageUrl         ,scrapedSeriesTitle
        description A,test_actionA,false           ,test_idA ,test_isbnA ,test_asinA ,Ava   ,test_pub_statusA ,test_pub_dateA ,test_pub_status_detailA ,test_cover_image_urlA ,scraped_series_titleA
        file:file.txt,test_actionB,true            ,test_idB ,test_isbnB ,test_asinB ,Belle ,test_pub_statusB ,test_pub_dateB ,test_pub_status_detailB ,test_cover_image_urlB ,scraped_series_titleB`;

    mock({
        'books.csv': books_csv,
        'books.csv.lock': '',
        'books.conf': BOOKS_CONF,
        'file.txt': 'description B',
        'content': { dir: {} },
        'node_modules': mock.load(path.resolve(__dirname, '../node_modules')),
    });

    let bookFile = new BookFile('books.csv', 'books.conf', 'content/dir');
    const bookList = await bookFile.readBooksAsync();
    const books = bookList.books;
    expect(books.length).toEqual(2);
    {
        let book = books[0];
        expect(book.description).toEqual('description A')
    }
    {
        let book = books[1];
        expect(book.description).toEqual('description B')
    }
});
