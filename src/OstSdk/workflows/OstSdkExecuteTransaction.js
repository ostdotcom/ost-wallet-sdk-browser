import OstSdkBaseWorkflow from "./OstSdkBaseWorkflow";
import OstError from "../../common-js/OstError";
import OstErrorCodes from '../../common-js/OstErrorCodes'
import OstSession from "../entities/OstSession";
import OstRule from "../entities/OstRule";
import OstTransactionPolling from "../OstPolling/OstTransactionPolling";

const LOG_TAG = "OstSdk :: OstSdkExecuteTransaction :: ";

class OstSdkExecuteTransaction extends OstSdkBaseWorkflow {
  constructor(args, browserMessenger) {
    super(args, browserMessenger);
    console.log(LOG_TAG, "constructor :: ", args);

    this.transactionData = args.transaction_data;

		this.token_holder_addresses = this.transactionData.token_holder_addresses;
    this.amounts = this.transactionData.amounts;
    this.ruleName = this.transactionData.rule_name;
		this.ruleMethod = this.transactionData.rule_method;
		this.meta = this.transactionData.meta;
    this.options = this.transactionData.options;
  }

  initParams() {
    super.initParams();

    this.session = null;

    this.transactionPollingClass = null;
  }

  validateParams() {
    super.validateParams();
  }

  performUserDeviceValidation() {
    return super.performUserDeviceValidation()
      .then(() => {
        if (!this.user.isStatusActivated()) {
          throw new OstError('os_w_oscs_pudv_1', OstErrorCodes.USER_NOT_ACTIVATED);
        }
      })
  }

  getAuthorizedSession() {
		return OstSession.getAllSessions()
			.then((sessionAddress) => {
				for (let i=0; i < sessionAddress.length; i++) {
					const session = sessionAddress[i];
					if (session.status === OstSession.STATUS.AUTHORIZED) {
						return session;
					}
				}
				return null;
			})
			.catch((err) => {
				console.error(LOG_TAG, "Error while fetching authorized session" ,err);
				return Promise.resolve(null);
			})
  }

	getRule(ruleName) {
		const oThis = this;
		return new Promise((resolve) => {
			OstRule.getById(ruleName)
				.then((res) => {
					if (res) return resolve(res.getData());

					// If rule Not found fetch rules
					return oThis.syncRules()
						.then(() => {
							return OstRule.getById(ruleName)
								.then((res) => {
									if (!res) throw "Rule not found";

									return resolve(res.getData());
								})
						});
				})
				.catch((err) => {
					console.error(LOG_TAG, "Error while fetching rule");
					return resolve();
				})
		});
	}

  onDeviceValidated() {
    const oThis = this;
    console.log(LOG_TAG, " onDeviceValidated");
    Promise.all([oThis.getAuthorizedSession(), oThis.getRule(oThis.ruleName)])
			.then((resp) => {
				if (!resp[0]) {
					console.error(LOG_TAG, "Session fetch failed");
					return Promise.reject();
				}
				const session = resp[0];
				this.session = new OstSession(session);

				if (!resp[1]) {
					console.error(LOG_TAG, "Rule fetch failed");
					return Promise.reject();
				}
				const rule = resp[1];
				return oThis.keyManagerProxy.signTransaction(session,
					oThis.user.getTokenHolderAddress(),
					oThis.token_holder_addresses,
					oThis.amounts,
					rule,
					oThis.ruleMethod,
					oThis.options);
			})
			.then((response) => {
				const struct = response.signed_transaction_struct;
				const txnData = response.transaction_data;

        console.log(struct);

        const params = {
					to: txnData.rule.address,
					raw_calldata: JSON.stringify(struct.raw_call_data),
					nonce: txnData.session.nonce,
					calldata: struct.call_data,
					signature:struct.signature,
					signer: txnData.session.address,
					meta_property: {},
        };

        console.log(LOG_TAG, "TXN PARAMS", params);
        return oThis.apiClient.executeTransaction(params);
      })
			.then((dataObject) => {
				return oThis.session.addNonce()
					.then(() => {
						return oThis.pollingForTransaction(dataObject['transaction'].id);
					});
			})
      .then((entity) => {
        this.postFlowComplete(entity);
      })
      .catch((err) => {
      	console.error(LOG_TAG, "Workflow failed" ,err);
        this.postError(err);
      })
  }

  pollingForTransaction(transactionId) {
    this.transactionPollingClass = new OstTransactionPolling(this.userId, transactionId, this.keyManagerProxy);
    return this.transactionPollingClass.perform()
      .then((txnEntity) => {
        console.log(txnEntity);
        return txnEntity;
      })
      .catch((err) => {
      	console.error(LOG_TAG, "Transaction Failed.. Decrementing nonce", err);
      	 return this.apiClient.getSession(this.session.getId());
      })
  }

}

export default OstSdkExecuteTransaction
