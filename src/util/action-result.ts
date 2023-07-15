// Result of a single action, which may or 

import { error } from "console";

// may not be retried.
export class ActionResult {

    public success: boolean;
    public shouldRetry: boolean = true;
    public nextActions: string = '';
    public error: Error = null;

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

    setError(error: Error): ActionResult {
        this.error = error;
        return this;
    }

    hasError(): boolean {
        return this.error != null;
    }

    getErrorMessage() {
        return this.error == null ? '' : "Error: " + this.error.message;
    }
}
