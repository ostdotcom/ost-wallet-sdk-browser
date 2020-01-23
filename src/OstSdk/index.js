import {SOURCE} from '../common-js/OstBrowserMessenger'
import OstURLHelpers from '../common-js/OstHelpers/OstUrlHelper'
import OstError from "../common-js/OstError";
import {MESSAGE_TYPE, OstMessage} from '../common-js/OstMessage'
import OstHelpers from "../common-js/OstHelpers";
import OstBaseSdk from "../common-js/OstBaseSdk";
import OstKeyManager from "./keyManagerProxy/ostKeyManager";
import uuidv4 from "uuid/v4";
import OstMessageNew from "../common-js/OstMessageNew";

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

          this.sendPublicKey();
        })
        .catch((err) => {
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

      let ostMessage = new OstMessageNew();
      ostMessage.setName( "onSetupComplete" );
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
      // createSdkKeyManagerIframe();
    })
    .catch((err) => {
      throw OstError.sdkError(err, 'os_i_os_1');
    });


  // function createSdkKeyManagerIframe() {
  //
  //   var ifrm = document.createElement('iframe');
  //   ifrm.setAttribute('id', 'kmMappyIFrame');
  //
  //   const url = 'http://localhost:9002';
  //
  //   let params = {
  //     publicKeyHex: ostSdkObj.getPublicKeyHex()
  //   };
  //
  //   let stringToSign = OstURLHelpers.getStringToSign(url, params );
  //
  //   ostSdkObj.signDataWithPrivateKey(stringToSign)
  //     .then((signedMessage) => {
  //       const signature = OstHelpers.byteArrayToHex(signedMessage);
  //       let iframeURL = OstURLHelpers.appendSignature(stringToSign, signature);
  //
  //       ifrm.setAttribute('src', iframeURL);
  //       ifrm.setAttribute('width', '100%');
  //       ifrm.setAttribute('height', '200');
  //
  //       document.body.appendChild(ifrm);
  //       ostSdkObj.setDownStreamWindow(ifrm.contentWindow);
  //       ostSdkObj.setDownStreamOrigin(url);
  //
	// 			ostSdkObj.browserMessenger.iframeObj = ifrm
  //
  //     })
  //     .catch((err) => {
  //       if (err instanceof OstError) {
  //         throw err;
  //       }
  //       throw new OstError('os_i_sdwpk_1', 'SKD_INTERNAL_ERROR', err);
  //     })
  // }


	// setTimeout(() => {
	// 	let message = new OstMessage({msg: "sending message to down"}, "OTHER");
	// 	ostSdkObj.sendMessage(message, SOURCE.DOWNSTREAM);
    //
	// 	let message1 = new OstMessage({msg: "sending message to up"}, "OTHER");
	// 	ostSdkObj.sendMessage(message1, SOURCE.UPSTREAM);
    //
	// 	const ostKeyManager = new OstKeyManager(ostSdkObj.browserMessenger, uuidv4());
	// 	ostKeyManager.init()
	// 		.then((msg) => {
	// 			console.log('OstSdk :: init', msg);
	// 			return ostKeyManager.getDeviceAddress();
	// 		}).then((msg) => {
	// 		console.log('OstSdk :: getDeviceAddress', msg);
	// 	}).catch((err) => {
	// 		console.log('OstSdk :: err', err);
	// 	});
	// }, 3000);
})(window);
