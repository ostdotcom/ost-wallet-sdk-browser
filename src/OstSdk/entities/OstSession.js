import {OstBaseEntity, STORES} from "./OstBaseEntity";
import BigNumber from 'bignumber.js';
import OstError from '../../common-js/OstError';

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

  getType() {
    return 'session';
  }


  static init(userId, address, spendingLimit, expiryTime) {
    const session = new OstSession(
      {user_id: userId, address: address, spending_limit: spendingLimit || 0, expiration_height: expiryTime || 0, status: OstSession.STATUS.CREATED}
    );
    return session.forceCommit();
  }

  static getAllSessions() {
    const ostSession = new OstSession({address: 'DummyInstance'});
    return ostSession.getAll();
  }

  static getActiveSessions(userId, minSpendingLimitInLowerUnit = 0) {
    if (!userId) {
      return Promise.resolve([]);
    }

    let minSpendingLimit = new BigNumber( minSpendingLimitInLowerUnit );
    let minBufferTime = 5 * 60 * 1000; //5 minutes
    let minExpirationTimeInMiliSeconds = Date.now() + minBufferTime;

    return OstSession.getAllSessions()
      .then((sessionArray) => {
        if (!sessionArray) sessionArray = [];

        let filterSessions = sessionArray.filter(function (sessionData) {
          // Check userId
          if ( userId !== sessionData.user_id ) {
            return false;
          }

          // Check if session is authorized.
          if ( OstSession.STATUS.AUTHORIZED !== sessionData.status ) {
            return false;
          }

          // Check if session has expired.
          let sessionExpirationTime = sessionData.approx_expiration_timestamp;
          // Convert into miliseconds
          let sessionExpirationTimeInMiliSeconds = sessionExpirationTime * 1000;
          if ( minExpirationTimeInMiliSeconds > sessionExpirationTimeInMiliSeconds ) {
            return false;
          }

          // Check spending limit.
          let sessionSpendingLimit = new BigNumber( sessionData.spending_limit );
          if ( minSpendingLimit.isGreaterThan( sessionSpendingLimit ) ) {
            return false;
          }
          return true;
        })
        return filterSessions;
      })
      .catch((err) => {
        throw OstError.sdkError(err, "ostsdk_ostsession_1");
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
    this.data.updated_timestamp = parseInt(Date.now() / 1000);
		return this.forceCommit();
  }

	subNonce() {
		this.data.nonce = parseInt(this.data.nonce) - 1;
		this.data.updated_timestamp = parseInt(Date.now() / 1000);
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
