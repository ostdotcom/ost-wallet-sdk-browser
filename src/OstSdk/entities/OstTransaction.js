import {OstBaseEntity, STORES} from "./OstBaseEntity";

class OstTransaction extends OstBaseEntity {

	static STATUS = {
		CREATED: "CREATED",
		SUBMITTED: "SUBMITTED",
		MINED: "MINED",
		SUCCESS: "SUCCESS",
		FAILED: "FAILED"
	};

  constructor(jsonObject) {
    super(jsonObject)
  }

  getIdKey() {
    return 'id';
  }

  static getAllTransaction() {
    const ostSession = new OstTransaction({id: 'DummyInstance'});
    return ostSession.getAll();
  }

  static getById(identifier) {
    const ostTransaction = new OstTransaction(
      {id: identifier}
    );
    return ostTransaction.sync();
  }

  static parse(data) {
    const session = new OstTransaction(data);
    return session.forceCommit();
  }

  getStoreName() {
    return STORES.OST_TRANSACTION;
  }

  isStatusMined() {
  	return this.getStatus() == OstTransaction.STATUS.MINED;
	}

	isStatusFailed() {
		return this.getStatus() == OstTransaction.STATUS.FAILED;
	}
}
export default OstTransaction;
