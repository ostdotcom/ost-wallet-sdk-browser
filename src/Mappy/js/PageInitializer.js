import ajaxUtils from "./ajaxUtils";
import '../css/loader.css';
import '../css/logged-in.css';
import DeleteSessionsHelper from './DeleteSessionsHelper';
import CreateSessionHelper from './CreateSessionHelper';

import WorkflowSubscriberService from "./WorkflowSubscriberService";

const sdkConfig = {
  "token_id": window.OST_TOKEN_ID,
  "environment": "testnet",
  "sdk_endpoint": OST_BROWSER_SDK_IFRAME_URL
};

const LOG_TAG = "PageInitializer";
class PageInitializer {
  constructor( autoPerform = true) {
    const oThis = this;

    oThis.currentUserInfo = null;
    oThis.deleteSessionsHelper = null;
    oThis.validatePage();
    $(() => {
      oThis.addPartials();
      ajaxUtils.setupAjax();
      oThis.bindEvents();
      if ( autoPerform ) {
        oThis.perform();
      }
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

      // Init WorkflowSubscriber Service
      .then( () => {
        // Hacky Logic - DO NOT COPY THIS `then`.
        let txt = jEl.text();
        jEl.html(txt + "<span style='float:right'>✅ Done</span>");

        let wsJEl = $("#loading-workflow-subscriber");
        let wsTxt = wsJEl.text();
        wsJEl.removeClass("d-none");
        return oThis.initWorkflowSubscriber()
          .then((idk) => {
            // Hacky Logic.
            jEl = wsJEl;
            return idk;
          })
          .catch((e) => {
            // Some error has occoured. But, lets supress it. continue anyway.
            wsJEl.html(wsTxt + "<span style='float:right'>⚠️ Failed</span>");
            // Hacky Logic - reset to txt
            jEl.html(txt);
          })
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
        if ( !oThis.deleteSessionsHelper ) {
          setTimeout( () => {
            // Do not break promise chian.
            oThis.deleteSessionsHelper = new DeleteSessionsHelper( oThis.currentUserInfo );
            oThis.createSessionHelper = new CreateSessionHelper( oThis.currentUserInfo );
          }, 0);
        }
        return true;
      })
      .catch( (error) => {
        let txt = jEl.text();
        jEl.html(txt + "<span style='float:right'>⚠️ Failed</span>");
        oThis.hidePageLoader();
        throw error;
      })
  }

  hidePageLoader() {
    $('body').addClass('loaded');
    setTimeout(() => {
      $("#loader-wrapper").remove();
    }, 7000);
  }

  validatePage() {

  }

  bindEvents() {
    const oThis = this;
    $("#j-logout-btn").click(() => {
      oThis.logout();
    });
  }
  onPageInitialized( callback ) {
    this.onPageInitializedCallback = callback;
  }

  getApiBaseUrl() {
    return window.DEMO_MAPPY_UI_API_ENDPOINT;
  }

  getCurrentUser() {
    return this.currentUserInfo;
  }

  getCurrentUserFromServer(dontLogout) {
    const oThis = this;

    if (typeof dontLogout !== 'boolean') {
      dontLogout = false;
    }

    const apiUrl = this.getApiBaseUrl() + '/users/current-user';
    return ajaxUtils.get( apiUrl )
      .then( ( data ) =>{
        const resultType = data.result_type;
        oThis.currentUserInfo = data[ resultType ];
        return oThis.currentUserInfo;
      })
      .catch( (error) => {
        // Trigger logout.
        // TODO: Detect if error is 401 before triggering logout.
        if ( !dontLogout ) {
          oThis.logout();
        }
        throw error;
      })
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
      console.error("|||------- OstWalletSdk.init threw an error -------|||", error);
      // Throw the error again.
      throw error;
    });
  }

  initWorkflowSubscriber() {
    return WorkflowSubscriberService.init(this.currentUserInfo)
      .catch((error) => {
        console.log("|||------- WorkflowSubscriber.init threw an error -------|||", error);
        // Throw the error again.
        throw error;
      })
  }

  setupDeviceWorkflow() {
    const oThis = this;
    const currentUser = oThis.getCurrentUser();
    let _resolve, _reject;
    let sdkDelegate =  new OstSetupDeviceDelegate();
    // Define register device.
    sdkDelegate.registerDevice = function( apiParams ) {
      console.log(LOG_TAG, "registerDevice");
      return oThis.registerDevice(apiParams);
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
      let workflowId = OstWalletSdk.setupDevice(currentUser.user_id, currentUser.token_id, sdkDelegate);
      // Set the workflowId for sdk-getters.
      currentUser.setup_device_workflow_id = workflowId;
      
      WorkflowSubscriberService.subscribeToWorkflowId(workflowId);
    });
  }

  logout() {
    const oThis = this;
    //BUG: This logout url is incorrect.
    const apiUrl = this.getApiBaseUrl() + '/users/logout';
    return ajaxUtils.post( apiUrl )
      .catch(() => {
        // ignore error.
        return true;
      })
      .then( () => {
        // Very old code for clearing cookies.
        // Most likely not going to work.
        var cookies = document.cookie.split(";");
        for(var i=0; i < cookies.length; i++) {
            var equals = cookies[i].indexOf("=");
            var name = equals > -1 ? cookies[i].substr(0, equals) : cookies[i];
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }

        console.log("document.cookie", document.cookie);
        // Go to login page.
        setTimeout(() => {
          window.location = "./login.html";
        }, 100);
      })
  }

  registerDevice(apiParams) {
    const apiUrl = this.getApiBaseUrl() + '/devices';
    return ajaxUtils.post( apiUrl, {
        "address": apiParams.device_address,
        "api_signer_address": apiParams.api_signer_address,
        "original_payload": apiParams
      })
      .catch( (errorResponse) => {
        let isDeviceAlreadyRegistered = false;
        // Response if already registered.
        //{"success":false,"internal_id":"l_oah_1","code":"ALREADY_EXISTS","msg":"Duplicate entity already exists."}

        if ( errorResponse && errorResponse.success === false ) {
          if ( errorResponse.code === "ALREADY_EXISTS") {
            isDeviceAlreadyRegistered = true;
          }
        }

        if ( isDeviceAlreadyRegistered ) {
          console.log("device already registered.");
          // ignore the error.
          return true;
        }
        alert('Unable to register device.');
        // If not, throw the error.
        throw error;
      });
  }

  addPartials() {
    if ( !window._htmlPartials ) {
      return;
    }
    for(let k in _htmlPartials) {
      let encodedHtml = _htmlPartials[k];
      let jEl = $( decodeURIComponent( encodedHtml ) );
      $('body').append( jEl );
    }
  }
}
export default PageInitializer;
