import {SOURCE} from "../../common-js/OstBrowserMessenger";
import {MESSAGE_TYPE, OstMessage} from "../../common-js/OstMessage";


export default class OstKeyManager {
	constructor(ostSdkObj, userId){
		this.ostSdkObj = ostSdkObj;
		this.userId = userId;
	}

	init() {
		return this.get(MESSAGE_TYPE.OST_KM_INIT);
	}

	getDeviceAddress() {
		return this.get(MESSAGE_TYPE.OST_KM_GET_DEVICE_ADDRESS);
	}

	getApiKeyAddress() {
		return this.get(MESSAGE_TYPE.OST_KM_GET_API_ADDRESS);
	}


	get(msgType) {
		const oThis = this;

		return new Promise(function (resolve, reject) {
			const initKeyManger = new OstMessage({userId: oThis.userId}, msgType);
			oThis.ostSdkObj.sendMessage(initKeyManger, SOURCE.DOWNSTREAM);
			oThis.ostSdkObj.registerOnce(msgType,
				(msg) => {
					console.log("Entity response", msgType, msg);
					if (!msg) {
						return reject(msgType ,"Entity not found");
					}
					return resolve(msg);
				}
			);
		});
	}
}
