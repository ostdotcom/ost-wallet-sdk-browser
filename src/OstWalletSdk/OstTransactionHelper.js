import {SOURCE} from "../common-js/OstBrowserMessenger";
import OstMessage from "../common-js/OstMessage";

const LOG_TAG = "OstTransactionHelper :: ";


const ResponseHandler = function (success, error) {
  const oThis = this;

  oThis.onSuccess = function(args) {
    return success(args.data);
  };

  oThis.onError = function(args) {
    return error(args.err);
  };

};

class OstTransactionHelper {
  constructor(messengerObj) {
    this.browserMessenger = messengerObj;
  }

  setTxConfig( config ) {
    let oThis = this;

    console.log(LOG_TAG, "setTxConfig");

    return new Promise((resolve, reject) => {
      let subId = this.browserMessenger.subscribe(new ResponseHandler(
        (response) => {
          resolve();
        },
        (err) => {
          reject();
        }
      ));

      oThis.sendToOstSdk('setTxConfig', {tx_config: config}, subId);
    })
  }

  sendToOstSdk( functionName, functionParams, subId = undefined ) {
    let message  = new OstMessage();
    message.setReceiverName("OstSdk");
    message.setFunctionName(functionName);
    message.setArgs(functionParams, subId);

    console.log(LOG_TAG, functionName);

    this.browserMessenger.sendMessage(message, SOURCE.DOWNSTREAM);
  }

}

export default OstTransactionHelper