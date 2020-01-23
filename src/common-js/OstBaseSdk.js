import OstURLHelpers from "./OstHelpers/OstUrlHelper";
import OstError from "./OstError";
import {OstBrowserMessenger, SOURCE} from "./OstBrowserMessenger";
import {MESSAGE_TYPE} from "./OstMessage1";

class OstBaseSdk {
  constructor(origin, pathname, ancestorOrigins, searchParams){
    this.origin = origin;
    this.pathname = pathname;
    this.ancestorOrigins = ancestorOrigins;
    this.searchParams = searchParams;

    this.urlParams = null;
    this.browserMessenger = null;
  }

  setURLParams() {
    if (this.searchParams) {
      this.urlParams = OstURLHelpers.getParamsFromURL(this.searchParams);
    }
  }

  subscribeOnSetupCompete ( ) {
    this.browserMessenger.subscribe(this, this.getReceiverName());
  }

  onSetupComplete (args) {
    console.log("OstBaseSdk :: onSetupComplete :: ", this.getReceiverName(), " :: ",  args);

    this.browserMessenger.setDownstreamPublicKeyHex( args.publicKeyHex)
  };

  perform() {
    let oThis = this;
    oThis.setURLParams();
    return oThis.createBrowserMessengerObject()
      .then(() => {
        oThis.setUpstreamOrigin();
        oThis.subscribeOnSetupCompete();
      })
  }

  //Setter

  createBrowserMessengerObject () {
    this.browserMessenger = new OstBrowserMessenger( this.getReceiverName() );
    return this.browserMessenger.perform()
  }

  getReceiverName() {
    return '';
  }

  setUpstreamOrigin() {
    if (this.ancestorOrigins) {
      let ancestorOrigins = this.ancestorOrigins;
      let upstreamOrigin = ancestorOrigins[0];
      this.browserMessenger.setUpStreamOrigin(upstreamOrigin);
    }
  }

  setDownStreamWindow( window ) {
    this.browserMessenger.setDownStreamWindow( window );
  }

  setDownStreamOrigin ( origin ) {
    this.browserMessenger.setDownStreamOrigin( origin );
  }


  getPublicKeyHex () {
    return this.browserMessenger.getPublicKeyHex();
  }

  signDataWithPrivateKey(stringToSign) {
    return this.browserMessenger.getSignature(stringToSign);
  }

  setUpstreamPublicKey() {
    let upstreamPublicKeyHex = this.urlParams.publicKeyHex;

    if (!upstreamPublicKeyHex) {
      throw new OstError('os_i_sppk_1', 'INVALID_UPSTREAM_PUBLIC_KEY');
    }
    return this.browserMessenger.setUpstreamPublicKeyHex( upstreamPublicKeyHex )
  }

  verifyIframeInitData() {
    console.log("verifyIframeInitData : ", this.urlParams);
    const signature = this.urlParams.signature;
    this.urlParams = OstURLHelpers.deleteSignature(this.urlParams);

    let url = OstURLHelpers.getStringToSign(this.origin+ this.pathname, this.urlParams);
    return this.browserMessenger.verifyIframeInit(url, signature);
  }

  setDownstreamPublicKeyHex( signer ) {
    return this.browserMessenger.setDownstreamPublicKeyHex(signer)
  }

  sendMessage(ostMessage, receiverSource) {
    return this.browserMessenger.sendMessage(ostMessage, receiverSource)
  }


  //Register listener
  registerOnce(type, callback) {
    this.browserMessenger.registerOnce(type, callback);
  }

  register(type, callback) {
    this.browserMessenger.register(type, callback);
  }

  unRegister(type, callback) {
    this.browserMessenger.unRegister(type, callback);
  }
}

export default OstBaseSdk
