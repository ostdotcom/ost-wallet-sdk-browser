import OstSdkBaseWorkflow from "./OstSdkBaseWorkflow";
import OstError from "../../common-js/OstError";
import OstErrorCodes from  '../../common-js/OstErrorCodes'
import OstSession from "../entities/OstSession";
import OstMessage from "../../common-js/OstMessage";
import {SOURCE} from "../../common-js/OstBrowserMessenger";

const LOG_TAG = "OstSdk :: OstSdkSetupDevice :: ";

class OstSdkCreateSession extends OstSdkBaseWorkflow {
  constructor(args, browserMessenger) {
    super(args, browserMessenger);
    console.log(LOG_TAG, "constructor :: ", args);

    this.expirationTime = parseInt(args.expiration_time);
    this.spendingLimit = String(args.spending_limit);
  }

  initParams() {
    super.initParams();
  }

  validateParams() {
    super.validateParams();

    const currentTimeStamp = parseInt(Date.now()/1000);

    if (currentTimeStamp < this.expirationTime) {
      throw new OstError('os_w_oscs_vp_1', OstErrorCodes.INVALID_SESSION_EXPIRY_TIME)
    }
  }

  performUserDeviceValidation() {
    return super.performUserDeviceValidation()
      .then(() => {
        // if (!this.user.isStatusActivated()) {
        //   throw new OstError('os_w_oscs_pudv_1', OstErrorCodes.USER_NOT_ACTIVATED);
        // }
      })
  }

  onDeviceValidated() {

    console.log(LOG_TAG, " onDeviceValidated");

    this.keyManagerProxy.createSessionKey()
      .then((sessionAddress) => {
        return this.createSessionEntity( sessionAddress.session_address )
      })
      .then((sessionEntity) => {
        return this.keyManagerProxy.signQRSessionData(
          sessionEntity.getId(),
          sessionEntity.getSpendingLimit().toString(),
          sessionEntity.getExpiryTime().toString()
          )
      })
      .then((data) => {
        this.postShowQRData(data.qr_data);
      })
      .catch((err) => {
        this.postError(err);
      })
  }

  createSessionEntity( sessionAddress ) {
    return OstSession.init(sessionAddress, this.expirationTime, this.spendingLimit)
  }

  postShowQRData( qrData ) {
    let message = new OstMessage();
    message.setFunctionName("showSessionQRCode");
    message.setSubscriberId(this.subscriberId);

    let params = {
        qr_data : JSON.stringify(qrData)
    };

    message.setArgs(params);

    this.browserMessenger.sendMessage(message, SOURCE.UPSTREAM);
  }

}

export default OstSdkCreateSession
