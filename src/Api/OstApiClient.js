import OstUser from "../OstSdk/entities/OstUser";
import * as axios from "axios";

const LOG_TAG = 'OstApiClient';
export default class OstApiClient {

	API_KEY = 'api_key';
	API_REQUEST_TIMESTAMP = 'api_request_timestamp';
	API_SIGNATURE_KIND = 'api_signature_kind';
	SIG_TYPE = "OST1-PS";
	API_SIGNATURE = 'api_signature';

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
		return this.get("/tokens/", {});
	}

	getUser() {
		return this.get(`/users/${this.userId}`, {});
	}
	getDevice(deviceAddress) {
		const oThis = this;
		return oThis.init()
			.then(() => {
				const  map = oThis.getPrerequisiteMap();
				return oThis.apiClient.get(`/users/${oThis.userId}/devices/${deviceAddress}`, {
					params: map
				});
			})
	}

	getCurrentDevice() {
		const oThis = this;
		return oThis.init()
			.then(() => {
				const  map = oThis.getPrerequisiteMap();
				return oThis.apiClient.get(`/users/${oThis.userId}/devices/${this.device.getDeviceAddress()}`, {
					params: map
				});
			})
	}

	getCurrentUser() {
		const oThis = this;
		return oThis.init()
			.then(() => {
				const  map = oThis.getPrerequisiteMap();
				return oThis.apiClient.get(`/users/${oThis.userId}`, {
					params: map
				});
			})
	}

	get(resource, params) {
		const oThis = this;
		return oThis.init()
			.then(() => {
				let map = oThis.getPrerequisiteMap();
				const paramMap = Object.assign({}, map, params);

				return oThis.keyManagerProxy.signApiParams(resource, paramMap);
			})
			.then((response) => {
				const paramsMap = Object.assign({}, response.params, {[this.API_SIGNATURE]: response.signature});
				console.log(LOG_TAG, "params to be sent", paramsMap);
				return oThis.apiClient.get(resource, {
					params: paramsMap
				});
			});
	}
}
