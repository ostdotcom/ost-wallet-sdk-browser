import OstBaseWorkflow from "./OstBaseWorkflow";
import OstMessage from "../../common-js/OstMessage";
import {SOURCE} from '../../common-js/OstBrowserMessenger';

class OstSetupDevice extends OstBaseWorkflow {
  constructor(userId, tokenId, ostWorkflowCallbacks, browserMessenger) {

    super(userId, ostWorkflowCallbacks, browserMessenger);

    this.tokenId = tokenId
  }

  perform () {
    super.perform();
    console.log("OstSetupDevice :: perform");

    return this.startWorkflow("setupDevice", {user_id: this.userId, token_id: this.tokenId});
  }

  registerDevice ( args ) {
    let oThis = this;
    console.log("OstSetupDevice :: registerDevice :: ", args);
    const subscriberId = args.subscriber_id;
    this.ostWorkflowCallbacks.registerDevice(args)
      .then((res) => {

        console.log("OstSetupDevice :: registerDevice :: then :: ", args);

        let message = new OstMessage();
        message.setSubscriberId(subscriberId);
        message.setFunctionName("deviceRegistered");
        message.setArgs(args, this.ostWorkflowCallbacks.uuid);

        oThis.browserMessenger.sendMessage(message, SOURCE.DOWNSTREAM);
      })
      .catch((err) => {

      });
  }
}

export default OstSetupDevice;