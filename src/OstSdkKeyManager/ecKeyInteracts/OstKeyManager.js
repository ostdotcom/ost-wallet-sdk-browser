

let ikmInstance = null;
export default class OstKeyManager {
	constructor(ikm) {
		ikmInstance = ikm;
	}

	getDeviceAddress() {
		return ikmInstance.getDeviceAddress();
	}

	getApiAddress() {
		return ikmInstance.getApiAddress();
	}

	createSessionKey() {
		return ikmInstance.createSessionKey();
	}
}
