import OstKeyManagerProxy from "../keyManagerProxy/ostKeyManager";
import OstMessage from "../../common-js/OstMessage";
import {SOURCE} from "../../common-js/OstBrowserMessenger";
import OstSdkSetupDevice from "../workflows/OstSdkSetupDevice";

class OstSdkAssist {
  constructor( messenger, receiverName ) {
    this.browserMessenger = messenger;
    this.receiverName = receiverName;

    this.browserMessenger.subscribe(this, this.receiverName);

    this.uuid = null;
  }

  setupDevice ( args ) {
    console.log("OstSdkAssist :: setupDevice :: ", args);

    let setupDevice = new OstSdkSetupDevice( args, this.browserMessenger );
    setupDevice.perform();
  }
}

export default OstSdkAssist