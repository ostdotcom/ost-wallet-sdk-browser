/*
    Uses subcriber events and creates workflow mapping
*/

let workflowMapping = {}

const LOG_TAG = "WorkflowSubscriberService :: "
class WorkflowSubscriberService {

    subscribeToEvents() {
        console.log("workflow subscriber service0");
        OstWalletSdk.subscribeAll("flowInitiated", this.flowInitiated);
        OstWalletSdk.subscribeAll("requestAcknowledged", this.requestAcknowledged);
        OstWalletSdk.subscribeAll("flowCompleted", this.flowComplete);
        OstWalletSdk.subscribeAll("flowInterrupted", this.flowInterrupt);    
    }

    flowInitiated(ostWorkflowContext) {

        if(ostWorkflowContext)
        {
            if(ostWorkflowContext["detail"]){
                const detail = ostWorkflowContext["detail"];

                if(detail["ost_workflow_context"]){
                    const ost_workflow_context = detail["ost_workflow_context"];
                    const workflowId = ost_workflow_context.id;
                    workflowMapping[workflowId].isFlowInitiated = true
                    workflowMapping[workflowId].ostWorkflowContext = ost_workflow_context;
                }
            }
        }
        console.log(LOG_TAG, "workflow subscriber initiated :: ",workflowMapping);
    }

    requestAcknowledged(ostWorkflowContext) {
        if(ostWorkflowContext)
        {
            if(ostWorkflowContext["detail"]){
                const detail = ostWorkflowContext["detail"]

                if(detail["ost_workflow_context"]){
                    const ost_workflow_context = detail["ost_workflow_context"];
                    const ost_context_entity = detail["ost_context_entity"];
                    const workflowId = ost_workflow_context.id;
                    workflowMapping[workflowId].isInProgress = true;
                    workflowMapping[workflowId].ostWorkflowContext = ost_workflow_context;
                    workflowMapping[workflowId].ostContextEntity = ost_context_entity;
                }
            }
        }
        console.log(LOG_TAG, "workflow subscriber ack :: ",workflowMapping);
    }

    flowComplete(ostWorkflowContext) {
        if(ostWorkflowContext)
        {
            if(ostWorkflowContext["detail"]){
                const detail = ostWorkflowContext["detail"]

                if(detail["ost_workflow_context"]){
                    const ost_workflow_context = detail["ost_workflow_context"];
                    const ost_context_entity = detail["ost_context_entity"];
                    const workflowId = ost_workflow_context.id;
                    workflowMapping[workflowId].isFlowCompleted = true;
                    workflowMapping[workflowId].ostWorkflowContext = ost_workflow_context;
                    workflowMapping[workflowId].ostContextEntity = ost_context_entity;
                }
            }
        }
        console.log(LOG_TAG, "workflow subscriber completed :: ",workflowMapping);
    }
    //not tested
    flowInterrupt(ostWorkflowContext) {
        if(ostWorkflowContext)
        {
            if(ostWorkflowContext["detail"]){
                const detail = ostWorkflowContext["detail"]

                if(detail["ost_workflow_context"]){
                    const ost_workflow_context = detail["ost_workflow_context"];
                    const ost_error = detail["ost_error"];                 
                    const workflowId = ost_workflow_context.id;
                    workflowMapping[workflowId].isFlowInterrupted = true;
                    workflowMapping[workflowId].ostWorkflowContext = ost_workflow_context;
                    workflowMapping[workflowId].ostError = ost_error;      
                }
            }
        }
        console.log(LOG_TAG, "workflow subscriber interrupted :: ",workflowMapping);
    }

    addWorkflow(workflowId) {

        if (workflowMapping[workflowId]) {
            return;
        }

        let workflowObj = {
            isFlowInitiated:  false,
            isInProgress: false,
            isFlowCompleted: false,
            isFlowInterrupted: false
        };
       
        workflowMapping[workflowId] = workflowObj;

        //Subscribe to particular workflowId events
        OstWalletSdk.subscribe("flowInitiated", workflowId,  this.flowInitiated);
        OstWalletSdk.subscribe("requestAcknowledged", workflowId, this.requestAcknowledged);
        OstWalletSdk.subscribe("flowCompleted", workflowId, this.flowComplete);
        OstWalletSdk.subscribe("flowInterrupted", workflowId, this.flowInterrupt); 

        console.log(LOG_TAG, "workflow subscriber added :: ", workflowMapping);
    }
}

export default new WorkflowSubscriberService();