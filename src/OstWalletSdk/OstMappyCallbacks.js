import OstWalletWorkFlowCallback from "./OstWalletCallback/OstWorkflowCallbacks";

class OstMappyCallbacks extends OstWalletWorkFlowCallback {
  constructor() {
    super()
  }

  registerDevice ( args ) {
    console.log("register device called.", args);
  }
}

export default OstMappyCallbacks;