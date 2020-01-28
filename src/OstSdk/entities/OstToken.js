import {OstBaseEntity, STORES} from "./OstBaseEntity";
import OstDevice from "./OstDevice";

class OstToken extends OstBaseEntity {

	static STATUS = {
		CREATED: 'CREATED'
	};

	constructor(jsonObject) {
		super(jsonObject)
	}

	static init(tokenId) {
		const token = new OstToken(
			{id: tokenId, status: OstToken.STATUS.CREATED}
		);
		return token.forceCommit();
	}

	getIdKey() {
		return 'id';
	}

	static parse(data) {
		const ostToken = new OstToken(data);
		return ostToken.forceCommit();
	}

	getStoreName() {
		return STORES.OST_TOKEN;
	}
}
export default OstToken;
