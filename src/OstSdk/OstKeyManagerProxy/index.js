import {SOURCE} from "../../common-js/OstBrowserMessenger";

const LOG_TAG = "OstSdk :: OstKeyManagerProxy";

export default class OstKeyManagerProxy {
  constructor(messengerObj, userId){
    this.messengerObj = messengerObj;
    this.userId = userId;
  }

  getDeviceAddress ( ) {
    let oThis = this;
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        oThis.onDeviceAddressGet({device_address: "0xNewDeviceAddress"});
      }, 1000);

      oThis.onDeviceAddressGet = function (args) {
        console.log(LOG_TAG, "onDeviceAddressGet");
        resolve(args.device_address);
      };

      oThis.onError = function ( args ) {
        reject(args.error);
      };

    });
  }

  getApiKeyAddress ( ) {
    let oThis = this;
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        oThis.onApiKeyAddressGet({api_key_address: "0xApiKeyAddress"});
      }, 1000);

      oThis.onApiKeyAddressGet = function (args) {
        console.log(LOG_TAG, "onDeviceAddressGet");
        resolve(args.api_key_address);
      };

      oThis.onError = function ( args ) {
        reject(args.error);
      };

    });
  }


}
