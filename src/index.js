/**
 * Please discuss before editing this file.
 */


// Export everything from OstWalletSdk.
export * from "./OstWalletSdk";


// //Attach the modules to window in an immutable objects.
// import * as AllExports from "./OstWalletSdk";

// /**
//  * Self Executing Method to Expose the exports to window object.
//  */
// ((_win) => {
//   for( let moduleName in AllExports ) {
//     const ModuleObj = AllExports[ moduleName ];
//     Object.defineProperty(_win, moduleName, {
//       "value": ModuleObj,
//       "writable": false,
//       "enumerable": true
//     }); 
//   }
// })(window);