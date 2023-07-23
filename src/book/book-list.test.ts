import { BookList } from './book-list.js';
import { makeOkTestBook } from '../util/test-utils.js';

test('size', () => {
  {
    let bl = makeBookList([]);
    expect(bl.size()).toEqual(0);
  }
  {
    let bl = makeBookList([makeOkTestBook(), makeOkTestBook()]);
    expect(bl.size()).toEqual(2);
  }
});

test('getBooksToProcess()', () => {
  {
    let bl = makeBookList([]);
    expect(bl.getBooksToProcess()).toEqual(new Map());
  }
  {
    let bl = makeBookList([
      makeOkTestBook({ action: 'a' }),
      makeOkTestBook({ action: 'b' }),
      makeOkTestBook({ action: 'a' }),
      makeOkTestBook({ action: '' })
    ]);
    let m = bl.getBooksToProcess();
    expect(m.size).toEqual(2);
    expect(m.get('a')).toEqual(2);
    expect(m.get('b')).toEqual(1);
    expect(m.has('c')).toEqual(false);
  }
});

test('getNumBooksToProcess()', () => {
  {
    let bl = makeBookList([]);
    expect(bl.getNumBooksToProcess()).toEqual(0);
  }
  {
    let bl = makeBookList([
      makeOkTestBook({ action: 'a' }),
      makeOkTestBook({ action: 'b' }),
      makeOkTestBook({ action: 'a' })
    ]);
    expect(bl.getNumBooksToProcess()).toEqual(3);
    bl.getBooks()[0].action = '';
    expect(bl.getNumBooksToProcess()).toEqual(2);
  }
});

test('containsContentAction', () => {
  {
    let bl = makeBookList([]);
    expect(bl.containsContentAction()).toEqual(false);
  }
  {
    let bl = makeBookList([makeOkTestBook(), makeOkTestBook()]);
    expect(bl.containsContentAction()).toEqual(false);
    let books = bl.getBooks();

    books[1].action = 'content:abc';
    expect(bl.containsContentAction()).toEqual(true);
    books[1].action = 'abc:content';
    expect(bl.containsContentAction()).toEqual(true);
    books[1].action = 'abc:content:abc';
    expect(bl.containsContentAction()).toEqual(true);

    books[1].action = 'blah:content-blah';
    expect(bl.containsContentAction()).toEqual(false);
  }
});

function makeBookList(books) {
  let bookList = new BookList();
  for (let book of books) {
    bookList.addBook(book);
  }
  return bookList;
}
