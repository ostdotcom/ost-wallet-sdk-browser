
import OstMessage from "../../common-js/OstMessage";
import {SOURCE} from "../../common-js/OstBrowserMessenger";

const LOG_TAG = 'OstJsonApiProxy :: ';

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
                return response;
            });
    }

    getBalanceFromServer(userId) {
        let oThis = this;
        let functionParams = {
            user_id: userId,
        };

        return oThis.getFromOstSdk('getBalanceFromServer', functionParams)
            .then((response) => {
                return response;
            });
	}

	getPricePointFromServer( userId ) {
		let oThis = this;
        let functionParams = {
            user_id: userId,
        };

        return oThis.getFromOstSdk('getPricePointFromServer', functionParams)
            .then((response) => {
                return response;
            });
	}

	getBalanceWithPricePointFromServer( userId ) {
		let oThis = this;
        let functionParams = {
            user_id: userId,
        };

        return oThis.getFromOstSdk('getBalanceWithPricePointFromServer', functionParams)
            .then((response) => {
                return response;
            });
	}

	// getPendingRecoveryFromServer( userId ) {
	// 	let oThis = this;
   //      let functionParams = {
   //          user_id: userId,
   //      };
	//
   //      return oThis.getFromOstSdk('getPendingRecoveryFromServer', functionParams)
   //          .then((response) => {
   //              return response;
   //          });
	// }

	getUserFromServer( userId ) {
		let oThis = this;
        let functionParams = {
            user_id: userId,
        };

        return oThis.getFromOstSdk('getUserFromServer', functionParams)
            .then((response) => {
                return response;
            });
    }

	getTokenFromServer( userId ) {
		let oThis = this;
        let functionParams = {
            user_id: userId,
        };

        return oThis.getFromOstSdk('getTokenFromServer', functionParams)
            .then((response) => {
                return response;
            });
	}

	getTransactionsFromServer( userId ) {
		let oThis = this;
        let functionParams = {
            user_id: userId,
        };

        return oThis.getFromOstSdk('getTransactionsFromServer', functionParams)
            .then((response) => {
                return response;
            });
	}

	getTokenHolderFromServer( userId ) {
		let oThis = this;
        let functionParams = {
            user_id: userId,
        };

        return oThis.getFromOstSdk('getTokenHolderFromServer', functionParams)
            .then((response) => {
                return response;
            });
	}

	getRulesFromServer( userId ) {
		let oThis = this;
        let functionParams = {
            user_id: userId,
        };

        return oThis.getFromOstSdk('getRulesFromServer', functionParams)
            .then((response) => {
                return response;
            });
	}

    getDeviceListFromServer( userId ) {
        let oThis = this;
        let functionParams = {
            user_id: userId,
        };

        return oThis.getFromOstSdk('getDeviceListFromServer', functionParams)
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
		return success(args.data);
	};

	oThis.onError = function(args) {
		return error(args.err);
	};

};

export default OstJsonApiProxy;
