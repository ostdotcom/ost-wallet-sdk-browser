import OstConstants from '../OstConstants'
import OstApiClient from "../../Api/OstApiClient";

const LOG_TAG = "OstBasePolling :: ";
class OstBasePolling {

  static FIRST_REQUEST_DELAY_TIME = 1000 * 21; //21 seconds

  constructor(userId, keyManagerProxy) {
    this.userId = userId;
    this.isFirstRequest = true;
    this.keyManagerProxy = keyManagerProxy;

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
          if ( this.shouldRetryAfterError(err) ) {
            oThis.getEntity(success, failure);
          }else {
            failure(err);
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

  shouldRetryAfterError( err ) {
    return true;
  }
}

export default OstBasePolling
