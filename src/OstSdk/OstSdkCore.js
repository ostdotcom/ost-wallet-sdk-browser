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
    this.ostSdkAssist.onSetupComplete = function (args) {
      console.log(LOG_TAG,"createOstSdkAssist :: onSetupComplete", args);
      oThis.onSetupComplete(args)
    }
  }

  perform() {
    return  super.perform()
      .then(() => {
        return this.setUpstreamPublicKey();
      })
      .then(() => {
        return this.verifyIframeInitData();
      })
      .then((isVerified) => {
        if (!isVerified) {
          throw new OstError('os_i_p_1', 'INVALID_VERIFIER');
        }
        this.createOstSdkAssist();
        this.sendPublicKey();
      })
      .catch((err) => {
        console.error("err", err);

        this.browserMessenger.removeUpstreamPublicKey();

        if (err instanceof OstError) {
          throw err;
        }
        throw new OstError('os_i_p_1', 'SKD_INTERNAL_ERROR', err);
      });
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
      // Inform Upstream
      .then( () => {
        return oThis.triggerDownstreamInitialzed();
      })
  }

  getUpstreamReceiverName() {
    return "OstWalletSdk";
  }
}

export default OstSdk;
