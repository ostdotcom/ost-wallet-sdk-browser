import {OstBaseEntity, STORES} from "./OstBaseEntity";

const LOG_TAG = "OstDevice";

class OstDevice extends OstBaseEntity {

  static STATUS = {
    CREATED: 'CREATED',
    REGISTERED: 'REGISTERED',
    AUTHORIZED: 'AUTHORIZED',
    REVOKED: 'REVOKED',
    AUTHORIZING: 'AUTHORIZING',
    REVOKING : 'REVOKING',
    RECOVERING: 'RECOVERING'

  };

  constructor(jsonObject) {
    super(jsonObject);
  }

	getIdKey() {
		return 'address';
	}

  static getById(deviceId) {
    const device = new OstDevice(
      {address: deviceId}
    );
    return device.sync();
  }

  static init(id, apiAddress, userId) {
    const device = new OstDevice(
      {address: id, api_key_address: apiAddress, user_id: userId, status: OstDevice.STATUS.CREATED}
    );
    return device.forceCommit()
  }

  static parse(data) {
    const ostDevice = new OstDevice(data);
    return ostDevice.forceCommit();
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
    return OstDevice.STATUS.REVOKED === this.getStatus();
  }

  isStatusCreated() {
    return OstDevice.STATUS.CREATED === this.getStatus();
  }

  isStatusAuthorized() {
    return OstDevice.STATUS.AUTHORIZED === this.getStatus();
  }

  isStatusRegistered() {
    return OstDevice.STATUS.REGISTERED === this.getStatus();
  }

  isStatusAuthorizing() {
    return OstDevice.STATUS.AUTHORIZING === this.getStatus();
  }

  isStatusRecovering() {
    return OstDevice.STATUS.RECOVERING === this.getStatus();
  }

  isStatusRevoking() {
    return OstDevice.STATUS.REVOKING === this.getStatus();
  }


  canMakeApiCall() {
    return this.isStatusAuthorized()
      || this.isStatusRegistered()
      || this.isStatusAuthorizing()
      || this.isStatusRecovering()
      || this.isStatusRevoking()
  }
}

export default OstDevice;
