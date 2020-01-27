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
