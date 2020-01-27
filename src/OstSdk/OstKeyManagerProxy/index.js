import {SOURCE} from "../../common-js/OstBrowserMessenger";
import OstMessage from "../../common-js/OstMessage";

const LOG_TAG = "OstSdk :: OstKeyManagerProxy";

export default class OstKeyManagerProxy {
  constructor(messengerObj, userId){
    this.messengerObj = messengerObj;
    this.userId = userId;
  }

  getDeviceAddress ( ) {
    let oThis = this;
    return new Promise((resolve, reject) => {

      let subId = this.messengerObj.subscribe(new ResponseHandler(
				function (args) {
					console.log(LOG_TAG, "onDeviceAddressGet", args);
					resolve(args.device_address);
				},
				function ( args ) {
					reject(args.error);
				}
			));

			let functionParams = {
				user_id: this.userId,
			};

			let message  = new OstMessage();
			message.setReceiverName("OstSdkKeyManager");
			message.setFunctionName("getDeviceAddress");
			message.setArgs(functionParams, subId);
			console.log(LOG_TAG, "sendMessageToGetDevice");
			this.messengerObj.sendMessage(message, SOURCE.DOWNSTREAM);
    });
  }


  getApiKeyAddress ( ) {
    let oThis = this;
    return new Promise((resolve, reject) => {


			let subId = this.messengerObj.subscribe(new ResponseHandler(
				function (args) {
					console.log(LOG_TAG, "onApiAddressGet", args);
					resolve(args.api_key_address);
				},
				function ( args ) {
					reject(args.error);
				}
			));

			let functionParams = {
				user_id: this.userId,
			};

			let message  = new OstMessage();
			message.setReceiverName("OstSdkKeyManager");
			message.setFunctionName("getApiAddress");
			message.setArgs(functionParams, subId);
			console.log(LOG_TAG, "sendMessageToApiAddress");
			this.messengerObj.sendMessage(message, SOURCE.DOWNSTREAM);
    });
  }

}

const ResponseHandler = function (success, error){
	const oThis = this;

	oThis.onSuccess = function(args) {
			return success(args);
	};

	oThis.onError = function(args) {
		return error(args);
	};

};
