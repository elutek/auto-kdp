// Result of a single action, which may or 
// may not be retried.
export class ActionResult {

    public success: boolean;
    public shouldRetry: boolean = true;
    public nextActions: string = '';

    constructor(success: boolean) {
        this.success = success;
    }

    doNotRetry() {
        this.shouldRetry = false;
        return this;
    }

    setNextActions(nextActions: string) {
        this.nextActions = nextActions;
        return this;
    }

}
