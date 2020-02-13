import OstBaseWorkflow from "./OstBaseWorkflow";

const LOG_TAG = "executePayTransaction :: ";

class OstExecutePayTransaction extends OstBaseWorkflow {
	constructor(userId,
							transactionData,
							ostWorkflowCallbacks,
							browserMessenger) {
		super(userId, ostWorkflowCallbacks, browserMessenger);
		this.transactionData = transactionData;
	}

	perform() {
		super.perform();

		return this.startWorkflow(
			"executePayTransaction",
			{
				user_id: this.userId,
				transaction_data: this.transactionData
			}
		);
	}
}


export default OstExecutePayTransaction;
