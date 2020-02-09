/**
 * Please discuss before editing this file.
 */
import * as AllExports from "./OstWalletSdk";

/**
 * Self Executing Method to Expose the exports to window object.
 */
((_win) => {
  for( let moduleName in AllExports ) {
    Object.defineProperty(_win, moduleName, {
      "value": AllExports[ moduleName ],
      "writable": false,
      "enumerable": true
    });
  }
})(window);