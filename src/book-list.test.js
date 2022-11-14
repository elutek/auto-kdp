import { BookList } from './book-list';
import { makeOkTestBook } from './test-utils';

test('size', () => {
  {
    let bl = makeBookList([]);
    expect(bl.size()).toBe(0);
  }
  {
    let bl = makeBookList([makeOkTestBook(), makeOkTestBook()]);
    expect(bl.size()).toBe(2);
  }
});

test('getBooksToProcess()', () => {
  {
    let bl = makeBookList([]);
    expect(bl.getBooksToProcess()).toEqual(new Map());
  }
  {
    let bl = makeBookList([makeOkTestBook('a'), makeOkTestBook('b'), makeOkTestBook('a')]);
    let m = bl.getBooksToProcess();
    expect(m.size).toBe(2);
    expect(m.get('a')).toEqual(2);
    expect(m.get('b')).toEqual(1);
    expect(m.has('c')).toBeFalsy();
  }
});

test('getNumBooksToProcess()', () => {
  {
    let bl = makeBookList([]);
    expect(bl.getNumBooksToProcess()).toBe(0);
  }
  {
    let bl = makeBookList([makeOkTestBook('a'), makeOkTestBook('b'), makeOkTestBook('a')]);
    expect(bl.getNumBooksToProcess()).toBe(3);
    bl.books[0].action = '';
    expect(bl.getNumBooksToProcess()).toBe(2);
  }
});

test('containsContentAction', () => {
  {
    let bl = makeBookList([]);
    expect(bl.containsContentAction()).toBe(false);
  }
  {
    let bl = makeBookList([makeOkTestBook(), makeOkTestBook()]);
    expect(bl.containsContentAction()).toBe(false);
    bl.books[1].action = 'content-blah';
    expect(bl.containsContentAction()).toBe(true);
    bl.books[1].action = 'blahContent blah';
    expect(bl.containsContentAction()).toBe(true);
  }
});


function makeBookList(books) {
  let bookList = new BookList();
  for (let book of books) {
    bookList.addBook(book);
  }
  return bookList;
}
