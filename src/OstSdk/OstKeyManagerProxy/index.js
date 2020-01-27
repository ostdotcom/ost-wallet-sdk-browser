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
      oThis.sendMessageToGetDevice();

      oThis.onSuccess = function (args) {
        console.log(LOG_TAG, "onDeviceAddressGet", args);
        resolve(args.device_address);
      };

      oThis.onError = function ( args ) {
        reject(args.error);
      };

    });
  }

  sendMessageToGetDevice() {
    let functionParams = {
      user_id: this.userId,
    };
		let subId = this.messengerObj.subscribe(this);

		let message  = new OstMessage();
		message.setReceiverName("OstSdkKeyManager");
    message.setFunctionName("getDeviceAddress");
    message.setArgs(functionParams, subId);
    console.log(LOG_TAG, "sendMessageToGetDevice");
		this.messengerObj.sendMessage(message, SOURCE.DOWNSTREAM);
  }

  getApiKeyAddress ( ) {
    let oThis = this;
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        oThis.onSuccess({api_key_address: "0xApiKeyAddress"});
      }, 1000);

      oThis.onSuccess = function (args) {
        console.log(LOG_TAG, "onDeviceAddressGet");
        resolve(args.api_key_address);
      };

      oThis.onError = function ( args ) {
        reject(args.error);
      };

    });
  }


}
