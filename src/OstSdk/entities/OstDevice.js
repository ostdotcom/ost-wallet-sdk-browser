import OstBaseEntity from "./OstBaseEntity";
import OstKeyManager from "../OstKeyManagerProxy";

const LOG_TAG = "OstDevice";
class OstDevice extends OstBaseEntity {
	constructor(jsonObject) {
		super(jsonObject);
		this.currentDeviceAddress = null;
	}

	static init(userId, tokenId) {
		return new OstDevice(
			{id: userId, token_id: tokenId}
			);
	}

	getApiSignerAddress() {

	}
}
export default OstDevice;
