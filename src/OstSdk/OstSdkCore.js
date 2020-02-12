import {SOURCE} from '../common-js/OstBrowserMessenger'
import OstBaseSdk from '../common-js/OstBaseSdk';
import OstSdkAssist from './OstSdkAssist'
import OstMessage from '../common-js/OstMessage'
import {OstBaseEntity} from "./entities/OstBaseEntity";

const LOG_TAG = "OstSdk :: index :: ";

class OstSdk extends OstBaseSdk {
  constructor(window, origin, pathname, ancestorOrigins, searchParams){
    super(window, origin, pathname, ancestorOrigins, searchParams);
    this.defineImmutableProperty

    this.ostSdkAssist = null
  }

  createOstSdkAssist () {
    let oThis = this;
    this.ostSdkAssist = new OstSdkAssist(this.browserMessenger, this.getReceiverName());
    console.log(LOG_TAG, "ostSdkAssist created");
    this.ostSdkAssist.onSetupComplete = function (args) {
      console.log(LOG_TAG,"createOstSdkAssist :: onSetupComplete", args);
      oThis.onSetupComplete(args)
    }
  }

  createAssist() {
    const oThis = this;
    return oThis.createOstSdkAssist();
  }

  initDBInstance() {
    return OstBaseEntity.initInstance();
  }

  getReceiverName() {
    return 'OstSdk';
  }

  sendPublicKey() {
    const oThis = this;
    console.log("sending OstSdk public key");

    let ostMessage = new OstMessage();
    ostMessage.setFunctionName( "onSetupComplete" );
    ostMessage.setReceiverName( oThis.getUpstreamReceiverName() );
    ostMessage.setArgs({
      publicKeyHex: oThis.browserMessenger.getPublicKeyHex()
    });

    return oThis.browserMessenger.sendMessage(ostMessage, SOURCE.UPSTREAM);
  }

  onSetupComplete (args) {
    const oThis = this;
    return super.onSetupComplete(args)
      // Inform self.
      .then(() => {
        oThis.onDownstreamInitialzed(args);
        return true;
      })
  }

  getUpstreamReceiverName() {
    return "OstWalletSdk";
  }

  getDownstreamEndpoint() {
    const oThis = this;
    const selfOrigin = oThis.origin;
    const kmOrigin = selfOrigin.replace("https://sdk-", "https://km-");
    const kmEndpoint = kmOrigin + oThis.pathname;
    console.log("kmEndpoint", kmEndpoint);
    return kmEndpoint;
  }

  verifyIframeInitData(...args) {
    return super.verifyIframeInitData(...args)
      .then(() => {
        return oThis.isWhiteListedParent()
      })
  }

  isWhiteListedParent() {
    const oThis = this
      , ancestorOrigin = oThis.ancestorOrigins[0]
    ;
    console.log(LOG_TAG, "AncestorOrigin of this iframe", ancestorOrigin);

    return oThis.getWhiteListedUrls()
      .then((whiteListedUrls) => {
        if (!Array.isArray(whiteListedUrls)) {
          throw "whiteListedUrls is not an array"
        }
        for (let i=0; i < whiteListedUrls.length; i++) {
          let urlObject = whiteListedUrls[i];
          if ( ancestorOrigin === urlObject.domain ) {
            console.log(LOG_TAG, "White listed url found", ancestorOrigin,urlObject.domain );
            return true
          }
        }
        console.log(LOG_TAG, "White listed url NOT found", ancestorOrigin);
        return false;
      })
  }

  getWhiteListedUrls() {


    //Todo: should come from Mappy Sdk endpoint
    // path is ./allowed-domains
    // IMPORTANT: note the DOT before THE SLASH.
    
    return Promise.resolve([
      {
        "id": 1,
        "uts": 1234567890,
        "domain": "https://devmappy.com"
      },
      {
        "id": 2,
        "uts": 1234567890,
        "domain": "https://sdk-devmappy.ostsdkproxy.com"
      }
    ]);
  }
}

export default OstSdk;
