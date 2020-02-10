
import OstMessage from "../../common-js/OstMessage";
import {SOURCE} from "../../common-js/OstBrowserMessenger";

const LOG_TAG = 'OstSdkProxy :: ';

class OstSdkProxy {
    constructor(messengerObj){
        this.messengerObj = messengerObj;
    }

    getUser(userId) {
        let oThis = this;
        let functionParams = {
            user_id: userId,
        };

        return oThis.getFromOstSdk('getUser', functionParams)
            .then((response) => {
                return response;
            });
    }

    getToken( token_id) {
        let oThis = this;
            let functionParams = {
                token_id: token_id,
            };

            return oThis.getFromOstSdk('getToken', functionParams)
                .then((response) => {
                    return response;
                });
    }

    getDevice(userId) {
        let oThis = this;
            let functionParams = {
                user_id: userId,
            };

            return oThis.getFromOstSdk('getDevice', functionParams)
                .then((response) => {
                    return response;
                });
    }

    getActiveSessions(userId, spendingLimit) {
        let oThis = this;
            let functionParams = {
                user_id: userId,
                spending_limit: spendingLimit,
            };

            return oThis.getFromOstSdk('getActiveSessions', functionParams)
                .then((response) => {
                    return response;
                });
            }

  deleteLocalSessions(userId) {
      let oThis = this;
      const functionParams = {
        user_id: userId
      };

      return oThis.getFromOstSdk('deleteLocalSessions', functionParams)
        .then((response) => {
          return response;
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
