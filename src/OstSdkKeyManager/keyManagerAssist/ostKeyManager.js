import {MESSAGE_TYPE, OstMessage} from "../../common-js/OstMessage1";
import {SOURCE} from "../../common-js/OstBrowserMessenger";
import IKM from "../ecKeyInteracts/internalKeyManager";
import OstIndexDB from "../../common-js/OstIndexedDB";

const LOG_TAG = 'IKM';
const KEY_STORE = 'KEY_STORE';

export default class OstKeyManager {

	constructor(messengerObj) {
		this.messengerObj = messengerObj;
		this.ikm = null;
	}

	registerRequestListeners() {
		const oThis = this;
		this.messengerObj.register(MESSAGE_TYPE.OST_KM_INIT, (msg) => {
			console.log("KM :: register", MESSAGE_TYPE.OST_KM_INIT, msg);
			oThis.init(msg.payload.userId)
				.then((messagePayload) => {
					const msg = new OstMessage(messagePayload, MESSAGE_TYPE.OST_KM_INIT);
					return msg;
				})
				.catch((err) => {
					const errMsg = new OstMessage(err, MESSAGE_TYPE.OST_KM_INIT);
					return errMsg;
				})
				.then((message) => {
					this.messengerObj.sendMessage(message, SOURCE.UPSTREAM);
				});
		});

		this.messengerObj.register(MESSAGE_TYPE.OST_KM_GET_DEVICE_ADDRESS, (msg) => {
			console.log("KM :: register", MESSAGE_TYPE.OST_KM_GET_DEVICE_ADDRESS, msg)
		});

		this.messengerObj.register(MESSAGE_TYPE.OST_KM_GET_API_ADDRESS, (msg) => {
			console.log("KM :: register", MESSAGE_TYPE.OST_KM_GET_API_ADDRESS, msg)
		});
	}

	init(userId) {
		this.ikm = new IKM(userId);
		this.ikm.init();
		const messagePayload = {
			userId: userId,
			msg: "Ost KM init completed"
		};

		const message = new OstMessage(messagePayload, MESSAGE_TYPE.OST_KM_INIT);
		this.messengerObj.sendMessage(message, SOURCE.UPSTREAM);
	}
}
