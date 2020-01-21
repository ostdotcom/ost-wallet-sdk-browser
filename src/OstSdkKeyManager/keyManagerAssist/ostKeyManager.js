import {MESSAGE_TYPE, OstMessage} from "../../common-js/OstMessage";
import {SOURCE} from "../../common-js/OstBrowserMessenger";
import IKM from "../ecKeyInteracts/internalKeyManager";

export default class OstKeyManager {

	constructor(messengerObj) {
		this.messengerObj = messengerObj;
		this.ikm = null;
	}

	registerRequestListeners() {
		const oThis = this;
		this.messengerObj.register(MESSAGE_TYPE.OST_KM_INIT, (msg) => {
			console.log("KM :: register", MESSAGE_TYPE.OST_KM_INIT, msg.content);
			oThis.init(msg.content.userId);
		});

		this.messengerObj.register(MESSAGE_TYPE.OST_KM_GET_DEVICE_ADDRESS, (msg) => {
			console.log("KM :: register", MESSAGE_TYPE.OST_KM_GET_DEVICE_ADDRESS, msg.content)
		});

		this.messengerObj.register(MESSAGE_TYPE.OST_KM_GET_API_ADDRESS, (msg) => {
			console.log("KM :: register", MESSAGE_TYPE.OST_KM_GET_API_ADDRESS, msg.content)
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
