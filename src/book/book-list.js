export class BookList {
    constructor() {
        this.books = [];
    }

    addBook(book) {
        this.books.push(book);
    }

    size() { 
        return this.books.length;
    }

    getBooksToProcess() {
        let result = new Map();
        for (let book of this.books) {
            if (book.action != '') {
              if (!result.has(book.action)) {
                result.set(book.action, 0);
              }
              result.set(book.action, result.get(book.action) + 1);
            }
        }
        return result;
    }

    getNumBooksToProcess() {
        let n = 0;
        for (let book of this.books) {
            if (book.action != '') {
                n++;
            }
        }
        return n;
    }

    containsContentAction() {
        for (let book of this.books) {
            if (book.action != null && book.getActionList().includes('content')) {
                return true;
            }
        }
        return false;
    }
}
