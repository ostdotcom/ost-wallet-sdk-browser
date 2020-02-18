import OstSdkBaseWorkflow from "./OstSdkBaseWorkflow";
import OstError from "../../common-js/OstError";
import OstErrorCodes from  '../../common-js/OstErrorCodes'
import OstSession from "../entities/OstSession";
import OstRule from "../entities/OstRule";
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
		return OstSession.getActiveSessions(oThis.userId)
			.then((sessionArray) => {
				if (!oThis.expectedSpendAmount) {
					oThis.expectedSpendAmount = oThis.getTotalExpectedAmount();
				}
				const expectedSpendingAmount = new BigNumber(oThis.expectedSpendAmount);
				const sessionFilteredArray = [];
				for (let i=0; i < sessionArray.length; i++) {
					const session = sessionArray[i];
					if (session.status === OstSession.STATUS.AUTHORIZED &&
						new BigNumber(session.spending_limit).isGreaterThanOrEqualTo(expectedSpendingAmount)
					) {
						sessionFilteredArray.push(session);
					}
				}
				return sessionFilteredArray;
			})
			.catch((err) => {
				console.error(LOG_TAG, "Error while fetching authorized session" ,err);
				return Promise.resolve(null);
			})
  }

	getTotalExpectedAmount (){
  	const oThis = this;
		let fiatMultiplier = oThis.fiatMultiplier;

		if ('Direct Transfer' == oThis.ruleName || !oThis.fiatMultiplier) {
			fiatMultiplier = new BigNumber(1);
		}

  	let total = new BigNumber(0);
  	for (let i = 0;i< this.amounts.length;i++) {
  		total = total.plus(
  			new BigNumber(oThis.amounts[i])
					.multipliedBy(fiatMultiplier)
			);
		}
		return total.toString();
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
					console.error(LOG_TAG, "Error while fetching rule", err);
					return resolve();
				})
		});
	}

	getPricePoint() {
		const oThis = this;
		return new Promise((resolve) => {
			const chainId = oThis.token.getAuxiliaryChainId();
			oThis.apiClient.getPricePoints(chainId)
				.then((dataObj) => {
					console.log(LOG_TAG, "Price point response", dataObj);

					const pricePoint = dataObj['price_point'];
					const pricePointOfBaseToken = pricePoint[oThis.token.getBaseToken()];
					return resolve(pricePointOfBaseToken);
				})
				.catch((err) => {
					console.error(LOG_TAG, "Error while fetching price point", err);
					return resolve();
				})
		});
	}

  onDeviceValidated() {
    const oThis = this;
    console.log(LOG_TAG, " onDeviceValidated");
		oThis.getPricePoint()
			.then((pricePoint) => {
				if (!pricePoint) {
					console.error(LOG_TAG, "Price point fetch failed");
					return Promise.reject("Price point fetch failed");
				}

				const currencyCode = oThis.options.currency_code || 'USD';
				const pricePointOSTtoUSD = pricePoint[currencyCode];
				const pricePointDecimalExpo = pricePoint.decimals;

				oThis.fiatMultiplier = oThis.calFiatMultiplier(pricePointOSTtoUSD,
					pricePointDecimalExpo,
					oThis.token.getConversionFactor(),
					oThis.token.getDecimals()
				);

				oThis.pricePoint =  pricePoint;
				return oThis.pricePoint;
			})
			.then(() => {
				return Promise.all([oThis.getAuthorizedSession(), oThis.getRule(oThis.ruleName)]);
			})
			.then((resp) => {
				if (!resp[0]) {
					console.error(LOG_TAG, "Session fetch failed");
					return Promise.reject("Session fetch failed");
				}
				const sessionArray = resp[0];
				if (!sessionArray.length) {
					throw new OstError('o_w_rt_odv_1', OstErrorCodes.SESSION_NOT_FOUND);
				}

				const session = oThis.getLeastUsedSession(sessionArray);

				this.session = new OstSession(session);

				if (!resp[1]) {
					console.error(LOG_TAG, "Rule fetch failed");
					return Promise.reject("Rule fetch failed");
				}
				const rule = resp[1];

				return oThis.keyManagerProxy.signTransaction(session,
					oThis.user.getTokenHolderAddress(),
					oThis.token_holder_addresses,
					oThis.amounts,
					rule,
					oThis.ruleMethod,
					oThis.pricePoint,
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
				this.postRequestAcknowledged(dataObject);
				return oThis.session.addNonce()
					.then(() => {
						return oThis.pollingForTransaction(dataObject['transaction'].id);
					});
			})
      .then((entity) => {
        oThis.postFlowComplete(entity);
      })
      .catch((err) => {
      	console.error(LOG_TAG, "Workflow failed" ,err);

      	//Sync session: Session nonce could be out of sync Or Session got unauthorized
				oThis.handleSessionSync();
				//Close workflow with error
				return oThis.postError(err);
      })
  }

  handleSessionSync() {
  	//If no session assigned, then return
  	if (!this.session) return Promise.resolve();

		return this.apiClient.getSession(this.session.getId())
			.then(()=> {
				//No need to handle;
			})
			.catch(() => {
				//No need to handle
			});
	}

	getLeastUsedSession(sessionArray = []) {
  	// Sort session based on updated timestamp
  	sessionArray = sessionArray.sort((sessionFirst, sessionSecond) => {
  			return parseInt(sessionFirst.updated_timestamp) - parseInt(sessionSecond.updated_timestamp);
		});

  	//return the last used session based on updated timestamp
  	return sessionArray[0];
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
      	throw OstError.sdkError(err, 'os_w_oset_pft_1', OstErrorCodes.SKD_INTERNAL_ERROR);
      })
  }

	calFiatMultiplier(ppOstToUsd, ppDecimalExponent, conversionFactorOstToBT, tokenDecimalExponent) {
		// weiDecimal = ppOstToUsd * 10^ppDecimalExponent
		const bigDecimal = new BigNumber(String(ppOstToUsd));
		const toWeiMultiplier = new BigNumber(10).pow(new BigNumber(ppDecimalExponent));
		const usdWeiDecimalDenominator = bigDecimal.multipliedBy(toWeiMultiplier);

		// toBtWeiMultiplier = 10^tokenDecimalExponent
		const toBtWeiMultiplier = new BigNumber(10).pow(new BigNumber(tokenDecimalExponent));

		// btInWeiNumerator = conversionFactorOstToBT * toBtWeiMultiplier
		const conversionFactorOstToPin = new BigNumber(String(conversionFactorOstToBT));
		const btInWeiNumerator = conversionFactorOstToPin.multipliedBy(toBtWeiMultiplier);

		let precision = ppDecimalExponent - tokenDecimalExponent;
		if (precision < 1) precision = 2;

		// multiplierForFiat = btInWeiNumerator / usdWeiDecimalDenominator
		const multiplierForFiat = btInWeiNumerator.dividedBy(usdWeiDecimalDenominator);

		return multiplierForFiat;
	}

  getWorkflowName () {
		return OstWorkflowContext.WORKFLOW_TYPE.EXECUTE_TRANSACTION;
	}

}

export default OstSdkExecuteTransaction
