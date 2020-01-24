import OstBaseEntity from "./OstBaseEntity";
import OstDevice from "./OstDevice";
import OstKeyManager from "../OstKeyManagerProxy";

const LOG_TAG = "OstUser";
class OstUser extends OstBaseEntity {
	constructor(jsonObject) {
		super(jsonObject);
		this.currentDeviceAddress = null;
	}

	static init(userId, tokenId) {
		return new OstUser(
			{id: userId, token_id: tokenId}
			);
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

	createDevice() {

	}
}
export default OstUser;
