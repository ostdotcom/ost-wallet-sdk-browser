import OstBasePolling from "./OstBasePolling";
import OstTransaction from "../entities/OstTransaction";

class OstTransactionPolling extends OstBasePolling {
  constructor(userId, transactionId, keyManagerProxy) {
    super(userId, keyManagerProxy);

    this.transactionId = transactionId;
  }

  fetchEntity() {
    let oThis = this;

    return oThis.apiClient.getTransaction(oThis.transactionId)
      .then((res) => {
        return OstTransaction.getById(oThis.transactionId);
      })
  }

  isProcessCompleted(entity) {
    return entity.isStatusSuccess();
  }

  isProcessFailed(entity) {
    return entity.isStatusFailed();
  }

  shouldRetryAfterError( err ) {
    return true
  }
}


export default OstTransactionPolling;
