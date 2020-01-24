import {SOURCE} from "../../common-js/OstBrowserMessenger";
import IKM from "../ecKeyInteracts/OstIKM";
import OstIndexDB from "../../common-js/OstIndexedDB";
import OstMessage from "../../common-js/OstMessage";

const LOG_TAG = 'IKM';
const KEY_STORE = 'KEY_STORE';

export default class OstKeyManagerAssist {

	constructor(messenger, receiverName) {
      this.browserMessenger = messenger;
      this.receiverName = receiverName;

      this.browserMessenger.subscribe(this, this.receiverName);
			IKM.getKeyManager("userId")
			.then((ikm) => {
				let deviceAddress = ikm.getDeviceAddress();
				console.log(LOG_TAG, "DEVICE_ADDRESS", deviceAddress);
			})
    }




	getDeviceAddress(args) {
		const oThis = this;
		const userId = args.user_id;
		const subscriberId = args.subscriber_id;
		if (!userId) {
			return oThis.onError({msg: "userId not found"}, subscriberId);
		}
		return IKM.getKeyManager(userId)
			.then((ikm) => {
				let deviceAddress = ikm.getDeviceAddress(userId);
				return oThis.onSuccess({user_id: userId, device_address: deviceAddress}, subscriberId)
			})
			.catch((err) => {
				return oThis.onError({err: err, msg: "Device address fetch failed"}, subscriberId);
			});

	}

	getApiAddress(args) {
		const oThis = this;
		const userId = args.user_id;
		const subscriberId = args.subscriber_id;
		if (!userId) {
			return oThis.onError({msg: "userId not found"}, subscriberId);
		}
		return IKM.getKeyManager(userId)
			.then((ikm) => {
				let deviceAddress = ikm.getApiAddress(userId);
				return oThis.onSuccess({user_id: userId, api_address: apiAddress}, subscriberId)
			})
			.catch((err) => {
				return oThis.onError({err: err, msg: "Api address fetch failed"}, subscriberId);
			});

	}

	init(userId) {
		this.ikm = new IKM(userId);
		this.ikm.init()
			.then(() => {
				console.log(LOG_TAG,"Device address", this.ikm.getDeviceAddress());
				console.log(LOG_TAG, "Api Address", this.ikm.getApiAddress());
			});
		const messagePayload = {
			userId: userId,
			msg: "Ost KM init completed"
		};

		// const message = new OstMessage(messagePayload, MESSAGE_TYPE.OST_KM_INIT);
		// this.messengerObj.sendMessage(message, SOURCE.UPSTREAM);
	}


	onError(errMsgObj, subscriberId) {
		const ostMsg = new OstMessage();
		ostMsg.setSubscriberId(subscriberId);
		ostMsg.setFunctionName('onError');
		ostMsg.setArgs(errMsgObj);
		this.browserMessenger.sendMessage(ostMsg, SOURCE.UPSTREAM);
	}

	onSuccess(args, subscriberId) {
		const ostMsg = new OstMessage();
		ostMsg.setSubscriberId(subscriberId);
		ostMsg.setFunctionName('onSuccess');
		ostMsg.setArgs(args);
		this.browserMessenger.sendMessage(ostMsg, SOURCE.UPSTREAM);
	}
}
