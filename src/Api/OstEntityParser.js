import OstUser from "../OstSdk/entities/OstUser";
import OstToken from "../OstSdk/entities/OstToken";
import OstDevice from "../OstSdk/entities/OstDevice";
import OstSession from "../OstSdk/entities/OstSession";
import OstRule from "../OstSdk/entities/OstRule";
import OstTransaction from "../OstSdk/entities/OstTransaction";

const LOG_TAG = "OstEntityParser";
const RESPONSE_SUCCESS = "success";
const RESPONSE_DATA = "data";

const USER = "user";
const TOKEN = "token";
const SESSION = "session";
const SESSIONS = "sessions";
const TRANSACTION = "transaction";
const RULE = "rule";
const RULES = "rules";
const DEVICE = "device";

const RESULT_TYPE = "result_type";
class OstEntityParser {
	parse(response) {
		if (!response || !response[RESPONSE_SUCCESS]) {
			let ostError = OstError.sdkError(null, "oep_parse_1");
			return Promise.reject( ostError );
		}
		const dataObj = response[RESPONSE_DATA];
		const allPromises = [];

		if (dataObj[USER]) {
			let parsePromise = OstUser.parse(dataObj[USER]);
			allPromises.push( parsePromise );
		}

		if (dataObj[TOKEN]) {
			let parsePromise = OstToken.parse(dataObj[TOKEN]);
			allPromises.push( parsePromise );
		}

		if (dataObj[DEVICE]) {
			let parsePromise = OstDevice.parse(dataObj[DEVICE]);
			allPromises.push( parsePromise );
		}

		if (dataObj[SESSION]) {
			let parsePromise = OstSession.parse(dataObj[SESSION]);
			allPromises.push( parsePromise );
		}

		if (dataObj[RULE]) {
			let parsePromise = OstRule.parse(dataObj[RULE]);
			allPromises.push( parsePromise );
		}

		if (dataObj[RULES]) {
			const jsonArray = dataObj[RULES];
			for (let i = 0; i < jsonArray.length; i++) {
				let parsePromise = OstRule.parse(jsonArray[i]);
				allPromises.push( parsePromise );
			}
		}

		if (dataObj[SESSIONS]) {
			const sessionArray = dataObj[SESSIONS];
			for (let i = 0; i < sessionArray.length; i++) {
				let parsePromise = OstSession.parse(sessionArray[i]);
				allPromises.push( parsePromise );
			}
		}

		if (dataObj[TRANSACTION]) {
			let parsePromise = OstTransaction.parse(dataObj[TRANSACTION]);
			allPromises.push( parsePromise );
		}

		return Promise.all( allPromises );
	}
}

export default new OstEntityParser();
