import {SOURCE} from "../../common-js/OstBrowserMessenger";
import OstMessage from "../../common-js/OstMessage";

const LOG_TAG = "OstSdk :: OstKeyManagerProxy";

export default class OstKeyManagerProxy {
  constructor(messengerObj, userId){
    this.messengerObj = messengerObj;
    this.userId = userId;
  }

	signApiParams(resource, params) {
  	let oThis = this;
		let functionParams = {
			user_id: this.userId,
			resource: resource,
			params: params
		};

  	return oThis.getFromKM('signApiParams', functionParams);
	}

  getDeviceAddress () {
		let oThis = this;
		let functionParams = {
			user_id: this.userId,
		};

		return oThis.getFromKM('getDeviceAddress', functionParams)
			.then((response) => {
				return response.device_address;
			});

	}

  getApiKeyAddress ( ) {
		let oThis = this;
		let functionParams = {
			user_id: this.userId,
		};

		return oThis.getFromKM('getApiAddress', functionParams)
			.then((response) => {
				return response.api_key_address;
			});
	}

	createSessionKey() {
		let oThis = this;
		let functionParams = {
			user_id: this.userId,
		};

		return oThis.getFromKM('createSessionKey', functionParams)
	}

	getFromKM(functionName, functionParams) {
		let oThis = this;
		return new Promise((resolve, reject) => {

			let subId = this.messengerObj.subscribe(new ResponseHandler(
				function (args) {
					console.log(LOG_TAG, `${functionName} get`, args);
					oThis.messengerObj.unsubscribe(subId);
					resolve(args);
				},
				function ( args ) {
					console.log(LOG_TAG, `${functionName} error`, args);
					oThis.messengerObj.unsubscribe(subId);
					reject(args);
				}
			));

			let message  = new OstMessage();
			message.setReceiverName("OstSdkKeyManager");
			message.setFunctionName(functionName);
			message.setArgs(functionParams, subId);
			console.log(LOG_TAG, functionName);
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
