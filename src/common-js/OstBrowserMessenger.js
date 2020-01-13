/**
 * OstBrowserMessenger is a wrapper class that internally 
 * uses Window.postMessage Api for inter-window communication.
 * For Information, see:
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
 * 
 */

class OstBrowserMessenger {

  static SOURCE = {
    UPSTREAM: "UPSTREAM",
    DOWNSTREAM: "DOWNSTREAM"
  };

  constructor() {
    this.signer = null;
    this.downStreamOrigin = null;
  }


  async init() {
    try {
      // Create a signer.
      this.signer = await createSignerKey();

    } catch() {

    }
  }

  setDownStreamOrigin( downStreamOrigin ) {
    this.downStreamOrigin = downStreamOrigin;
  }

  getUpStreamOrigin() {
    // 1. Validate window/self.
    if ( typeof window !== 'object' || typeof self !== 'object' || window != self ) {
      throw new Error("");
    }
    return window.parent;
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

  sendMessage(ostMessage, receiverSourceEnum) {

  }
}


export default OstBrowserMessenger;