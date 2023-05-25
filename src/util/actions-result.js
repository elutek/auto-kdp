// Result of running multiple set of actions
// (each of those actions may be retried)
export class ActionsResult {

    constructor() {
        this.numSuccesses = 0;
        this.numFailures = 0;
        this.isDone = false;
    }

    reportResult(actionResult) {
        if (actionResult.success) {
            this.numSuccesses++;
        } else {
            this.numFailures++;
            this.isDone = true;
        }

        if (actionResult.nextActions != '') {
            this.isDone = true;
        }
    }

    hasSuccess() {
        return this.numSuccesses > 0;
    }

    hasFailed() {
        return this.numFailures > 0;
    }
}
