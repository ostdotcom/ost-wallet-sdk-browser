import {OstBaseEntity, STORES} from "./OstBaseEntity";
import OstDevice from "./OstDevice";
import OstError from "../../common-js/OstError";

const LOG_TAG = "OstUser";
class OstUser extends OstBaseEntity {

  static STATUS = {
    CREATED: 'CREATED',
    ACTIVATING: 'ACTIVATING',
    ACTIVATED: 'ACTIVATED',
  };

  constructor(jsonObject) {
    super(jsonObject);
    this.currentDeviceAddress = null;
  }

  static init(userId, tokenId) {
    const user = new OstUser(
      {id: userId, token_id: tokenId, status: OstUser.STATUS.CREATED}
    );
    return user.commit();
  }

  static getById(userId) {
    const user = new OstUser(
      {id: userId}
    );
    return user.sync();
  }

  getTokenId() {
    return this.getData().token_id;
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

  createOrGetDevice(keyManagerProxy) {
    let oThis = this;

    return keyManagerProxy.getDeviceAddress()
      .then((deviceAddress) => {
        oThis.currentDeviceAddress = deviceAddress;
        return keyManagerProxy.getApiKeyAddress()
      })
      .then((apiKeyAddress)=> {
        oThis.apiKeyAddress = apiKeyAddress;
        return oThis.storeDeviceEntity()
      })
      .catch((err) => {
        throw OstError.sdkError(err, 'os_w_ossd_cd_1')
      })
  }

  storeDeviceEntity() {
    return OstDevice.getById(this.currentDeviceAddress)
      .then((deviceEntity) => {
        if (!deviceEntity) {
          return OstDevice.init(this.currentDeviceAddress, this.apiKeyAddress, this.userId);
        }
        return deviceEntity;
      });
  }

  //status
  isStatusActivated() {
    return OstUser.status.ACTIVATED === this.getStatus();
  }

  isStatusActivating() {
  	return OstUser.status.ACTIVATING === this.getStatus();
  }

}
export default OstUser;
