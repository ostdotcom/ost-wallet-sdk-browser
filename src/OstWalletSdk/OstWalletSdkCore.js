import OstBaseSdk from '../common-js/OstBaseSdk'
import OstSetupDevice from "./OstWorkflows/OstSetupDevice";
import OstCreateSession from "./OstWorkflows/OstCreateSession";
import OstSdkProxy from './OstSdkProxy'
import OstJsonApiProxy from "./OstJsonApiProxy";
import OstExecuteTransaction from "./OstWorkflows/OstExecuteTransaction";
import EC from "../common-js/OstErrorCodes";
import {OstWorkflowEvents} from "./OstWorkflows/OstWorkflowEvents"
import OstWorkflowEmitter from "./OstWorkflows/OstWorkflowEmitter"
import packageJson from "../../package.json";
import './sdk-stylesheet.css';
import OstTransactionHelper from "./OstTransactionHelper";

const DEFAULT_SDK_IFRAME_ORIGIN = "ostwalletsdk.com";

class OstWalletSdkCore extends OstBaseSdk {
  constructor( window, parentOrigin ) {
    super(window, parentOrigin);
    this.sdkEndpoint = null;
  }

  setSdkConfig(...args) {
    const oThis = this;
    return super.setSdkConfig(...args)
      .then((sdkConfig) => {
        oThis.setSdkEndpoint( sdkConfig );
        return sdkConfig;
      })
  }

  getSdkMainDomain() {
    if ( typeof WP_OST_BROWSER_SDK_MAIN_DOMAIN === 'string' && WP_OST_BROWSER_SDK_MAIN_DOMAIN ) {
      return WP_OST_BROWSER_SDK_MAIN_DOMAIN;
    }
    return DEFAULT_SDK_IFRAME_ORIGIN;
  }

  getSdkVersion() {
    if ( typeof WP_OST_BROWSER_SDK_VERSION === 'string') {
      //Note - during dev, version is empty string.
      //Hence not checking it's length.
      return WP_OST_BROWSER_SDK_VERSION;
    }
    return `v-${packageJson.version}`;
  }

  setSdkEndpoint( sdkConfig ) {
    const oThis = this;

    const sdkMainDomain = oThis.getSdkMainDomain();
    const sdkVersion    = oThis.getSdkVersion();
    let sdkVersionPart = "";
    if ( sdkVersion ) {
      sdkVersionPart = `/${sdkVersion}`;
    }

    let sdkEndpoint = `https://sdk-${sdkConfig.environment}-${sdkConfig.token_id}.${sdkMainDomain}${sdkVersionPart}/index.html`;
    this.defineImmutableProperty("sdkEndpoint", sdkEndpoint);
  }

  getDownstreamEndpoint() {
    return this.sdkEndpoint;
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
        oThis.defineImmutableProperty("proxy", proxy);

        const jsonApiProxy = new OstJsonApiProxy(this.browserMessenger);
        oThis.defineImmutableProperty("jsonApiProxy", jsonApiProxy);

        const workflowEvents = new OstWorkflowEvents();
        oThis.defineImmutableProperty("workflowEvents", workflowEvents);

        const txHelper = new OstTransactionHelper(this.browserMessenger);
        oThis.defineImmutableProperty("transactionHelper", txHelper);

        return Promise.resolve();
      });
  }

  createAssist() {
    // I am my own assistor.
    this.browserMessenger.subscribe(this, this.getReceiverName());

		const ostWorkflowEmitter = new OstWorkflowEmitter(this.workflowEvents);
		this.browserMessenger.subscribe(ostWorkflowEmitter, ostWorkflowEmitter.getReceiverName());

		return Promise.resolve( true );
  }

  //region - Workflows.
  setupDevice ( userId, tokenId, ostWorkflowDelegate) {
    let setupDevice = new OstSetupDevice(userId, tokenId, ostWorkflowDelegate, this.browserMessenger, this.workflowEvents);
    let workflowId = setupDevice.perform();

    return workflowId;
  }

  createSession ( userId, expirationTime, spendingLimit, ostWorkflowDelegate) {
    let createSession = new OstCreateSession(userId, expirationTime, spendingLimit, ostWorkflowDelegate, this.browserMessenger, this.workflowEvents);
    let workflowId = createSession.perform();

    return workflowId;
  }

  executeTransaction(userId, transactionData, ostWorkflowDelegate) {
    let transaction = new OstExecuteTransaction(userId,
      transactionData,
      ostWorkflowDelegate,
      this.browserMessenger, this.workflowEvents);
    let workfowId = transaction.perform();

    return workfowId;
  }

  executePayTransaction(userId, transactionData, ostWorkflowDelegate) {
    transactionData.rule_name = 'pricer';
    transactionData.rule_method = 'pay';
    transactionData.meta = transactionData.meta || {};
    transactionData.options = transactionData.options || {};
    return this.executeTransaction(userId, transactionData, ostWorkflowDelegate);
  }

  executeDirectTransfer(userId, transactionData, ostWorkflowDelegate) {
    transactionData.rule_name = 'Direct Transfer';
    transactionData.rule_method = 'directTransfers';
    transactionData.meta = transactionData.meta || {};
    transactionData.options = transactionData.options || {};
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
