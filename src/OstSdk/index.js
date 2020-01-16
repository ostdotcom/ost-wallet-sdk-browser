import {SOURCE} from '../common-js/OstBrowserMessenger'
import OstURLHelpers from '../common-js/OstHelpers/OstUrlHelper'
import OstError from "../common-js/OstError";
import {MESSAGE_TYPE, OstMessage} from '../common-js/OstMessage'
import OstHelpers from "../common-js/OstHelpers";
import OstBaseSdk from "../common-js/OstBaseSdk";

// window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

// function createDatabase(tokenId){
//   if(!window.indexedDB){
//     alert("indexed Db not supported");
//   }
//   let request = window.indexedDB.open("EntitiesDB"+tokenId,1), db, tx, store;
// }
//
// function createTable(name){
//   let db = window.request.result;
//   store = db.createObjectStore(name,{keypath: "userId"})
//
// }

(function (window) {

  const location = window.location
    , origin = location.origin
    , pathname = location.pathname
    , ancestorOrigins = location.ancestorOrigins
    , searchParams = location.search
  ;

  class OstSdk extends OstBaseSdk {
    constructor(origin, pathname, ancestorOrigins, searchParams, onMessageReceivedCallback){
      super(origin, pathname, ancestorOrigins, searchParams);
      this.onMessageReceivedCallback = onMessageReceivedCallback;
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

    onSetupComplete(eventData) {
      if (MESSAGE_TYPE.OST_SKD_KM_SETUP_COMPLETE === eventData.message.type) {
        this.setChildPublicKey(eventData);
      }
    }

    onMessageReceived(content, type) {
      console.log("ost sdk => message received");
      console.log("content : ", content, " type :", type);
    }

    sendPublicKey() {

      const messagePayload = {
        msg: "sdk up complete",
        publicKeyHex: this.browserMessenger.publicKeyHex
      };
      const message = new OstMessage(messagePayload, "WALLET_SETUP_COMPLETE");
      this.browserMessenger.sendMessage(message, SOURCE.UPSTREAM)
    }
  }

  const ostSdkObj = new OstSdk(origin, pathname, ancestorOrigins, searchParams);
  ostSdkObj.perform()
    .then(() => {
      createSdkKeyManagerIframe();
    })
    .catch((err) => {
      if (err instanceof OstError) {
        throw err;
      }
      throw new OstError('os_i_os_1', 'SKD_INTERNAL_ERROR', err);
    });


  function createSdkKeyManagerIframe() {

    var ifrm = document.createElement('iframe');
    ifrm.setAttribute('id', 'kmMappyIFrame');

    const url = 'http://localhost:9002';

    let params = {
      publicKeyHex: ostSdkObj.getPublicKeyHex()
    };

    let stringToSign = OstURLHelpers.getStringToSign(url, params );

    ostSdkObj.signDataWithPrivateKey(stringToSign)
      .then((signedMessage) => {
        const signature = OstHelpers.byteArrayToHex(signedMessage);
        let iframeURL = OstURLHelpers.appendSignature(stringToSign, signature);

        ifrm.setAttribute('src', iframeURL);
        ifrm.setAttribute('width', '100%');
        ifrm.setAttribute('height', '200');

        document.body.appendChild(ifrm);
        ostSdkObj.setDownStreamWindow(ifrm.contentWindow);
        ostSdkObj.setDownStreamOrigin(url);

      })
      .catch((err) => {
        if (err instanceof OstError) {
          throw err;
        }
        throw new OstError('os_i_sdwpk_1', 'SKD_INTERNAL_ERROR', err);
      })
  }


  setTimeout(() => {
    let message = new OstMessage({msg: "sending message to down"}, "OTHER");
    ostSdkObj.sendMessage(message, SOURCE.DOWNSTREAM);

    let message1 = new OstMessage({msg: "sending message to up"}, "OTHER");
    ostSdkObj.sendMessage(message1, SOURCE.UPSTREAM);
  }, 3000)
})(window);