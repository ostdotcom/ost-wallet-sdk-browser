/**
 * Please discuss before editing this file.
 */
import * as allModules from "./index";

/**
 * Self Executing Method to Expose the exports to window object.
 */
((_win) => {
  for( let moduleName in allModules ) {
    Object.defineProperty(_win, moduleName, {
      "value": allModules[ moduleName ],
      "writable": false,
      "enumerable": true
    });
  }
})(window);