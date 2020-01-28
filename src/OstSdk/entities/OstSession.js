import {OstBaseEntity, STORES} from "./OstBaseEntity";

class OstSession extends OstBaseEntity {

	static STATUS = {
		CREATED: 'CREATED',
		AUTHORIZED: 'AUTHORIZED',
		REVOKED: 'REVOKED',
	};

	constructor(jsonObject) {
		super(jsonObject)
	}

	getIdKey() {
		return 'address';
	}

	static init(address) {
		const token = new OstSession(
			{address: address, status: OstSession.STATUS.CREATED}
		);
		return token.forceCommit();
	}

	static parse(data) {
		const ostToken = new OstSession(data);
		return ostToken.forceCommit();
	}

	getStoreName() {
		return STORES.OST_SESSION;
	}
}
export default OstSession;
