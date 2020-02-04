import OstHelpers from "../../common-js/OstHelpers";

const LOG_TAG = "OstQRSigner";

let ikmInstance = null;
export default class OstQRSigner {
	constructor(ikm) {
		ikmInstance = ikm;
	}

	static WORKFLOW = "AS";
	static VERSION = "2.0.0";

	sign( data ) {
		const oThis = this;

		const deviceAddress = OstHelpers.cleanHexPrefix(ikmInstance.getDeviceAddress());
		const sessionAddress = OstHelpers.cleanHexPrefix(data.session_address);
		const spendingLimit = data.spending_limit;
		const expiryTime = data.expiry_time;

		let stringToSign = `${
			OstQRSigner.WORKFLOW
		}|${
			OstQRSigner.VERSION
		}|${
			deviceAddress
		}|${
			sessionAddress
		}|${
			spendingLimit
		}|${
			expiryTime
		}`;

		stringToSign = stringToSign.toLowerCase();
		console.log(LOG_TAG, "String to sign", stringToSign);

		return ikmInstance.personalSign(stringToSign)
			.then((signature) => {
				const cleanHexPrefix = OstHelpers.cleanHexPrefix(signature);
				const qrString = `${stringToSign}|${cleanHexPrefix}`;

				return qrString;
			})
	}
}
