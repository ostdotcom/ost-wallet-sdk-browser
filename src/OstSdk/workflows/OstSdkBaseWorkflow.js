import OstKeyManagerProxy from "../OstKeyManagerProxy";
import OstError from "../../common-js/OstError";
import OstStateManager from "./OstStateManager";
import OstApiClient from "../../Api/OstApiClient";
import OstWorkflowContext from "./OstWorkflowContext";
import OstMessage from "../../common-js/OstMessage";
import {SOURCE} from "../../common-js/OstBrowserMessenger";
import OstErrorCodes from "../../common-js/OstErrorCodes";
import OstDevice from "../entities/OstDevice";
import OstUser from "../entities/OstUser";
import OstToken from "../entities/OstToken";

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
    this.token = null;
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
        this.performUserDeviceValidation()
          .then(() => {
            this.onUserDeviceValidated();
          })
          .catch((err) => {
            throw OstError.sdkError(err, 'sk_w_osbw_pr_1');
          });
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

    return this.ensureApiCommunication()
      .then(() => {
        return this.ensureUser()
      })
      .then(() => {
        return this.ensureToken()
      })
      .then(() => {
        if (this.shouldCheckCurrentDeviceAuthorization()) {
          if (!this.currentDevice.isStatusAuthorized()) {
            throw OstError('os_w_osbw_pwdv_1', OstErrorCodes.DEVICE_UNAUTHORIZED);
          }
        }
      })
  }

  ensureApiCommunication() {
    return this.getUserFromDB()
      .then(() => {
        return this.getCurrentDeviceFromDB()
      })
      .then(() => {
        return this.canDeviceMakeApiCall()
      })
      .then(() => {

        //return this.syncCurrentDevice()
      })
      .then(() => {

      })
  }

  getUserFromDB() {
    return OstUser.getById(this.userId)
      .then((userEntity) => {
        this.user = userEntity;
        if (!userEntity) {
          throw OstError('os_w_osbw_eac_1', OstErrorCodes.DEVICE_NOT_SETUP)
        }
      })
  }

  getCurrentDeviceFromDB() {
    return this.user.getCurrentDevice()
      .then((deviceEntity) => {
        this.currentDevice = deviceEntity;
        if (!deviceEntity) {
          throw OstError('os_w_osbw_eac_2', OstErrorCodes.DEVICE_NOT_SETUP)
        }
      })
  }

  canDeviceMakeApiCall() {
    let oThis = this;
    return oThis.keyManagerProxy.getApiKeyAddress()
      .then((apiKeyAddress) => {
        if (!apiKeyAddress) {
          throw OstError('os_w_osbw_cdmac_1', OstErrorCodes.INVALID_API_END_POINT)
        }
        if (!oThis.currentDevice.canMakeApiCall()) {
          throw OstError('os_w_osbw_cdmac_2', OstErrorCodes.DEVICE_NOT_SETUP)
        }
      })
  }

  ensureUser() {
    if (!this.user
      || !this.user.getTokenHolderAddress()
      || !this.user.getDeviceManagerAddress()
    ) {
      return this.syncUser()
    }
    return Promise.resolve();
  }

  ensureToken() {
    let oThis = this;
    if (!this.user) {
      return this.ensureUser()
        .then(() => {
          return oThis.validateToken()
        })
    }
    return oThis.validateToken()
  }


  shouldCheckCurrentDeviceAuthorization() {
    return false;
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
        return oThis.getCurrentDeviceFromDB()
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
        return oThis.getUserFromDB()
      })
      .catch((err) => {
        console.log(LOG_TAG, 'syncUser :: catch', err);
      });
  }

  validateToken() {

    return this.getTokenFromDB()
      .then(() => {
        if (!this.token || !this.token.getAuxiliaryChainId() || !this.token.getDecimals()) {
          return this.syncToken();
        }
      })
  }

  getTokenFromDB() {
    let tokenId = this.user.getTokenId();
    return OstToken.getById(tokenId)
      .then((tokenEntity) => {
        this.token = tokenEntity;
        if (!tokenEntity) {
          throw OstError('os_w_osbw_gtfdb_1', OstErrorCodes.DEVICE_NOT_SETUP)
        }
      })
  }

  syncToken() {
    let oThis = this;

    const apiClient = new OstApiClient(oThis.userId, baseUrl, oThis.keyManagerProxy);
    return apiClient.getToken()
      .then((res) => {
        return oThis.getTokenFromDB()
      })
      .catch((err) => {
        console.log(LOG_TAG, 'syncUser :: catch', err);
      });
  }

}
