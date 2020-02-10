import {SOURCE} from '../common-js/OstBrowserMessenger'
import OstURLHelpers from '../common-js/OstHelpers/OstUrlHelper'
import OstError from "../common-js/OstError";
import OstBaseSdk from '../common-js/OstBaseSdk';
import OstSdkAssist from './OstSdkAssist'
import OstMessage from '../common-js/OstMessage'
import OstSdk from "./OstSdkCore";

const LOG_TAG = "OstSdk :: index :: ";
(function (window) {

  const ostSdkObj = new OstSdk(window);
  ostSdkObj.perform()
    .then(() => {
      createSdkKeyManagerIframe();
    })
    .catch((err) => {
      throw OstError.sdkError(err, 'os_i_os_1');
    });


  function createSdkKeyManagerIframe() {

    var ifrm = document.createElement('iframe');
    ifrm.setAttribute('id', 'kmMappyIFrame');

    const url = 'https://km-devmappy.ostsdkproxy.com';

    let params = {
      publicKeyHex: ostSdkObj.getPublicKeyHex()
    };

    let stringToSign = OstURLHelpers.getStringToSign(url, params );

    ostSdkObj.signDataWithPrivateKey(stringToSign)
      .then((signature) => {
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

})(window);
