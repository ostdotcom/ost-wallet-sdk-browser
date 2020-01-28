/**
 * OstBrowserMessenger is a wrapper class that internally
 * uses Window.postMessage Api for inter-window communication.
 * For Information, see:
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
 *
 */

import OstError from "./OstError";

import OstHelpers from "./OstHelpers";
import OstErrorCodes from "./OstErrorCodes";
import EventEmitter from 'eventemitter3';
import OstVerifier from "./OstVerifier";
import OstMessage from "./OstMessage";
import uuidv4 from 'uuid/v4';

const SOURCE = {
  UPSTREAM: "UPSTREAM",
  DOWNSTREAM: "DOWNSTREAM"
};

class OstBrowserMessenger {

  constructor( receiverName ) {

    this.receiverName = receiverName;

    this.signer = null;
    this.downStreamOrigin = null;

    this.publicKeyHex = null;

    this.upstreamPublicKeyHex = null;
    this.upstreamPublicKey = null;

    this.downstreamPublicKeyHex = null;
    this.downstreamPublicKey = null;

    this.eventEmitter = new EventEmitter();

    this.idMap = {};
  }

  perform() {
    this.registerListener();

    return this.createSignerKey()
      .then((res) => {
        this.signer = res;
        return this.exportPublicKey();
      });
  }

  registerListener() {
    let oThis = this;
    window.addEventListener("message", (event) => {
      oThis.onMessageReceived(event);
    }, false);
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

  onMessageReceived(event) {

    let oThis = this;

    const eventData = event.data;

    if (!eventData) {
      return;
    }

    const ostMessage = OstMessage.ostMessageFromReceivedMessage( eventData, this.getOstVerifierObj() );

    if ( !ostMessage ) {
      return;
    }

    console.log("OstBrowserMessenger :: onMessageReceived :: message object formed => ", ostMessage);

    ostMessage.isVerifiedMessage( )
      .then ((isVerified) => {
        console.log("then of isVerifiedMessage  :: ", isVerified);
        if (isVerified) {
          oThis.onValidMessageReceived(ostMessage);
        }else {
          oThis.onOtherMessageReceived(ostMessage, null);
        }
      })
      .catch ((err) => {
        console.error("catch of isVerifiedMessage : ", err);
        oThis.onOtherMessageReceived(ostMessage, err);
      });

  }

  getOstVerifierObj ( ) {
    let ostVerifierObj = new OstVerifier();

    ostVerifierObj.setUpstreamPublicKey( this.upstreamPublicKey );
    ostVerifierObj.setDownstreamPublicKey( this.downstreamPublicKey );

    ostVerifierObj.setUpstreamPublicKeyHex( this.upstreamPublicKeyHex );
    ostVerifierObj.setDownstreamPublicKeyHex( this.downstreamPublicKeyHex );

    ostVerifierObj.setUpStreamOrigin( this.upStreamOrigin );
    ostVerifierObj.setDownStreamOrigin( this.downStreamOrigin );

    ostVerifierObj.setReceiverName ( this.receiverName );

    return ostVerifierObj
  }

  onValidMessageReceived(ostMessage) {
    console.log("OstBrowserMessenger :: onValidMessageReceived : ", ostMessage);

    let functionId = ostMessage.getSubscriberId();

    if ( !functionId ) {
      functionId = ostMessage.getReceiverName()
    }

    let subscribedObject = this.getSubscribedObject( functionId );

    if ( subscribedObject ) {
      console.log("OstBrowserMessenger :: onOtherMessageReceived :: got subscribed object");
      const method = subscribedObject[ostMessage.getMethodName()];

      if (method && typeof method === 'function') {
        method.call(subscribedObject, ostMessage.getArgs());
      }
    }else  {
      console.log("OstBrowserMessenger :: onOtherMessageReceived :: subscribed object not found for ::", functionId );
      console.log(this.idMap);
    }
  }

  onOtherMessageReceived( ostMessage, err) {
    console.log("ostMessage.getMethodName() :: ", ostMessage.getMethodName());
    if (['onSetupComplete'].includes(ostMessage.getMethodName())) {
      this.onValidMessageReceived(ostMessage);
    }
  }

  exportPublicKey() {
    return crypto.subtle.exportKey('spki', this.signer.publicKey)
      .then((res) => {
        this.publicKeyHex = OstHelpers.byteArrayToHex(res);
      })
  }

  //Setter

  setUpStreamOrigin( upStreamOrigin ) {
    this.upStreamOrigin = upStreamOrigin;
  }

  setDownStreamWindow( downStreamWindow ) {
    if ( typeof window !== 'object' || typeof self !== 'object' || window !== self ) {
      throw new OstError('cj_obm_obm_1', 'INVALID_TARGET_WINDOW');
    }
    this.downStreamWindow = downStreamWindow;
  }

  setDownStreamOrigin( downStreamOrigin ) {
    this.downStreamOrigin = downStreamOrigin;
    console.log('setDownStreamOrigin', downStreamOrigin);
  }

  setUpstreamPublicKeyHex(hex) {
    this.upstreamPublicKeyHex = hex;
    return this.importPublicKey(this.upstreamPublicKeyHex)
      .then((cryptoKey) => {
        this.upstreamPublicKey = cryptoKey;
      })
      .catch((err) => {
        if (err instanceof OstError) {
          throw err;
        }
        throw new OstError('cj_obm_sppkh_1', 'SKD_INTERNAL_ERROR', err);
      });
  }

  importPublicKey(hex) {
    const arrayBuffer = OstHelpers.hexToByteArray(hex);
    return crypto.subtle.importKey('spki', arrayBuffer, {name: 'RSASSA-PKCS1-v1_5', hash: 'sha-256'}, true, ['verify']);
  }

  setDownstreamPublicKeyHex(hex) {

    if (!hex || typeof hex !== 'string') {
      return;
    }

    this.downstreamPublicKeyHex = hex;

    return this.importPublicKey(this.downstreamPublicKeyHex)
      .then((cryptoKey) => {
        this.downstreamPublicKey = cryptoKey;
      })
      .catch((err) => {
        if (err instanceof OstError) {
          throw err;
        }
        throw new OstError('cj_obm_scpkh_1', 'SKD_INTERNAL_ERROR', err);
      });
  }

  removeUpstreamPublicKey() {
    this.upstreamPublicKey = null;
    this.upstreamPublicKeyHex = null;
  }

  removeDownstreamPublicKey() {
    this.downstreamPublicKey = null;
    this.downstreamPublicKeyHex = null;
  }

  //getter

  getUpStreamWindow() {
    if ( typeof window !== 'object' || typeof self !== 'object' || window !== self ) {
      throw new OstError('cj_obm_gusw_1', 'INVALID_TARGET_WINDOW');
    }

    return window.parent;
  }

  getUpStreamOrigin() {
    if (!this.upStreamOrigin || typeof this.upStreamOrigin !== 'string' ) {
      throw new OstError('cj_obm_guso_1', 'INVALID_UPSTREAM_ORIGIN');
    }

    return this.upStreamOrigin;
  }

  getDownStreamWindow() {
    let windowRef = this.downStreamWindow;

    if (!windowRef || typeof windowRef !== 'object') {
      throw new OstError('cj_obm_gusw_1', 'INVALID_TARGET_WINDOW');
    }

    return windowRef;
  }

  getDownStreamOrigin() {
    if (!this.downStreamOrigin || typeof this.downStreamOrigin !== 'string') {
      throw new OstError('cj_obm_gdso_1', 'INVALID_DOWNSTREAM_ORIGIN');
    }

    return this.downStreamOrigin
  }

  getPublicKeyHex() {
    return this.publicKeyHex;
  }

  isValidSigner() {
    if (!this.signer) {
      return false
    }

    if (typeof this.signer !== 'object' ) {
      return false;
    }

    return (this.signer.publicKey instanceof CryptoKey) && (this.signer.privateKey instanceof CryptoKey);
  }

  //Performable
  sendMessage(ostMessage, receiverStream) {

    if ( !(ostMessage instanceof OstMessage) ) {
      throw new OstError('cj_obm_sm_1', 'INVALID_OST_MESSAGE')
    }

    if (!SOURCE.hasOwnProperty( receiverStream )) {
      throw new OstError('cj_obm_sm_2', 'INVALID_ENUM')
    }

    if (!this.isValidSigner()) {
      throw new OstError('cj_obm_sm_3', 'INVALID_SIGNER')
    }

    let targetWindow;
    let targetOrigin;
    if (SOURCE.DOWNSTREAM === receiverStream) {
      targetWindow = this.getDownStreamWindow();
      targetOrigin = this.getDownStreamOrigin();

    } else if (SOURCE.UPSTREAM === receiverStream) {
      targetWindow = this.getUpStreamWindow();
      targetOrigin = this.getUpStreamOrigin();
    }

    ostMessage.setMessageSendToDirection( receiverStream );
    ostMessage.setSigner( this.getPublicKeyHex() );

    const dataToSign = ostMessage.buildPayloadToSign();

    return this.getSignature(dataToSign)
      .then((signedMessage) => {
        console.log("signature generated.");
        const signature = OstHelpers.byteArrayToHex( signedMessage );

        ostMessage.setSignature( signature );

        console.log("OstBrowserMessenger :: sendMessage ::  => ", ostMessage.buildPayloadToSend());

        targetWindow.postMessage(ostMessage.buildPayloadToSend(), targetOrigin);
      }).catch((err) => {
        console.log("signature generation failed.");

        throw OstError.sdkError(err,'cj_obm_sm_5');
      });
  }

  getSignature(payload) {
    return crypto.subtle.sign('RSASSA-PKCS1-v1_5', this.signer.privateKey, OstHelpers.getDataToSign(payload));
  }

  verifyIframeInit(url, signature) {
    return crypto.subtle.verify('RSASSA-PKCS1-v1_5', this.upstreamPublicKey, OstHelpers.hexToByteArray(signature), OstHelpers.getDataToSign(url));
  }

  //
  registerOnce(type, callback) {
    this.eventEmitter.once(type, callback);
  }

  register(type, callback) {
    this.eventEmitter.on(type, callback);
  }

  unRegister(type, callback) {
    this.eventEmitter.removeListener(type, callback);
  }

  subscribe(obj, name) {
    if (!name || typeof name !== 'string') {
      name = uuidv4();
    }

    this.idMap[name] = obj;

    console.log("subscribing for :: ", name, " on :: ", this.receiverName);
    return name;
  }

  unsubscribe(name) {
    if (!name || typeof name !== 'string') {
      return;
    }

    delete this.idMap[name];
  }

  getSubscribedObject(name) {
    if (!name || typeof name !== 'string') {
      return null;
    }

    return this.idMap[name];
  }
}

export {SOURCE, OstBrowserMessenger};
