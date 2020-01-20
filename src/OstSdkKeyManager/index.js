import uuidv4 from 'uuid/v4';
import OstURLHelpers from "../common-js/OstHelpers/OstUrlHelper";
import {MESSAGE_TYPE, OstMessage} from "../common-js/OstMessage";
import {OstBrowserMessenger, SOURCE} from "../common-js/OstBrowserMessenger";
import OstError from "../common-js/OstError";
import OstBaseSdk from "../common-js/OstBaseSdk";
// import IKM from './ecKeyInteracts/internalKeyManager'
//
// const ikm = new IKM(uuidv4());
// const wallet = ikm.generateHDWallet();
// const gensig = ikm.signMessage(wallet, "message");
// const persig = ikm.personalSign(wallet, "message");


(function(window) {

  const location = window.location
    , origin = location.origin
    , pathname = location.pathname
    , ancestorOrigins = location.ancestorOrigins
    , searchParams = location.search
  ;

  class OstSdkKeyManager extends OstBaseSdk {
    constructor(origin, pathname, ancestorOrigins, searchParams, onMessageReceiveCallback){
      super(origin, pathname, ancestorOrigins, searchParams);

      this.onMessageReceiveCallback = onMessageReceiveCallback;
    }

    perform() {

      this.getURLParams();

      return super.perform()
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
					this.registerOther();
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

		registerOther() {
				this.register("OTHER", (msg) => {
					console.log("KM :: registerOther :: msg => ", msg)
				});
    }

    sendPublicKey() {
      const messagePayload = {
        msg: "key manager up complete",
        publicKeyHex: this.browserMessenger.publicKeyHex
      };
      const message = new OstMessage(messagePayload, MESSAGE_TYPE.OST_SKD_KM_SETUP_COMPLETE);
      this.browserMessenger.sendMessage(message, SOURCE.UPSTREAM)
    }
  }


  let sdkKmManager = new OstSdkKeyManager(origin, pathname, ancestorOrigins, searchParams);
  sdkKmManager.perform()
    .then(() => {

    })
    .catch((err) => {

    })
})(window);



