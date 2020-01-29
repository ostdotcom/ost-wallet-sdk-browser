import OstError from "../../common-js/OstError";
import OstErrorCode from '../../common-js/OstErrorCodes'
import OstConstants from '../OstConstants'
import OstApiClient from "../../Api/OstApiClient";

const LOG_TAG = "OstBasePolling :: ";
class OstBasePolling {

  static MAX_RETY_COUNT = 20;
  static FIRST_REQUEST_DELAY_TIME = 1000 * 21; //21 seconds

  constructor(userId, keyManagerProxy) {
    this.userId = userId;
    this.requestCount = 0;
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
    this.requestCount += 1;

    if ( OstBasePolling.MAX_RETY_COUNT >= this.requestCount ) {

      let delayTime = OstConstants.getBlockGenerationTime();
      if (1 === oThis.requestCount) {
        delayTime = OstBasePolling.FIRST_REQUEST_DELAY_TIME
      }

      setTimeout(() => {
        this.fetchEntity()
          .then((entity) => {
            if (entity && oThis.isProcessCompleted(entity) ) {
              return success(entity);
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

    }else {

      failure(new OstError('os_op_obp_1', OstErrorCode.POLLING_TIMEOUT))
    }
  }

  fetchEntity() {

  }

  isProcessCompleted( entity ) {
    return false
  }

  shouldRetryAfterError( err ) {
    return true
  }
}

export default OstBasePolling