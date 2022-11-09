import { BookList } from './book-list';
import { makeOkTestBook } from './test-utils';

test('size', () => {
  {
    let bl = makeBookList(0);
    expect(bl.size()).toBe(0);
  }
  {
    let bl = makeBookList(2);
    expect(bl.size()).toBe(2);
  }
});

test('getNumBooksToProcess()', () => {
  {
    let bl = makeBookList(0);
    expect(bl.getNumBooksToProcess()).toBe(0);
  }
  {
    let bl = makeBookList(2);
    expect(bl.getNumBooksToProcess()).toBe(2);
    bl.books[1].action = '';
    expect(bl.getNumBooksToProcess()).toBe(1);
    bl.books[0].action = '';
    expect(bl.size()).toBe(2);
    expect(bl.getNumBooksToProcess()).toBe(0);
  }
});

test('containsContentAction', () => {
  {
    let bl = makeBookList(0);
    expect(bl.containsContentAction()).toBe(false);
  }
  {
    let bl = makeBookList(2);
    expect(bl.containsContentAction()).toBe(false);
    bl.books[1].action = 'content-blah';
    expect(bl.containsContentAction()).toBe(true);
    bl.books[1].action = 'blahContent blah';
    expect(bl.containsContentAction()).toBe(true);
  }
});


function makeBookList(n) {
  let bookList = new BookList();
  for (let i = 0; i < n; ++i) {
    bookList.addBook(makeOkTestBook());
  }
  return bookList;
}
