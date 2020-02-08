import ajaxUtils from "./ajaxUtils";
import '../css/loader.css';

const sdkConfig = {
  "api_endpoint": DEMO_MAPPY_UI_PLATFORM_API_ENDPOINT,
  "sdk_endpoint": DEMO_MAPPY_UI_OST_SDK_IFRAME_URL
};

class PageInitializer {
  constructor() {
    const oThis = this;

    this.currentUserInfo = null;

    this.validatePage();
    $(() => {
      ajaxUtils.setupAjax();
      oThis.perform();
    })
  }
  perform() {
    const oThis = this;

    // Fetch user from server.
    let jEl = $("#loading-user");
    jEl.removeClass("d-none");
    return oThis.getCurrentUserFromServer()
      // Init Sdk.
      .then( () => {
        let txt = jEl.text();
        jEl.html(txt + "<span style='float:right'>✅ Done</span>");
        

        jEl = $("#loading-sdk-init");
        jEl.removeClass("d-none");
        return oThis.initOstWalletSdk()
      })

      // Perform the setup Device
      .then( () => {
        let txt = jEl.text();
        jEl.html(txt + "<span style='float:right'>✅ Done</span>");

        jEl = $("#loading-setup-device");
        jEl.removeClass("d-none");
        return oThis.setupDeviceWorkflow( oThis.currentUserInfo );
      })

      // Hide the loader.
      .then( () => {
        let txt = jEl.text();
        jEl.html(txt + "<span style='float:right'>✅ Done</span>");
        oThis.hidePageLoader();
        if ( oThis.onPageInitializedCallback ) {
          setTimeout( () => {
            // Do not break promise chian.
            oThis.onPageInitializedCallback( oThis.currentUserInfo );  
          }, 0);
        }
        return true;
      })
      .catch( (error) => {
        let txt = jEl.text();
        jEl.html(txt + "<span style='float:right'>⚠️ Failed</span>");
        $("#loader").remove();
        throw error;
      })
  }

  hidePageLoader() {
    $('body').addClass('loaded');
  }

  validatePage() {

  }

  onPageInitialized( callback ) {
    this.onPageInitializedCallback = callback;
  }

  getBaseUrl() {
    return DEMO_MAPPY_UI_API_ENDPOINT;
  }

  getCurrentUser() {
    return this.currentUserInfo;
  }

  getCurrentUserFromServer(successCb, failuerCb) {
    const oThis = this;
    const apiUrl = this.getBaseUrl() + '/users/current-user';
    return ajaxUtils.get( apiUrl ).then( ( data ) =>{
      const resultType = data.result_type;
      oThis.currentUserInfo = data[ resultType ];
      return oThis.currentUserInfo;
    });
  }

  initOstWalletSdk() {
    if ( this.isOstWalletSdkInitialized ) {
      return Promise.resolve();
    }
    return OstWalletSdk.init( sdkConfig ).then(() => {
      console.log("OstWalletSdk.init resolved");
      this.isOstWalletSdkInitialized = true;
      return true;
    }).catch(( error ) => {
      console.error("OstWalletSdk.init threw an error", error);
      // Throw the error again.
      throw error;
    });
  }

  setupDeviceWorkflow() {
    const oThis = this;
    const currentUser = oThis.getCurrentUser();
    let _resolve, _reject;
    let sdkDelegate =  new OstSetupDeviceDelegate();
    // Define register device.
    sdkDelegate.registerDevice = function( apiParams ) {
      console.log(LOG_TAG, "registerDevice")
      return registerDevice(apiParams);
    };

    //Define flowComplete
    sdkDelegate.flowComplete = (ostWorkflowContext , ostContextEntity ) => {
      console.log("setupDeviceWorkflow :: sdkDelegate.flowComplete called");
      _resolve( ostContextEntity );
    };

    //Define flowInterrupt
    sdkDelegate.flowInterrupt = (ostWorkflowContext , ostError) => {
      console.log("setupDeviceWorkflow :: sdkDelegate.flowInterrupt called");
      _reject( ostError );
    };

    // Return a promise that invokes the workflow.
    return new Promise( (res, rej) => {
      _resolve = res;
      _reject  = rej;

      // Invoke the workflow.
      OstWalletSdk.setupDevice(currentUser.user_id, currentUser.token_id, sdkDelegate);
    });
  }

}
export default PageInitializer;