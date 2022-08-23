// If successful returns next actions; if failed, returns null.
async function ExecuteBookAction(action, book, actionCallback, params) {
    let err = null;
    for (let attempt = 1; attempt <= 3; ++attempt) {
        try {
            console.log(`Book action ${action} #${attempt} start`);
            let result = await actionCallback(action, book, params);
            let success = result.consumeAction;
            console.log(`Book action ${action} #${attempt} done: ` + (success ? 'success' : 'failure'));
            if (success) {
                return result;
            }
        } catch (e) {
            console.log(`Book action ${action} #${attempt} done: throws: ` + e);
        }
    }
    return {
        consumeAction: false,
        nextActions: ''
    };
}

// Reads actions from book.action. Writes new actions the same way.
// If this procedure fails, actions remain unchanged.
// Returns whether any action succeeded.
export async function ExecuteBookActions(book, actionCallback, params) {
    // Process actions until the first action fails.
    // The book.actions field is only modified in this function, not in ExecuteBookAction().
    let numSuccesses = 0;
    while (book.hasAction()) {
        let currAction = book.getFirstAction();
        console.log("\n\n-------------------\nExecuting action: " + currAction);
        let result = await ExecuteBookAction(currAction, book, actionCallback, params);
        if (result.consumeAction) {
            ++numSuccesses;
            book.popFirstAction();
            if (result.nextActions != '') {
                book.action = result.nextActions + (result.nextActions != '' && book.action != '' ? ':' : '') + book.action;
            }
        } else {
            // Processing failed at this action, we are not popping it, so it will be retried.
            return { numSuccesses: numSuccesses, result: false };
        }
    }
    return { numSuccesses: numSuccesses, result: true };
}
