import {OstBaseEntity, STORES} from "./OstBaseEntity";
import OstDevice from "./OstDevice";
import OstKeyManager from "../OstKeyManagerProxy";

const LOG_TAG = "OstUser";
class OstUser extends OstBaseEntity {
	constructor(jsonObject) {
		super(jsonObject);
		this.currentDeviceAddress = null;
	}

	static init(userId, tokenId) {
		const user = new OstUser(
			{id: userId, token_id: tokenId}
			);
		return user.commit();
	}

	getCurrentDevice() {
		let currentDevice = null;
		if (!this.currentDeviceAddress) {
			return Promise.resolve(null);
		}
		console.debug(LOG_TAG, String.format("currentDeviceAddress: %s", this.currentDeviceAddress));
		return OstDevice.getById(this.currentDeviceAddress);
	}

	getStoreName() {
		return STORES.OST_USER;
	}

	createDevice() {

	}
}
export default OstUser;
