import OstBaseWorkflow from "./OstBaseWorkflow";

const LOG_TAG = "OstExecuteTransaction :: ";

class OstExecuteTransaction extends OstBaseWorkflow {
	constructor(userId, tokenHolderAddresses, amounts, ostWorkflowCallbacks, browserMessenger) {
		super(userId, ostWorkflowCallbacks, browserMessenger);

		this.tokenHolderAddresses = tokenHolderAddresses;
		this.amounts = amounts;
	}

	perform() {
		super.perform();
		return this.startWorkflow(
			"executeTransaction",
			{user_id: this.userId, token_holder_addresses: this.tokenHolderAddresses, amounts: this.amounts}
		);
	}
}


export default OstExecuteTransaction;
