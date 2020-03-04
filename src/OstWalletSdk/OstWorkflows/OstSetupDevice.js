import OstBaseWorkflow from "./OstBaseWorkflow";
import OstMessage from "../../common-js/OstMessage";
import {SOURCE} from '../../common-js/OstBrowserMessenger';

class OstSetupDevice extends OstBaseWorkflow {
  constructor(userId, tokenId, ostWorkflowCallbacks, browserMessenger, workflowEvents) {

    super(userId, ostWorkflowCallbacks, browserMessenger, workflowEvents);

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

    let message = new OstMessage();
    message.setSubscriberId(subscriberId);
    message.setArgs(args, this.ostWorkflowCallbacks.uuid);

    this.ostWorkflowCallbacks.registerDevice(args.device)
      .then((res) => {

        console.log("OstSetupDevice :: registerDevice :: then :: ", args);

        message.setFunctionName("deviceRegistered");
        oThis.browserMessenger.sendMessage(message, SOURCE.DOWNSTREAM);
      })
      .catch((err) => {

        message.setFunctionName("cancelFlow");
        oThis.browserMessenger.sendMessage(message, SOURCE.DOWNSTREAM);
      });
  }

	subscribeEvents() {
		const oThis = this
			, workflowEventsObj = this.workflowEvents
		;

		super.subscribeEvents();
		workflowEventsObj.subscribe("registerDevice", oThis.workflowId, (args) => {
			oThis.registerDevice(args);
		});
	}
}

export default OstSetupDevice;
