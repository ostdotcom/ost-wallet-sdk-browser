export default class OstWorkflowContext {

  static WORKFLOW_TYPE = {
    SETUP_DEVICE: 'SETUP_DEVICE',
    CREATE_SESSION: 'CREATE_SESSION',
		EXECUTE_TRANSACTION: 'EXECUTE_TRANSACTION'
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
