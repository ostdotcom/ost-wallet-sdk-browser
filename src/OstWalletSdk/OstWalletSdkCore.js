import OstHelpers from "../common-js/OstHelpers";
import OstURLHelpers from '../common-js/OstHelpers/OstUrlHelper'
import OstError from "../common-js/OstError";
import OstBaseSdk from '../common-js/OstBaseSdk'
import OstSetupDevice from "./OstWorkflows/OstSetupDevice";
import OstCreateSession from "./OstWorkflows/OstCreateSession";
import OstSdkProxy from './OstSdkProxy'
import OstJsonApiProxy from "./OstJsonApiProxy";
import OstExecuteTransaction from "./OstWorkflows/OstExecuteTransaction";

class OstWalletSdkCore extends OstBaseSdk {
  constructor( window ) {
    super();
    this._window = window;
  }

  getDownstreamEndpoint() {
    return this.sdkConfig.sdk_endpoint;
  }

  getReceiverName() {
    return 'OstWalletSdk';
  }

  onBrowserMessengerCreated( browserMessenger ) {
    const oThis = this;
    const proxy = new OstSdkProxy(this.browserMessenger);
    const jsonApiProxy = new OstJsonApiProxy(this.browserMessenger);
    oThis.defineImmutableProperty("proxy", proxy);
    oThis.defineImmutableProperty("jsonApiProxy", jsonApiProxy);
    return Promise.resolve();
  }


  //TODO: Task for Rachin - Figure it out.
  waitForDownstreamInitialization() {
    return Promise.resolve(true);
  }

  //region - Workflows.
  setupDevice ( userId, tokenId, ostWorkflowDelegate) {
    let setupDevice = new OstSetupDevice(userId, tokenId, ostWorkflowDelegate, this.browserMessenger);
    let workflowId = setupDevice.perform();

    return workflowId;
  }

  createSession ( userId, expirationTime, spendingLimit, ostWorkflowDelegate) {
    let createSession = new OstCreateSession(userId, expirationTime, spendingLimit, ostWorkflowDelegate, this.browserMessenger);
    let workflowId = createSession.perform();

    return workflowId;
  }

  executeTransaction(userId, transactionData, ostWorkflowDelegate) {
    let transaction = new OstExecuteTransaction(userId,
      transactionData,
      ostWorkflowDelegate,
      this.browserMessenger);
    let workfowId = transaction.perform();

    return workfowId;
  }

  executePayTransaction(userId, transactionData, ostWorkflowDelegate) {
    transactionData.rule_name = 'pricer';
    transactionData.rule_method = 'pay';
    transactionData.meta = {};
    transactionData.options = {};
    return this.executeTransaction(userId, transactionData, ostWorkflowDelegate);
  }

  executeDirectTransferTransaction(userId, transactionData, ostWorkflowDelegate) {
    transactionData.rule_name = 'Direct Transfer';
    transactionData.rule_method = 'directTransfers';
    transactionData.meta = {};
    transactionData.options = {};
    return this.executeTransaction(userId, transactionData, ostWorkflowDelegate);
  }
  //endregion
  
  //region - getter methods
  getUser( userId ) {
    return this.proxy.getUser( userId );
  }

  getToken( userId ) {
    return this.proxy.getToken( userId );
  }

  getDevice( userId ) {
    return this.proxy.getDevice(userId);
  }

  getActiveSessions( userId, spendingLimit = '' ) {
    return this.proxy.getActiveSessions(userId, spendingLimit);
  }
  //endregion

  //region - JSON Api calls
  getCurrentDeviceFromServer( userId ) {
    return this.jsonApiProxy.getCurrentDeviceFromServer(userId);
  }

  getBalanceFromServer( userId ) {
    return this.jsonApiProxy.getBalanceFromServer(userId);
  }

  getPricePointFromServer( userId ) {
    return this.jsonApiProxy.getPricePointFromServer(userId);
  }

  getBalanceWithPricePointFromServer( userId ) {
    return this.jsonApiProxy.getBalanceWithPricePointFromServer(userId);
  }

  getPendingRecoveryFromServer( userId ) {
    return this.jsonApiProxy.getPendingRecoveryFromServer(userId);
  }

  getUserFromServer( userId ) {
    return this.jsonApiProxy.getUserFromServer(userId);
  }

  getTokenFromServer( userId ) {
    return this.jsonApiProxy.getTokenFromServer(userId);
  }

  getTransactionsFromServer( userId ) {
    return this.jsonApiProxy.getTransactionsFromServer(userId);
  }

  getTokenHolderFromServer( userId ) {
    return this.jsonApiProxy.getTokenHolderFromServer(userId);
  }

  getRulesFromServer ( userId ) {
    return this.jsonApiProxy.getRulesFromServer(userId);
  }
  //endregion

}

export default OstWalletSdkCore;