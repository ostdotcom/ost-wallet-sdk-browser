import OstBaseWorkflow from "./OstBaseWorkflow";
import OstMessage from "../../common-js/OstMessage";
import {SOURCE} from '../../common-js/OstBrowserMessenger';

class OstSetupDevice extends OstBaseWorkflow {
  constructor(userId, tokenId, ostWorkflowCallbacks, browserMessenger) {

    super(browserMessenger, ostWorkflowCallbacks);
    this.userId = userId;
    this.tokenId = tokenId
  }

  perform () {
    console.log("OstSetupDevice :: perform");
    this.browserMessenger.subscribe(this, this.ostWorkflowCallbacks.uuid);

    let message = new OstMessage();
    message.setReceiverName('OstSdk');
    message.setFunctionName('setupDevice');
    message.setArgs({userId: this.userId, tokenId: this.tokenId}, this.ostWorkflowCallbacks.uuid);

    this.ostWorkflowCallbacks.workflowId = this.workflowId;

    this.browserMessenger.sendMessage(message, SOURCE.DOWNSTREAM);

    return this.workflowId;
  }

  registerDevice ( args ) {
    console.log("OstSetupDevice :: registerDevice :: ", args);

    let message = new OstMessage();
    message.setFunctionName("deviceRegistered");
    message.setArgs(args);
    message.setSubscriberId(args.subscriber_id);

    this.browserMessenger.sendMessage(message, SOURCE.DOWNSTREAM);
  }
}

export default OstSetupDevice;