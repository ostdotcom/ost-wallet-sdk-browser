import CodeTesterPageBase from "./CodeTesterPageBase";

class SdkGettersPage extends CodeTesterPageBase {
  
  constructor() {
    super("#page-container", "#j-method-template");
  }

  addTesterConfigs() {
    const oThis = this;
    oThis.addTestConfig("getUser", "OstWalletSdk.getUser('{{user_id}}')");
    oThis.addTestConfig("getToken", "OstWalletSdk.getToken('{{token_id}}')");
    oThis.addTestConfig("getDevice", "OstWalletSdk.getDevice('{{user_id}}')");
    oThis.addTestConfig("getActiveSessions", "OstWalletSdk.getActiveSessions('{{user_id}}')");
    oThis.addTestConfig("getWorkflowInfo", "OstWalletSdk.getWorkflowInfo('{{user_id}}', '{{setup_device_workflow_id}}')");
    oThis.addTestConfig("getPendingWorkflows", "OstWalletSdk.getPendingWorkflows('{{user_id}}')");
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

  getWorkflowInfo() {
    const oThis = this;
    const ostUserId = oThis.currentUser.user_id;
    const setupDeviceWorkflowId = oThis.currentUser.setup_device_workflow_id;
    return OstWalletSdk.getWorkflowInfo(ostUserId, setupDeviceWorkflowId);
  }

  getPendingWorkflows() {
    const oThis = this;
    const ostUserId = oThis.currentUser.user_id;
    return OstWalletSdk.getPendingWorkflows(ostUserId);
  }


}

export default new SdkGettersPage();
