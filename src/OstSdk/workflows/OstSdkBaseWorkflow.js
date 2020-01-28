import OstKeyManagerProxy from "../OstKeyManagerProxy";
import OstError from "../../common-js/OstError";
import OstStateManager from "./OstStateManager";
import OstApiClient from "../../Api/OstApiClient";
import OstWorkflowContext from "./OstWorkflowContext";
import OstMessage from "../../common-js/OstMessage";
import {SOURCE} from "../../common-js/OstBrowserMessenger";
import OstErrorCodes from "../../common-js/OstErrorCodes";

const LOG_TAG = 'OstSdkBaseWorkflow :: ';

const baseUrl = 'https://api.stagingostproxy.com/testnet/v2/';

export default class OstSdkBaseWorkflow {

  constructor(args, browserMessenger) {
    this.userId = args.user_id.toString();
    this.subscriberId = args.subscriber_id.toString();

    this.browserMessenger = browserMessenger;

    let orderedStates = this.getOrderedStates();
    this.stateManager = new OstStateManager(orderedStates);


    this.keyManagerProxy = new OstKeyManagerProxy(this.browserMessenger, this.userId);

    this.initParams()
  }

  initParams() {
    this.user = null;
    this.currentDevice = null;
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
    if (!this.userId) {
      throw new OstError('os_w_osbw_vp__1', OstErrorCodes.INVALID_USER_ID);
    }
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
    let workflowContext = new OstWorkflowContext(this.getWorkflowName());
    return workflowContext
  }

  getWorkflowName() {

  }

  performState(state, obj) {
    this.stateManager.setState(state, obj);
    this.perform();
  }

  processNext(obj = null) {
    this.stateManager.setNextState(obj);
    this.process();
  }

  postFlowComplete(entity) {
    let message = new OstMessage();
    message.setSubscriberId(this.subscriberId);
    message.setFunctionName('flowComplete');
    message.setArgs({
      ost_context_entity: entity.getData(),
      ost_workflow_context: this.getWorkflowContext().getJSONObject()
    });

    this.browserMessenger.sendMessage(message, SOURCE.UPSTREAM);
  }

  postError(error) {
    error = OstError.sdkError(error, 'os_w_osbw_pe_1');

    let message = new OstMessage();
    message.setSubscriberId(this.subscriberId);
    message.setFunctionName('flowInterrupt');
    message.setArgs({
      ost_error: error.getJSONObject(),
      ost_workflow_context: this.getWorkflowContext().getJSONObject()
    });

    this.browserMessenger.sendMessage(message, SOURCE.UPSTREAM);
  }

  //Sync

  syncCurrentDevice() {
    let oThis = this;

    const apiClient = new OstApiClient(oThis.userId, baseUrl, oThis.keyManagerProxy);
    return apiClient.getDevice(this.currentDevice.getId())
    	.then((res) => {
          console.log(LOG_TAG, 'syncCurrentDevice :: then', res);
    	})
    	.catch((err) => {
    		console.log(LOG_TAG, 'syncCurrentDevice :: catch', err);
    	});
  }

  syncUser() {
    let oThis = this;

    const apiClient = new OstApiClient(oThis.userId, baseUrl, oThis.keyManagerProxy);
    return apiClient.getUser()
      .then((res) => {
        console.log(LOG_TAG, 'syncUser :: then', res);
      })
      .catch((err) => {
        console.log(LOG_TAG, 'syncUser :: catch', err);
      });
  }

  syncToken() {
    let oThis = this;

    const apiClient = new OstApiClient(oThis.userId, baseUrl, oThis.keyManagerProxy);
    return apiClient.getToken()
      .then((res) => {
        console.log(LOG_TAG, 'syncUser :: then', res);
      })
      .catch((err) => {
        console.log(LOG_TAG, 'syncUser :: catch', err);
      });
  }

}
