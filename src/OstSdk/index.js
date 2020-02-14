import OstSdk from "./OstSdkCore";
import OstConstant from './OstConstants';
import OstMessage from '../common-js/OstMessage';
import OstParentOriginHelper from '../common-js/OstHerlpers/ParentOriginHelper';

const LOG_TAG = "OstSdk :: index :: ";

(function (_window, _location) {

// function getParentOrigin() {
//   // if ( _location.ancestorOrigins ) {
//   //   if ( _location.ancestorOrigins.length ) {
//   //     return Promise.resolve(_location.ancestorOrigins[0]);
//   //   }
//   // }

//   const parentWindow = _window.parent;
//   let _origin = null;
//   let _resolve, _reject;
  

//   // 1 - > Receive Message.
//   const messageReceiver = (event) => {
//     console.log("|||", "getParentOrigin", "messageReceiver event", event);
//     if ( _origin ) {
//       // We have already set _origin. Ignore the message.
//       return;
//     }
//     if (!event.isTrusted) {
//       console.log("|||", "getParentOrigin", "c1 failed");
//       return;
//     }

//     const eventData = event.data;
//     if (!eventData) {
//       console.log("|||", "getParentOrigin", "c2 failed");
//       return;
//     }

//     if ( !eventData.ost_message ) {
//       console.log("|||", "getParentOrigin", "c3 failed");
//       return;
//     }

//     // Verify the event source.
//     if ( event.source != parentWindow) {
//       console.log("|||", "getParentOrigin", "c4 failed");
//       return;
//     }

//     //TODO - check message contains ost_parent_verifier_response.

//     // note the origin.
//     _origin = event.origin;

//     // Our job is done.
//     _window.removeEventListener("message", messageReceiver);
    
//     console.log("|||", "getParentOrigin", "ALL PASSED. _origin", _origin);
//     // Resolve the promise.
//     _resolve(event.origin);
//   };

//   // Make a messgae receiver
//   window.addEventListener("message", messageReceiver);
  

//   // 2 - > Send Message to parent.
//   // Send message
//   const messageData = {
//     "ost_parent_verifier_request": true,
//     "href": _location.href
//   };

  
//   let targetOrigin = "*";
//   parentWindow.postMessage(messageData, targetOrigin);
//   console.log("|||", "getParentOrigin", "parent origin requested", event);

//   // 3 - > Wait for not more than 1 sec.
//   // setTimeout(() => {
//   //   if ( !_origin ) {
//   //     destroySelf();
//   //   }
//   // }, 2000)

//   return new Promise((resolve, reject) => {
//       _resolve = resolve;
//       _reject = reject;
//   });
// }

function destroySelf() {
  const escapeUrl = "about:blank";
  _location.href = escapeUrl;
  _location = escapeUrl;
}

  if ( _window.parent == _window ) {
    return destroySelf();
  }

  OstParentOriginHelper.getParentOrigin().then((parentOrigin) => {
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
