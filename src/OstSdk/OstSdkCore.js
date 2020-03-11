import {SOURCE} from '../common-js/OstBrowserMessenger'
import OstBaseSdk from '../common-js/OstBaseSdk';
import OstSdkAssist from './OstSdkAssist'
import OstMessage from '../common-js/OstMessage'
import {OstBaseEntity} from "./entities/OstBaseEntity";
import OstApiClient from "./api/OstApiClient";
import OstError from "../common-js/OstError";
import EC from '../common-js/OstErrorCodes';
import OstWorkflowContext from "./workflows/OstWorkflowContext";
import OstSessionPolling from "./OstPolling/OstSessionPolling";
import OstSession from "./entities/OstSession";
import OstConstants from "./OstConstants";

const LOG_TAG = "OstSdk :: index :: ";

class OstSdk extends OstBaseSdk {
  constructor(window, parentOrigin){
    super(window, parentOrigin);
    this.ostSdkAssist = null
  }

  createOstSdkAssist () {
    let oThis = this;
    this.ostSdkAssist = new OstSdkAssist(this.browserMessenger, this.getReceiverName());
    console.log(LOG_TAG, "ostSdkAssist created");
    this.ostSdkAssist.onSetupComplete = function (args) {
      console.log(LOG_TAG,"createOstSdkAssist :: onSetupComplete", args);
      oThis.onSetupComplete(args)
    }
  }

  createAssist() {
    const oThis = this;
    return oThis.createOstSdkAssist();
  }

  initDBInstance() {
    return OstBaseEntity.initInstance();
  }

  getReceiverName() {
    return 'OstSdk';
  }

  sendPublicKey() {
    const oThis = this;
    console.log("sending OstSdk public key");

    let ostMessage = new OstMessage();
    ostMessage.setFunctionName( "onSetupComplete" );
    ostMessage.setReceiverName( oThis.getUpstreamReceiverName() );
    ostMessage.setArgs({
      publicKeyHex: oThis.browserMessenger.getPublicKeyHex()
    });

    return oThis.browserMessenger.sendMessage(ostMessage, SOURCE.UPSTREAM);
  }

  onSetupComplete (args) {
    const oThis = this;
    return super.onSetupComplete(args)
      // Inform self.
      .then(() => {
        oThis.onDownstreamInitialzed(args);
        return true;
      })
  }

  getUpstreamReceiverName() {
    return "OstWalletSdk";
  }

  getDownstreamEndpoint() {
    const oThis = this;
    const selfOrigin = oThis.origin;
    const kmOrigin = selfOrigin.replace("https://sdk-", "https://km-");
    const kmEndpoint = kmOrigin + oThis.pathname;
    console.log("kmEndpoint", kmEndpoint);
    return kmEndpoint;
  }

	verifyIframeInitData(...args) {
		const oThis = this
		;
		return super.verifyIframeInitData(...args)
			.then((verified) => {
				if (!verified) {
					return verified;
				}
				return oThis.isWhiteListedParent();
			})
	}

	isWhiteListedParent() {
    console.log("||RAC|| isWhiteListedParent called!");
      const oThis = this
        , parentOrigin = oThis.ancestorOrigins[0]
        , token_id = oThis.sdkConfig.token_id
        , apiEndPoint = oThis.sdkConfig.api_endpoint
      ;

      return new OstApiClient('').validateDomain(token_id, parentOrigin)
        .then((res) => {
          if (res) {
            return res;
          }

          throw new OstError('os_osc_iwlp_1', EC.INVALID_UPSTREAM_ORIGIN);
        })
  }

  init(...args) {
    return super.init(...args)
      .then((val) => {
				OstSessionPolling.setCreateSessionQRTimeout( this.sdkConfig.create_session_qr_timeout );
				OstSession.setCreateSessionTimeout( this.sdkConfig.create_session_qr_timeout );
				OstWorkflowContext.setMaxWorkflowRetentionCount( this.sdkConfig.max_workflow_retention_count );
				return val;
      });
  }

  setSdkConfig(...args) {
    console.log("||RAC|| setSdkConfig called!");
    return super.setSdkConfig(...args)
      .then((sdkConfig) => {
        console.log("||RAC|| setSdkConfig.then called!");
        OstConstants.setApiEnvironment( sdkConfig.environment );
        return sdkConfig;
      })
  }
  //sdkConfig.api_endpoint);
}

export default OstSdk;
