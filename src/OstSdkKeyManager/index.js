import OstSdkKeyManager from "./OstKeyManagerCore"
import OstParentOriginHelper from "../common-js/OstHelpers/ParentOriginHelper";

const LOG_TAG = 'KM';

(function(_window, _location ) {

  function destroySelf() {
    const escapeUrl = "about:blank";
    _location.href = escapeUrl;
    _location = escapeUrl;
  }

  if ( _window.parent == _window ) {
    return destroySelf();
  }

  OstParentOriginHelper.getParentOrigin(_window, _location).then((parentOrigin) => {
    let sdkKmManager = new OstSdkKeyManager(window, window.location.ancestorOrigins[0]);
    sdkKmManager.perform();
  })
    .catch(() => {
      destroySelf()
    });

})(window, location);



