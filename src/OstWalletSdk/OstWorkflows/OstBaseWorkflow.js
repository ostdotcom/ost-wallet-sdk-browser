import uuidv4 from "uuid/v4";
import OstMessage from "../../common-js/OstMessage";
import {SOURCE} from '../../common-js/OstBrowserMessenger';

const LOG_TAG = "OstBaseWorkflow :: ";

class OstBaseWorkflow {
	constructor(userId, ostWorkflowCallbacks, browserMessenger, workflowEvents) {
		this.userId = userId;
		this.browserMessenger = browserMessenger;
		this.ostWorkflowCallbacks = ostWorkflowCallbacks;
		this.workflowEvents = workflowEvents;

		this.workflowId = null;
	}

	perform() {
		this.workflowId = uuidv4();
		console.log(LOG_TAG, "perform :: workflowId ::", this.workflowId);
	}

	flowInitiated(ost_workflow_context) {
		console.log(LOG_TAG, "flowInitiated", arguments);
		this.ostWorkflowCallbacks.flowInitiated(ost_workflow_context);
	}

	requestAcknowledged(ost_workflow_context, ost_context_entity) {
		console.log(LOG_TAG, "requestAcknowledged", arguments);
		this.ostWorkflowCallbacks.requestAcknowledged(ost_workflow_context, ost_context_entity);
	}

	flowComplete(ost_workflow_context, ost_context_entity) {
		console.log(LOG_TAG, "flowComplete", arguments);
		this.ostWorkflowCallbacks.flowComplete(ost_workflow_context, ost_context_entity);
	}

	flowInterrupt(ost_workflow_context, ost_error) {
		console.error(LOG_TAG, "flowInterrupt", arguments);
		this.ostWorkflowCallbacks.flowInterrupt(ost_workflow_context, ost_error);
	}

	startWorkflow(functionName, params) {
		this.subscribeEvents();

		params["workflow_id"] = this.workflowId;
		let message = new OstMessage();
		message.setReceiverName('OstSdk');
		message.setFunctionName(functionName);
		message.setArgs(params, this.workflowId);

		this.browserMessenger.sendMessage(message, SOURCE.DOWNSTREAM);

		return this.workflowId;
	}

	subscribeEvents() {
		const oThis = this
			, workflowEventsObj = this.workflowEvents
		;

		workflowEventsObj.subscribe("flowInitiated", oThis.workflowId, (ost_workflow_context) => {
			oThis.flowInitiated(ost_workflow_context);
		});

		workflowEventsObj.subscribe("requestAcknowledged", oThis.workflowId, (ost_workflow_context, ost_context_entity) => {
			oThis.requestAcknowledged(ost_workflow_context, ost_context_entity);
		});

		workflowEventsObj.subscribe("flowCompleted", oThis.workflowId, (ost_workflow_context, ost_context_entity) => {
			oThis.flowComplete(ost_workflow_context, ost_context_entity)
		});

		workflowEventsObj.subscribe("flowInterrupted", oThis.workflowId, (ost_workflow_context, ost_error) => {
			oThis.flowInterrupt(ost_workflow_context, ost_error)
		});
	}
}

export default OstBaseWorkflow
