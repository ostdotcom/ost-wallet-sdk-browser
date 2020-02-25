import OstSdkBaseWorkflow from "./OstSdkBaseWorkflow";
import OstError from "../../common-js/OstError";
import OstErrorCodes from '../../common-js/OstErrorCodes'
import OstSession from "../entities/OstSession";
import OstSessionPolling from "../OstPolling/OstSessionPolling";
import OstWorkflowContext from "./OstWorkflowContext";
import OstHelpers from "../../common-js/OstHelpers";

const LOG_TAG = "OstSdk :: OstSdkCreateSession :: ";

class OstSdkCreateSession extends OstSdkBaseWorkflow {
  constructor(args, browserMessenger) {
    super(args, browserMessenger);
    console.log(LOG_TAG, "constructor :: ", args);

    this.user_id = args.user_id;
    this.expirationTime = parseInt(args.expiration_time);
    this.spendingLimit = String(args.spending_limit);
  }

  initParams() {
    super.initParams();

    this.session = null;

    this.sessionPollingClass = null;
  }

  getWorkflowName() {
    return OstWorkflowContext.WORKFLOW_TYPE.CREATE_SESSION
  }

  validateParams() {
    super.validateParams();

    const currentTimeStamp = parseInt(Date.now()/1000);

    if (currentTimeStamp > this.expirationTime) {
      throw new OstError('os_w_oscs_vp_1', OstErrorCodes.INVALID_SESSION_EXPIRY_TIME)
    }

    const num = Number(this.spendingLimit);
    if (!this.spendingLimit || isNaN(num)) {
      throw new OstError('os_w_oscs_vp_2', OstErrorCodes.INVALID_SESSION_SPENDING_LIMIT, {spending_limit: this.spendingLimit})
    }
  }

  performUserDeviceValidation() {
    return super.performUserDeviceValidation()
      .then(() => {
        if (!this.user.isStatusActivated()) {
          throw new OstError('os_w_oscs_pudv_1', OstErrorCodes.USER_NOT_ACTIVATED);
        }
      })
  }

  onDeviceValidated() {
    const oThis = this;
    console.log(LOG_TAG, " onDeviceValidated");

    oThis.keyManagerProxy.createSessionKey()
      .then((sessionAddress) => {
        return oThis.createSessionEntity( sessionAddress.session_address )
      })
      .then((sessionEntity) => {
        oThis.session = sessionEntity;
        return this.keyManagerProxy.signQRSessionData(
          sessionEntity.getId(),
          sessionEntity.getSpendingLimit().toString(),
          sessionEntity.getExpiryTime().toString()
          )
      })
      .then((data) => {
        oThis.qr_data = data.qr_data;
        oThis.postShowQRData();
        return oThis.processNext();
      })
      .catch((err) => {
        oThis.postError(err);
      })
  }

  createSessionEntity( sessionAddress ) {
    return OstSession.init(this.user_id, sessionAddress, this.spendingLimit, this.expirationTime)
  }

  postShowQRData( qrData ) {
    this.postRequestAcknowledged(this.session)
  }

  getRequestAckContextEntity(entity) {
    let contextEntity = super.getRequestAckContextEntity(entity);
    contextEntity['qr_data'] = this.qr_data;
    return contextEntity;
  }

  onPolling() {
    const oThis = this;
    let sessionAddress =  oThis.workflowContext.getData().context_entity_id;

    return oThis.pollingForSessionAddress(sessionAddress)
      .then((entity) => {
        oThis.postFlowComplete(entity);
      })
      .catch((err) => {
        oThis.postError(err);
      })
  }

  pollingForSessionAddress(sessionAddress) {
    this.sessionPollingClass = new OstSessionPolling(this.userId, sessionAddress, this.keyManagerProxy);
    return this.sessionPollingClass.perform()
      .then((sessionEntity) => {
        console.log(sessionEntity);
        return sessionEntity;
      })
      .catch((err) => {
        throw err
      })
  }

}

export default OstSdkCreateSession
