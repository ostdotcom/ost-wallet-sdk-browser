import {SOURCE} from "../../common-js/OstBrowserMessenger";
import {MESSAGE_TYPE, OstMessage} from "../../common-js/OstMessage";


export default class OstKeyManager {
	constructor(ostSdkObj, userId){
		this.ostSdkObj = ostSdkObj;
		this.userId = userId;
		const initKeyManger = new OstMessage({userId: userId}, MESSAGE_TYPE.OST_KM_INIT);
		this.ostSdkObj.sendMessage(initKeyManger, SOURCE.DOWNSTREAM);
	}

	getDeviceAddress() {
		const initKeyManger = new OstMessage({userId: userId}, MESSAGE_TYPE.OST_KM_GET_DEVICE_ADDRESS);
		this.ostSdkObj.sendMessage(initKeyManger, SOURCE.DOWNSTREAM);
		ostSdkObj.register
	}

	getApiKeyAddress() {

	}
}
