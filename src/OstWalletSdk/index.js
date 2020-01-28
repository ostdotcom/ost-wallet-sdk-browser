import OstHelpers from "../common-js/OstHelpers";
import OstURLHelpers from '../common-js/OstHelpers/OstUrlHelper'
import OstError from "../common-js/OstError";
import OstBaseSdk from '../common-js/OstBaseSdk'
import OstSetupDevice from "./OstWorkflows/OstSetupDevice";
import OstMappyCallbacks from "./OstMappyCallbacks";

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

    getReceiverName() {
      return 'OstWalletSdk';
    }

    setupDevice ( userId, tokenId, baseURL, ostWorkflowDelegate) {
      let setupDevice = new OstSetupDevice(userId, tokenId, ostWorkflowDelegate, this.browserMessenger);
      let workflowId = setupDevice.perform();

      return workflowId;
    }

    createSessionAddress ( userId, expirationTime, spendingLimit, ostWorkflowDelegate) {
      let createSession = new OstCreateSession(userId, expirationTime, expirationTime, ostWorkflowDelegate, this.browserMessenger);
      let workflowId = createSession.perform();

      return workflowId;
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

    const url = 'https://sdk-devmappy.ostsdkproxy.com';

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

        window.OstSdkWallet = walletSdk;
      })
      .catch((err) => {
        throw OstError.sdkError(err, 'ows_i_csmif_1');
      })
  }
})(window);
