/*
 Copyright © 2019 OST.com Inc

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0
 */

import uuidv4 from 'uuid/v4';

/**
 * OstWalletWorkFlowCallback
 * All callback workflow implementations class should be derived from OstWalletWorkFlowCallback
 */

class OstWalletWorkFlowCallback {

  /**
   * @constructor: Should be called from derived class constructor always.
   * super();
   */
  constructor() {
    this.uuid = uuidv4();
    this.workflowId = null;
  }

  /**
   * Register Device
   * @param {Object} apiParams - Register Device API parameters
   * @param {OstDeviceRegistered} ostDeviceRegistered - With callback to pass response
   * @override
   */
  registerDevice( deviceAddress, apiKeyAddress ) {
    return Promise.reject();
  }

  /**
   * Request acknowledged
   * @param {Object} ostWorkflowContext - info about workflow type
   * @param ostContextEntity - info about entity
   * @override
   */
  requestAcknowledged(ostWorkflowContext , ostContextEntity ) {  }

  /**
   * Flow complete
   * @param ostWorkflowContext - workflow type
   * @param ostContextEntity -  status of the flow
   * @override
   */
  flowComplete(ostWorkflowContext , ostContextEntity ) {   }

  /**
   * Flow interrupt
   * @param ostWorkflowContext workflow type
   * @param ostError reason of interruption
   * @override
   */
  flowInterrupt(ostWorkflowContext , ostError)  {   }
}

export default OstWalletWorkFlowCallback;
