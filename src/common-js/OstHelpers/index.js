import  {TextEncoder , TextDecoder} from "text-encoding"
import BigNumber from 'bignumber.js';

class OstHelpers {

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

  static cleanHexPrefix(hexString) {
    if (hexString.startsWith("0x") || hexString.startsWith("0X")) {
      return hexString.slice(2);
    }
  }

	static strToArrayBuffer(str) {
		var buf = new ArrayBuffer(str.length * 2);
		var bufView = new Uint16Array(buf);
		for (var i = 0, strLen = str.length; i < strLen; i++) {
			bufView[i] = str.charCodeAt(i);
		}
		return buf;
	}

	static arrayBufferToString(buf) {
		return String.fromCharCode.apply(null, new Uint16Array(buf));
	}

	static isNumber( num ) {
      let bigNumVal = new BigNumber( num );
      console.log("bigNumVal :: ", bigNumVal.description);
      return !!bigNumVal.description
    }
}

export default OstHelpers
