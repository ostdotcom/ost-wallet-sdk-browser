import OstError from "./OstError";
import OstErrorCodes from './OstErrorCodes'
import {SOURCE} from './OstBrowserMessenger'

const MESSAGE_TYPE = {
	OST_KM_INIT: 'OST_KM_INIT',
  OST_SKD_SETUP_COMPLETE: 'OST_SKD_SETUP_COMPLETE',
  OST_SKD_KM_SETUP_COMPLETE: 'OST_SKD_KM_SETUP_COMPLETE',
	OST_KM_GET_DEVICE_ADDRESS: 'OST_KM_GET_DEVICE_ADDRESS',
	OST_KM_GET_API_ADDRESS: 'OST_KM_GET_API_ADDRESS'
};

const MESSAGE_TIMESTAMP_THRESHOLD = '1000';

class OstMessage1 {

  static getOstMessage(payload, type) {
    return new OstMessage(payload, type)
  }

  static getOstMessageFromReceivedData(data) {
    const signature = data.signature;
    const message = data.ostMessage;

    if (!message) {
      throw new OstError('cj_om_gomfrd_1', OstErrorCodes.INVALID_OST_MESSAGE)
    }

    const ostMessage = new OstMessage(message.content, message.type);
    ostMessage.setTimestamp(message.timestamp);
    ostMessage.setSignature(signature);
    ostMessage.setSigner(message.signer);
    ostMessage.setStreamDirection(message.streamDirection);

    return ostMessage;
  }

  constructor(payload, type) {
    this.payload = payload;
    this.type  = type;

    this.timestamp = null;
    this.signer = null;
    this.signature = null;
    this.streamDirection = null;
  }

  //Setter

  setTimestamp (timestamp) {
    this.timestamp = timestamp
  }

  setSigner(hex) {
    this.signer = hex;
  }

  setSignature1(signature) {
    this.signature = signature;
  }

  setStreamDirection(direction) {
    this.streamDirection = direction;
  }

  //Getter

  getSignature() {
    return this.signature;
  }

  getTimeStamp() {
    if (!this.timestamp) {
      this.timestamp = Date.now();
    }
    return this.timestamp;
  }

  getPayloadToSign1() {

    const payloadToSign = {
      content: this.payload,
      type: this.type,
      timestamp: this.getTimeStamp(),
      streamDirection: this.streamDirection,
      signer: this.signer
    };

    return payloadToSign
  }

  getPayloadToPost() {
    return {
      signature: this.signature,
      ostMessage: this.getPayloadToSign()
    }
  }

  //Verifier

  isValidTimeStamp( ) {
    const currentDate = Date.now();
    if ((currentDate - MESSAGE_TIMESTAMP_THRESHOLD) < this.timestamp && (currentDate + MESSAGE_TIMESTAMP_THRESHOLD) > this.timestamp ) {
      return true;
    }
    return false;
  }

  isReceivedFromUpstream() {
    return SOURCE.DOWNSTREAM === this.streamDirection
  }

  isReceivedFromDownstream() {
    return SOURCE.UPSTREAM === this.streamDirection
  }
}

export {MESSAGE_TYPE, OstMessage1};
