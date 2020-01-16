import uuidv4 from 'uuid/v4';
import OstURLHelpers from "../common-js/OstHelpers/OstUrlHelper";
import OstMessage from "../common-js/OstMessage";
import {OstBrowserMessenger, SOURCE} from "../common-js/OstBrowserMessenger";
import OstError from "../common-js/OstError";
// import IKM from './ecKeyInteracts/internalKeyManager'
//
// const ikm = new IKM(uuidv4());
// const wallet = ikm.generateHDWallet();
// const gensig = ikm.signMessage(wallet, "message");
// const persig = ikm.personalSign(wallet, "message");


(function() {

  class OstSdkKeyManager {
    constructor(location){
      console.log("ostsdk init");
      this.locationObj = location;
      this.urlParams = null;
      this.browserMessenger = null;
      this.onMessageReceived = null;
    }

    getURLParams() {
      this.urlParams = OstURLHelpers.getParamsFromURL(this.locationObj);
    }

    perform() {
      console.log("sdkKeyManager perform");
      window.addEventListener("message", this.receiveMessage, false);

      this.getURLParams();

      return this.createBowserMessengerObject()
        .then(() => {
          return this.setParentPublicKey();
        })
        .then(() => {
          return this.verifyPassedData();
        })
        .then((isVerified) => {
          console.log("isVerified: ", isVerified);
          this.sendPublicKey();
        })
        .catch((err) => {
          if (err instanceof OstError) {
            throw err;
          }
          throw new OstError('os_i_p_1', 'SKD_INTERNAL_ERROR', err);
        });
    }

    receiveMessage(event) {

      const eventData = event.data;
      const message = eventData.message;

      console.log("KeyManager => receiveMessage", eventData);

      if (message) {
        console.log(message);
        if (this.onMessageReceived){
          this.onMessageReceived(eventData.message.content, eventData.message.type);
        }
      }
    }

    getPublicKeyHex () {
      return this.browserMessenger.getPublicKeyHex();
    }

    signDataWithPrivateKey(stringToSign) {
      return this.browserMessenger.getSignature(stringToSign);
    }

    createBowserMessengerObject () {
      this.browserMessenger = new OstBrowserMessenger();
      return this.browserMessenger.perform()
    }

    setParentPublicKey() {
      let parentPublicKeyHex = this.urlParams.publicKeyHex;

      if (!parentPublicKeyHex) {
        throw new OstError('os_i_sppk_1', 'INVALID_PARENT_PUBLIC_KEY');
      }
      return this.browserMessenger.setParentPublicKeyHex(parentPublicKeyHex)
    }

    verifyPassedData() {
      const signature = this.urlParams.signature;
      this.urlParams = OstURLHelpers.deleteSignature(this.urlParams);

      let url = OstURLHelpers.getStringToSign(this.locationObj.origin+ this.locationObj.pathname, this.urlParams);
      return this.browserMessenger.verify(url, signature, this.browserMessenger.parentPublicKey);
    }

    sendPublicKey() {
      console.log("ostsdkKM sendPublicKey");

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
      console.log("sdkKeyManager then of perform");
    })
    .catch((err) => {

    })
})();



