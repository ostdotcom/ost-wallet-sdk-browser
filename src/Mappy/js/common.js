const LOG_TAG = "Mappy :: common :: ";
export class OstSetup {

  constructor() {
    $.ajaxSetup({
      type: "POST",
      xhrFields: {
        withCredentials: true
      },
      crossDomain: true
    });
  
    $.ajaxSetup({
      type: "GET",
      xhrFields: {
        withCredentials: true
      },
      crossDomain: true
    });
  }

  getBaseUrl() {
    return DEMO_MAPPY_UI_API_ENDPOINT;
  }

  ajaxSetupFunction(){

    $.ajaxSetup({
      type: "POST",
      xhrFields: {
        withCredentials: true
      },
      crossDomain: true
    });
  
    $.ajaxSetup({
      type: "GET",
      xhrFields: {
        withCredentials: true
      },
      crossDomain: true
    });
  }

  getCurrentUser() {
    return new Promise((resolve, reject) => {
    var baseUrl = this.getBaseUrl();
      $.ajax({
        type: 'GET',
        url: baseUrl + '/users/current-user',
        data: {
        },
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (jsonData) {
          console.log("result =====> ", jsonData.success);
          var currentUser = jsonData.data.current_user;
          resolve(currentUser)
        },
        error: function (error) {
          alert(error);
          reject(error);
        }
      });
    })
  }

  initOstWalletSdk() {
    if ( this.isOstWalletSdkInitialized ) {
      return Promise.resolve();
    }

    const sdkConfig = {
      "api_endpoint": OST_BROWSER_SDK_PLATFORM_API_ENDPOINT,
      "sdk_endpoint": OST_BROWSER_SDK_IFRAME_URL
    };
    console.log("sdkConfig", sdkConfig);

    return OstWalletSdk.init( sdkConfig ).then(() => {
      console.log("init resolved");
      this.isOstWalletSdkInitialized = true;
      return true;
    }).catch(( error ) => {
      console.log("init caught!");
      console.error(error);
    });
  }

  setupDeviceWorkflow( currentUser ) {
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

  setupDevice(){
    const oThis = this;
    let currentUserInstance = null;

    return this.getCurrentUser()
      // Store currentUser and invoke OstWalletSdk.init
      .then((currentUser) => {
        currentUserInstance = currentUser;
        return oThis.initOstWalletSdk();
      })

      // Perform the setup Device
      .then( () => {
        return oThis.setupDeviceWorkflow( currentUserInstance );
      })


    // return new Promise((resolve, reject) => {
      
    //     .then((currentUser) => {

    //       console.log("user_id =======> ",currentUser.user_id);
    //       let workflowId = OstWalletSdk.setupDevice(
    //         currentUser.user_id,
    //         currentUser.token_id,
    //         //"http://stagingpepo.com",
    //         mappyCallback);


    //         resolve(currentUser);
    //     })
    //     .catch(err => {
    //       console.log(err);
    //       reject(err);

    //     });
    //   })
  }
}

export default OstSetup;

function registerDevice(apiParams){

  return new Promise((resolve, reject) => {

    const response = function (data, status) {
      console.log("regData: " + data + "\nStatus: " + status);
      // Make another api call to fetch current user info.
      console.log("reg",data.success);
      console.log("reg",data.code);
      if(data.success==false){
        alert("Already exists or invalid entry");
        return resolve()
      }
      else{
        return resolve();
      }
    };
    var ostSetup = new OstSetup();
    var baseUrl = ostSetup.getBaseUrl();
    $.post(baseUrl+"/devices",
      {
        address: apiParams.device_address,
        api_signer_address: apiParams.api_signer_address
      }, response)
  })
}
