import OstHelpers from "./OstHelpers";

class OstVerifier {

  constructor ( ) {
    this.upstreamPublicKey = null;
    this.upstreamPublicKeyHex = null;
    this.upstreamOrigin = null;

    this.downstreamPublicKey = null;
    this.downstreamPublicKeyHex = null;
    this.downstreamOrigin = null;

    this.receiverName = null;
  }

  //Setter
  setUpstreamPublicKey ( key ) {
    this.upstreamPublicKey = key;
  }

  setUpstreamPublicKeyHex ( hex ) {
    this.upstreamPublicKeyHex = hex;
  }

  setUpStreamOrigin ( origin ) {
    this.upstreamOrigin = origin;
  }

  setDownstreamPublicKey ( key ) {
    this.downstreamPublicKey = key;
  }

  setDownstreamPublicKeyHex ( hex ) {
    this.downstreamPublicKeyHex = hex;
  }


  setDownStreamOrigin ( origin ) {
    this.downstreamOrigin = origin;
  }

  setReceiverName ( name ) {
    this.receiverName = name;
  }


  //Validate
  isDownstreamSigner ( signer ) {
    return this.downstreamPublicKeyHex === signer;
  }

  isDownstreamOrigin ( origin ) {
    return this.downstreamOrigin === origin;
  }

  isUpstreamSigner ( signer ) {
    return this.upstreamPublicKeyHex === signer;
  }

  isUpstreamOrigin ( origin ) {
    return this.upstreamOrigin === origin;
  }

  isValidReceiver ( name ) {
    return this.receiverName === name;
  }

  isValidSignature(signature, payloadToSign, publicKey) {

    return crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      publicKey,
      OstHelpers.hexToByteArray( signature ),
      OstHelpers.getDataToSign( payloadToSign )
    );
  }
}

export default OstVerifier