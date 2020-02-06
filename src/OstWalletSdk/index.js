import OstWalletSdkCore from "./OstWalletSdkCore";
import OstError from "../common-js/OstError";
import OstMappyCallbacks from "./OstMappyCallbacks";
import EC from "../common-js/OstErrorCodes";

(function( _win ) {
  console.log("----- window", window);

  const sdkCore = new OstWalletSdkCore( window );

  // Core Sdk methods to expose.
  const simpleMethods = ["init"];
  const workflowMethods = ["setupDevice", 
    "createSession", 
    "executeTransaction", 
    "executePayTransaction", 
    "executeDirectTransferTransaction"];

  const simpleFunctionGenerator = (fromObj, methodName) => {
    return (...args) => {
      return fromObj[methodName](...args);  
    };   
  };

  const workflowFunctionGenerator = (fromObj, methodName) => {
    return (...args) => {
      if ( sdkCore.isSdkInitialized() ) {
        return fromObj[methodName](...args);  
      }
      let internalErrorCode = ["ows_generator_", "workflowFunctionGenerator", methodName].join("_");
      let errorInfo = {
        "methodName": methodName,
        "reason": "Sdk must be initialized to use this method"
      }
      throw new OstError(internalErrorCode, EC.SDK_NOT_INITIALIZED, errorInfo);
    }
  };

  const addMethods = (fromObj, toObj, functionGenerator, methodsToAdd) => {
    if ( !fromObj ) {
      throw new Error("addMethods: fromObj is null");
    }

    if ( !toObj ) {
      throw new Error("addMethods: toObj is null");
    }

    if ( !functionGenerator ) {
      throw new Error("addMethods: functionGenerator is null");
    }

    if ( !methodsToAdd ) {
      methodsToAdd = Object.keys( fromObj );
    }
    
    let len = methodsToAdd.length;
    console.log("len", len);
    while( len-- ) {
      let methodName = methodsToAdd[ len ];
      let fnRef = fromObj[ methodName ];
      if ( typeof fnRef === 'function') {
        let generatedFunction = functionGenerator(fromObj, methodName);
        Object.defineProperty( toObj, methodName, {
          "value": generatedFunction,
          "writable": false,
          "enumerable": true
        });

      } else {
        console.log("methodName", methodName, "typeof", typeof fnRef);
      }
    }
  };

  // Add
  var ostWalletSdkObj = {};
  addMethods(sdkCore, ostWalletSdkObj, simpleFunctionGenerator, simpleMethods);
  addMethods(sdkCore, ostWalletSdkObj, workflowFunctionGenerator, workflowMethods);
  console.log("OstWalletSdkObj", ostWalletSdkObj);

  //Add getter methods.
  Object.defineProperty(_win, "OstWalletSdk", {
    "value": ostWalletSdkObj,
    "writable": false,
    "enumerable": true
  });

  // Why is it named OstMappyCallbacks ???
  Object.defineProperty(_win, "OstMappyCallbacks", {
    "value": OstMappyCallbacks,
    "writable": false,
    "enumerable": true
  });
  

})(window);

export default OstWalletSdk;
