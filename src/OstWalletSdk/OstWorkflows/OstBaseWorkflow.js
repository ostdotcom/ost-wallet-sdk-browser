import uuidv4 from "uuid/v4";
import OstMessage from "../../common-js/OstMessage";
import {SOURCE} from '../../common-js/OstBrowserMessenger';


const LOG_TAG = "OstBaseWorkflow :: ";

class OstBaseWorkflow {
  constructor(userId, ostWorkflowCallbacks, browserMessenger) {
    this.userId = userId;
    this.browserMessenger = browserMessenger;
    this.ostWorkflowCallbacks = ostWorkflowCallbacks;

    this.workflowId = null;
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

  startWorkflow(functionName, params) {
    this.browserMessenger.subscribe(this, this.ostWorkflowCallbacks.uuid);

    let message = new OstMessage();
    message.setReceiverName('OstSdk');
    message.setFunctionName('setupDevice');
    message.setArgs(params, this.ostWorkflowCallbacks.uuid);

    this.ostWorkflowCallbacks.workflowId = this.workflowId;

    this.browserMessenger.sendMessage(message, SOURCE.DOWNSTREAM);

    return this.workflowId;
  }
}

export default OstBaseWorkflow