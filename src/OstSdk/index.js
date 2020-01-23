import {SOURCE, OstBrowserMessenger} from '../common-js/OstBrowserMessenger'
import OstURLHelpers from '../common-js/OstHelpers/OstUrlHelper'
import OstError from "../common-js/OstError";
import OstMessage from '../common-js/OstMessage'
import OstHelpers from "../common-js/OstHelpers";

// window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

// function createDatabase(tokenId){
//   if(!window.indexedDB){
//     alert("indexed Db not supported");
//   }
//   let request = window.indexedDB.open("EntitiesDB"+tokenId,1), db, tx, store;
// }

// function createTable(name){
//   let db = window.request.result;
//   store = db.createObjectStore(name,{keypath: "userId"})

// }

(function () {

  const location = window.location;

  class OstSdk {
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
      console.log("ostsdk perform");
      window.addEventListener("message", (event) => {
        this.receiveMessage(event);
      }, false);

      this.getURLParams();

      return this.createBrowserMessengerObject()
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
      console.log("OstSdk => receiveMessage", eventData);
      if (message) {
        if ("WALLET_SETUP_COMPLETE" === eventData.message.type) {
          this.setChildPublicKey(eventData);
        }else if (this.onMessageReceived){
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

    createBrowserMessengerObject () {
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

    setChildPublicKey(eventData) {
      let childPublicKeyHex = eventData.message.content.publicKeyHex;
      return this.browserMessenger.setChildPublicKeyHex(childPublicKeyHex)
        .then(() => {
          return this.browserMessenger.verifyChildMessage(eventData)
        })
        .then((isVerified) => {
          console.log("child public key verified: ", isVerified);
          return Promise.resolve();
        })
        .catch((err) => {
          if (err instanceof OstError) {
            throw err;
          }
          throw new OstError('os_i_scpk_1', 'SKD_INTERNAL_ERROR', err);
        })
    }

    sendPublicKey() {
      console.log("ostsdk sendPublicKey");

      const messagePayload = {
        msg: "sdk up complete",
        publicKeyHex: this.browserMessenger.publicKeyHex
      };
      const message = new OstMessage(messagePayload, "WALLET_SETUP_COMPLETE");
      this.browserMessenger.sendMessage(message, SOURCE.UPSTREAM)
    }

  }

  const ostSdkObj = new OstSdk(location);
  ostSdkObj.perform()
    .then(() => {
      console.log("OstSdk init success");
      createSdkKeyManagerIframe();
    })
    .catch((err) => {
      if (err instanceof OstError) {
        throw err;
      }
      throw new OstError('os_i_os_1', 'SKD_INTERNAL_ERROR', err);
    });


  function createSdkKeyManagerIframe() {
    console.log("OstSdk createSdkKeyManagerIframe");

    var ifrm = document.createElement('iframe');
    ifrm.setAttribute('id', 'kmMappyIFrame');

    const url = 'http://localhost:9002';

    let params = {
      publicKeyHex: ostSdkObj.getPublicKeyHex()
    };

    let stringToSign = OstURLHelpers.getStringToSign(url, params );

    ostSdkObj.signDataWithPrivateKey(stringToSign)
      .then((signedMessage) => {
        console.log("OstSdk signDataWithPrivateKey");
        const signature = OstHelpers.byteArrayToHex(signedMessage);
        let iframeURL = OstURLHelpers.appendSignature(stringToSign, signature);

        ifrm.setAttribute('src', iframeURL);
        ifrm.setAttribute('width', '100%');
        ifrm.setAttribute('height', '200');

        document.body.appendChild(ifrm);
        console.log("OstSdk signDataWithPrivateKey done");
      })
      .catch((err) => {
        if (err instanceof OstError) {
          throw err;
        }
        throw new OstError('os_i_sdwpk_1', 'SKD_INTERNAL_ERROR', err);
      })
  }
})();