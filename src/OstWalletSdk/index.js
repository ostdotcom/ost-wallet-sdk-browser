import '../styles/login.css';

import OstHelpers from "../common-js/OstHelpers";
import OstURLHelpers from '../common-js/OstHelpers/OstUrlHelper'
import OstError from "../common-js/OstError";
import OstBaseSdk from '../common-js/OstBaseSdk'
import {MESSAGE_TYPE} from "../common-js/OstMessage";

(function(window) {

  class OstWalletSdk extends OstBaseSdk {
    constructor() {
      super();
    }

    perform() {
      return super.perform()
        .then(() => {

        })
        .catch((err) => {
          throw OstError.sdkError(err, 'ows_i_p_1');
        });
    }

    onSetupCompete() {

    }

    getReceiverName() {
      return 'OstWalletSdk';
    }
  }

  const walletSdk = new OstWalletSdk();
  walletSdk.perform()
    .then(() => {
      return createSdkMappyIframe();
    })
    .catch((err) => {
      throw OstError.sdkError(err, 'ows_i_p_2');
    });

  function createSdkMappyIframe() {
    console.log("createSdkMappyIframe Started");

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

        console.log("createSdkMappyIframe Completed");
      })
      .catch((err) => {
        throw OstError.sdkError(err, 'ows_i_csmif_1');
      })
  }

})(window);
