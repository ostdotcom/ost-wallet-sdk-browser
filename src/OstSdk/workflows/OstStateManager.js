export default class OstStateManager {
  static state = {
    INITIAL: "INITIAL",
    PARAMS_VALIDATED: "PARAMS_VALIDATED",
    REGISTERED: "REGISTERED",
    DEVICE_VALIDATED: "DEVICE_VALIDATED",
    POLLING: "POLLING",
    PIN_AUTHENTICATION_REQUIRED: "PIN_AUTHENTICATION_REQUIRED",
    PIN_INFO_RECEIVED: "PIN_INFO_RECEIVED",
    AUTHENTICATED: "AUTHENTICATED",
    CANCELLED: "CANCELLED",
    COMPLETED: "COMPLETED",
    COMPLETED_WITH_ERROR: "COMPLETED_WITH_ERROR"
  };

  constructor(states) {

    this.orderedStates = states || [];
    this.currentStateIndex = 0;
    this.stateObject = null;
  }

  setStateObject(obj) {
    this.stateObject = obj;
  }

  getCurrentState() {
    if (this.orderedStates.length > this.currentStateIndex) {
      return this.orderedStates[this.currentStateIndex]
    }
    return this.state.COMPLETED_WITH_ERROR
  }


  getNextState() {
    let stateIndex = this.currentStateIndex + 1;
    if (this.orderedStates.count > stateIndex) {
      this.currentStateIndex = stateIndex;
      return this.orderedStates[stateIndex];
    }
    return this.state.COMPLETED_WITH_ERROR
  }

  setNextState(obj = null) {
    this.currentStateIndex += 1;
    this.setStateObject(obj)
  }

  setState(state, obj = null) {
    let stateIndx = this.orderedStates.indexOf(state);
    this.currentStateIndex = stateIndx;
    this.setStateObject(obj)
  }

  getStateObject() {
    return this.stateObject
  }

  setOrderedStates(states) {
    this.orderedStates = states
  }
}
