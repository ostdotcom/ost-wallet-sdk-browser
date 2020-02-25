/*
    Not yet included anywhere. Should be included in OstSdkSetupDevice.
*/

import OstWorkflowContext from "./OstWorkflowContext";
import OstSdkCreateSession from "./OstSdkCreateSession";
import OstSdkExecuteTransaction from "./OstSdkExecuteTransaction";

class OstSdkWorkflowFactory {

	constructor(workflowInfo, browserMessenger) {
		const oThis = this;

		if (OstWorkflowContext.WORKFLOW_TYPE.CREATE_SESSION === workflowInfo.getName()) {
			oThis.baseWorkflow = new OstSdkCreateSession(workflowInfo.getArgs()[0], browserMessenger, workflowInfo);
		}
		if (OstWorkflowContext.WORKFLOW_TYPE.EXECUTE_TRANSACTION === workflowInfo.getName()) {
			oThis.baseWorkflow = new OstSdkExecuteTransaction(workflowInfo.getArgs()[0], browserMessenger, workflowInfo);
		}
	}

	perform() {
		return this.baseWorkflow.perform();
	}
}

export default OstSdkWorkflowFactory;
