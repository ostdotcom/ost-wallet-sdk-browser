import OstUser from "../OstSdk/entities/OstUser";
import * as axios from "axios";

export default class OstApiClient {

	API_KEY = 'api_key';
	API_REQUEST_TIMESTAMP = 'api_request_timestamp';
	API_SIGNATURE_KIND = 'api_signature_kind';
	SIG_TYPE = "OST1-PS";

	constructor(userId, baseUrl, keyManagerProxy) {
		this.userId = userId;
		this.baseUrl = baseUrl;
		this.keyManagerProxy = keyManagerProxy;
		this.apiClient = axios.create({
			baseURL: baseUrl,
			timeout: 1000,
			headers: {
				'Content-Type': "application/x-www-form-urlencoded",
			}
		});
		this.user = null;
		this.device = null;
	}

	init() {
		const oThis = this;

		if (oThis.user && oThis.device) {
			return Promise.resolve();
		}
		return OstUser.getById(this.userId)
			.then((userEntity) => {
				this.user = userEntity;
				return userEntity.createOrGetDevice(oThis.keyManagerProxy)
			})
			.then((deviceEntity) => {
				this.device = deviceEntity;
			});
	}

	getPrerequisiteMap() {
		const map = {};

		// api token_id.user_id.device_address.personal_sign_address
		map[this.API_KEY] = `${this.user.getTokenId()}.${this.userId}.${this.device.getId()}.${this.device.getApiKeyAddress()}`;
		map[this.API_REQUEST_TIMESTAMP] = String(Date.now() / 1000);
		map[this.API_SIGNATURE_KIND] =  this.SIG_TYPE;
		return map;
	}

	getToken() {
		const oThis = this;
		return oThis.init()
			.then(()=> {
				const  map = oThis.getPrerequisiteMap();
				return oThis.apiClient.get('/tokens', {
					params: map
				});
			})
	}
}
