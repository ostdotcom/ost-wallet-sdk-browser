import OstWalletWorkFlowCallback from "./OstWalletCallback/OstWorkflowCallbacks";

class OstMappyCallbacks extends OstWalletWorkFlowCallback {
  constructor() {
    super()
  }

  registerDevice ( deviceAddress, apiKeyAddress ) {
    console.log("OstMappyCallbacks :: registerDevice");
    return new Promise((resolve, reject) => {

      return resolve({deviceAddress: deviceAddress, apiKeyAddress: apiKeyAddress});
    })
  }
}

export default OstMappyCallbacks;