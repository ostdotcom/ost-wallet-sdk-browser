/**
 * OstBrowserMessenger is a wrapper class that internally
 * uses Window.postMessage Api for inter-window communication.
 * For Information, see:
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
 *
 */

import OstError from "./OstError";

const SOURCE = {
  UPSTREAM: "UPSTREAM",
  DOWNSTREAM: "DOWNSTREAM"
}

class OstBrowserMessenger {

  constructor() {
    this.signer = null;
    this.downStreamOrigin = null;
  }

  perform() {
    return this.createSignerKey()
      .then((res) => {
        this.signer = res
    })
  }

  /**
   * Method to create message signer.
   * @return {Promise} a Promise that fulfills with a CryptoKeyPair.
   */
  createSignerKey() {
    return crypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048, //can be 1024, 2048, or 4096
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
      },
      false, //whether the key is extractable (i.e. can be used in exportKey)
      ["sign", "verify"] //can be any combination of "sign" and "verify"
    );
  }

  //Setter

  setDownStreamOrigin( downStreamOrigin ) {
    this.downStreamOrigin = downStreamOrigin;
  }

  //getter

  getUpStreamOrigin() {
    // 1. Validate window/self.
    if ( typeof window !== 'object' || typeof self !== 'object' || window !== self ) {
      throw new OstError('cj_obm_guso_1', 'INVALID_TARGET_WINDOW');
    }

    return window;
  }

  getTargetOrigin(targetWindow) {
    return targetWindow.origin;
  }

  getCurrentWindow() {
    //Don't know how secure this is.
    return self;
  }

  //Verify

  isValidSigner() {

    if (!this.signer) {
      console.log("here 1.")
      return false
    }

    if (typeof this.signer !== 'object' ) {
      console.log("here 2.");
      return false;
    }

    return (this.signer.publicKey instanceof CryptoKey) && (this.signer.privateKey instanceof CryptoKey);
  }


  //Performable
  sendMessage(ostMessage, receiverSourceEnum) {

    // if (ostMessage instanceof OstMessage) {
    //   throw new OstError('cj_obm_sm_1', 'INVALID_OST_MESSAGE')
    // }

    if (!SOURCE.hasOwnProperty(receiverSourceEnum)) {
      throw new OstError('cj_obm_sm_2', 'INVALID_ENUM')
    }

    if (!this.isValidSigner()) {
      throw new OstError('cj_obm_sm_3', 'INVALID_SIGNER')
    }

    let targetWindow;
    if (SOURCE.DOWNSTREAM == receiverSourceEnum) {
      console.log("here1.")
      targetWindow = this.downStreamOrigin;
    }else if (SOURCE.UPSTREAM == receiverSourceEnum) {
      targetWindow = this.getUpStreamOrigin();
    }

    console.log("1. ", targetWindow);
    console.log("2. ", self);
    console.log("3. ", targetWindow === self);
    // if (targetWindow === self ) {
    //   throw new OstError('cj_obm_sm_4', 'INVALID_TARGET_WINDOW');
    // }

    //todo: add getter message into OstMessage to get `ArrayBuffer`.
    var enc = new TextEncoder();
    let data = enc.encode(ostMessage);
    // const signedMessage = crypto.subtle.sign('RSASSA-PKCS1-v1_5', this.signer, ostMessage.getDataToSign());
    const signedMessage = crypto.subtle.sign('RSASSA-PKCS1-v1_5', this.signer.privateKey, data);


    targetWindow.postMessage(signedMessage, '*', {});
  }
}


export {SOURCE, OstBrowserMessenger};