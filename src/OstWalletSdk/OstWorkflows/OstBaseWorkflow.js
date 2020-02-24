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

  perform ( ) {
    this.workflowId = uuidv4();
    console.log(LOG_TAG, "perform :: workflowId ::", this.workflowId);
  }

  flowInitiated( args ) {
    console.log(LOG_TAG, "flowInitiated", args);
    this.ostWorkflowCallbacks.flowInitiated(args.ost_workflow_context);

    this.workflowEvents.postFlowInitiatedEvent(args.ost_workflow_context);
  }

  requestAcknowledged( args ) {
    console.log(LOG_TAG, "requestAcknowledged", args);
    this.ostWorkflowCallbacks.requestAcknowledged(args.ost_workflow_context, args.ost_context_entity);

    this.workflowEvents.postRequestAcknowledgedEvent(args.ost_workflow_context, args.ost_context_entity)
  }

  flowComplete( args ) {
    console.log(LOG_TAG, "flowComplete", args);
    this.ostWorkflowCallbacks.flowComplete(args.ost_workflow_context, args.ost_context_entity);

    this.workflowEvents.postFlowCompleteEvent(args.ost_workflow_context, args.ost_context_entity)
  }

  flowInterrupt( args )  {
    console.error(LOG_TAG, "flowInterrupt", args);
    this.ostWorkflowCallbacks.flowInterrupt(args.ost_workflow_context, args.ost_error);

    this.workflowEvents.postFlowInterruptEvent(args.ost_workflow_context, args.ost_context_entity)
  }

  startWorkflow(functionName, params) {
    this.browserMessenger.subscribe(this, this.workflowId);

    params["workflow_id"] = this.workflowId;
    let message = new OstMessage();
    message.setReceiverName('OstSdk');
    message.setFunctionName(functionName);
    message.setArgs(params, this.workflowId);

    this.browserMessenger.sendMessage(message, SOURCE.DOWNSTREAM);

    return this.workflowId;
  }
}

export default OstBaseWorkflow