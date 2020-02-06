import '../css/login.css';
import OstMappyCallbacks from "../../OstWalletSdk/OstMappyCallbacks";
import OstSetup from "./common";

var ostSetup;

class Workflows {

    constructor() {
        ostSetup = new OstSetup();
    }

    setupDeviceWorkflow(){
        let mappyCallback =  new OstMappyCallbacks();

        mappyCallback.registerDevice = function( apiParams ) {
          return Promise.reject("registerDevice not allowed here.");
        };

        mappyCallback.requestAcknowledged = (ostWorkflowContext , ostContextEntity) => {
            console.log("requestAcknowledged ---> ",ostContextEntity);
        };

        mappyCallback.flowComplete = (ostWorkflowContext , ostContextEntity ) => {
            console.log("flowComplete ---> ",ostContextEntity);
        };

        mappyCallback.flowInterrupt = (ostWorkflowContext , ostError) => {   
            console.log("flowInterrupt ---> ",ostError);
        }



        

        ostSetup.getCurrentUser()
        .then((currentUser) => {
  
          console.log("user_id =======> ",currentUser.user_id);
          let workflowId = window.OstSdkWallet.setupDevice(
            currentUser.user_id,
            currentUser.token_id,
            //"http://stagingpepo.com",
            mappyCallback);
            console.log("Workflow id ------>",workflowId);
        })
        .catch(err => console.log(err));
    }

    createSessionWorkflow(){

    }

    executeTransactionWorkflow(){

    }
}

var workflow = new Workflows();
workflow.setupDeviceWorkflow();
