import {OstBaseEntity, STORES} from "./OstBaseEntity";

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

  static init(address, spendingLimit, expiryTime) {
    const token = new OstSession(
      {address: address, spending_limit: spendingLimit || 0, expiry_time: expiryTime || 0, status: OstSession.STATUS.CREATED}
    );
    return token.forceCommit();
  }

  static parse(data) {
    const ostToken = new OstSession(data);
    return ostToken.forceCommit();
  }

  getStoreName() {
    return STORES.OST_SESSION;
  }

  getSpendingLimit() {
    return this.getData().spending_limit;
  }

  getExpiryTime() {
  	return this.getData().expiry_time;
  }
}
export default OstSession;
