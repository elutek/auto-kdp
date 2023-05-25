import { Book } from "./book.js";

export class BookList {
    private books = new Array<Book>();

    constructor() {
    }

    getBooks(): Array<Book> {
        return this.books;
    }

    addBook(book: Book) {
        this.books.push(book);
    }

    size() {
        return this.books.length;
    }

    getBooksToProcess(): Map<string, number> {
        let result = new Map();
        for (const book of this.books) {
            if (book.action != '') {
                if (!result.has(book.action)) {
                    result.set(book.action, 0);
                }
                result.set(book.action, result.get(book.action) + 1);
            }
        }
        return result;
    }

    getNumBooksToProcess(): number {
        let n = 0;
        for (const book of this.books) {
            if (book.action != '') {
                n++;
            }
        }
        return n;
    }

    containsContentAction(): boolean {
        for (const book of this.books) {
            if (book.action != null && book.getActionList().includes('content')) {
                return true;
            }
        }
        return false;
    }
}
