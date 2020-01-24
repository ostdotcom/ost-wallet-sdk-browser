import {SOURCE} from "../../common-js/OstBrowserMessenger";
import IKM from "../ecKeyInteracts/internalKeyManager";
import OstIndexDB from "../../common-js/OstIndexedDB";

const LOG_TAG = 'IKM';
const KEY_STORE = 'KEY_STORE';

export default class OstKeyManagerAssist {

	constructor(messenger, receiverName) {
      this.browserMessenger = messenger;
      this.receiverName = receiverName;

      this.browserMessenger.subscribe(this, this.receiverName);

    }



	init(userId) {
		this.ikm = new IKM(userId);
		this.ikm.init();
		const messagePayload = {
			userId: userId,
			msg: "Ost KM init completed"
		};

		// const message = new OstMessage(messagePayload, MESSAGE_TYPE.OST_KM_INIT);
		// this.messengerObj.sendMessage(message, SOURCE.UPSTREAM);
	}
}