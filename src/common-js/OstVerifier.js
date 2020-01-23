import OstHelpers from "./OstHelpers";

class OstVerifier {

  constructor ( ) {
    this.upstreamPublicKey = null;
    this.upstreamOrigin = null;
    this.downstreamPublicKey = null;
    this.downstreamOrigin = null;
    this.receiverName = null;
  }

  //Setter
  setUpstreamPublicKey (upstreamPublicKey) {
    this.upstreamPublicKey = upstreamPublicKey;
  }

  setUpStreamOrigin ( upstreamOrigin ) {
    this.upstreamOrigin = upstreamOrigin;
  }

  setDownstreamPublicKey ( downstreamPublicKey ) {
    this.downstreamPublicKey = downstreamPublicKey;
  }

  setDownStreamOrigin ( downstreamOrigin ) {
    this.downstreamOrigin = downstreamOrigin;
  }

  setReceiverName ( receiverName ) {
    this.receiverName = receiverName;
  }


  //Validate
  isDownstreamSigner ( signer ) {
    return this.downstreamPublicKey === signer;
  }

  isDownstreamOrigin ( origin ) {
    return this.downstreamOrigin === origin;
  }

  isUpstreamSigner ( signer ) {
    return this.upstreamPublicKey === signer;
  }

  isUpstreamOrigin ( origin ) {
    return this.upstreamOrigin === origin;
  }

  isValidReceiver ( receiverName ) {
    return this.receiverName === receiverName;
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