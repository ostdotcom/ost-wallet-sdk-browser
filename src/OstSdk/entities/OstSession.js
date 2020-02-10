import {OstBaseEntity, STORES} from "./OstBaseEntity";
import OstDevice from "./OstDevice";
import BigNumber from "bignumber.js/bignumber";

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
    const ostSession = new OstSession({address: 'DummyInstance'});
    return ostSession.getAll();
  }

  static getActiveSessions(userId) {
    if (!userId) {
      return [];
    }

    let _resolve;

    OstSession.getAllSessions()
      .then((sessionArray) => {
        if (!sessionArray) sessionArray = [];

        let filterSessions = sessionArray.filter(function (x) {
          return x.user_id === userId
            && x.status === 'AUTHORIZED'
        });

        _resolve(filterSessions)
      })
      .catch(() => {
        _resolve([])
      });

      return new Promise((resolve) => {
        _resolve = resolve;
      });
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

  static deleteById(address) {
    const session = new OstSession(
      {address: address}
    );
    return session.deleteData();
  }

  static deleteAllSessions(userId) {
    let _resolve;

    OstSession.getActiveSessions(userId)
      .then((sessions) => {
        if (!sessions) {sessions = []}
        let promiseArray = [];
        let sessionIds = [];
        let promiseList = [];
        sessions.forEach((session) => {
          sessionIds.push(session.id);
        });

        sessionIds.forEach((address) => {
          promiseList.push(OstSession.deleteById(address))
        });

        return Promise.all(promiseList)
      })
      .then(() => {
        _resolve()
      })
      .catch((err) => {
        _resolve()
      });

    return new Promise((resolve) => {
      _resolve = resolve
    })
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

  addNonce() {
    this.data.nonce = parseInt(this.data.nonce) + 1;
		return this.forceCommit();
  }

	subNonce() {
		this.data.nonce = parseInt(this.data.nonce) - 1;
		return this.forceCommit();
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
