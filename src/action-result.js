// Result of a single action, which may or 
// may not be retried.
export class ActionResult {

    constructor(success) {
        this.success = success;
        this.shouldRetry = true;
        this.nextActions = '';
    }

    doNotRetry() {
        this.shouldRetry = false;
        return this;
    }

    setNextActions(nextActions) {
        this.nextActions = nextActions;
        return this;
    }

}
