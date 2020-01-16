import '../styles/login.css';

import OstHelpers from "../common-js/OstHelpers";
import OstURLHelpers from '../common-js/OstHelpers/OstUrlHelper'
import OstError from "../common-js/OstError";
import OstBaseSdk from '../common-js/OstBaseSdk'
import {MESSAGE_TYPE} from "../common-js/OstMessage";

(function(window) {

  class OstWalletSdk extends OstBaseSdk {
    constructor(onMessageReceivedCallback) {
      super();
      this.onMessageReceivedCallback = onMessageReceivedCallback
    }

    perform() {
      return super.perform()
        .then(() => {
        })
        .catch((err) => {
          if (err instanceof OstError) {
            throw err;
          }
          throw new OstError('ows_i_p_1', 'SKD_INTERNAL_ERROR', err);
        });
    }

    onSetupComplete(eventData) {
      if (MESSAGE_TYPE.OST_SKD_SETUP_COMPLETE === eventData.message.type) {
        this.setChildPublicKey(eventData);
      }
    }

    onMessageReceived(content, type) {
      console.log("ost wallet sdk => message received");
      console.log("content : ", content, " type :", type);
    }
  }

  const walletSdk = new OstWalletSdk();
  walletSdk.perform()
    .then(() => {
      return createSdkMappyIframe();
    })
    .then(() => {
    })
    .catch((err) => {
      if (err instanceof OstError) {
        throw err;
      }
      throw new OstError('ows_i_p_1', 'SKD_INTERNAL_ERROR', err);
    });

  function createSdkMappyIframe() {

    var ifrm = document.createElement('iframe');
    ifrm.setAttribute('id', 'sdkMappyIFrame');

    const url = 'http://localhost:9001';

    let params = {
      publicKeyHex: walletSdk.getPublicKeyHex()
    };

    let stringToSign = OstURLHelpers.getStringToSign(url, params );

    walletSdk.signDataWithPrivateKey(stringToSign)
      .then((signedMessage) => {
        const signature = OstHelpers.byteArrayToHex(signedMessage);
        let iframeURL = OstURLHelpers.appendSignature(stringToSign, signature);
        ifrm.setAttribute('src', iframeURL);
        ifrm.setAttribute('width', '100%');
        ifrm.setAttribute('height', '200');

        document.body.appendChild(ifrm);

        walletSdk.setDownStreamWindow(ifrm.contentWindow);
        walletSdk.setDownStreamOrigin(url);

      })
      .catch((err) => {
        if (err instanceof OstError) {
          throw err;
        }
        throw new OstError('ows_i_csmif_1', 'SKD_INTERNAL_ERROR', err);
      })
  }

})(window);