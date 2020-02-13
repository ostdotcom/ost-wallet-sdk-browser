import OstWalletWorkFlowCallback from "./OstWalletCallback/OstWorkflowCallbacks";

class OstMappyCallbacks extends OstWalletWorkFlowCallback {
  constructor() {
    super()
  }

  registerDevice ( apiParams ) {
    console.log("OstMappyCallbacks :: registerDevice");
    return new Promise((resolve, reject) => {

      return resolve(apiParams);
    })
  }
}

export default OstMappyCallbacks;