// If successful returns next actions; if failed, returns null.
async function _executeBookAction(action, book, actionCallback, params) {
    let err = null;
    for (let attempt = 1; attempt <= 3; ++attempt) {
        try {
            console.log(`\nBook action ${action} #${attempt} start`);
            let callbackResult = await actionCallback(action, book, params);
            let result = (typeof callbackResult == 'boolean') ? { success: callbackResult, nextActions: ''} : callbackResult;
            console.log(`Book action ${action} #${attempt} result : ` + (result.success ? 'OK': 'FAILED'));
            if (result.success) {
                return result;
            }
        } catch (e) {
            console.log(`Book action ${action} #${attempt} done: throws: ` + e);
        }
    }
    return {
        success: false,
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
        let result = await _executeBookAction(currAction, book, actionCallback, params);
        if (result.success) {
            ++numSuccesses;
            book.popFirstAction();
            if (result.nextActions != '') {
                book.action = result.nextActions + (result.nextActions != '' && book.action != '' ? ':' : '') + book.action;
                break;
                // When we have more actions to execute, we stop now to avoid infinite loop, and to let the user review the new actions.
            }
        } else {
            // Processing failed at this action, we are not popping it, so it will be retried.
            return { numSuccesses: numSuccesses, result: false };
        }
    }
    return { numSuccesses: numSuccesses, result: true };
}
