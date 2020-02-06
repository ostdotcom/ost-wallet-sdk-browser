import OstBaseWorkflow from "./OstBaseWorkflow";

const LOG_TAG = "OstExecuteDirectTransferTransaction :: ";

class OstExecuteDirectTransferTransaction extends OstBaseWorkflow {
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
			"executeDirectTransferTransaction",
			{
				user_id: this.userId,
				transaction_data: this.transactionData
			}
		);
	}
}


export default OstExecuteDirectTransferTransaction;
