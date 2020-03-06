import OstError from "../../common-js/OstError";

const LOG_TAG = "OstWorkflowEmitter :: ";

export default class OstWorkflowEmitter {

  constructor(workflowEvents) {
    this.workflowEvents = workflowEvents;
  }

  registerDevice(args) {
    console.log(LOG_TAG, "registerDevice", args);

    const workflowId = this.getWorkflowId(args);
    if (!workflowId) return;

    this.workflowEvents.postRegisterDeviceEvent(args.ost_workflow_context, args);
  }

  flowInitiated(args) {
    console.log(LOG_TAG, "flowInitiated", args);

    const workflowId = this.getWorkflowId(args);
    if (!workflowId) return;

    this.workflowEvents.postFlowInitiatedEvent(args.ost_workflow_context);
  }

  requestAcknowledged(args) {
    console.log(LOG_TAG, "requestAcknowledged", args);

    const workflowId = this.getWorkflowId(args);
    if (!workflowId) return;


    this.workflowEvents.postRequestAcknowledgedEvent(args.ost_workflow_context, args.ost_context_entity)
  }

  flowComplete(args) {
    console.log(LOG_TAG, "flowComplete", args);

    const workflowId = this.getWorkflowId(args);
    if (!workflowId) return;

    this.workflowEvents.postFlowCompleteEvent(args.ost_workflow_context, args.ost_context_entity)
  }

  flowInterrupt(args) {
    console.error(LOG_TAG, "flowInterrupt", args);

    const workflowId = this.getWorkflowId(args);
    if (!workflowId) return;

    let error = OstError.fromErrorPayload(args.ost_error);

    this.workflowEvents.postFlowInterruptEvent(args.ost_workflow_context, error)
  }

  getWorkflowId(args) {
    if (!args) {
      return null;
    }
    if (!args.ost_workflow_context) {
      return null;
    }
    if (!args.ost_workflow_context.id) {
      return null;
    }

    return args.ost_workflow_context.id;
  }

  getReceiverName() {
    return "OstWorkflowEmitter";
  }
}
