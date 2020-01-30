import {SOURCE} from "../../common-js/OstBrowserMessenger";
import IKM from "../ecKeyInteracts/OstIKM";
import OstIndexDB from "../../common-js/OstIndexedDB";
import OstMessage from "../../common-js/OstMessage";

const LOG_TAG = 'IKM: OstKeyManagerAssist';
const KEY_STORE = 'KEY_STORE';

export default class OstKeyManagerAssist {

	constructor(messenger, receiverName) {
      this.browserMessenger = messenger;
      this.receiverName = receiverName;

      this.browserMessenger.subscribe(this, this.receiverName);
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
				let deviceAddress = ikm.getDeviceAddress();
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
				let apiAddress = ikm.getApiAddress();
				return oThis.onSuccess({user_id: userId, api_signer_address: apiAddress}, subscriberId)
			})
			.catch((err) => {
				return oThis.onError({err: err, msg: "Api address fetch failed"}, subscriberId);
			});

	}

	signApiParams(args) {
		const oThis = this;
		const userId = args.user_id;
		const res = args.resource;
		const params = args.params;
		const subscriberId = args.subscriber_id;
		if (!userId) {
			return oThis.onError({msg: "userId not found"}, subscriberId);
		}
		return IKM.getApiSigner(userId)
			.then((apiSigner) => {
				return apiSigner.sign(res, params);
			})
			.then((signature) => {
				console.log(LOG_TAG, "Signature ", signature);
				const response = Object.assign({}, args, {signature: signature});
				return oThis.onSuccess(response, subscriberId)
			})
			.catch((err) => {
				return oThis.onError({err: err, msg: "Sign api params failed"}, subscriberId);
			});
	}

	signQRSessionData(args) {
		const oThis = this;
		const userId = args.user_id;
		const subscriberId = args.subscriber_id;
		if (!userId) {
			return oThis.onError({msg: "userId not found"}, subscriberId);
		}
		return IKM.getQRSigner(userId)
			.then((qrSigner) => {
				return qrSigner.sign(args);
			})
			.then((qrObject) => {
				console.log(LOG_TAG, "Qr data ", qrObject);
				const response = Object.assign({}, args, {qr_data: qrObject});
				return oThis.onSuccess(response, subscriberId)
			})
			.catch((err) => {
				return oThis.onError({err: err, msg: "Sign QR data failed"}, subscriberId);
			});
	}


	createSessionKey(args) {
		const oThis = this;
		const userId = args.user_id;
		const subscriberId = args.subscriber_id;
		if (!userId) {
			return oThis.onError({msg: "userId not found"}, subscriberId);
		}
		return IKM.getKeyManager(userId)
			.then((ikm) => {
				return ikm.createSessionKey();
			})
			.then((sessionAddress) => {
				return oThis.onSuccess({user_id: userId, session_address: sessionAddress}, subscriberId)
			})
			.catch((err) => {
				return oThis.onError({err: err, msg: "Create session failed"}, subscriberId);
			});
	}

	setTrustable(args) {
		const oThis = this;
		const userId = args.user_id;
		const trustable = args.trustable;
		const subscriberId = args.subscriber_id;
		if (!userId) {
			return oThis.onError({msg: "userId not found"}, subscriberId);
		}
		return IKM.getKeyManager(userId)
			.then((ikm) => {
				return ikm.setTrustable(trustable);
			})
			.then((isTrustable) => {
				return oThis.onSuccess({user_id: userId, is_trustable: isTrustable}, subscriberId)
			})
			.catch((err) => {
				return oThis.onError({err: err, msg: "Trustable set failed"}, subscriberId);
			});
	}

	isTrustable(args) {
		const oThis = this;
		const userId = args.user_id;
		const subscriberId = args.subscriber_id;
		if (!userId) {
			return oThis.onError({msg: "userId not found"}, subscriberId);
		}
		return IKM.getKeyManager(userId)
			.then((ikm) => {
				const isTrustable = ikm.isTrustable();
				return oThis.onSuccess({user_id: userId, is_trustable: isTrustable}, subscriberId)
			})
			.catch((err) => {
				return oThis.onError({err: err, msg: "Trustable get failed"}, subscriberId);
			});
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
