import OstHelpers from "../common-js/OstHelpers";
import OstURLHelpers from '../common-js/OstHelpers/OstUrlHelper'
import OstError from "../common-js/OstError";
import OstBaseSdk from '../common-js/OstBaseSdk'
import OstSetupDevice from "./OstWorkflows/OstSetupDevice";
import OstCreateSession from "./OstWorkflows/OstCreateSession";
import OstSdkProxy from './OstSdkProxy'
import OstJsonApiProxy from "./OstJsonApiProxy";
import OstExecuteTransaction from "./OstWorkflows/OstExecuteTransaction";

class OstWalletSdkCore extends OstBaseSdk {
  constructor( window ) {
    super();
    this._window = window;
  }

  getDownstreamIframeUrl() {
    const oThis = this;
    const sdkEndpoint = this.sdkConfig.sdk_endpoint;
    const params = {
      publicKeyHex: oThis.getPublicKeyHex(),
      sdkConfig: this.sdkConfig
    };
    const stringToSign = OstURLHelpers.getStringToSign(sdkEndpoint, params );
    console.log("sdkEndpoint", sdkEndpoint);
    console.log(params);
    console.log("OstWalletSdkCore :: stringToSign", stringToSign);
    
    
    // Sign the data.
    return oThis.signDataWithPrivateKey(stringToSign)
      // Return the url.
      .then((signature) => {
        return OstURLHelpers.appendSignature(stringToSign, signature);
      })
  }
}

export default OstWalletSdkCore;