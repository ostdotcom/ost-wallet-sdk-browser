import uuidv4 from "uuid/v4";

class OstBaseWorkflow {
  constructor(browserMessenger, ostWorkflowCallbacks) {
    this.workflowId = null;
    this.browserMessenger = browserMessenger;
    this.ostWorkflowCallbacks = ostWorkflowCallbacks;
  }

  perform ( ) {
    this.workflowId = uuidv4();
    console.log("OstBaseWorkflow :: workflowId : ", this.workflowId);
  }
}

export default OstBaseWorkflow