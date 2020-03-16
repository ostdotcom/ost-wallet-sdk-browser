import OstWalletSdkCore from "./OstWalletSdkCore";
import OstError from "../common-js/OstError";
import OstApiError from "../common-js/OstApiError";

import OstMappyCallbacks from "./OstMappyCallbacks";
import OstWalletWorkFlowCallback from "./OstWalletCallback/OstWorkflowCallbacks";
import EC from "../common-js/OstErrorCodes";

// Things to export.
const OstWalletSdk = {};
const OstJsonApi = {};
const OstSetupDeviceDelegate = OstMappyCallbacks;
const OstWorkflowDelegate = OstWalletWorkFlowCallback;
export {
  OstWalletSdk,
  OstJsonApi,
  OstSetupDeviceDelegate,
  OstWorkflowDelegate,
  OstError,
  OstApiError
};

/**
 * Self executing method to generate wrapper methods.
 */
(function( _win ) {

  const sdkCore = new OstWalletSdkCore( window );

  // Core Sdk methods to expose.
  const simpleMethods = ["init"];

  const workflowMethods = ["setupDevice",
    "createSession",
    "executeTransaction",
    "executePayTransaction",
    "executeDirectTransfer"];

  const getterMethods = ["getUser",
    "getToken",
    "getDevice",
    "getActiveSessions",
    "deleteLocalSessions",
    "getWorkflowInfo",
    "getPendingWorkflows"
  ];

  const txHelperMethods = [
    "setTxConfig"
  ];

  /**
   * jsonApiMethodsMap - is a map of sdkCore.jsonApiProxy methods names
   * key - names of methods exposed to the api consumer.
   * value - name of sdkCore.jsonApiProxy method to invoke.
   * @type {*[]}
   */
  const jsonApiMethodsMap = {
    getCurrentDevice: "getCurrentDeviceFromServer",
    getBalance: "getBalanceFromServer",
    getPricePoint: "getPricePointFromServer",
    getBalanceWithPricePoint: "getBalanceWithPricePointFromServer",
    getUser: "getUserFromServer",
    getToken: "getTokenFromServer",
    getTransactions: "getTransactionsFromServer",
    getRules: "getRulesFromServer",
    //getPendingRecovery: "getPendingRecoveryFromServer",
    getDeviceList: "getDeviceListFromServer",
    getTokenHolder: "getTokenHolderFromServer"
  };
  const jsonApiMethods = Object.keys( jsonApiMethodsMap );


  const subscribeMethods = ["subscribe", "subscribeAll"];


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
        "reason": "Sdk must be initialized before using this method."
      };
      throw new OstError(internalErrorCode, EC.SDK_NOT_INITIALIZED, errorInfo);
    }
  };

  const getterFunctionGenerator = (fromObj, methodName) => {
    return (...args) => {
      if ( sdkCore.isSdkInitialized() ) {
        return sdkCore.proxy[methodName](...args);
      }
      let internalErrorCode = ["ows_generator_", "getterFunctionGenerator", methodName].join("_");
      let errorInfo = {
        "methodName": methodName,
        "reason": "Sdk must be initialized before using this method."
      };
      throw new OstError(internalErrorCode, EC.SDK_NOT_INITIALIZED, errorInfo);
    }
  };

  const jsonApiFunctionGenerator = (fromObj, externalMethodName) => {
    const internalMethodName = jsonApiMethodsMap[ externalMethodName ];
    return (...args) => {
      if ( sdkCore.isSdkInitialized() ) {
        return sdkCore.jsonApiProxy[ internalMethodName ](...args);
      }
      let internalErrorCode = ["ows_generator_", "jsonApiFunctionGenerator", externalMethodName].join("_");
      let errorInfo = {
        "methodName": externalMethodName,
        "reason": "Sdk must be initialized before using this method."
      };
      throw new OstError(internalErrorCode, EC.SDK_NOT_INITIALIZED, errorInfo);
    }
  };

  const subscriberFunctionGenerator = (fromObj, methodName) => {
    return (...args) => {
      if ( sdkCore.isSdkInitialized() ) {
        return sdkCore.workflowEvents[methodName](...args);
      }
      let internalErrorCode = ["ows_generator_", "getterFunctionGenerator", methodName].join("_");
      let errorInfo = {
        "methodName": methodName,
        "reason": "Sdk must be initialized before using this method."
      };
      throw new OstError(internalErrorCode, EC.SDK_NOT_INITIALIZED, errorInfo);
    }
  };

  const txHelperFunctionGenerator = (fromObj, methodName) => {
    return (...args) => {
      if ( sdkCore.isSdkInitialized() ) {
        return sdkCore.transactionHelper[methodName](...args);
      }
      let internalErrorCode = ["ows_generator_", "getterFunctionGenerator", methodName].join("_");
      let errorInfo = {
        "methodName": methodName,
        "reason": "Sdk must be initialized before using this method."
      };
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
    while( len-- ) {
      let methodName = methodsToAdd[ len ];
      let generatedFunction = functionGenerator(fromObj, methodName);
      if ( generatedFunction ) {
        Object.defineProperty( toObj, methodName, {
          "value": generatedFunction,
          "writable": false,
          "enumerable": true
        });
      } else {
        let fnRef = fromObj[ methodName ];
        console.warn("generatedFunction is undefined for methodName", methodName, "typeof fnRef", typeof fnRef);
      }
    }
  };

  // Add wrapper methods to OstWalletSdk
  addMethods(sdkCore, OstWalletSdk, simpleFunctionGenerator, simpleMethods);
  addMethods(sdkCore, OstWalletSdk, workflowFunctionGenerator, workflowMethods);
  addMethods(sdkCore, OstWalletSdk, getterFunctionGenerator, getterMethods);
  addMethods(sdkCore, OstWalletSdk, subscriberFunctionGenerator, subscribeMethods);
  addMethods(sdkCore, OstWalletSdk, txHelperFunctionGenerator, txHelperMethods);

  // Add wrapper methods to OstJsonApi
  addMethods(sdkCore, OstJsonApi, jsonApiFunctionGenerator, jsonApiMethods);

})(window);
