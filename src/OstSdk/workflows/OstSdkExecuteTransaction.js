import OstSdkBaseWorkflow from "./OstSdkBaseWorkflow";
import OstError from "../../common-js/OstError";
import OstErrorCodes from  '../../common-js/OstErrorCodes'
import OstSession from "../entities/OstSession";
import OstRule from "../entities/OstRule";
import OstTransactionPolling from "../OstPolling/OstTransactionPolling";
import BigNumber from 'bignumber.js';
import OstWorkflowContext from "./OstWorkflowContext";
import OstTransaction from "../entities/OstTransaction";

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

  getRule(ruleName) {
    const oThis = this;
    ruleName = ruleName || oThis.ruleName;

    return OstRule.getById(ruleName)
      .then((res) => {
        if (res) return res.getData();

        // If rule Not found fetch rules
        return oThis.apiClient.getRules()
          .then(() => {
            return OstRule.getById(ruleName)
              .then((res) => {
                if (!res) {
                  let errInfo = {"rule_name": ruleName};
                  throw new OstError("ostsdk_oset_gr_1", OstErrorCodes.RULE_NOT_FOUND, errInfo);
                }
                return res.getData();
              })
          });
      })
      .then(( ruleData ) => {
        oThis.ruleData = ruleData;
        return ruleData;
      })
  }

  //region - expected spend amount computation
  computeExpectedSpendAmount() {
    const oThis = this;

    if ( oThis.expectedSpendAmount ) {
      // Already set. Must be a custom rule.
      return Promise.resolve( oThis.expectedSpendAmount );

    } else if ( "pricer" === oThis.ruleName ) {
      // Lets compute for pricer rule.
      return oThis.computePricerExpectedSpendAmount();
    }

    // Must be direct transfer;
    let amountToBtMultiplier = new BigNumber(1);
    oThis.expectedSpendAmount = oThis.getTotalExpectedAmount( amountToBtMultiplier );
    return Promise.resolve( oThis.expectedSpendAmount );
  }

  computePricerExpectedSpendAmount() {
    const oThis = this;

    // Get price points
    return oThis.getPricePoint()

    //compute Fiat Multiplier
      .then((pricePoint) => {
        let fiatToBtMultiplier = oThis.computeFiatMultiplier( pricePoint );
        oThis.expectedSpendAmount = oThis.getTotalExpectedAmount( fiatToBtMultiplier );
        return oThis.expectedSpendAmount;
      })
  }

  getTotalExpectedAmount( amountToBtMultiplier ) {
    const oThis = this;
    let total = new BigNumber(0);
    for (let i = 0; i< this.amounts.length; i++) {
      // amount in BigNumber
      let thisAmount = new BigNumber(oThis.amounts[i]);

      // amount in lower unit Bt.
      let amountInBt = thisAmount.multipliedBy( amountToBtMultiplier );

      // Add to total.
      total = total.plus( amountInBt );
    }
    return total.toString();
  }

  getPricePoint() {
    const oThis = this;
    const chainId = oThis.token.getAuxiliaryChainId();
    return oThis.apiClient.getPricePoints(chainId)
      .then((dataObj) => {
        const baseToken = oThis.token.getBaseToken();
        const pricePoint = dataObj['price_point'];
        oThis.pricePoint = pricePoint[ baseToken ];
        return oThis.pricePoint;
      })
      .catch((err) => {
        throw OstError.sdkError(err, "ostsdk_oset_gpp_1");
      })
  }

  computeFiatMultiplier( pricePoint ) {
    const oThis = this;
    pricePoint = pricePoint || oThis.pricePoint;

    // @Dev: Is it ok to default currency_code to USD?
    // Should we validate it instead?
    const currencyCode = oThis.options.currency_code || 'USD';

    const ppOstToUsd = pricePoint[currencyCode];
    const ppDecimalExponent = pricePoint.decimals;
    const conversionFactorOstToBT = oThis.token.getConversionFactor();
    const tokenDecimalExponent = oThis.token.getDecimals();

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
    return btInWeiNumerator.dividedBy(usdWeiDecimalDenominator);
  }
  //endregion

  getAuthorizedSession( expectedSpendAmount ) {
    const oThis = this;
    expectedSpendAmount = expectedSpendAmount || oThis.expectedSpendAmount;

    return OstSession.getActiveSessions(oThis.userId, expectedSpendAmount)
      .then(( activeSessions ) => {
        if ( !activeSessions || activeSessions.length < 1 ) {
          throw new OstError('ostsdk_oset_gas_1', OstErrorCodes.SESSION_NOT_FOUND);
        }
        return oThis.keyManagerProxy.filterLocalSessions(activeSessions);
      })
      .then(( activeSessions) => {
        if ( !activeSessions || activeSessions.length < 1 ) {
          throw new OstError('ostsdk_oset_gas_2', OstErrorCodes.SESSION_NOT_FOUND);
        }
        const session = oThis.getLeastUsedSession(activeSessions);
        oThis.session = new OstSession(session);
        return oThis.session;
      })
  }

  onDeviceValidated() {
    const oThis = this;


    // - Get the rule
    console.log(LOG_TAG, "onDeviceValidated : calling getRule");
    let p1 = oThis.getRule(oThis.ruleName);

    // - Compute Expected Spend Amount If Needed.
    console.log(LOG_TAG, "onDeviceValidated : calling computeExpectedSpendAmount");
    let p2 = oThis.computeExpectedSpendAmount();



    Promise.all([p1, p2])
    // - Determine if we have authorized session to do this transaction.
      .then(() => {
        console.log(LOG_TAG, "onDeviceValidated : calling getAuthorizedSession");
        return oThis.getAuthorizedSession();
      })
      .then(() => {
        console.log(LOG_TAG, "onDeviceValidated : calling signTransaction");
        console.log(LOG_TAG, "\t oThis.session.getData()", oThis.session.getData());
        console.log(LOG_TAG, "\t oThis.user.getTokenHolderAddress()", oThis.user.getTokenHolderAddress());
        console.log(LOG_TAG, "\t oThis.token_holder_addresses", oThis.token_holder_addresses);
        console.log(LOG_TAG, "\t oThis.amounts", oThis.amounts);
        console.log(LOG_TAG, "\t oThis.ruleData", oThis.ruleData);
        console.log(LOG_TAG, "\t oThis.pricePoint", oThis.pricePoint);
        console.log(LOG_TAG, "\t oThis.options", oThis.options);

        return oThis.keyManagerProxy.signTransaction(
          oThis.session.getData(),
          oThis.user.getTokenHolderAddress(),
          oThis.token_holder_addresses,
          oThis.amounts,
          oThis.ruleData,
          oThis.ruleMethod,
          oThis.pricePoint,
          oThis.options
        );
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
        const transactionId = dataObject['transaction'].id;
        return OstTransaction.getById(transactionId);
      })
      .then((transaction) => {
        oThis.transaction = transaction;
        oThis.postRequestAcknowledged(oThis.transaction);
        return oThis.session.addNonce();
      })
      .then(() => {
        return oThis.processNext();
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

  onPolling() {
    const oThis = this;

    let transactionId =  oThis.workflowContext.getData().context_entity_id;

    return oThis.pollingForTransaction(transactionId)
      .then((entity) => {
        oThis.postFlowComplete(entity);
      })
      .catch((err) => {
        oThis.postError(err);
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
        throw OstError.sdkError(err, 'os_w_oset_pft_1', OstErrorCodes.SKD_INTERNAL_ERROR);
      })
  }

  getWorkflowName () {
    return OstWorkflowContext.WORKFLOW_TYPE.EXECUTE_TRANSACTION;
  }

}

export default OstSdkExecuteTransaction
