
const MESSAGE_TYPE = {
  OST_SKD_SETUP_COMPLETE: 'OST_SKD_SETUP_COMPLETE',
  OST_SKD_KM_SETUP_COMPLETE: 'OST_SKD_KM_SETUP_COMPLETE',
};

class OstMessage {
  constructor(payload, type) {
    this.payload = payload;
    this.type  = type;
    this.timestamp = Date.now();
  }

  getPayloadToSign() {
    let payloadToSign = {
      content: this.payload,
      type: this.type,
      timestamp: this.timestamp
    };

    return payloadToSign
  }
}

export {MESSAGE_TYPE, OstMessage};