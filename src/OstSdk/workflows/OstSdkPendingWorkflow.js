/*
    Not yet included anywhere. Should be included in OstSdkSetupDevice.
*/

import OstSessionPolling from "../OstPolling/OstSessionPolling";
import OstTransactionPolling from "../OstPolling/OstTransactionPolling";
import OstSdkbaseWorkflow from "./OstSdkBaseWorkflow";

class OstSdkPendingWorkflow extends OstSdkbaseWorkflow {

    constructor(workflowInfo, args, browserMessenger) {

        super(args, browserMessenger);

        const oThis = this;

        if(workflowInfo){
            if(workflowInfo.workflowName == "CREATE_SESSION"){
                oThis.pollingClass = new OstSessionPolling(oThis.userId, workflowInfo.contextEntityId, oThis.keyManagerProxy);
            }
            if(workflowInfo.workflowName == "EXECUTE_TRANSACTION"){
                oThis.pollingClass = new OstTransactionPolling(oThis.userId, workflowInfo.contextEntityId, oThis.keyManagerProxy);
            }
        }

    }

    perform() {
        this.pollingClass.perform()
        .then((entity) => {
            //this.postFlowComplete(entity);
        })
        .catch((err) => {
            //this.postError(err);
        });
    }
}

export default OstSdkPendingWorkflow;