// Result of running multiple set of actions

import { ActionResult } from "./action-result.js";


// (each of those actions may be retried)
export class ActionsResult {
    public numSuccesses: number = 0;
    public numFailures: number = 0;
    public isDone: boolean = false;

    constructor() { }

    reportResult(actionResult: ActionResult) {
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
