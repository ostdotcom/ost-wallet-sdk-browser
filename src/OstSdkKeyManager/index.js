

import {SOURCE} from "../common-js/OstBrowserMessenger";
import OstError from "../common-js/OstError";
import OstBaseSdk from "../common-js/OstBaseSdk";

// import IKM from './ecKeyInteracts/internalKeyManager'
//
// const ikm = new IKM(uuidv4());
// const wallet = ikm.generateHDWallet();
// const gensig = ikm.signMessage(wallet, "message");
// const persig = ikm.personalSign(wallet, "message");
import OstKeyManager from './keyManagerAssist/ostKeyManager'
import OstMessage from "../common-js/OstMessage";

(function(window) {

  const location = window.location
    , origin = location.origin
    , pathname = location.pathname
    , ancestorOrigins = location.ancestorOrigins
    , searchParams = location.search
  ;

  class OstSdkKeyManager extends OstBaseSdk {
    constructor(origin, pathname, ancestorOrigins, searchParams){
      super(origin, pathname, ancestorOrigins, searchParams);
      this.ostKeyManager = null;
    }

    perform() {
      const oThis = this;
      return super.perform()
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

          oThis.ostKeyManager = new OstKeyManager(this.browserMessenger);
          oThis.ostKeyManager.registerRequestListeners();

          this.sendPublicKey();
        })
        .catch((err) => {
          this.browserMessenger.removeUpstreamPublicKey();

          if (err instanceof OstError) {
            throw err;
          }
          throw new OstError('os_i_p_1', 'SKD_INTERNAL_ERROR', err);
        });
    }

    getReceiverName() {
      return 'OstSdkKeyManager';
    }

    sendPublicKey() {
      console.log("sending OstSdkKeyManager public key");

      let ostMessage = new OstMessage();
      ostMessage.setFunctionName( "onSetupComplete" );
      ostMessage.setReceiverName( "OstSdk" );
      ostMessage.setArgs({
        publicKeyHex: this.browserMessenger.getPublicKeyHex()
      });

      this.browserMessenger.sendMessage(ostMessage, SOURCE.UPSTREAM)
    }
  }


  let sdkKmManager = new OstSdkKeyManager(origin, pathname, ancestorOrigins, searchParams);
  sdkKmManager.perform()
    .then(() => {

    })
    .catch((err) => {

    })
})(window);



