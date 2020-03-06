class MappyUiWorkflowCallback {
  setWorkflowId(id) {
    const oThis = this;
    oThis.id = id;

  }

  setFlowComplete(ostWorkflowContext, ostContextEntity) {
    const oThis = this;
    var response = {
      "ostWorkflowContext": ostWorkflowContext,
      "ostContextEntity": ostContextEntity
    }
    oThis.length = oThis.responseArr.push(response);
  }

  getResponses() {
    return oThis.responseArr;
  }
}

export default new MappyUiWorkflowCallback();
