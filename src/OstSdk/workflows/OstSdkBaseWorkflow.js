import OstKeyManagerProxy from "../OstKeyManagerProxy";
import OstError from "../../common-js/OstError";
import OstStateManager from "./OstStateManager";
import OstApiClient from "../../Api/OstApiClient";
import OstWorkflowContext from "./OstWorkflowContext";
import OstMessage from "../../common-js/OstMessage";
import {SOURCE} from "../../common-js/OstBrowserMessenger";
import OstErrorCodes from "../../common-js/OstErrorCodes";
import OstUser from "../entities/OstUser";
import OstToken from "../entities/OstToken";
import OstConstants from '../OstConstants';

const LOG_TAG = 'OstSdkBaseWorkflow :: ';

export default class OstSdkBaseWorkflow {

  constructor(args, browserMessenger) {
    this.args = args;
    this.userId = args.user_id.toString();
    this.subscriberId = args.subscriber_id.toString();
    this.workflowId = args.workflow_id.toString();

    this.browserMessenger = browserMessenger;

    let orderedStates = this.getOrderedStates();
    this.stateManager = new OstStateManager(orderedStates);


    this.keyManagerProxy = new OstKeyManagerProxy(this.browserMessenger, this.userId);
    this.apiClient = new OstApiClient(this.userId, OstConstants.getBaseURL(), this.keyManagerProxy);

    this.initParams();
  }

  initParams() {
    this.user = null;
    this.currentDevice = null;
    this.token = null;

    this.createWorkflowContext();
  }

  createWorkflowContext() {
    const oThis = this
      , workflowObj = {
        id: oThis.workflowId,
        name: oThis.getWorkflowName(),
        user_id: oThis.userId,
        args: [oThis.args],
        status: OstWorkflowContext.STATUS.CREATED
      }
    ;

    oThis.workflowContext = OstWorkflowContext.newInstanceFromObject(workflowObj);
  }

  getOrderedStates() {
    let states = OstStateManager.state;
    let orderedStates = [];

    orderedStates.push(states.INITIAL);
    orderedStates.push(states.PARAMS_VALIDATED);
    orderedStates.push(states.DEVICE_VALIDATED);
    orderedStates.push(states.POLLING);

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
        try {
          this.postFlowInitiated()
            .then(() => {
              this.validateParams();
              this.onParamsValidated();
            });
        } catch (err) {
          throw  OstError.sdkError(err, 'sk_w_osbw_p_vp_1');
        }
        break;

      case states.PARAMS_VALIDATED:
        return this.performUserDeviceValidation()
          .then(() => {
            this.onUserDeviceValidated();
          })
          .catch((err) => {
            throw OstError.sdkError(err, 'sk_w_osbw_p_pudv_1');
          });

        case states.DEVICE_VALIDATED:
        this.onDeviceValidated();
        break;

      case states.POLLING:
        this.onPolling();
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
            throw new OstError('os_w_osbw_pwdv_1', OstErrorCodes.DEVICE_UNAUTHORIZED);
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
      });
  }

  getUserFromDB() {
    return OstUser.getById(this.userId)
      .then((userEntity) => {
        this.user = userEntity;
        if (!userEntity) {
          throw new OstError('os_w_osbw_eac_1', OstErrorCodes.DEVICE_NOT_SETUP)
        }
      })
  }

  getCurrentDeviceFromDB() {
    return this.user.createOrGetDevice(this.keyManagerProxy)
      .then((deviceEntity) => {
        console.log(LOG_TAG, "|*|", "this.user.createOrGetDevice deviceEntity:", deviceEntity);
        this.currentDevice = deviceEntity;
        if (!deviceEntity) {
          throw new OstError('os_w_osbw_eac_2', OstErrorCodes.DEVICE_NOT_SETUP)
        }

        return deviceEntity;
      })
  }

  canDeviceMakeApiCall() {
    let oThis = this;
    return oThis.keyManagerProxy.getApiKeyAddress()
      .then((apiKeyAddress) => {
        if (!apiKeyAddress) {
          throw new OstError('os_w_osbw_cdmac_1', OstErrorCodes.INVALID_API_END_POINT)
        }
        if (!oThis.currentDevice.canMakeApiCall()) {
          throw new OstError('os_w_osbw_cdmac_2', OstErrorCodes.DEVICE_NOT_SETUP)
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

  onPolling() {
    this.processNext();
  }

  getWorkflowContext() {
    const oThis = this
    ;

    return oThis.workflowContext;
  }

  onWorkflowInitiated() {
    const oThis = this
    ;

    //return if workflow context is not allowed by the sub-class
    if (oThis.shouldNotSaveWorkflowContext()) return Promise.resolve(false);

    if (!oThis.workflowContext) {
      throw "Not expected";
    }

    oThis.workflowContext.setWorkflowStatus(OstWorkflowContext.STATUS.INITIATED);

    return oThis.workflowContext.forceCommit()
      .catch((err) => {
        console.error(LOG_TAG, "onWorkflowInitiated", err);
        throw err;
      });
  }

  onWorkflowAcknowledged(entity) {
    const oThis = this
    ;

    //return if workflow context is not allowed by the sub-class
    if (oThis.shouldNotSaveWorkflowContext()) return Promise.resolve(false);

    if (!oThis.workflowContext) {
      throw "Not expected";
    }

    oThis.workflowContext.setWorkflowStatus(OstWorkflowContext.STATUS.ACKNOWLEDGED);

    //Todo:: some of the workflow entity don't have ids please handle it.
    oThis.workflowContext.setContextEntityId(entity.getId());
    oThis.workflowContext.setContextEntityType(entity.getType());

    return oThis.workflowContext.forceCommit()
      .catch((err) => {
        console.error(LOG_TAG, "onWorkflowAcknowledged", err);
        throw err;
      });
  }

  onWorkflowComplete() {
    const oThis = this
    ;

    //return if workflow context is not allowed by the sub-class
    if (oThis.shouldNotSaveWorkflowContext()) return Promise.resolve(false);

    if (!oThis.workflowContext) {
      throw "Not expected";
    }

    oThis.workflowContext.setWorkflowStatus(OstWorkflowContext.STATUS.COMPLETED);

    return oThis.workflowContext.forceCommit()
      .catch((err) => {
        console.error(LOG_TAG, "onWorkflowComplete", err);
        throw err;
      });
  }

  onWorkflowFailed() {
    const oThis = this
    ;

    //return if workflow context is not allowed by the sub-class
    if (oThis.shouldNotSaveWorkflowContext()) return Promise.resolve(false);

    if (!oThis.workflowContext) {
      throw "Not expected";
    }

    oThis.workflowContext.setWorkflowStatus(OstWorkflowContext.STATUS.INTERRUPTED);
    return oThis.workflowContext.forceCommit()
      .catch((err) => {
        console.error(LOG_TAG, "onWorkflowFailed", err);
        throw err;
      });
  }

  shouldNotSaveWorkflowContext() {
    // Save workflow context for every workflow unless specified
    return false;
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

  postFlowInitiated() {
    const oThis = this
      , message = new OstMessage()
    ;

    message.setSubscriberId(this.subscriberId);
    message.setFunctionName('flowInitiated');
    message.setArgs({
      ost_workflow_context: this.getWorkflowContext().getJSONObject()
    });

    return oThis.onWorkflowInitiated()
      .then(() => {
        return oThis.browserMessenger.sendMessage(message, SOURCE.UPSTREAM);
      });
  }


  postRequestAcknowledged(entity) {
    const oThis = this
      , message = new OstMessage()
    ;

    message.setSubscriberId(this.subscriberId);
    message.setFunctionName('requestAcknowledged');
    let contextEntity = oThis.getRequestAckContextEntity(entity);
    message.setArgs({
      ost_context_entity: contextEntity,
      ost_workflow_context: this.getWorkflowContext().getJSONObject()
    });

    return oThis.onWorkflowAcknowledged(entity)
      .then(() => {
        return oThis.browserMessenger.sendMessage(message, SOURCE.UPSTREAM);
      });
  }

  getRequestAckContextEntity(entity) {
    return {
      entity_type: entity.getType(),
      entity: entity.getData()
    }
  }

  postFlowComplete(entity) {
    const oThis = this
      , message = new OstMessage()
    ;

    message.setSubscriberId(this.subscriberId);
    message.setFunctionName('flowComplete');

    const contextEntity = {entity_type: entity.getType(), entity: entity.getData()};

    message.setArgs({
      ost_context_entity: contextEntity,
      ost_workflow_context: this.getWorkflowContext().getJSONObject()
    });

    return oThis.onWorkflowComplete()
      .then(() => {
        oThis.browserMessenger.sendMessage(message, SOURCE.UPSTREAM);
      });
  }

  postError(error) {
    const oThis = this
      , message = new OstMessage()
    ;

    error = OstError.sdkError(error, 'os_w_osbw_pe_1');
    message.setSubscriberId(this.subscriberId);
    message.setFunctionName('flowInterrupt');
    message.setArgs({
      ost_error: error.getJSONObject(),
      ost_workflow_context: this.getWorkflowContext().getJSONObject()
    });

    return oThis.onWorkflowFailed()
      .then(() => {
        oThis.browserMessenger.sendMessage(message, SOURCE.UPSTREAM);
      });
  }

  getWorkFlowArgs() {
    const oThis = this
    ;
    return [oThis.userId, oThis.workflowId, oThis.subscriberId];
  }
  //Sync

  syncCurrentDevice() {
    let oThis = this;

    return oThis.apiClient.getDevice(this.currentDevice.getId())
      .then((res) => {
        return oThis.getCurrentDeviceFromDB()
      })
      .catch((err) => {
        throw OstError.sdkError(err, 'os_w_osbw__scd_1', OstErrorCodes.SDK_API_ERROR);
      });
  }

  syncUser() {
    let oThis = this;

    return oThis.apiClient.getUser()
      .then((res) => {
        return oThis.getUserFromDB()
      })
      .catch((err) => {
        throw OstError.sdkError(err, 'os_w_osbw__su_1', OstErrorCodes.SDK_API_ERROR);
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
          throw new OstError('os_w_osbw_gtfdb_1', OstErrorCodes.DEVICE_NOT_SETUP)
        }
      })
  }

  syncToken() {
    let oThis = this;

    return oThis.apiClient.getToken()
      .then((res) => {
        return oThis.getTokenFromDB()
      })
      .catch((err) => {
        throw OstError.sdkError(err, 'os_w_osbw__st_1', OstErrorCodes.SDK_API_ERROR);
      });
  }

  cancelFlow() {
    const err = new OstError("os_osdw_cf_1", OstErrorCodes.WORKFLOW_CANCELLED);
    this.postError(err)
  }
}
