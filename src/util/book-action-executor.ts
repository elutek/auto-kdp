import { Book } from '..//book/book.js';
import { ActionResult } from './action-result.js';
import { ActionsResult } from './actions-result.js';
import { ActionParams } from './action-params.js';
import { BookFile } from '../book/book-file.js';
import { BookList } from '../book/book-list.js';
import { mergeActions, debug, error } from './utils.js';

export type ActionCallback = (action: string, book: Book, params: any) => Promise<ActionResult>;

// If successful returns next actions; if failed, returns null.
async function doExecuteBookActionWithRetries(action: string, book: Book, actionCallback: ActionCallback, params: ActionParams): Promise<ActionResult> {
    const verbose = params.verbose;
    let err = null;
    for (let attempt = 1; attempt <= 3; ++attempt) {
        try {
            debug(book, verbose, `Book action ${action} #${attempt} start`);
            const result = await actionCallback(action, book, params);
            debug(book, verbose, `Book action ${action} #${attempt} done: ` + (result.success ? 'OK' : 'FAILED'));
            if (result.success || !result.shouldRetry) {
                return result;
            }
        } catch (e) {
            error(book, `Book action ${action} #${attempt} done: throws: ` + e);
        }
    }
    return new ActionResult(false).doNotRetry();
}

// Reads actions from book.action. Writes new actions the same way.
// If this procedure fails, actions remain unchanged.
// Returns whether any action succeeded.
export async function ExecuteBookActions(book: Book, bookFile: BookFile, bookList: BookList, actionCallback: ActionCallback, params: ActionParams): Promise<ActionsResult> {
    const verbose = params.verbose;
    // Process actions until the first action fails.
    // The book.actions field is only modified in this function, not in ExecuteBookAction().
    let actionsResult = new ActionsResult();
    while (book.hasAction() && !actionsResult.isDone) {
        let currAction = book.getFirstAction();
        let result = await doExecuteBookActionWithRetries(currAction, book, actionCallback, params);
        actionsResult.reportResult(result);

        // Handle next actions.
        if (result.success) {
            book.popFirstAction();
            if (result.nextActions != '') {
                book.action = mergeActions(result.nextActions, book.action);
            }
        } else {
            /* Istanbul skip next */
            error(book, 'Book processing FAILED');
        }

        // Write out the books to preserve current state.
        if (bookFile != null && bookList != null) {
            debug(book, verbose, `Writing ${bookList.size()} books`);
            await bookFile.writeBooksAsync(bookList);
        }
    }
    actionsResult.isDone = true;
    return actionsResult;
}
