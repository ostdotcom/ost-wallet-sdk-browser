import OstURLHelpers from "./OstHelpers/OstUrlHelper";
import OstError from "./OstError";
import {OstBrowserMessenger, SOURCE} from "./OstBrowserMessenger";
import {MESSAGE_TYPE} from "./OstMessage";

class OstBaseSdk {
  constructor(origin, pathname, ancestorOrigins, searchParams){
    this.origin = origin;
    this.pathname = pathname;
    this.ancestorOrigins = ancestorOrigins;
    this.searchParams = searchParams;

    this.urlParams = null;
    this.browserMessenger = null;
  }

  getURLParams() {
    this.urlParams = OstURLHelpers.getParamsFromURL(this.searchParams);
  }

  perform() {
    this.registerListener();
    return this.createBrowserMessengerObject()
      .then(() => {
        this.setParentOrigin();
      })
  }

  //Setter

  setParentOrigin() {
    if (this.ancestorOrigins) {
      let ancestorOrigins = this.ancestorOrigins;
      let parentOrigin = ancestorOrigins[0];
      this.browserMessenger.setUpStreamOrigin(parentOrigin);
    }
  }

  setDownStreamWindow( window ) {
    this.browserMessenger.setDownStreamWindow( window );
  }

  setDownStreamOrigin ( origin ) {
    this.browserMessenger.setDownStreamOrigin( origin );
  }

  registerListener() {
    window.addEventListener("message", (event) => {
      this.receiveMessage(event);
    }, false);
  }

  receiveMessage(event) {
    const eventData = event.data;
    const message = eventData.message;
    if (message) {
      if ([MESSAGE_TYPE.OST_SKD_KM_SETUP_COMPLETE,
          MESSAGE_TYPE.OST_SKD_SETUP_COMPLETE].includes(eventData.message.type)) {

        this.onSetupComplete(eventData);

      }else if (this.onMessageReceived){
        this.onMessageReceived(eventData.message.content, eventData.message.type);
      }
    }
  }

  onSetupComplete(eventData) {

  }

  validateReceivedMessage(eventData) {
    let signer = eventData.message.signer;

    const verifiedCallback = (isVerified) => {
      if (isVerified) {
        this.onMessageReceived(eventData.message.content, eventData.message.type);
      }
    };
    if (this.browserMessenger.isParentPublicKey(signer)) {
      this.browserMessenger.verifyParentMessage(eventData)
        .then(verifiedCallback)
    }else if (this.browserMessenger.isChildPublicKey(signer)){
      this.browserMessenger.verifyChildMessage(eventData)
        .then(verifiedCallback)
    }
  }

  onMessageReceived(content, type) {

  }

  createBrowserMessengerObject () {
    this.browserMessenger = new OstBrowserMessenger();
    return this.browserMessenger.perform()
  }

  getPublicKeyHex () {
    return this.browserMessenger.getPublicKeyHex();
  }

  signDataWithPrivateKey(stringToSign) {
    return this.browserMessenger.getSignature(stringToSign);
  }

  setParentPublicKey() {
    let parentPublicKeyHex = this.urlParams.publicKeyHex;

    if (!parentPublicKeyHex) {
      throw new OstError('os_i_sppk_1', 'INVALID_PARENT_PUBLIC_KEY');
    }
    return this.browserMessenger.setParentPublicKeyHex(parentPublicKeyHex)
  }

  verifyPassedData() {
    const signature = this.urlParams.signature;
    this.urlParams = OstURLHelpers.deleteSignature(this.urlParams);

    let url = OstURLHelpers.getStringToSign(this.origin+ this.pathname, this.urlParams);
    return this.browserMessenger.verify(url, signature, this.browserMessenger.parentPublicKey);
  }

  setChildPublicKey(eventData) {
    let childPublicKeyHex = eventData.message.content.publicKeyHex;
    return this.browserMessenger.setChildPublicKeyHex(childPublicKeyHex)
      .then(() => {
        return this.browserMessenger.verifyChildMessage(eventData)
      })
      .then((isVerified) => {
        if (!isVerified) {
          throw new OstError('cj_obs_scpk_1', 'INVALID_VERIFIER')
        }
        return Promise.resolve();
      })
      .catch((err) => {
        this.browserMessenger.removeChildPublicKey();

        if (err instanceof OstError) {
          throw err;
        }
        throw new OstError('os_i_scpk_1', 'SKD_INTERNAL_ERROR', err);
      })
  }

  sendMessage(ostMessage, receiverSource) {
    return this.browserMessenger.sendMessage(ostMessage, receiverSource)
  }
}

export default OstBaseSdk