import OstUser from "../entities/OstUser";
import OstToken from "../entities/OstToken";
import OstSdkBaseWorkflow from "./OstSdkBaseWorkflow";
import OstMessage from "../../common-js/OstMessage";
import {SOURCE} from "../../common-js/OstBrowserMessenger";
import OstStateManager from "./OstStateManager";
import OstErrorCodes from '../../common-js/OstErrorCodes'
import OstError from "../../common-js/OstError";
import OstWorkflowContext from "./OstWorkflowContext";

const LOG_TAG = "OstSdk :: OstSdkSetupDevice :: ";

export default class OstSdkSetupDevice extends OstSdkBaseWorkflow {

  constructor( args, browserMessenger ) {
    super(args, browserMessenger);
    console.log(LOG_TAG, "constructor :: ", args);

    this.tokenId = args.token_id;
  }

  initParams() {
    super.initParams();

    this.deviceRegisteredUUID = null;
    this.token = null;
  }


  getOrderedStates() {
    let states = OstStateManager.state;
    let orderedStates = [];

    orderedStates.push(states.INITIAL);
    orderedStates.push(states.REGISTERED);

    return orderedStates;
  }

  getWorkflowName() {
    return OstWorkflowContext.WORKFLOW_TYPE.SETUP_DEVICE
  }

  process() {
    let states = OstStateManager.state;

    switch (this.stateManager.getCurrentState()) {
      case states.REGISTERED:
        this.syncEntities();
        break;
      default:
        super.process();
        break;
    }
  }

  validateParams() {
    if (!this.userId) {
      throw new OstError('os_w_ossd_vp_1', OstErrorCodes.INVALID_USER_ID);
    }

    if (!this.tokenId) {
      throw new OstError('os_w_ossd_vp_2', OstErrorCodes.INVALID_TOKEN_ID);
    }
  }

  onParamsValidated() {
    let oThis = this;

    console.log(LOG_TAG, "onParamsValidated");

    return oThis.initToken()
      .then((token) => {
        oThis.token = token;

        console.log(LOG_TAG, "initToken :: then");
        return oThis.initUser()
      })
      .then((user) => {
        oThis.user = user;

        console.log(LOG_TAG, "initToken :: then");
        return oThis.user.createOrGetDevice(this.keyManagerProxy)
      })
      .then((deviceEntity) => {
        oThis.currentDevice = deviceEntity;

        if (deviceEntity.isStatusCreated()) {
          console.log(LOG_TAG, "Created Device entity", deviceEntity);
          return oThis.registerDevice(deviceEntity);

        } else {
          console.log(LOG_TAG, "Current Device entity", deviceEntity);
          return oThis.syncEntities();
        }
      })
      .catch((err) => {
        oThis.postError(OstError.sdkError(err, 'os_w_ossd_opv_1'));
      });
  }

  initToken() {
    return OstToken.init(this.tokenId);
  }

  initUser() {
    return OstUser.init(this.userId, this.tokenId);
  }

  getCurrentDevice() {
    this.user.getCurrentDevice();
  }


  registerDevice(deviceEntity) {
    let message = new OstMessage();
    message.setFunctionName("registerDevice");
    message.setSubscriberId(this.subscriberId);


    let params = {
      api_key_address: deviceEntity.getApiKeyAddress(),
      device_address: deviceEntity.getId(),
      user_id: this.userId
    };

    this.deviceRegisteredUUID = this.browserMessenger.subscribe(this);

    message.setArgs(params, this.deviceRegisteredUUID);

    this.browserMessenger.sendMessage(message, SOURCE.UPSTREAM);
  }

  deviceRegistered ( args ) {

    // let subscriberId = args.subscriber_id;
    // if (subscriberId) {
    //   this.subscriberId = subscriberId;
    // }

    this.browserMessenger.unsubscribe(this.deviceRegisteredUUID);
    this.performState( OstStateManager.state.REGISTERED, args);
  }

  syncEntities() {
    const oThis = this;

    console.log(LOG_TAG, "syncEntities", this.currentDevice);

    return oThis.verifyDeviceRegistered()
      .then(() => {

        console.log(LOG_TAG, "verifyDeviceRegistered :: then");
        return oThis.syncUser()
      })
      .then(() => {

        console.log(LOG_TAG, "syncUser :: then");
        return oThis.syncToken()
      })
      .then((obj) => {
        console.log(LOG_TAG, "Session Address", obj);
        this.postFlowComplete(this.currentDevice);
      })
      .catch((err) => {
        this.postError(err)
      })
  }

  verifyDeviceRegistered() {
    const oThis = this;

    return oThis.syncCurrentDevice()
      .then((deviceEntity) => {
        if (deviceEntity && deviceEntity.hasOwnProperty(canMakeApiCall)) {
          if (!deviceEntity.canMakeApiCall()) {
            throw OstError("os_w_ossd_vdr_1", OstErrorCodes.DEVICE_NOT_SETUP)
          }
        }
      });
  }

}
