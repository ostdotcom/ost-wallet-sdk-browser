/**
 * OstBrowserMessenger is a wrapper class that internally
 * uses Window.postMessage Api for inter-window communication.
 * For Information, see:
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
 *
 */

import OstError from "./OstError";
import OstMessage from "./OstMessage";
import OstHelpers from "./OstHelpers";

const SOURCE = {
  UPSTREAM: "UPSTREAM",
  DOWNSTREAM: "DOWNSTREAM"
};

class OstBrowserMessenger {

  constructor() {
    this.signer = null;
    this.downStreamOrigin = null;
    this.parentPublicKeyHex = null;
    this.parentPublicKey = null;
    this.publicKeyHex = null;
  }

  perform() {
    return this.createSignerKey()
      .then((res) => {
        this.signer = res;
        return this.exportPublicKey();
      });
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

  exportPublicKey() {
    return crypto.subtle.exportKey('spki', this.signer.publicKey)
      .then((res) => {
        this.publicKeyHex = OstHelpers.byteArrayToHex(res);
      })
  }

  importPublicKey(hex) {
    const arrayBuffer = OstHelpers.hexToByteArray(hex);

    return crypto.subtle.importKey('spki', arrayBuffer, {name: 'RSASSA-PKCS1-v1_5', hash: 'sha-256'}, true, ['verify'])
      .then((cryptoKey) => {
        this.parentPublicKey = cryptoKey;
      })
  }

  //Setter

  setDownStreamOrigin( downStreamOrigin ) {
    this.downStreamOrigin = downStreamOrigin;
  }

  setParentPublicKeyHex(hex) {
    this.parentPublicKeyHex = hex;
    return this.importPublicKey(this.parentPublicKeyHex);
  }

  //getter

  getUpStreamOrigin() {
    // 1. Validate window/self.
    if ( typeof window !== 'object' || typeof self !== 'object' || window !== self ) {
      throw new OstError('cj_obm_guso_1', 'INVALID_TARGET_WINDOW');
    }

    return window.parent;
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
      return false
    }

    if (typeof this.signer !== 'object' ) {
      return false;
    }

    return (this.signer.publicKey instanceof CryptoKey) && (this.signer.privateKey instanceof CryptoKey);
  }

  isValidParentPublicKey() {
    if (!this.parentPublicKey) {
      return false
    }

    return (this.parentPublicKey instanceof CryptoKey)
  }

  //Performable
  sendMessage(ostMessage, receiverSourceEnum) {

    if (!(ostMessage instanceof OstMessage)) {
      throw new OstError('cj_obm_sm_1', 'INVALID_OST_MESSAGE')
    }

    if (!SOURCE.hasOwnProperty(receiverSourceEnum)) {
      throw new OstError('cj_obm_sm_2', 'INVALID_ENUM')
    }

    if (!this.isValidSigner()) {
      throw new OstError('cj_obm_sm_3', 'INVALID_SIGNER')
    }

    let targetWindow;
    if (SOURCE.DOWNSTREAM == receiverSourceEnum) {
      targetWindow = this.downStreamOrigin;
    } else if (SOURCE.UPSTREAM == receiverSourceEnum) {
      targetWindow = this.getUpStreamOrigin();
    }

    if (!targetWindow || targetWindow === self) {
      throw new OstError('cj_obm_sm_4', 'INVALID_TARGET_WINDOW');
    }

    const dataToSign = OstHelpers.getMessageToSign(ostMessage, this.publicKeyHex);

    this.getSignature(dataToSign)
      .then((signedMessage)=>{

        const signature = OstHelpers.byteArrayToHex(signedMessage);

        const dataToPost = OstHelpers.getPostMessageData(signature, ostMessage, this.publicKeyHex);

        targetWindow.postMessage(dataToPost, '*');
      }).catch((err)=>{
        console.log("err", err);
      });
  }


  getSignature(payload) {
    return crypto.subtle.sign('RSASSA-PKCS1-v1_5', this.signer.privateKey, OstHelpers.getDataToSign(payload));
  }

  verifyMessage(data) {
    if (!this.isValidParentPublicKey()) {
      throw new OstError('cj_obm_vm_1', 'INVALID_ENUM')
    }

    const signature = data.signature;
    if (!signature || typeof signature !== 'string') {
      throw new OstError('cj_obm_vm_2', 'INVALID_PARAM_SIGNATURE')
    }

    const message = data.message;
    return this.verify(message, signature);
  }

  verify(message, signature) {
    console.log("message : ", message);
    console.log("signature : ", signature);

    return crypto.subtle.verify('RSASSA-PKCS1-v1_5', this.parentPublicKey, OstHelpers.hexToByteArray(signature), OstHelpers.getDataToSign(message))
  }
}

export {SOURCE, OstBrowserMessenger};