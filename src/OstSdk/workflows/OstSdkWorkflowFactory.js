import OstWorkflowContext from "./OstWorkflowContext";
import OstSdkCreateSession from "./OstSdkCreateSession";
import OstSdkExecuteTransaction from "./OstSdkExecuteTransaction";

const LOG_TAG = 'OstSdkWorkflowFactory';

class OstSdkWorkflowFactory {

	constructor(workflowInfo, browserMessenger) {
		const oThis = this;
		oThis.workflowInfo = workflowInfo;
		oThis.browserMessenger = browserMessenger;
	}


	perform() {
		const oThis = this
			, workflowInfo = oThis.workflowInfo
			, browserMessenger = oThis.browserMessenger
		;

		if (OstWorkflowContext.WORKFLOW_TYPE.CREATE_SESSION === workflowInfo.getName()) {
			oThis.baseWorkflow = new OstSdkCreateSession(workflowInfo.getArgs()[0], browserMessenger, workflowInfo);
		}

		if (OstWorkflowContext.WORKFLOW_TYPE.EXECUTE_TRANSACTION === workflowInfo.getName()) {
			oThis.baseWorkflow = new OstSdkExecuteTransaction(workflowInfo.getArgs()[0], browserMessenger, workflowInfo);
		}

		//For unknown workflow type
		if (!this.baseWorkflow) {
			console.error(LOG_TAG, "perform :: Unknown workflow type", workflowInfo.getName());
			return;
		}

		return this.baseWorkflow.perform();
	}
}

export default OstSdkWorkflowFactory;
