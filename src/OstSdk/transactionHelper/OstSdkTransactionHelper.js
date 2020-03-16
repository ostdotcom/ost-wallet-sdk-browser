
import defaultTransactionConfig from "./OstSdkTransactionConfig"
import BigNumber from 'bignumber.js';

import merge from "lodash/merge"

const LOG_TAG = "OstSdkTransactionHelper :: ";

let transactionConfig = {};

const sortConfig = (sortData) => {
  sortData.sort((a, b) => {
    let aBnSpendingLimit = new BigNumber(a.spending_limit);
    let bBnSpendingLimit = new BigNumber(b.spending_limit);
    return aBnSpendingLimit.minus(bBnSpendingLimit);
  });

  return sortData;
};

class OstSdkTransactionHelper {
  constructor() {
    this.isExternalConfig = false;
    this.setTxConfig();
  }

  setExternalTxConfig(config) {
    this.isExternalConfig = true;
    this.setTxConfig(config)
  }

  setTxConfig(config) {
    let externalConfig = config || {};

    let masterConfig = JSON.parse(JSON.stringify(defaultTransactionConfig));

    // Deep Merge.
    merge(masterConfig, externalConfig);

    let sortedSessionBuckets = sortConfig(masterConfig.session_buckets);
    masterConfig.session_buckets = sortedSessionBuckets;

    transactionConfig = masterConfig;

    console.log(LOG_TAG, "setTxConfig :: transactionConfig = ", transactionConfig);
  }
}


export default new OstSdkTransactionHelper();
