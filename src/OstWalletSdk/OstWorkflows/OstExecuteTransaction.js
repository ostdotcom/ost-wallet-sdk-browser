import OstBaseWorkflow from "./OstBaseWorkflow";

const LOG_TAG = "OstExecuteTransaction :: ";

class OstExecuteTransaction extends OstBaseWorkflow {
  constructor(userId,
              transactionData,
              ostWorkflowCallbacks,
              browserMessenger,
              workflowEvents) {

    super(userId, ostWorkflowCallbacks, browserMessenger, workflowEvents);

    this.transactionData = transactionData;
  }

  perform() {
    super.perform();
    return this.startWorkflow(
      "executeTransaction",
      {
        user_id: this.userId,
        transaction_data: this.transactionData
      }
    );
  }
}


export default OstExecuteTransaction;
