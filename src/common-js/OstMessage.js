class OstMessage {
  constructor(payload, type) {
    this.payload = payload;
    this.type  = type;
  }

  getPayloadToSign() {
    let payloadToSign = {
      contnet: this.payload,
      type: this.type
    };

    return payloadToSign
  }
}

export default OstMessage;