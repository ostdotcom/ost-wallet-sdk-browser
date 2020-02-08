import CodeTesterBase from "./CodeTesterBase";

class JsonApiPage extends CodeTesterBase {

  addTesterConfigs() {
    const oThis = this;

    // User-Id Dependent Api Calls.
    oThis.addTestConfig("getUser", "OstJsonApi.getUser('{{user_id}}')");
    oThis.addTestConfig("getBalance", "OstJsonApi.getBalance('{{user_id}}')");
    oThis.addTestConfig("getBalanceWithPricePoint", "OstJsonApi.getBalanceWithPricePoint('{{user_id}}')");
    oThis.addTestConfig("getCurrentDevice", "OstJsonApi.getCurrentDevice('{{user_id}}')");
    oThis.addTestConfig("getTransactions", "OstJsonApi.getTransactions('{{user_id}}')");
    
    // Token-Id Dependent Api Calls.
    // NOTE FOR DEV: The fix is NOT sending user_id. 
    // The fix is to fix the OstJsonApi method to accept token_id.
    oThis.addTestConfig("getToken", "OstJsonApi.getToken('{{token_id}}')");
    oThis.addTestConfig("getRules", "OstJsonApi.getRules('{{token_id}}')");
    oThis.addTestConfig("getPricePoint", "OstJsonApi.getPricePoint('{{token_id}}')");
  }

  getToken() {
    // NOTE FOR DEV: The fix is NOT sending user_id. 
    // The fix is to fix the OstJsonApi method to accept token_id.
    const oThis = this;
    const tokenId = oThis.currentUser.token_id;
    return OstJsonApi.getToken( tokenId );
  }

  getRules() {
    // NOTE FOR DEV: The fix is NOT sending user_id. 
    // The fix is to fix the OstJsonApi method to accept token_id.
    const oThis = this;
    const tokenId = oThis.currentUser.token_id;
    return OstJsonApi.getRules( tokenId );
  }

  getPricePoint() {
    // NOTE FOR DEV: The fix is NOT sending user_id. 
    // The fix is to fix the OstJsonApi method to accept token_id.
    const oThis = this;
    const tokenId = oThis.currentUser.token_id;
    return OstJsonApi.getPricePoint( tokenId );
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
}

export default new JsonApiPage();