export default class OstWorkflowContext {

  static WORKFLOW_TYPE = {
    SETUP_DEVICE: 'SETUP_DEVICE',
  };

  constructor(workflowName) {
    this.workflowName = workflowName;
  }

  getJSONObject() {
    return {
      workflow_name: this.workflowName
    }
  }
}