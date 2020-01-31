import OstSdkBaseWorkflow from "./OstSdkBaseWorkflow";
import OstError from "../../common-js/OstError";
import OstErrorCodes from  '../../common-js/OstErrorCodes'
import OstSession from "../entities/OstSession";
import OstMessage from "../../common-js/OstMessage";
import {SOURCE} from "../../common-js/OstBrowserMessenger";
import OstSessionPolling from "../OstPolling/OstSessionPolling";

const LOG_TAG = "OstSdk :: OstSdkExecuteTransaction :: ";

class OstSdkExecuteTransaction extends OstSdkBaseWorkflow {
  constructor(args, browserMessenger) {
    super(args, browserMessenger);
    console.log(LOG_TAG, "constructor :: ", args);

    this.token_holder_addresses = parseInt(args.token_holder_addresses);
    this.amounts = String(args.amounts);
  }

  initParams() {
    super.initParams();

    this.session = null;

    this.sessionPollingClass = null;
  }

  validateParams() {
    super.validateParams();
  }

  performUserDeviceValidation() {
    return super.performUserDeviceValidation()
      .then(() => {
        if (!this.user.isStatusActivated()) {
          throw new OstError('os_w_oscs_pudv_1', OstErrorCodes.USER_NOT_ACTIVATED);
        }
      })
  }

  onDeviceValidated() {
    const oThis = this;
    console.log(LOG_TAG, " onDeviceValidated");
    OstSession.getAllSessions()
      .then((sessionAddress) => {
        for (let i=0; i < sessionAddress.length; i++) {
          const session = sessionAddress[i];
          if (session.status === OstSession.STATUS.AUTHORIZED) {
            return session;
          }
        }
        throw "Session not found";
      })
      .then((session) => {
				// console.log(LOG_TAG, " onDeviceValidated", session.nonce, oThis.user.getTokenHolderAddress());
				//Todo:: TO be removed
        const rule = {
					name: "Direct Transfer",
					address: "0x19784e6190436a50195cfd0c5d9334f254e3017d"
				};
				return oThis.keyManagerProxy.signTransaction(session, rule ,['0x151111fc5a63f5a7f898395519c4c04071cd8ec5'], oThis.user.getTokenHolderAddress(), ['100']);
      })
      .then((response) => {
				const struct = response.signed_transaction_struct;
				const txnData = response.transaction_data;

        console.log(struct)


        const params = {
					to: txnData.rule.address,
					raw_calldata: JSON.stringify(struct.raw_call_data),
					nonce: txnData.session.nonce,
					calldata: struct.call_data,
					signature:struct.signature,
					signer: txnData.session.address,
					meta_property: {},
        };

        console.log(LOG_TAG, "TXN PARAMS", params);
        return oThis.apiClient.executeTransaction(params);
      })
      .then((entity) => {
        this.postFlowComplete(entity);
      })
      .catch((err) => {
        this.postError(err);
      })
  }


  createSessionEntity( sessionAddress ) {
    return OstSession.init(sessionAddress, this.spendingLimit, this.expirationTime)
  }

  postShowQRData( qrData ) {
    let message = new OstMessage();
    message.setFunctionName("showSessionQRCode");
    message.setSubscriberId(this.subscriberId);

    let params = {
        qr_data : qrData
    };

    message.setArgs(params);

    this.browserMessenger.sendMessage(message, SOURCE.UPSTREAM);
  }

  pollingForSessionAddress() {
    this.sessionPollingClass = new OstSessionPolling(this.userId, this.session.getId(), this.keyManagerProxy);
    return this.sessionPollingClass.perform()
      .then((sessionEntity) => {
        console.log(sessionEntity);
        return sessionEntity;
      })
      .catch((err) => {
        throw err
      })
  }

}

export default OstSdkExecuteTransaction
