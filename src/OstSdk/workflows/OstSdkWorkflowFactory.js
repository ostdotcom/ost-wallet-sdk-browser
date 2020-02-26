/*
    Not yet included anywhere. Should be included in OstSdkSetupDevice.
*/

import OstWorkflowContext from "./OstWorkflowContext";
import OstSdkCreateSession from "./OstSdkCreateSession";
import OstSdkExecuteTransaction from "./OstSdkExecuteTransaction";

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
			// Avoid create session workflow if pending session workflow is older than the provided time limit.
			const currentTimeStamp = parseInt(Date.now() / 1000);
			const deltaTime = 5 * 60;
			if (currentTimeStamp - parseInt(workflowInfo.getCreatedAt()) > deltaTime) {
				workflowInfo.setWorkflowStatus(OstWorkflowContext.STATUS.CANCELLED_BY_NAVIGATION);
				return workflowInfo.forceCommit();
			} else {
				oThis.baseWorkflow = new OstSdkCreateSession(workflowInfo.getArgs()[0], browserMessenger, workflowInfo);
			}
		}

		if (OstWorkflowContext.WORKFLOW_TYPE.EXECUTE_TRANSACTION === workflowInfo.getName()) {
			oThis.baseWorkflow = new OstSdkExecuteTransaction(workflowInfo.getArgs()[0], browserMessenger, workflowInfo);
		}

		return this.baseWorkflow.perform();
	}
}

export default OstSdkWorkflowFactory;
