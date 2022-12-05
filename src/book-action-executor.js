import { ActionResult } from './action-result.js';
import { ActionsResult } from './actions-result.js';
import { mergeActions } from './utils.js';

// If successful returns next actions; if failed, returns null.
async function doExecuteBookActionWithRetries(action, book, actionCallback, params) {
    let err = null;
    for (let attempt = 1; attempt <= 3; ++attempt) {
        try {
            console.log(`\nBook action ${action} #${attempt} start`);
            let result = await actionCallback(action, book, params);
            console.log(`Book action ${action} #${attempt} result : ` + (result.success ? 'OK' : 'FAILED'));
            if (result.success || !result.shouldRetry) {
                return result;
            }
        } catch (e) {
            console.log(`Book action ${action} #${attempt} done: throws: ` + e);
        }
    }
    return new ActionResult(false).doNotRetry();
}

// Reads actions from book.action. Writes new actions the same way.
// If this procedure fails, actions remain unchanged.
// Returns whether any action succeeded.
export async function ExecuteBookActions(book, actionCallback, params) {
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
            console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
            console.log('!!!!     Book processing failed   !!!!!');
            console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        }
    }
    actionsResult.isDone = true;
    return actionsResult;
}
