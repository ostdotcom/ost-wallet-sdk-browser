import {SOURCE} from '../common-js/OstBrowserMessenger'
import OstBaseSdk from '../common-js/OstBaseSdk';
import OstSdkAssist from './OstSdkAssist'
import OstMessage from '../common-js/OstMessage'
import {OstBaseEntity} from "./entities/OstBaseEntity";
import EC from "../common-js/OstErrorCodes";
import * as axios from "axios";
import OstError from "../common-js/OstError";

const LOG_TAG = "OstSdk :: index :: ";

class OstSdk extends OstBaseSdk {
  constructor(window, origin, pathname, ancestorOrigins, searchParams){
    super(window, origin, pathname, ancestorOrigins, searchParams);
    this.ostSdkAssist = null
  }

  createOstSdkAssist () {
    let oThis = this;
    this.ostSdkAssist = new OstSdkAssist(this.browserMessenger, this.getReceiverName());
    console.log(LOG_TAG, "ostSdkAssist created");
    this.ostSdkAssist.onSetupComplete = function (args) {
      console.log(LOG_TAG,"createOstSdkAssist :: onSetupComplete", args);
      oThis.onSetupComplete(args)
    }
  }

  createAssist() {
    const oThis = this;
    return oThis.createOstSdkAssist();
  }

  initDBInstance() {
    return OstBaseEntity.initInstance();
  }

  getReceiverName() {
    return 'OstSdk';
  }

  sendPublicKey() {
    const oThis = this;
    console.log("sending OstSdk public key");

    let ostMessage = new OstMessage();
    ostMessage.setFunctionName( "onSetupComplete" );
    ostMessage.setReceiverName( oThis.getUpstreamReceiverName() );
    ostMessage.setArgs({
      publicKeyHex: oThis.browserMessenger.getPublicKeyHex()
    });

    return oThis.browserMessenger.sendMessage(ostMessage, SOURCE.UPSTREAM);
  }

  onSetupComplete (args) {
    const oThis = this;
    return super.onSetupComplete(args)
      // Inform self.
      .then(() => {
        oThis.onDownstreamInitialzed(args);
        return true;
      })
  }

  getUpstreamReceiverName() {
    return "OstWalletSdk";
  }

  getDownstreamEndpoint() {
    const oThis = this;
    const selfOrigin = oThis.origin;
    const kmOrigin = selfOrigin.replace("https://sdk-", "https://km-");
    const kmEndpoint = kmOrigin + oThis.pathname;
    console.log("kmEndpoint", kmEndpoint);
    return kmEndpoint;
  }

	verifyIframeInitData(...args) {
		const oThis = this
		;
		return super.verifyIframeInitData(...args)
			.then((verified) => {
				if (!verified) {
					return verified;
				}
				return oThis.isWhiteListedParent();
			})
	}

  isWhiteListedParent() {
    const oThis = this
      , ancestorOrigin = oThis.ancestorOrigins[0]
    ;
    console.log(LOG_TAG, "AncestorOrigin of this iframe", ancestorOrigin);

    return oThis.getWhiteListedUrls()
      .then((whiteListedUrls) => {
        if (!Array.isArray(whiteListedUrls)) {
          throw "whiteListedUrls is not an array"
        }
        for (let i=0; i < whiteListedUrls.length; i++) {
          let urlObject = whiteListedUrls[i];
          if (  urlObject.domain.startsWith(ancestorOrigin) ) {
            console.log(LOG_TAG, "White listed url found", ancestorOrigin,urlObject.domain );
            return true
          }
        }
        console.log(LOG_TAG, "White listed url NOT found", ancestorOrigin);
        return false;
      })
  }

	getWhiteListedUrls() {
		let _resolve
			, _reject
		;

		// GET request for Mappy Sdk Endpoint
		axios({
			method: 'get',
			url: './allowed-domains.json',
			responseType: 'json'
		})
			.then(function (response) {
				const responseData = response.data;
				const data = responseData.data;
				console.log(LOG_TAG, "allowed-domians", data);
				if (!responseData.success || !data.result_type || !data[data.result_type]) {
					console.error(LOG_TAG, "allowed-domains.json response parsing failed");
					const ostError = new OstError('os_wf_osc_gwlu_1', EC.SDK_API_ERROR);
					return _reject(ostError);
				}
				const validDomains = data[data.result_type];
				return _resolve(validDomains);
			})
			.catch((err) => {
				console.error(LOG_TAG, "allowed-domains.json fetch failed", err);
				const ostError = OstError.sdkError(err, 'os_wf_osc_gwlu_2', EC.SDK_API_ERROR);
				return _reject(ostError);
			});

		return new Promise((resolve, reject) => {
			_resolve = resolve;
			_reject = reject;
		});
	}
}

export default OstSdk;
