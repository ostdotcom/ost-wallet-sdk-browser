
import OstMessage from "../../common-js/OstMessage";
import {SOURCE} from "../../common-js/OstBrowserMessenger";

const LOG_TAG = 'OstJsonApiProxy :: '

class OstJsonApiProxy {
    constructor(messengerObj){
        this.messengerObj = messengerObj;
    }

    getCurrentDeviceFromServer(userId) {
        let oThis = this;
        let functionParams = {
            user_id: userId,
        };

        return oThis.getFromOstSdk('getCurrentDeviceFromServer', functionParams)
            .then((response) => {
                alert(JSON.stringify(response));
            });
    }

    getBalanceFromServer(userId) {
        let oThis = this;
        let functionParams = {
            user_id: userId,
        };

        return oThis.getFromOstSdk('getBalanceFromServer', functionParams)
            .then((response) => {
                alert(JSON.stringify(response));
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

export default OstJsonApiProxy;