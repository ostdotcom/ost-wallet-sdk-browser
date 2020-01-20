import OstBaseEntity from "./OstBaseEntity";

class OstToken extends OstBaseEntity {
	constructor(jsonObject) {
		super(jsonObject)
	}

	static init(tokenId) {
		return new OstToken(
			{token_id: tokenId}
			);
	}
}
export default OstToken;
