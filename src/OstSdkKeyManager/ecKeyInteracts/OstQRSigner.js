import OstUrlHelper from "../../common-js/OstHelpers/OstUrlHelper";

let ikmInstance = null;
export default class OstQRSigner {
	constructor(ikm) {
		ikmInstance = ikm;
	}

	qrObj = {
		dd: "AS",
		ddv: "1.0.0",
		d:{
			sd: {
				da: "0x device address",
				aa: "0x api address",
				sa: "0x session address",
				sl: "spending limit",
				et: "expiry time",
			},
			s: "signer",
			sig: "sign"
		}
	};

	sign( data ) {
		const oThis = this;
		oThis.qrObj.d.sd.da = ikmInstance.getDeviceAddress();
		oThis.qrObj.d.sd.aa = ikmInstance.getApiAddress();
		oThis.qrObj.d.sd.sa = data.session_address;
		oThis.qrObj.d.sd.sl = data.spending_limit;
		oThis.qrObj.d.sd.et = data.expiry_time;
		oThis.qrObj.d.s = ikmInstance.getApiAddress();

		const objectToSign = Object.assign({}, oThis.qrObj.d.sd);

		const stringToSign = OstUrlHelper.getStringFromParams(objectToSign);
		return ikmInstance.personalSign(stringToSign)
			.then((signature) => {
				oThis.qrObj.d.sig = signature;
				return Object.assign({}, oThis.qrObj);
			})
	}
}
