import OstUser from "../OstSdk/entities/OstUser";
import OstToken from "../OstSdk/entities/OstToken";
import OstDevice from "../OstSdk/entities/OstDevice";
import OstSession from "../OstSdk/entities/OstSession";
import OstRule from "../OstSdk/entities/OstRule";

const LOG_TAG = "OstEntityParser";
const RESPONSE_SUCCESS = "success";
const RESPONSE_DATA = "data";

const USER = "user";
const TOKEN = "token";
const SESSION = "session";
const SESSIONS = "sessions";
const RULE = "rule";
const RULES = "rules";
const DEVICE = "device";

const RESULT_TYPE = "result_type";
export default class OstEntityParser {
	static parse(response) {
		if (!response || !response[RESPONSE_SUCCESS]) {
			throw "Invalid response";
		}
		const dataObj = response[RESPONSE_DATA];

		console.log(LOG_TAG, "parsing response", dataObj);

		if (dataObj[USER]) {
			OstUser.parse(dataObj[USER]);
		}

		if (dataObj[TOKEN]) {
			OstToken.parse(dataObj[TOKEN]);
		}

		if (dataObj[DEVICE]) {
			OstDevice.parse(dataObj[DEVICE]);
		}

		if (dataObj[SESSION]) {
			OstSession.parse(dataObj[SESSION]);
		}

		if (dataObj[RULE]) {
			OstRule.parse(dataObj[RULE]);
		}

		if (dataObj[RULES]) {
			const jsonArray = dataObj[RULES];
			for (let i = 0; i < jsonArray.length; i++) {
				OstRule.parse(jsonArray[i]);
			}
		}

		if (dataObj[SESSIONS]) {
			const sessionArray = dataObj[SESSIONS];
			for (let i = 0; i < sessionArray.length; i++) {
				OstSession.parse(sessionArray[i]);
			}
		}
	}
}
