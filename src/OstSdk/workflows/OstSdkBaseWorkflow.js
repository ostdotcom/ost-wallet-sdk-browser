import OstKeyManagerProxy from "../OstKeyManagerProxy";
import OstError from "../../common-js/OstError";
import OstStateManager from "./OstStateManager";

export default class OstSdkBaseWorkflow {

  constructor(args, browserMessenger) {
    this.userId = args.user_id.toString();
    this.browserMessenger = browserMessenger;
    let orderedStates = this.getOrderedStates();
    this.stateManager = new OstStateManager(orderedStates);


    this.keyManagerProxy = new OstKeyManagerProxy(this.browserMessenger, this.userId);
  }

  getOrderedStates() {
    let states = OstStateManager.state;
    let orderedStates = [];

    orderedStates.push(states.INITIAL);
    orderedStates.push(states.PARAMS_VALIDATED);
    orderedStates.push(states.DEVICE_VALIDATED);

    orderedStates.push(states.COMPLETED);
    orderedStates.push(states.CANCELLED);

    return orderedStates;
  }

  perform() {
    try {
      this.process();
    }catch (err) {
      let error = OstError.sdkError(err, 'sk_w_osbw_p_1');

      this.postError(error);
    }
  }

  process() {
    let states = OstStateManager.state;
    switch (this.stateManager.getCurrentState()) {
      case states.INITIAL:
        this.validateParams();
        this.onParamsValidated();
        break;
      case states.PARAMS_VALIDATED:
        this.performUserDeviceValidation();
        this.onUserDeviceValidated();
        break;
      case states.DEVICE_VALIDATED:
        this.onDeviceValidated();
        break;
      case states.COMPLETED:
        break;
      case states.CANCELLED:
        break;
      case states.COMPLETED_WITH_ERROR:
        break;
      default:
        break;
    }
  }

  validateParams() {

  }

  onParamsValidated() {
    this.processNext();
  }

  performUserDeviceValidation() {
    //ensureApiCommunication

    //ensureUser

    //ensureToken

    //shouldCheckCurrentDeviceAuthorization
    if (this.shouldCheckCurrentDeviceAuthorization()) {
      //ensureDeviceAuthorized
    }
  }

  shouldCheckCurrentDeviceAuthorization() {
    return true;
  }

  onUserDeviceValidated() {
    this.processNext();
  }

  onDeviceValidated() {
    this.processNext();
  }

  onWorkflowComplete() {
    const workflowContext = this.getWorkflowContext();

  }

  getWorkflowContext() {

  }

  performState(state, obj) {
    this.stateManager.setState(state, obj);
    this.perform();
  }

  processNext(obj = null) {
    this.stateManager.setNextState(obj);
    this.process();
  }

  postError(error) {

  }


}
