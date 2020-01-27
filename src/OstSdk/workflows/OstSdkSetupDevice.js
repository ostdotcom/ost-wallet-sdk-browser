import OstUser from "../entities/OstUser";
import OstToken from "../entities/OstToken";
import OstKeyManager from "../OstKeyManagerProxy";
import OstSdkBaseWorkflow from "./OstSdkBaseWorkflow";
import OstMessage from "../../common-js/OstMessage";
import {SOURCE} from "../../common-js/OstBrowserMessenger";
import OstStateManager from "./OstStateManager";
import OstErrorCodes from '../../common-js/OstErrorCodes'
import OstError from "../../common-js/OstError";

const LOG_TAG = "OstSdk :: OstSdkSetupDevice :: ";

export default class OstSdkSetupDevice extends OstSdkBaseWorkflow {

  constructor( args, browserMessenger ) {
    super(args, browserMessenger);
    console.log(LOG_TAG, "constructor :: ", args);

    this.tokenId = args.token_id;
    this.subscriberId = args.subscriber_id;

    this.initParams()
  }

  initParams() {
    this.uuid = null;

    this.currentDevice = null;
    this.user = null;
    this.token = null;
  }

  status = {
  	CREATED: "created",
  	ACTIVATING: "activating",
  	ACTIVATED: "activated"
  };

  getOrderedStates() {
    let states = OstStateManager.state;
    let orderedStates = [];

    orderedStates.push(states.INITIAL);
    orderedStates.push(states.REGISTERED);

    return orderedStates;
  }

  process() {
    let states = OstStateManager.state;

    switch (this.stateManager.getCurrentState()) {
      case states.REGISTERED:
        //Todo:: Sync with Ost Platform
        break;
      default:
        super.process();
        break;
    }
  }

  validateParams() {
    //Todo:: Validate params
    if (!this.userId) {
      throw new OstError('os_w_ossd_vp_1', OstErrorCodes.INVALID_USER_ID);
    }

    if (!this.tokenId) {
      throw new OstError('os_w_ossd_vp_2', OstErrorCodes.INVALID_TOKEN_ID);
    }
  }

  onParamsValidated() {
    //Todo:: Initialize OstUser(UserId, TokenId), OstToken(Token Id), OstDevice(ApiAddress, DeviceAddress)
    let oThis = this;

    console.log(LOG_TAG, "onParamsValidated :: 1");
    return oThis.initToken()
      .then(()=> {
        console.log(LOG_TAG, "initToken :: then");
        return oThis.initUser()
      })
      .then(() => {
        console.log(LOG_TAG, "initToken :: then");
        return oThis.getCurrentDevice();
      })
      .then(() => {
        console.log(LOG_TAG, "getCurrentDevice :: then");
        return oThis.registerDeviceIfRequired()
      })
      .catch((err) => {
        throw OstError.sdkError(err, 'os_w_ossd_opv_1')
      });
  }

  initToken() {
    //todo: create token entity
    return Promise.resolve()
  }

  initUser() {
    //todo: crate user entity
    return Promise.resolve()
  }

  registerDeviceIfRequired() {
    let oThis = this;
    return new Promise((resolve, reject) => {

      if (!oThis.currentDevice )

      console.log(LOG_TAG, "registerDeviceIfRequired");

    })


    // Todo: Check whether device is registered or not
    // Todo: If registered ensure entities Otherwise move forward

    //Todo:: registerDevice call with OstDevice
  }

  getCurrentDevice() {
    //todo: get current device entity
    return Promise.resolve()
  }


  sendRegisterDeviceMessage () {
    let message = new OstMessage();
    message.setFunctionName("registerDevice");
    message.setSubscriberId(this.subscriberId);

    this.uuid = this.browserMessenger.subscribe(this);

    message.setArgs({device_address: this.deviceAddress, api_key_address: this.apiKeyAddress}, this.uuid);

    console.log("sending message : OstSdkSetupDevice");
    this.browserMessenger.sendMessage(message, SOURCE.UPSTREAM);
  }

  createOrGetCurrentDevice(ostUser) {
    let ostDevice = ostUser.getCurrentDevice();
    if (ostDevice) {
      console.debug(TAG, "currentDevice is null");
      ostDevice = ostUser.createDevice();
    }
    return ostDevice;
  }

  hasDeviceApiKey(ostDevice) {
    const ostKeyManager = new OstKeyManager(this.userId);
    return ostKeyManager.getApiKeyAddress() === ostDevice.getApiSignerAddress();
  }


  deviceRegistered ( args ) {
    console.log("OstSdkSetupDevice :: deviceRegistered",  args);
    //Todo:: Call perform with args
  }

  syncEntities() {
    //Todo: ensureAll Entities (user, device, token)
  }

  //
// return;
//     console.log(LOG_TAG, "Initializing User and Token");
//
//     const ostUser = OstUser.init(this.userId, this.tokenId);
//     const ostToken = OstToken.init(this.tokenId);
//
//     console.log(LOG_TAG, "Creating current device if does not exist");
//     const ostDevice = this.createOrGetCurrentDevice(ostUser);
//     if (!ostDevice) {
//       //post error;
//       return;
//     }
//
//     console.log(LOG_TAG, "Check we are able to access device keys");
//     if (!this.hasDeviceApiKey(ostDevice)) {
//       // return postErrorInterrupt("wf_rd_pr_3", ErrorCode.SDK_ERROR);
//       return;
//     }
//
//     console.log(LOG_TAG, "Check if device has been registered.");
//     if (status.CREATED  ===  ostDevice.getStatus() ) {
//       console.log(LOG_TAG, "Registering device");
//       this.registerDevice(ostDevice);
//       return true;
//     }
//     console.log(LOG_TAG, "Device is already registered. ostDevice.status:" + ostDevice.getStatus() );
//  }
}
