import OstSdk from "./OstSdkCore";
import OstConstant from './OstConstants'

const LOG_TAG = "OstSdk :: index :: ";
(function (window) {

  const ostSdkObj = new OstSdk(window);
  const urlParams = ostSdkObj.getUrlParams();
  const sdkConfig = urlParams.sdkConfig;

  OstConstant.setBaseURL(sdkConfig.api_endpoint);

  // Initialize the sdk.
  ostSdkObj.init( sdkConfig );


})(window);
