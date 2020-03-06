import OstBaseWorkflow from "./OstBaseWorkflow";

const LOG_TAG = "OstCreateSession :: ";

class OstCreateSession extends OstBaseWorkflow {
  constructor(userId, expirationTime, spendingLimit, ostWorkflowCallbacks, browserMessenger, workflowEvents) {
    super(userId, ostWorkflowCallbacks, browserMessenger, workflowEvents);

    this.expirationTime = expirationTime;
    this.spendingLimit = spendingLimit;
  }

  perform() {
    super.perform();
    return this.startWorkflow(
      "createSession",
      {user_id: this.userId, spending_limit: this.spendingLimit, expiration_time: this.expirationTime}
    );
  }

}


export default OstCreateSession;
