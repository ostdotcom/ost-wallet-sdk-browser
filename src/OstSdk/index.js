import {SOURCE} from '../common-js/OstBrowserMessenger'
import OstURLHelpers from '../common-js/OstHelpers/OstUrlHelper'
import OstError from "../common-js/OstError";
import OstHelpers from "../common-js/OstHelpers";
import OstBaseSdk from '../common-js/OstBaseSdk';
import OstSdkAssist from './OstSdkAssist'
import OstMessage from '../common-js/OstMessage'

const LOG_TAG = "OstSdk :: index :: ";
(function (window) {

  const location = window.location
    , origin = location.origin
    , pathname = location.pathname
    , ancestorOrigins = location.ancestorOrigins
    , searchParams = location.search
  ;

  class OstSdk extends OstBaseSdk {
    constructor(origin, pathname, ancestorOrigins, searchParams){
      super(origin, pathname, ancestorOrigins, searchParams);

      this.ostSdkAssist = null
    }

    createOstSdkAssist () {
      let oThis = this;
      this.ostSdkAssist = new OstSdkAssist(this.browserMessenger, this.getReceiverName());
      this.ostSdkAssist.onSetupComplete = function (args) {
        console.log(LOG_TAG,"createOstSdkAssist :: onSetupComplete", args);
        oThis.onSetupComplete(args)
      }
    }

    perform() {
      return  super.perform()
        .then(() => {
          return this.setUpstreamPublicKey();
        })
        .then(() => {
          return this.verifyIframeInitData();
        })
        .then((isVerified) => {
          if (!isVerified) {
            throw new OstError('os_i_p_1', 'INVALID_VERIFIER');
          }
          this.createOstSdkAssist();
          this.sendPublicKey();
        })
        .catch((err) => {
          console.log("err", err);

          this.browserMessenger.removeUpstreamPublicKey();

          if (err instanceof OstError) {
            throw err;
          }
          throw new OstError('os_i_p_1', 'SKD_INTERNAL_ERROR', err);
        });
    }

    getReceiverName() {
      return 'OstSdk';
    }

    sendPublicKey() {
      console.log("sending OstSdk public key");

      let ostMessage = new OstMessage();
      ostMessage.setFunctionName( "onSetupComplete" );
      ostMessage.setReceiverName( "OstWalletSdk" );
      ostMessage.setArgs({
        publicKeyHex: this.browserMessenger.getPublicKeyHex()
      });

      this.browserMessenger.sendMessage(ostMessage, SOURCE.UPSTREAM)
    }

  }

  const ostSdkObj = new OstSdk(origin, pathname, ancestorOrigins, searchParams);
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
