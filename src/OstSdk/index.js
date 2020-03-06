import OstSdk from "./OstSdkCore";
import OstConstant from './OstConstants';
import OstParentOriginHelper from '../common-js/OstHelpers/ParentOriginHelper';

const LOG_TAG = "OstSdk :: index :: ";

(function (_window, _location) {

function destroySelf() {
  const escapeUrl = "about:blank";
  _location.href = escapeUrl;
  _location = escapeUrl;
}

  if ( _window.parent == _window ) {
    return destroySelf();
  }

  OstParentOriginHelper.getParentOrigin(_window, _location, LOG_TAG).then((parentOrigin) => {
    console.log("||| Initializing OstSdk with parentOrigin", parentOrigin);
    const ostSdkObj = new OstSdk(_window, parentOrigin);
    const urlParams = ostSdkObj.getUrlParams();
    const sdkConfig = urlParams.sdkConfig;

    OstConstant.setBaseURL(sdkConfig.api_endpoint);

    console.log("||| ostSdkObj.getUpstreamOrigin()", ostSdkObj.getUpstreamOrigin());
    // Initialize the sdk.
    ostSdkObj.init( sdkConfig );
  })
  .catch(() => {
    destroySelf();
  })
  ;

})(window, location);
