import OstMessage from '../OstMessage'

class OstHelpers {

  static getPostMessageData(signature, ostMessage, signer) {

    const msg = OstHelpers.getMessageToSign(ostMessage,signer);
    return {
      signature: signature,
      message: msg
    }
  }

  static getMessageToSign(ostMessage, signer) {
    let msgObj = Object.assign({signer: signer}, ostMessage.getPayloadToSign());
    return msgObj
  }

  static getDataToSign(payload) {
    const serializeDataToSign = JSON.stringify(payload);

    const enc = new TextEncoder();
    return enc.encode(serializeDataToSign);
  }

  static getDeSerializedData(data) {
    const enc = new TextDecoder();
    return enc.decode(data);
  }

  static byteArrayToHex(buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
  }

  static hexToByteArray(hex) {
    var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16)
    }));
    return typedArray.buffer;
  }


  // compare ArrayBuffers
  static arrayBuffersAreEqual(a, b) {
    return this.dataViewsAreEqual(new DataView(a), new DataView(b));
  }

// compare DataViews
  static dataViewsAreEqual(a, b) {
    if (a.byteLength !== b.byteLength) return false;
    for (let i=0; i < a.byteLength; i++) {
      if (a.getUint8(i) !== b.getUint8(i)) return false;
    }
    return true;
  }
}

export default OstHelpers