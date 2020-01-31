
import OstMessage from "../../common-js/OstMessage";
import {SOURCE} from "../../common-js/OstBrowserMessenger";
import OstSdkBaseWorkflow from "../OstWorkflows/OstBaseWorkflow";

const LOG_TAG = 'OstSdkProxy :: '

class OstSdkProxy {
    constructor(userId, messengerObj, spendingLimit){
        this.messengerObj = messengerObj;
        this.userId = userId;
        this.spending_limit = spendingLimit;
    }

    getUser() {
        let oThis = this;
        let functionParams = {
            user_id: this.userId,
        };

        return oThis.getFromOstSdk('getUser', functionParams)
            .then((response) => {
                alert(JSON.stringify(response));
            });
    }

    getToken() {
        let oThis = this;
            let functionParams = {
                user_id: this.userId,
            };
    
            return oThis.getFromOstSdk('getToken', functionParams)
                .then((response) => {
                    alert(JSON.stringify(response));
                    //return 
                });
    }

    getDevice() {
        let oThis = this;
            let functionParams = {
                user_id: this.userId,
            };
    
            return oThis.getFromOstSdk('getDevice', functionParams)
                .then((response) => {
                    alert(JSON.stringify(response));
                    //return 
                });
    }

    getActiveSessions() {
        let oThis = this;
            let functionParams = {
                user_id: this.userId,
                spending_limit: this.spending_limit,
            };
    
            return oThis.getFromOstSdk('getActiveSessions', functionParams)
                .then((response) => {
                    alert(JSON.stringify(response));
                    //return 
                });
            }


    getFromOstSdk(functionName, functionParams) {
        let oThis = this;
		return new Promise((resolve, reject) => {

			let subId = this.messengerObj.subscribe(new ResponseHandler(
				function (args) {
					console.log(LOG_TAG, `${functionName} get`, args);
					oThis.messengerObj.unsubscribe(subId);
					resolve(args);
				},
				function ( args ) {
					console.log(LOG_TAG, `${functionName} error`, args);
					oThis.messengerObj.unsubscribe(subId);
					reject(args);
				}
			));

			let message  = new OstMessage();
			message.setReceiverName("OstSdk");
			message.setFunctionName(functionName);
			message.setArgs(functionParams, subId);
			console.log(LOG_TAG, functionName);
			this.messengerObj.sendMessage(message, SOURCE.DOWNSTREAM);
		});
    }
    
}

const ResponseHandler = function (success, error){
	const oThis = this;

	oThis.onSuccess = function(args) {
			return success(args);
	};

	oThis.onError = function(args) {
		return error(args);
	};

};

export default OstSdkProxy;