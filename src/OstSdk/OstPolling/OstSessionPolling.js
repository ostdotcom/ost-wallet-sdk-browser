import OstBasePolling from "./OstBasePolling";
import OstSession from "../entities/OstSession";
import OstError from "../../common-js/OstError";
import OstErrorCodes from "../../common-js/OstErrorCodes";

let create_session_qr_timeout = 3 * 60 * 60;

class OstSessionPolling extends OstBasePolling {
  constructor(userId, sessionAddress, keyManagerProxy, ostWorkflowContext) {
    super(userId, keyManagerProxy, ostWorkflowContext);

    this.sessionAddress = sessionAddress;
  }

	static setCreateSessionQRTimeout( val ) {
		create_session_qr_timeout = val;
	}

	fetchEntity() {
		let oThis = this;
		// Check whether session key exists
		return OstSession.init(oThis.userId, oThis.sessionAddress)
			.then((sessionEntity) => {
			  oThis.sessionEntity = sessionEntity;
				return oThis.keyManagerProxy.filterLocalSessions([oThis.sessionEntity.getData()])
			})
			.then((filteredSessions) => {
			  if (!filteredSessions.length ||
					filteredSessions[0].id.toLowerCase() !== oThis.sessionAddress.toLowerCase()) {

			    throw new OstError('os_op_osp_fe_1', OstErrorCodes.SESSION_KEY_NOT_FOUND);

			  }
				return filteredSessions[0];
			})
			//If session key exists start poll
			.then(() => {
				return oThis.apiClient.getSession(oThis.sessionAddress)
			})
			.then((res) => {
				return OstSession.getById(oThis.sessionAddress);
			})
	}

	isProcessCompleted(entity) {
    return entity.isStatusAuthorized();
  }

	isProcessFailed(entity) {
		return false;
	}

  isPollingTimeOut(entity) {
    const oThis = this
    ;

    if (!oThis.ostWorkflowContext) {
      return true;
    }

		const currentTimeStamp = parseInt(Date.now() / 1000);
		if (currentTimeStamp - parseInt(oThis.ostWorkflowContext.getUpdatedAt()) > create_session_qr_timeout) {
			return true;
		}
		return false;
  }

	getPollingFailedError(err) {
    const oThis = this
    ;

    //Check for polling timeout
		const isPollingTimeOut = oThis.isPollingTimeOut();
		if (isPollingTimeOut) {
			return new OstError('os_op_osp_gte_1', OstErrorCodes.CREATE_SESSION_QR_TIMEOUT);
    }

		if (err instanceof OstError) {
			if (OstErrorCodes.CREATE_SESSION_QR_TIMEOUT == err.getErrorCode() ||
				OstErrorCodes.SESSION_KEY_NOT_FOUND == err.getErrorCode()) {
				return err;
			}
		}
		return null;
	}
}


export default OstSessionPolling;
