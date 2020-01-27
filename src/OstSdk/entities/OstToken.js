import {OstBaseEntity, STORES} from "./OstBaseEntity";

class OstToken extends OstBaseEntity {

	static STATUS = {
		CREATED: 'CREATED'
	}

	constructor(jsonObject) {
		super(jsonObject)
	}

	static init(tokenId) {
		const token = new OstToken(
			{id: tokenId, status: OstToken.STATUS.CREATED}
		);
		return token.commit();
	}

	getStoreName() {
		return STORES.OST_TOKEN;
	}
}
export default OstToken;
