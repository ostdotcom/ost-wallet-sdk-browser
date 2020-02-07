import OstSdkBaseWorkflow from "./OstSdkBaseWorkflow";
import OstError from "../../common-js/OstError";
import OstErrorCodes from  '../../common-js/OstErrorCodes'
import OstSession from "../entities/OstSession";
import OstMessage from "../../common-js/OstMessage";
import {SOURCE} from "../../common-js/OstBrowserMessenger";
import OstSessionPolling from "../OstPolling/OstSessionPolling";
import OstRule from "../entities/OstRule";
import OstTransaction from "../entities/OstTransaction";
import OstTransactionPolling from "../OstPolling/OstTransactionPolling";
import BigNumber from 'bignumber.js';
import OstWorkflowContext from "./OstWorkflowContext";

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
    this.expectedSpendAmount = this.transactionData.expected_spend_amount;
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
  	const oThis = this;
		return OstSession.getAllSessions()
			.then((sessionAddress) => {
				if (!oThis.expectedSpendAmount) {
					oThis.expectedSpendAmount = oThis.getTotalAmount();
				}
				const expectedSpendingAmount = new BigNumber(oThis.expectedSpendAmount);
				for (let i=0; i < sessionAddress.length; i++) {
					const session = sessionAddress[i];
					if (session.status === OstSession.STATUS.AUTHORIZED &&
						new BigNumber(session.spending_limit).isGreaterThanOrEqualTo(expectedSpendingAmount)
					) {
						return [session];
					}
				}
				console.warn(LOG_TAG, "Session not found");
				return [];
			})
			.catch((err) => {
				console.error(LOG_TAG, "Error while fetching authorized session" ,err);
				return Promise.resolve(null);
			})
  }

	getTotalAmount (){
  	const oThis = this;

  	let total = new BigNumber(0);
  	for (let i = 0;i< this.amounts.length;i++) {
  		total = total.plus(new BigNumber(oThis.amounts[i]));
		}
		return total.toString();
	}

	getRule(ruleName) {
  	return new Promise((resolve) => {
			OstRule.getById(ruleName)
				.then((res) => {
					return resolve(res.getData());
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
    Promise.all([oThis.getAuthorizedSession(), oThis.getRule("Direct Transfer"), oThis.syncRules()])
			.then((resp) => {
				if (!resp[0]) {
					console.error(LOG_TAG, "Session fetch failed");
					return Promise.reject();
				}
				const sessionArray = resp[0];
				if (!sessionArray.length) {
					throw new OstError('o_w_rt_odv_1', 'SESSION_NOT_FOUND');
				}
				const session = sessionArray[0];
				this.session = new OstSession(session);

				if (!resp[1]) {
					console.error(LOG_TAG, "Rule fetch failed");
					return Promise.reject();
				}
				const rule = resp[1];
					return oThis.keyManagerProxy.signTransaction(session, rule, oThis.user.getTokenHolderAddress() ,oThis.token_holder_addresses, oThis.amounts);
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

  getWorkflowName () {
		return OstWorkflowContext.WORKFLOW_TYPE.EXECUTE_TRANSACTION;
	}

}

export default OstSdkExecuteTransaction