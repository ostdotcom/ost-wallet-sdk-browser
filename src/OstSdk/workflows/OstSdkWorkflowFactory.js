import OstWorkflowContext from "./OstWorkflowContext";
import OstSdkCreateSession from "./OstSdkCreateSession";
import OstSdkExecuteTransaction from "./OstSdkExecuteTransaction";

const LOG_TAG = 'OstSdkWorkflowFactory';

let create_session_qr_timeout = 3 * 60 * 60;

class OstSdkWorkflowFactory {

	constructor(workflowInfo, browserMessenger) {
		const oThis = this;
		oThis.workflowInfo = workflowInfo;
		oThis.browserMessenger = browserMessenger;
	}

	static setCreateSessionQRTimeout( val ) {
		create_session_qr_timeout = val;
	}

	perform() {
		const oThis = this
			, workflowInfo = oThis.workflowInfo
			, browserMessenger = oThis.browserMessenger
		;

		if (OstWorkflowContext.WORKFLOW_TYPE.CREATE_SESSION === workflowInfo.getName()) {
			// Avoid create session workflow if pending session workflow is older than the provided time limit.
			const currentTimeStamp = parseInt(Date.now() / 1000);
			const deltaTime = create_session_qr_timeout;
			if (currentTimeStamp - parseInt(workflowInfo.getCreatedAt()) > deltaTime) {
				workflowInfo.setWorkflowStatus(OstWorkflowContext.STATUS.QR_TIMEDOUT);
				return workflowInfo.forceCommit();
			} else {
				oThis.baseWorkflow = new OstSdkCreateSession(workflowInfo.getArgs()[0], browserMessenger, workflowInfo);
			}
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
