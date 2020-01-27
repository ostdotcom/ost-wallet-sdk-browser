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
    message.setArgs({user_id: this.userId, token_id: this.tokenId}, this.ostWorkflowCallbacks.uuid);

    this.ostWorkflowCallbacks.workflowId = this.workflowId;

    this.browserMessenger.sendMessage(message, SOURCE.DOWNSTREAM);

    return this.workflowId;
  }

  registerDevice ( args ) {
    let oThis = this;
    console.log("OstSetupDevice :: registerDevice :: ", args);

    this.ostWorkflowCallbacks.registerDevice(args.device_address, args.api_key_address)
      .then((res) => {

        console.log("OstSetupDevice :: registerDevice :: then :: ", res);

        let message = new OstMessage();
        message.setFunctionName("deviceRegistered");
        message.setArgs(res, this.ostWorkflowCallbacks.uuid);
        message.setSubscriberId(args.subscriber_id);

        oThis.browserMessenger.sendMessage(message, SOURCE.DOWNSTREAM);
      })
      .catch((err) => {

      });
  }
}

export default OstSetupDevice;