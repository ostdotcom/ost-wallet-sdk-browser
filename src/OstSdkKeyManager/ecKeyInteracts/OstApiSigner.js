import OstUrlHelper from "../../common-js/OstHelpers/OstUrlHelper";

let ikmInstance = null;
export default class OstApiSigner {
	constructor(ikm) {
		ikmInstance = ikm;
	}

	sign( url, params ) {
		const stringToSign = OstUrlHelper.getStringToSign(url, params);
		return ikmInstance.personalSign(stringToSign);
	}
}
