import {SOURCE} from '../common-js/OstBrowserMessenger'
import OstURLHelpers from '../common-js/OstHelpers/OstUrlHelper'
import OstError from "../common-js/OstError";
import OstBaseSdk from '../common-js/OstBaseSdk';
import OstSdkAssist from './OstSdkAssist'
import OstMessage from '../common-js/OstMessage'
import OstSdk from "./OstSdkCore";

const LOG_TAG = "OstSdk :: index :: ";
(function (window) {

  const ostSdkObj = new OstSdk(window);
  const urlParams = ostSdkObj.getUrlParams();
  const sdkConfig = urlParams.sdkConfig;

  // Initialize the sdk.
  ostSdkObj.init( sdkConfig );


})(window);
