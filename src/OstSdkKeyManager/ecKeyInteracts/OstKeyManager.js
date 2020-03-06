

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

	isTrustable() {
		return ikmInstance.isTrustable();
	}

	setTrustable(trustable) {
		return ikmInstance.setIsTrustable(trustable);
	}

	deleteLocalSessions(addresses) {
		return ikmInstance.deleteSessions(addresses);
	}

	filterValidSessions(sessions) {
		return ikmInstance.filterValidSessions(sessions);
	}
}
