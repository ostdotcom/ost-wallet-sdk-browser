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

    this.parent = null;
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

  setParent( parent ) {
    this.parent = parent;
  }

  //Validate
  isDownstreamSigner ( signer ) {
    return this.downstreamPublicKeyHex === signer;
  }

  isDownstreamOrigin ( origin ) {
    console.log("downstreamOrigin", this.downstreamOrigin);
    console.log("origin", origin);
    console.log("this.downstreamOrigin === signer", (this.downstreamOrigin === origin) );

    let expectedOrigin = origin;
    if ( expectedOrigin && !expectedOrigin.endsWith("/") ) {
      expectedOrigin = expectedOrigin + "/";
    }

    let registeredOrigin = this.downstreamOrigin;
    if ( registeredOrigin && !registeredOrigin.endsWith("/") ) {
      registeredOrigin = registeredOrigin + "/";
    }
    return registeredOrigin === expectedOrigin;
  }

  isUpstreamSigner ( signer ) {
    return this.upstreamPublicKeyHex === signer;
  }

  isUpstreamOrigin ( origin ) {
    return this.upstreamOrigin === origin;
  }

  isUpstreamEvent ( event ) {
    return this.parent === event.source;
  }

  isValidReceiver ( name ) {
    return this.receiverName === name;
  }

  isValidSignature(signature, payloadToSign, publicKey) {

    return crypto.subtle.verify({
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256"
      },
      publicKey,
      OstHelpers.hexToByteArray( signature ),
      OstHelpers.getDataToSign( payloadToSign )
    );
  }
}

export default OstVerifier