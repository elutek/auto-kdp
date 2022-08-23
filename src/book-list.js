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
            if (book.action != null && book.action.toLowerCase().includes('content')) {
                return true;
            }
        }
        return false;
    }
}
