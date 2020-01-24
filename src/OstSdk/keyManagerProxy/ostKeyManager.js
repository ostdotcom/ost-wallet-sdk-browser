import {SOURCE} from "../../common-js/OstBrowserMessenger";


export default class OstKeyManagerProxy {
	constructor(messengerObj, userId){
		this.messengerObj = messengerObj;
		this.userId = userId;
	}

	init() {
		// return this.get(MESSAGE_TYPE.OST_KM_INIT);
	}

	getDeviceAddress() {
		// return this.get(MESSAGE_TYPE.OST_KM_GET_DEVICE_ADDRESS);
	}

	getApiKeyAddress() {
		// return this.get(MESSAGE_TYPE.OST_KM_GET_API_ADDRESS);
	}


	get(msgType) {
		const oThis = this;

		return new Promise(function (resolve, reject) {

		});
	}
}
