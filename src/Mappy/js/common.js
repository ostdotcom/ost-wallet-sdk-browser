import OstMappyCallbacks from "../../OstWalletSdk/OstMappyCallbacks";
import "../../OstWalletSdk/index";

var currentUser = null;
const LOG_TAG = "Mappy :: common :: ";
var baseUrl="https://demo-devmappy.stagingostproxy.com/demo/api/1129/3213e2cfeed268d4ff0e067aa9f5f528d85bdf577e30e3a266f22556865db23a";

export default function deviceSetup() {

    $(function() {

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
      
      
        $.ajax({
          type: 'GET',
          url: baseUrl+'/users/current-user',
          data: {
          },
          contentType: 'application/json; charset=utf-8',
          dataType: 'json',
          success: function (jsonData) {
      
            console.log("result =====> ", jsonData.success);
            
            setupDevice( jsonData.data );
          },
          error: function (error) {
            alert("hey+error");
            
          }
        });
      });
   
}

function setupDevice(args) {

    console.log(LOG_TAG, "setupDevice");
  
    let resultType = args.result_type
    ;
    currentUser = args[resultType];
  
  
    let mappyCallback =  new OstMappyCallbacks();
    mappyCallback.registerDevice = function( apiParams ) {
      console.log(LOG_TAG, "registerDevice");
  
      return registerDevice(apiParams);
    };
    console.log("user_id =======> ",currentUser.user_id);
    let workflowId = OstSdkWallet.setupDevice(
      currentUser.user_id,
      currentUser.token_id,
      "http://stagingpepo.com",
      mappyCallback);
  }


  function registerDevice(apiParams, device_name = 'a', device_uuid = 'b'){

    return new Promise((resolve, reject)=> {
  
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
      $.post(baseUrl+"/devices",
        {
          address: apiParams.device_address,
          api_signer_address: apiParams.api_signer_address,
          device_name: device_name,
          device_uuid: device_uuid
  
        }, response)
    })
  }
