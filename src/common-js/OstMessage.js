class OstMessage {
  static ostMessageFromReceivedMessage(message) {
    if (!message.signature || !message.ost_message) {
      return null;
    }

    return new OstMessage(message);
  }

  constructor(messagePayload = null) {

    this.messagePayload = messagePayload || {}; //first preference

    this.signature = null;
    this.timestamp = null;
    this.receiverName = null;
    this.subscriberId = null;
    this.name = null;
    this.args = null;

  }

  //Setter
  setSignature(signature) {
    this.signature = signature;
  }

  setTimestamp(timestamp) {
    this.timestamp = timestamp;
  }

  setReceiverName(receiverName) {
    this.receiverName = receiverName;
  }

  setSubscriberId(subscriberId) {
    this.subscriberId = subscriberId;
  }

  setFunctionName(name) {
    this.name = name;
  }

  setArgs(args, subscriberId) {
    if (subscriberId === undefined) {
      this.args = Object.assign(args);
    }
    else {
      this.args = Object.assign(args, {subscriber_id: subscriberId});
    }
  }

  //Getter

  getSignature() {
    return this.messagePayload.signature || this.signature;
  }

  getOstMessage() {
    if (!this.messagePayload) {
      return {}
    }
    return this.messagePayload.ost_message || {};
  }

  getTo() {
    const message = this.getOstMessage();

    return message.to || {};
  }

  getMethodDetails() {
    const message = this.getOstMessage();

    return message.method_details || {};
  }

  getTimestamp() {
    let timestamp = this.getOstMessage().timestamp || this.timestamp;
    if (!timestamp) {
      this.timestamp = Date.now();
      timestamp = this.timestamp;
    }
    return timestamp
  }

  getReceiverName() {
    return this.getTo().receiver_name || this.receiverName;
  }

  getSubscriberId() {
    return this.getTo().subscriber_id || this.subscriberId;
  }

  getMethodName() {
    return this.getMethodDetails().name || this.name;
  }

  getArgs() {
    return this.getMethodDetails().args || this.args;
  }

  //Build
  buildPayloadToSign() {
    return {
      timestamp: this.getTimestamp(),
      to: {
        receiver_name: this.getReceiverName(),
        subscriber_id: this.getSubscriberId()
      },

      method_details: {
        name: this.getMethodName(),
        args: this.getArgs()
      },

      ost_verifiable_message: true
    }
  }

  buildPayloadToSend() {
    return {
      signature: this.getSignature(),
      ost_message: this.buildPayloadToSign()
    }
  }

}

export default OstMessage

/*
- Sample OstMessage Structure
{
  "ost_varifiable_message": true,
	"signature": "0x",
	"ost_message": {
		timestamp: 123123123,
		to: {
			"receiver_name": "OstSdk"
		},

		method_details: {
			"name": "getCurrentUser",
			"args": {
				"user_id": "4321-2121-4321-12123-user",
				"subscriber_id": "1234-1212-12121234-success",
			}
		}
	}
}
 */
