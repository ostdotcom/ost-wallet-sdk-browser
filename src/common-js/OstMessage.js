import OstError from "./OstError";
import OstErrorCodes from './OstErrorCodes'

const MESSAGE_TYPE = {
	OST_KM_INIT: 'OST_KM_INIT',
  OST_SKD_SETUP_COMPLETE: 'OST_SKD_SETUP_COMPLETE',
  OST_SKD_KM_SETUP_COMPLETE: 'OST_SKD_KM_SETUP_COMPLETE',
	OST_KM_GET_DEVICE_ADDRESS: 'OST_KM_GET_DEVICE_ADDRESS',
	OST_KM_GET_API_ADDRESS: 'OST_KM_GET_API_ADDRESS'
};

class OstMessage {

  static getOstMessage(payload, type) {
    return new OstMessage(payload, type)
  }

  static getOstMessageFromReceivedData(data) {
    const message = data.ostMessage;
    if (!message) {
      throw new OstError('cj_om_gomfrd_1', OstErrorCodes.INVALID_OST_MESSAGE)
    }

    const type = message.type;
    const payload = message.content;

    return new OstMessage(payload, type);
  }


  constructor(payload, type) {
    this.payload = payload;
    this.type  = type;

    this.timestamp = null;
  }

  getTimeStamp() {
    if (!this.timestamp) {
      this.timestamp = Date.now();
    }
    return this.timestamp;
  }

  getPayloadToSign() {
    let payloadToSign = {
      content: this.payload,
      type: this.type,
      timestamp: this.getTimeStamp()
    };

    return payloadToSign
  }
}

export {MESSAGE_TYPE, OstMessage};
