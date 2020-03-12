import OstMessage from "../common-js/OstMessage";
import OstError from "../common-js/OstError";
import OstKeyManagerAssist from "./OstKeyManagerAssist";
import OstBaseSdk from "../common-js/OstBaseSdk";
import {SOURCE} from "../common-js/OstBrowserMessenger";

const LOG_TAG = "OstSdkKeyManager :: ";

class OstSdkKeyManager extends OstBaseSdk {
  constructor(window, parentOrigin){
    super(window, parentOrigin);
    this.ostKeyManagerAssist = null;
  }

  createOstSdkKeyManagerAssist () {
    const oThis = this;

    this.ostKeyManagerAssist = new OstKeyManagerAssist(this.browserMessenger, this.getReceiverName());
    this.ostKeyManagerAssist.onSetupComplete = function (args) {
      console.log(LOG_TAG,"createOstSdkKeyManagerAssist :: onSetupComplete", args);
      oThis.onSetupComplete(args)
    }
  }

  createAssist() {
    const oThis = this;
    return oThis.createOstSdkKeyManagerAssist();
  }

  perform() {
    const oThis = this;
    return super.perform()
      .then(() => {
        return oThis.setUpstreamPublicKey();
      })
      .then(() => {
        return oThis.verifyIframeInitData();
      })
      .then((isVerified) => {
        if (!isVerified) {
          throw new OstError('os_i_p_1', 'INVALID_VERIFIER');
        }
        oThis.createOstSdkKeyManagerAssist();
        oThis.sendPublicKey();
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

  verifyIframeInitData() {
    const oThis = this
      , kMOrigin = oThis.origin
    ;
    const determinedKMOrigin = oThis.determineUpStreamOrigin();
    if (determinedKMOrigin !== kMOrigin) {
      console.error(LOG_TAG, "KM origin does not conform with determined KM origin",
        "Determined KM Origin", ancestorOrigin, "KMOrigin", kMOrigin);
      return Promise.resolve(false)
    }

    return super.verifyIframeInitData();
  }

  determineUpStreamOrigin() {
    const oThis = this
      , ancestorOrigin = oThis.ancestorOrigins[0]
    ;

    return ancestorOrigin.replace("https://sdk-", "https://km-");
  }

  getReceiverName() {
    return 'OstSdkKeyManager';
  }

  sendPublicKey() {
    const oThis = this;
    console.log(LOG_TAG, "sending OstSdkKeyManager public key");

    let ostMessage = new OstMessage();
    ostMessage.setFunctionName( "onSetupComplete" );
    ostMessage.setReceiverName( oThis.getUpstreamReceiverName() );
    ostMessage.setArgs({
      publicKeyHex: this.browserMessenger.getPublicKeyHex()
    });

    this.browserMessenger.sendMessage(ostMessage, SOURCE.UPSTREAM)
  }

  getUpstreamReceiverName() {
    return "OstSdk";
  }
}

export default OstSdkKeyManager;