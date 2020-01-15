import {SOURCE, OstBrowserMessenger} from '../common-js/OstBrowserMessenger'
import OstURLHelpers from '../common-js/OstHelpers/OstUrlHelper'
import OstError from "../common-js/OstError";
import OstMessage from '../common-js/OstMessage'

// window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

function createDatabase(tokenId){
  if(!window.indexedDB){
    alert("indexed Db not supported");
  }
  let request = window.indexedDB.open("EntitiesDB"+tokenId,1), db, tx, store;
}

function createTable(name){
  let db = window.request.result;
  store = db.createObjectStore(name,{keypath: "userId"})

}

(function () {

  const locationObj = window.location;

  class OstSdk {
    constructor(location){
      console.log("ostsdk init");
      this.location = location;
      this.urlParams = null;
      this.browserMessenger = null;
    }

    getURLParams() {
      this.urlParams = OstURLHelpers.getParamsFromURL(this.location);
    }

    perform() {
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

      let url = OstURLHelpers.getStringToSign(locationObj.origin+locationObj.pathname, this.urlParams);
      return this.browserMessenger.verify(url, signature, this.browserMessenger.parentPublicKey);
    }

    sendPublicKey() {
      console.log("here");
      const messagePayload = {
        msg: "wallet up complete",
        publicKeyHex: this.browserMessenger.publicKeyHex
      };
      const message = new OstMessage(messagePayload, "WALLET_SETUP_COMPLETE");
      this.browserMessenger.sendMessage(message, SOURCE.UPSTREAM)
    }

  }

  const ostSdkObj = new OstSdk(locationObj);
  ostSdkObj.perform()
    .then(() => {
      console.log("OstSdk init success");
    })
    .catch((err) => {
      if (err instanceof OstError) {
        throw err;
      }
      throw new OstError('os_i_os_1', 'SKD_INTERNAL_ERROR', err);
    });

})();