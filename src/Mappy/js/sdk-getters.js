import DeviceSetup from "./common";

var baseUrl="https://demo-devmappy.stagingostproxy.com/demo/api/1129/3213e2cfeed268d4ff0e067aa9f5f528d85bdf577e30e3a266f22556865db23a";
let currentUser;

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

  DeviceSetup();

  $.ajax({
    type: 'GET',
    url: baseUrl+'/users/current-user',
    data: {
    },
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
    success: function (jsonData) {

      console.log("result =====> ", jsonData.success);
      currentUser = jsonData.data.current_user;

    },
    error: function (error) {
      alert("hey+error");
      
    }
  });
});

$("#sdk-getter-btn").on('click', function(event){
  //getUser();
  //getDevice();
  getToken();
  //getActiveSessions()
});



function getUser() {

    window.OstSdkWallet.getUser(currentUser.user_id)
    .then((user) => {
        console.log("MAppy :: index :: getUser :: then :: " , user);
     })
    .catch((err) => {
      console.log("MAppy :: index :: getUser :: catch ::" , err);
    });
  
  }
  
  function getToken() {
  
    window.OstSdkWallet.getToken(currentUser.user_id)
    .then((token) => {
        console.log("MAppy :: index :: getToken :: then :: " ,  token);
     })
    .catch((err) => {
      console.log("MAppy :: index :: getToken :: catch ::" , err);
    });
  
  }
  
  function getDevice() {
  
    window.OstSdkWallet.getDevice(currentUser.user_id)
    .then((device) => {
        console.log("MAppy :: index :: getDevice :: then :: " ,  device);
     })
    .catch((err) => {
      console.log("MAppy :: index :: getDevice :: catch ::" , err);
    });
  
  }

  // spending limit as function parameters
  var spendingLimit = '10000000000000';

  function getActiveSessions() {
    window.OstSdkWallet.getActiveSessions(currentUser.user_id, spendingLimit)
    .then((session) => {
        console.log("MAppy :: index :: getActiveSessions :: then :: " ,  session);
     })
    .catch((err) => {
      console.log("MAppy :: index :: getActiveSessions :: catch ::" , err);
    });
  }