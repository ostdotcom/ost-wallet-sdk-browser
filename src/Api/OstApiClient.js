import OstUser from "../OstSdk/entities/OstUser";
import * as axios from "axios";
import OstEntityParser from "./OstEntityParser";
import * as qs from "qs";
import OstSession from "../OstSdk/entities/OstSession";
import OstApiErrorParser from "./OstApiErrorParser";

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
      timeout: 10000,
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
    map[this.API_REQUEST_TIMESTAMP] = String(parseInt(Date.now() / 1000));
    map[this.API_SIGNATURE_KIND] =  this.SIG_TYPE;
    return map;
  }

  getToken() {
    return this.get("/tokens/");
  }

  getUser() {
    return this.get(`/users/${this.userId}/`);
  }

  getDevice(deviceAddress) {
    return this.get(`/users/${this.userId}/devices/${deviceAddress}/`);
  }

  getSession(sessionAddress) {
    return this.get(`/users/${this.userId}/sessions/${sessionAddress}/`)
      .then((response) => {
        return response;
      })
      .catch((err) => {
        console.error(LOG_TAG, 'getSession', err.response);

        const errorResponse = err.response;
        //Wipe session from local db if it is NOT FOUND in backend
        if ( 404 === parseInt(errorResponse.status) ) {
          OstSession.deleteById(sessionAddress);
        }
        throw err;
      });
  }

  getTransaction(transactionId) {
    return this.get(`/users/${this.userId}/transactions/${transactionId}/`);
  }

  getTransactions() {
    return this.get(`/users/${this.userId}/transactions`);
  }

  getPricePoints(chainId) {
    return this.get(`/chains/${chainId}/price-points`);
  }

  getPendingRecovery() {
    return this.get(`/users/${this.userId}/devices/pending-recovery`);
  }

  getBalance() {
    return this.get(`/users/${this.userId}/balance/`);
  }

  getTokenHolder() {
    return this.get(`/users/${this.userId}/token-holder`);
  }

  getDeviceList() {
    return this.get(`/users/${this.userId}/devices`);
  }

  executeTransaction(params) {
    return this.post(`/users/${this.userId}/transactions/`, params);
  }

  getRules() {
    return this.get("/rules/");
  }

  validateDomain(tokenId, domain) {
    const resource = `/tokens/${tokenId}/validate-domain`
      ,   params = {domain: domain}
      ;
    return this.apiClient.get(resource, {params: params})
      .then((res) => {
        const data = res.data
        ;

        return data.success || false
      })
  }

  get(resource, params) {
    const lastChar = resource.charAt( resource.length - 1 );
    if(lastChar!=='/'){
      resource += '/';
    }
    const oThis = this;
    params = params || {};
    return oThis.init()
      .then(() => {
        let map = oThis.getPrerequisiteMap();
        const paramMap = Object.assign({}, map, params);

        return oThis.keyManagerProxy.signApiParams(resource, paramMap);
      })
      .then((response) => {
        const paramsMap = Object.assign({}, response.params, {[this.API_SIGNATURE]: response.signature});
        return oThis.apiClient.get(resource, {params: paramsMap })
      })
      .catch((error) => {
        throw OstApiErrorParser.parse( error, params );
      })
      .then((response) => {
        return OstEntityParser.parse(response.data);
      });
  }

	post(resource, params) {
    var lastChar = resource.charAt( resource.length - 1 );
    if(lastChar!=='/'){
      resource += '/';
    }
		const oThis = this;
		params = params || {};
		return oThis.init()
			.then(() => {
				let map = oThis.getPrerequisiteMap();
				const paramMap = Object.assign({}, map, params);

				return oThis.keyManagerProxy.signApiParams(resource, paramMap);
			})
			.then((response) => {
				const paramsMap = Object.assign({}, response.params, {[this.API_SIGNATURE]: response.signature});
				console.log(LOG_TAG, "params to be sent", paramsMap);
				return oThis.apiClient.post(resource, qs.stringify(paramsMap));
			})
      .catch((error) => {
        throw OstApiErrorParser.parse( error, params );
      })
			.then((response) => {
				return OstEntityParser.parse(response.data);
			});
	}

}
