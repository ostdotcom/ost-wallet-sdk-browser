import CodeTesterBase from "./CodeTesterBase";

class SdkGettersPage extends CodeTesterBase {

  addTesterConfigs() {
    const oThis = this;
    oThis.addTestConfig("getToken", "OstWalletSdk.getToken('{{token_id}}')");
    oThis.addTestConfig("getUser", "OstWalletSdk.getUser('{{user_id}}')");
    oThis.addTestConfig("getDevice", "OstWalletSdk.getDevice('{{user_id}}')");
    oThis.addTestConfig("getActiveSessions", "OstWalletSdk.getActiveSessions('{{user_id}}')");
  }

  getUser() {
    const oThis = this;
    const ostUserId = oThis.currentUser.user_id;
    return OstWalletSdk.getUser(ostUserId);
  }

  getToken() {
    const oThis = this;
    const tokenId = oThis.currentUser.token_id;
    return OstWalletSdk.getToken( tokenId );
  }

  getDevice() {
    const oThis = this;
    const ostUserId = oThis.currentUser.user_id;
    return OstWalletSdk.getDevice(ostUserId);
  }

  getActiveSessions() {
    const oThis = this;
    const ostUserId = oThis.currentUser.user_id;
    return OstWalletSdk.getActiveSessions(ostUserId);
  }
}

export default new SdkGettersPage();
