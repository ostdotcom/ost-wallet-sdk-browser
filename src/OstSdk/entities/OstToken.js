import {OstBaseEntity, STORES} from "./OstBaseEntity";

class OstToken extends OstBaseEntity {
	constructor(jsonObject) {
		super(jsonObject)
	}

	static init(tokenId) {
		const token = new OstToken(
			{id: tokenId}
		);
		return token.commit();
	}

	getStoreName() {
		return STORES.OST_TOKEN;
	}
}
export default OstToken;
