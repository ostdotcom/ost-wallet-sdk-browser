import {OstBaseEntity, STORES} from "./OstBaseEntity";

const LOG_TAG = "OstDevice";

class OstDevice extends OstBaseEntity {

	static STATUS = {
		CREATED: 'CREATED',
		REGISTERED: 'REGISTERED',
		AUTHORIZED: 'AUTHORIZED',
		REVOKED: 'REVOKED'
	};

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
			{id: id, api_key_address: apiAddress, user_id: userId, status: OstDevice.STATUS.CREATED}
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
		return OstDevice.STATUS.REVOKED == this.getStatus();
  }

  isStatusCreated() {
		return OstDevice.STATUS.CREATED == this.getStatus();
  }
}

export default OstDevice;
