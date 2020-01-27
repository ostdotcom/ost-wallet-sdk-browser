import {OstBaseEntity, STORES} from "./OstBaseEntity";

const LOG_TAG = "OstDevice";

class OstDevice extends OstBaseEntity {
  constructor(jsonObject) {
    super(jsonObject);
  }

	static getById(deviceId) {
		const device = new OstDevice(
			{id: deviceId}
		);
		return device.sync();
	}

	static init(id, apiAddress, userId) {
		const device = new OstDevice(
			{id: id, api_key_address: apiAddress, user_id: userId}
		);
		return device.commit();
	}

	getStoreName() {
		return STORES.OST_DEVICE;
	}

  getApiKeyAddress() {
		return this.getData().api_key_address;
  }

  getDeviceAddress() {
		return this.getData().device_address;
  }

  //Status Checks
  isStatusRevoked() {
    //todo: check whether device status 'REVOKED'
    return true
  }

  isStatusCreated() {
	//todo: check whether device status 'CREATED'
	return true;
  }
}

export default OstDevice;
