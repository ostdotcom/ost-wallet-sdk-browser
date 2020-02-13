import OstError from "../common-js/OstError";
import OstBaseSdk from '../common-js/OstBaseSdk'
import OstSetupDevice from "./OstWorkflows/OstSetupDevice";
import OstCreateSession from "./OstWorkflows/OstCreateSession";
import OstSdkProxy from './OstSdkProxy'
import OstJsonApiProxy from "./OstJsonApiProxy";
import OstExecuteTransaction from "./OstWorkflows/OstExecuteTransaction";
import EC from "../common-js/OstErrorCodes";

class OstWalletSdkCore extends OstBaseSdk {
  constructor( window ) {
    super(window);
  }

  getDownstreamEndpoint() {
    return this.sdkConfig.sdk_endpoint;
  }

  getReceiverName() {
    return 'OstWalletSdk';
  }

  getDownstreamInitializationTimeout() {
    return 15000;
  }

  hasUpstream() {
    return false;
  }

  onBrowserMessengerCreated( browserMessenger ) {
    const oThis = this;

    return super.onBrowserMessengerCreated() 
      .then( () => {
        const proxy = new OstSdkProxy(this.browserMessenger);
        const jsonApiProxy = new OstJsonApiProxy(this.browserMessenger);
        oThis.defineImmutableProperty("proxy", proxy);
        oThis.defineImmutableProperty("jsonApiProxy", jsonApiProxy);
        return Promise.resolve();
      });
  }

  createAssist() {
    // I am my own assistor.
    this.browserMessenger.subscribe(this, this.getReceiverName());
    return Promise.resolve( true );
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


  //region - Actions
  deleteLocalSessions( userId ) {
    return this.proxy.deleteLocalSessions(userId)
  }

  destroySelf() {
    throw new OstError('ows_owsc_ds_1', EC.SKD_INTERNAL_ERROR);
  }
}

export default OstWalletSdkCore;