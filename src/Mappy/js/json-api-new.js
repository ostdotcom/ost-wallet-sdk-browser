import CodeTesterBase from "./CodeTesterBase";


/**
 * Note for devs: user_id is mandatory param as it is needed to sign the api requests.
 */
class JsonApiPage extends CodeTesterBase {

  addTesterConfigs() {
    const oThis = this;

    // User-Id Dependent Api Calls.
    oThis.addTestConfig("getUser", "OstJsonApi.getUser('{{user_id}}')");
    oThis.addTestConfig("getBalance", "OstJsonApi.getBalance('{{user_id}}')");
    oThis.addTestConfig("getBalanceWithPricePoint", "OstJsonApi.getBalanceWithPricePoint('{{user_id}}')");
    oThis.addTestConfig("getCurrentDevice", "OstJsonApi.getCurrentDevice('{{user_id}}')");
    oThis.addTestConfig("getTransactions", "OstJsonApi.getTransactions('{{user_id}}')");
    oThis.addTestConfig("getToken", "OstJsonApi.getToken('{{user_id}}')");
    oThis.addTestConfig("getRules", "OstJsonApi.getRules('{{user_id}}')");
    oThis.addTestConfig("getPricePoint", "OstJsonApi.getPricePoint('{{user_id}}')");
    //oThis.addTestConfig("getPendingRecovery", "OstJsonApi.getPendingRecovery('{{user_id}}')");
    oThis.addTestConfig("getDeviceList", "OstJsonApi.getDeviceList('{{user_id}}')");
    oThis.addTestConfig("getTokenHolder", "OstJsonApi.getTokenHolder('{{user_id}}')");
  }

  getToken() {
    const oThis = this;
    const ostUserId = oThis.currentUser.user_id;
    return OstJsonApi.getToken( ostUserId );
  }

  getRules() {
    const oThis = this;
    const ostUserId = oThis.currentUser.user_id;
    return OstJsonApi.getRules( ostUserId );
  }

  getPricePoint() {
    const oThis = this;
    const ostUserId = oThis.currentUser.user_id;
    return OstJsonApi.getPricePoint( ostUserId );
  }

  getUser() {
    const oThis = this;
    const ostUserId = oThis.currentUser.user_id;
    return OstJsonApi.getUser(ostUserId);
  }

  getCurrentDevice() {
    const oThis = this;
    const ostUserId = oThis.currentUser.user_id;
    return OstJsonApi.getCurrentDevice(ostUserId);
  }

  getBalance() {
    const oThis = this;
    const ostUserId = oThis.currentUser.user_id;
    return OstJsonApi.getBalance(ostUserId);
  }

  getBalanceWithPricePoint() {
    const oThis = this;
    const ostUserId = oThis.currentUser.user_id;
    return OstJsonApi.getBalanceWithPricePoint(ostUserId);
  }

  getTransactions() {
    const oThis = this;
    const ostUserId = oThis.currentUser.user_id;
    return OstJsonApi.getTransactions(ostUserId);
  }

  getPendingRecovery() {
    const oThis = this;
    const ostUserId = oThis.currentUser.user_id;
    return OstJsonApi.getPendingRecovery(ostUserId);
  }

  getDeviceList() {
    const oThis = this;
    const ostUserId = oThis.currentUser.user_id;
    return OstJsonApi.getDeviceList(ostUserId);
  }

  getTokenHolder(){
    const oThis = this;
    const ostUserId = oThis.currentUser.user_id;
    return OstJsonApi.getTokenHolder(ostUserId);
  }
}

export default new JsonApiPage();
