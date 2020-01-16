import uuidv4 from 'uuid/v4';
import OstURLHelpers from "../common-js/OstHelpers/OstUrlHelper";
import OstMessage from "../common-js/OstMessage";
import {OstBrowserMessenger, SOURCE} from "../common-js/OstBrowserMessenger";
import OstError from "../common-js/OstError";
import OstBaseSdk from "../common-js/OstBaseSdk";
// import IKM from './ecKeyInteracts/internalKeyManager'
//
// const ikm = new IKM(uuidv4());
// const wallet = ikm.generateHDWallet();
// const gensig = ikm.signMessage(wallet, "message");
// const persig = ikm.personalSign(wallet, "message");


(function() {

  class OstSdkKeyManager extends OstBaseSdk {
    constructor(location, onMessageReceiveCallback){
      super(location);
      this.onMessageReceiveCallback = onMessageReceiveCallback;
    }

    perform() {
      super.perform();

      this.getURLParams();

      return this.createBrowserMessengerObject()
        .then(() => {
          return this.setParentPublicKey();
        })
        .then(() => {
          return this.verifyPassedData();
        })
        .then((isVerified) => {
          if (!isVerified) {
            throw new OstError('os_i_p_1', 'INVALID_VERIFIER');
          }

          this.sendPublicKey();
        })
        .catch((err) => {
          this.browserMessenger.removeParentPublicKey();

          if (err instanceof OstError) {
            throw err;
          }
          throw new OstError('os_i_p_1', 'SKD_INTERNAL_ERROR', err);
        });
    }

    onMessageReceived(content, type) {
      console.log("ost sdk key manager=> message received");
      console.log("content : ", content, " type :", type);
    }

    sendPublicKey() {
      const messagePayload = {
        msg: "key manager up complete",
        publicKeyHex: this.browserMessenger.publicKeyHex
      };
      const message = new OstMessage(messagePayload, "WALLET_SETUP_COMPLETE");
      this.browserMessenger.sendMessage(message, SOURCE.UPSTREAM)
    }
  }


  let sdkKmManager = new OstSdkKeyManager(window.location);
  sdkKmManager.perform()
    .then(() => {
    })
    .catch((err) => {

    })
})();



