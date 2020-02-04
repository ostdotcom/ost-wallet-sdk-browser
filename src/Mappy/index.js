import OstMappyCallbacks from "../OstWalletSdk/OstMappyCallbacks";


import './css/login.css';
import '../common-js/qrcode';



var i=1;
var baseUrl="https://demo-devmappy.stagingostproxy.com/demo/api/1129/3213e2cfeed268d4ff0e067aa9f5f528d85bdf577e30e3a266f22556865db23a";

const LOG_TAG = "Mappy :: index :: ";
function preloadFunc()
{
    

    $.ajax({
      type: 'GET',
      url: baseUrl+'/users/current-user',
      data: {
      },
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function (jsonData) {

        window.location.href = "/devserver/users.html";
        
        
        
      },
      error: function (error) {
        alert("hey+error");
        console.log('Error loading username=' + document.getElementById("usernameTb").value + error);
      }
    });
    alert("PreLoad");

}
window.onpaint = preloadFunc();

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
  

  $("#signupBtn").click(function () {
  

    
   $.post(baseUrl+"/login",
      {
        username: document.getElementById("usernameTb").value,
        password: document.getElementById("password").value
      },
      function (data, status) {
        
        console.log("Data: " + data + "\nStatus: " + status);
        // Make another api call to fetch current user info.
        console.log(data.success);
        if(data.success==false){
          alert("INVALID USERNAME OR PASSWORD");
        }
        if(data.success==true){
          
          //var data =registerDevice("0x69F3a70eD7Ab01826a1b4F0b262b3886D4D0685a","0x1ffc91Bce15fAd500f1Bb3f265cE33d4D385ff51","Postman client 2","0x69F3a70eD7Ab01826a1b4F0b262b3886D4D0685a");
          //alert(data);
          document.getElementById("signupBtn").disabled = true;
          window.location.href = "devserver/users.html";
       
      }
      });
  });
})



function setupDevice(args) {

  console.log(LOG_TAG, "setupDevice");

  let resultType = args.result_type
    , currentUser = args[resultType]
  ;

  let mappyCallback =  new OstMappyCallbacks();
  mappyCallback.registerDevice = function(deviceAddress, apiKeyAddress) {
    console.log(LOG_TAG, "registerDevice");

    return registerDevice(deviceAddress, apiKeyAddress);
  };

  let workflowId = window.OstSdkWallet.setupDevice(
    currentUser.user_id,
    currentUser.token_id,
    "http://stagingpepo.com",
    mappyCallback);


}














function registerDevice(address, api_signer_address, device_name = 'a', device_uuid = 'b'){

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
        address: address,
        api_signer_address: api_signer_address,
        device_name: device_name,
        device_uuid: device_uuid

      }, response)
  })
}


function makeCode(object){
  
  let text  =  JSON.stringify(object);
  $("#QrMainDiv div").html('');  
  var qrcode = new QRCode(document.getElementById("qrcode"), {
    text: text,
    width: 470,
    height: 470,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
});

 
}

