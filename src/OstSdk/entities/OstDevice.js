import {OstBaseEntity, STORES} from "./OstBaseEntity";

const LOG_TAG = "OstDevice";

class OstDevice extends OstBaseEntity {
  constructor(jsonObject) {
    super(jsonObject);
    this.currentDeviceAddress = null;
  }

	static getById(deviceId) {
		const device = new OstDevice(
			{id: deviceId}
		);
		return device.sync();
	}

	static init(id, userId) {
		const device = new OstDevice(
			{id: id, user_id: userId}
		);
		return device.commit();
	}

	getStoreName() {
		return STORES.OST_DEVICE;
	}

  getApiSignerAddress() {

  }

  getDeviceAddress() {

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
