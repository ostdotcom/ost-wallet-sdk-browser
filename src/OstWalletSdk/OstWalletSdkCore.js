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

  getDownstreamEndpoint() {
    return this.sdkConfig.sdk_endpoint;
  }
}

export default OstWalletSdkCore;