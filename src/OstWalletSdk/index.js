import '../styles/login.css';

import {OstBrowserMessenger} from "../common-js/OstBrowserMessenger";
import OstHelpers from "../common-js/OstHelpers";
import OstURLHelpers from '../common-js/OstHelpers/OstUrlHelper'
import OstError from "../common-js/OstError";

(function() {

  console.log("================= walletSdk/index");

  class OstWalletSdk {
    constructor(onMessageReceived) {
      console.log("OstWalletSdk init");

      this.ostBrowserMessenger = null;
      this.onMessageReceived = onMessageReceived
    }

    perform() {
      console.log("1");
      window.addEventListener("message", (event) => {
        this.receiveMessage(event);
      }, false);

      this.ostBrowserMessenger = new OstBrowserMessenger();
      return this.ostBrowserMessenger.perform()
        .then(() => {

        })
        .catch((err) => {
          if (err instanceof OstError) {
            throw err;
          }
          throw new OstError('ows_i_p_1', 'SKD_INTERNAL_ERROR', err);
        });
    }

    receiveMessage(event) {
      const eventData = event.data;
      const message = eventData.message;
      console.log("walletSdk => receiveMessage", eventData);
      if (message) {
        if ("WALLET_SETUP_COMPLETE" === eventData.message.type) {
          this.setChildPublicKey(eventData);
        }else if (this.onMessageReceived){
          this.onMessageReceived(eventData.message.content, eventData.message.type);
        }
      }
    }

    signDataWithPrivateKey(stringToSign) {
      return this.ostBrowserMessenger.getSignature(stringToSign);
    }

    getPublicKeyHex() {
      return this.ostBrowserMessenger.getPublicKeyHex();
    }

    setChildPublicKey(eventData) {
      let childPublicKeyHex = eventData.message.content.publicKeyHex;
      return this.ostBrowserMessenger.setChildPublicKeyHex(childPublicKeyHex)
        .then(() => {
          return this.ostBrowserMessenger.verifyChildMessage(eventData)
        })
        .then((isVerified) => {
          console.log("child public key verified: ", isVerified);
          return Promise.resolve();
        })
        .catch((err) => {
          if (err instanceof OstError) {
            throw err;
          }
          throw new OstError('ows_i_owsc_1', 'SKD_INTERNAL_ERROR', err);
        })
    }
  }


  const walletSdk = new OstWalletSdk(onMessageReceivedComplete);
  walletSdk.perform()
    .then(() => {

      return createSdkMappyIframe();
    })
    .then(() => {
      console.log("iframe created successfully");
    })
    .catch((err) => {
      if (err instanceof OstError) {
        throw err;
      }
      throw new OstError('ows_i_p_1', 'SKD_INTERNAL_ERROR', err);
    });

  function createSdkMappyIframe() {
    console.log("2");
    var ifrm = document.createElement('iframe');
    ifrm.setAttribute('id', 'sdkMappyIFrame');

    const url = 'http://localhost:9001';

    let params = {
      publicKeyHex: walletSdk.getPublicKeyHex()
    };

    let stringToSign = OstURLHelpers.getStringToSign(url, params );

    walletSdk.signDataWithPrivateKey(stringToSign)
      .then((signedMessage) => {
        console.log("3");
        const signature = OstHelpers.byteArrayToHex(signedMessage);
        let iframeURL = OstURLHelpers.appendSignature(stringToSign, signature);
        console.log("3.1.1");
        ifrm.setAttribute('src', iframeURL);
        ifrm.setAttribute('width', '100%');
        ifrm.setAttribute('height', '200');

        document.body.appendChild(ifrm);
        console.log("3.1.2");
      })
      .catch((err) => {
        if (err instanceof OstError) {
          throw err;
        }
        throw new OstError('ows_i_csmif_1', 'SKD_INTERNAL_ERROR', err);
      })
  }

  const onMessageReceivedComplete = function (content, type) {
    console.log("content: ", content, "type: ", type);
  };

})();