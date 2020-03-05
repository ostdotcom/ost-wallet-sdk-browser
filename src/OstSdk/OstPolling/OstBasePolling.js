import OstConstants from '../OstConstants'
import OstApiClient from "../api/OstApiClient";

const LOG_TAG = "OstBasePolling :: ";
class OstBasePolling {

  static FIRST_REQUEST_DELAY_TIME = 1000 * 21; //21 seconds

  constructor(userId, keyManagerProxy, ostWorkflowContext) {
    this.userId = userId;
    this.isFirstRequest = true;
    this.keyManagerProxy = keyManagerProxy;
    this.ostWorkflowContext = ostWorkflowContext;

    this.apiClient = new OstApiClient(this.userId, OstConstants.getBaseURL(), this.keyManagerProxy);
  }

  perform() {
    return new Promise((resolve, reject) => {
      this.getEntity(
        (entity) => {
          console.log(LOG_TAG, "perform :: Success :: ", entity);
          resolve(entity);
        },
        (err) => {
          console.log(LOG_TAG, "perform :: failure :: ", err);
          reject(err);
        })
    })
  }

  getEntity(success, failure) {
    let oThis = this;

    let delayTime = OstConstants.getBlockGenerationTime();
    if (oThis.isFirstRequest) {
      oThis.isFirstRequest = false;
      delayTime = OstBasePolling.FIRST_REQUEST_DELAY_TIME;
    }

    setTimeout(() => {
      this.fetchEntity()
        .then((entity) => {
          if (entity && oThis.isProcessCompleted(entity) ) {
            return success(entity);
          }
          if (entity && oThis.isProcessFailed(entity) ) {
            return failure(entity);
          }
          oThis.getEntity(success, failure);
        })
        .catch((err) => {
					const pollingError = oThis.getPollingFailedError(err);
					if (pollingError) {
						failure(pollingError);
					} else {
						oThis.getEntity(success, failure);
					}
        })
    }, delayTime)
  }

  fetchEntity() {

  }

  isProcessCompleted( entity ) {
    return false;
  }

	isProcessFailed( entity ) {
		return false;
	}

  getPollingFailedError( err ) {
    return null;
  }
}

export default OstBasePolling
