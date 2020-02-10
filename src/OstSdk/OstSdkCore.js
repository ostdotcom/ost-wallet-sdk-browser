import {SOURCE} from '../common-js/OstBrowserMessenger'
import OstURLHelpers from '../common-js/OstHelpers/OstUrlHelper'
import OstError from "../common-js/OstError";
import OstBaseSdk from '../common-js/OstBaseSdk';
import OstSdkAssist from './OstSdkAssist'
import OstMessage from '../common-js/OstMessage'

const LOG_TAG = "OstSdk :: index :: ";

class OstSdk extends OstBaseSdk {
  constructor(window, origin, pathname, ancestorOrigins, searchParams){
    super(window, origin, pathname, ancestorOrigins, searchParams);
    this.defineImmutableProperty

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
}

export default OstSdk;
