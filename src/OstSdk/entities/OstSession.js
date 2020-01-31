import {OstBaseEntity, STORES} from "./OstBaseEntity";
import OstDevice from "./OstDevice";

class OstSession extends OstBaseEntity {

  static STATUS = {
    CREATED: 'CREATED',
    AUTHORIZED: 'AUTHORIZED',
    REVOKED: 'REVOKED',
  };

  constructor(jsonObject) {
    super(jsonObject)
  }

  getIdKey() {
    return 'address';
  }

  static init(userId, address, spendingLimit, expiryTime) {
    const session = new OstSession(
      {user_id: userId, address: address, spending_limit: spendingLimit || 0, expiration_height: expiryTime || 0, status: OstSession.STATUS.AUTHORIZED}
    );
    return session.forceCommit();
  }

  static getAllSessions() {
    const ostSession = new OstSession({address: 'DummyInstace'});
    return ostSession.getAll();
  }

  static getById(address) {
    const session = new OstSession(
      {address: address}
    );
    return session.sync();
  }

  static parse(data) {
    const session = new OstSession(data);
    return session.forceCommit();
  }

  getStoreName() {
    return STORES.OST_SESSION;
  }

  getSpendingLimit() {
    return this.getData().spending_limit;
  }

  getExpiryTime() {
  	return this.getData().expiration_height;
  }

  getNonce() {
    return this.getData().nonce;
  }
  //Status
  isStatusAuthorized() {
    return OstSession.STATUS.AUTHORIZED === this.getStatus()
  }
}
export default OstSession;
