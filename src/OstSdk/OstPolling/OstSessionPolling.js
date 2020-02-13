import OstBasePolling from "./OstBasePolling";
import OstSession from "../entities/OstSession";

class OstSessionPolling extends OstBasePolling {
  constructor(userId, sessionAddress, keyManagerProxy) {
    super(userId, keyManagerProxy);

    this.sessionAddress = sessionAddress;
  }

  fetchEntity() {
    let oThis = this;

    return oThis.apiClient.getSession(oThis.sessionAddress)
      .then((res) => {
        return OstSession.getById(oThis.sessionAddress);
      })
  }

  isProcessCompleted(entity) {
    return entity.isStatusAuthorized();
  }

  shouldRetryAfterError( err ) {
    return true
  }
}


export default OstSessionPolling;
