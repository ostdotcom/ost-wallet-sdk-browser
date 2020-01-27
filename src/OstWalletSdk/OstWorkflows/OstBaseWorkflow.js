import uuidv4 from "uuid/v4";


const LOG_TAG = "OstBaseWorkflow :: ";

class OstBaseWorkflow {
  constructor(browserMessenger, ostWorkflowCallbacks) {
    this.workflowId = null;
    this.browserMessenger = browserMessenger;
    this.ostWorkflowCallbacks = ostWorkflowCallbacks;
  }

  perform ( ) {
    this.workflowId = uuidv4();
    console.log(LOG_TAG, "perform :: workflowId ::", this.workflowId);
  }

  requestAcknowledged( args ) {
    console.log(LOG_TAG, "requestAcknowledged", args);
    this.ostWorkflowCallbacks.requestAcknowledged(args.ostWorkflowContext, args.ostContextEntity);
  }

  flowComplete( args ) {
    console.log(LOG_TAG, "flowComplete", args);
    this.ostWorkflowCallbacks.flowComplete(args.ostWorkflowContext, args.ostContextEntity);
  }

  flowInterrupt( args )  {
    console.log(LOG_TAG, "flowInterrupt", args);
    this.ostWorkflowCallbacks.flowInterrupt(args.ostWorkflowContext, args.ostError);
  }
}

export default OstBaseWorkflow