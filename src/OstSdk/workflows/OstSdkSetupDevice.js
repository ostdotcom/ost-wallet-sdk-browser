import OstUser from "../entities/OstUser";
import OstToken from "../entities/OstToken";
import OstKeyManager from "../OstKeyManagerProxy";
import OstSdkBaseWorkflow from "./OstSdkBaseWorkflow";
import OstMessage from "../../common-js/OstMessage";
import {SOURCE} from "../../common-js/OstBrowserMessenger";

const LOG_TAG = "SetupDevice";

export default class OstSdkSetupDevice extends OstSdkBaseWorkflow {

  constructor( args, browserMessenger ) {
    super(args.userId, browserMessenger);
    console.log("OstSdkSetupDevice :: constructor :: ", args);
    this.tokenId = args.token_id;
    this.subscriberId = args.subscriber_id;
    this.uuid = null;
  }

  status = {
  	CREATED: "created",
  	ACTIVATING: "activating",
  	ACTIVATED: "activated"
  };


  sendRegisterDeviceMessage () {
    let message = new OstMessage();
    message.setFunctionName("registerDevice");
    message.setSubscriberId(this.subscriberId);

    this.uuid = this.browserMessenger.subscribe(this);

    message.setArgs({device_address: this.deviceAddress, api_key_address: this.apiKeyAddress}, this.uuid);

    console.log("sending message : OstSdkSetupDevice");
    this.browserMessenger.sendMessage(message, SOURCE.UPSTREAM);
  }

  perform() {
console.log(LOG_TAG, "perform");
    return this.keyManagerProxy.getDeviceAddress()
      .then((deviceAddress) => {
        console.log(LOG_TAG, " Got device address :: ", deviceAddress);
        this.deviceAddress = deviceAddress;

        return this.keyManagerProxy.getApiKeyAddress()
      })
      .then((apiKeyAddress) => {
        console.log(LOG_TAG, " Got api key address :: ", apiKeyAddress);

        this.apiKeyAddress = apiKeyAddress;
        this.sendRegisterDeviceMessage();
      })
      .catch((err) => {

      });





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
  }


  setStateManager() {
    super.setStateManager();
    customStates.push(StateManager.state.INITIAL);
    customStates.push(StateManager.state.INITIALIZED);
    customStates.push(StateManager.state.REGISTERED);
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

  registerDevice(ostDevice) {
    const apiResponse = buildApiResponse(ostDevice);

    setTimeout(() => {
      if (this.delegate) {
        this.delegate.registerDevice(apiResponse, OstRegisterDevice.this);
      } else {
        //Do Nothing, let the workflow die.
      }
    }, 0);
  }

  deviceRegistered ( args ) {
    console.log("OstSdkSetupDevice :: deviceRegistered",  args);
  }
}
