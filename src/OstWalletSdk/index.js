import OstHelpers from "../common-js/OstHelpers";
import OstURLHelpers from '../common-js/OstHelpers/OstUrlHelper'
import OstError from "../common-js/OstError";
import OstBaseSdk from '../common-js/OstBaseSdk'
import OstSetupDevice from "./OstWorkflows/OstSetupDevice";
import OstCreateSession from "./OstWorkflows/OstCreateSession";
import OstSdkProxy from './OstSdkProxy'
import OstJsonApiProxy from "./OstJsonApiProxy";
import OstExecuteTransaction from "./OstWorkflows/OstExecuteTransaction";
import OstExecutePayTransaction from "./OstWorkflows/OstExecutePayTransaction";
import OstExecuteDirectTransferTransaction from "./OstWorkflows/OstExecuteDirectTransferTransaction";

(function(window) {

  class OstWalletSdk extends OstBaseSdk {
    constructor() {
      super();
    }

    perform() {
      const oThis = this;
      return super.perform()
        .then(() => {
          oThis.proxy = new OstSdkProxy(this.browserMessenger);
          oThis.jsonApiProxy = new OstJsonApiProxy(this.browserMessenger);
        })
        .catch((err) => {
          throw OstError.sdkError(err, 'ows_i_p_1');
        });
    }

    getReceiverName() {
      return 'OstWalletSdk';
    }

    setupDevice ( userId, tokenId, baseURL, ostWorkflowDelegate) {
      let setupDevice = new OstSetupDevice(userId, tokenId, ostWorkflowDelegate, this.browserMessenger);
      let workflowId = setupDevice.perform();

      return workflowId;
    }

    createSession ( userId, expirationTime, spendingLimit, ostWorkflowDelegate) {
      let createSession = new OstCreateSession(userId, expirationTime, spendingLimit, ostWorkflowDelegate, this.browserMessenger);
      let workflowId = createSession.perform();

      return workflowId;
    }

		executeTransaction(userId, transactionData, ostWorkflowDelegate) {
			let transaction = new OstExecuteTransaction(userId,
				transactionData,
				ostWorkflowDelegate,
				this.browserMessenger);
			let workfowId = transaction.perform();

			return workfowId;
		}

		executePayTransaction(userId, transactionData, ostWorkflowDelegate) {
			let transaction = new OstExecutePayTransaction(userId,
				transactionData,
				ostWorkflowDelegate,
				this.browserMessenger);
			let workfowId = transaction.perform();

			return workfowId;
		}

		executeDirectTransferTransaction(userId, transactionData, ostWorkflowDelegate) {
			let transaction = new OstExecuteDirectTransferTransaction(userId,
				transactionData,
				ostWorkflowDelegate,
				this.browserMessenger);
			let workfowId = transaction.perform();

			return workfowId;
    }

    //getter methods
    getUser( userId ) {
      return this.proxy.getUser( userId );
    }

    getToken( userId ) {
      return this.proxy.getToken( userId );
    }

    getDevice( userId ) {
      return this.proxy.getDevice(userId);
    }

    getActiveSessions( userId, spendingLimit = '' ) {
      return this.proxy.getActiveSessions(userId, spendingLimit);
    }

    //JSON Api calls
    getCurrentDeviceFromServer( userId ) {
      return this.jsonApiProxy.getCurrentDeviceFromServer(userId);
    }

    getBalanceFromServer( userId ) {
      return this.jsonApiProxy.getBalanceFromServer(userId);
    }

    getPricePointFromServer( userId ) {
      return this.jsonApiProxy.getPricePointFromServer(userId);
    }

    getBalanceWithPricePointFromServer( userId ) {
      return this.jsonApiProxy.getBalanceWithPricePointFromServer(userId);
    }

    getPendingRecoveryFromServer( userId ) {
      return this.jsonApiProxy.getPendingRecoveryFromServer(userId);
    }

    getUserFromServer( userId ) {
      return this.jsonApiProxy.getUserFromServer(userId);
    }

    getTokenFromServer( userId ) {
      return this.jsonApiProxy.getTokenFromServer(userId);
    }

    getTransactionsFromServer( userId ) {
      return this.jsonApiProxy.getTransactionsFromServer(userId);
    }

    getTokenHolderFromServer( userId ) {
      return this.jsonApiProxy.getTokenHolderFromServer(userId);
    }

    getRulesFromServer ( userId ) {
      return this.jsonApiProxy.getRulesFromServer(userId);
    }



  }


  const walletSdk = new OstWalletSdk();
  walletSdk.perform()
    .then(() => {
      return createSdkMappyIframe();
    })
    .catch((err) => {
      throw OstError.sdkError(err, 'ows_i_p_2');
    });

  function createSdkMappyIframe() {
    console.log("createSdkMappyIframe Started");

    var ifrm = document.createElement('iframe');
    ifrm.setAttribute('id', 'sdkMappyIFrame');

    const url = 'https://sdk-devmappy.ostsdkproxy.com';

    let params = {
      publicKeyHex: walletSdk.getPublicKeyHex()
    };

    let stringToSign = OstURLHelpers.getStringToSign(url, params );

    walletSdk.signDataWithPrivateKey(stringToSign)
      .then((signedMessage) => {
        const signature = OstHelpers.byteArrayToHex(signedMessage);
        let iframeURL = OstURLHelpers.appendSignature(stringToSign, signature);
        ifrm.setAttribute('src', iframeURL);
        ifrm.setAttribute('width', '100%');
        ifrm.setAttribute('height', '200');

        document.body.appendChild(ifrm);

				// ifrm.addEventListener("load", function() {
				// 	ifrm.window.onerror = function (event) {
				// 		console.error(LOG_TAG, "Miracle Miracle!!!!", event);
				// 	};
				// });

        walletSdk.setDownStreamWindow(ifrm.contentWindow);
        walletSdk.setDownStreamOrigin(url);

        console.log("createSdkMappyIframe Completed");

        window.OstSdkWallet = walletSdk;
      })
      .catch((err) => {
        throw OstError.sdkError(err, 'ows_i_csmif_1');
      })
  }
})(window);
