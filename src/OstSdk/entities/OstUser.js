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
		if (null == this.currentDeviceAddress) {
			const ostKeyManager = new OstKeyManager(this.getId());
			this.currentDeviceAddress = ostKeyManager.getDeviceAddress();
			if (null == this.currentDeviceAddress) {
				console.error(LOG_TAG, "Current Device address is null, seems like device has been revoked");
				return null;
			}
		}
		console.debug(LOG_TAG, String.format("currentDeviceAddress: %s", this.currentDeviceAddress));
		currentDevice = OstDevice.getById(this.currentDeviceAddress);
		return currentDevice;
	}

	getStoreName() {
		return STORES.OST_USER;
	}

	createDevice() {

	}
}
export default OstUser;
