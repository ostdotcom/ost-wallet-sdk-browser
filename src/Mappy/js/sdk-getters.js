import OstSetup from "./common";

var currentUser = null;
$(function() {

  var ostSetup = new OstSetup();
  ostSetup.deviceSetupCall();
  ostSetup.getCurrentUser()
    .then((current_user) => {
      console.log(current_user);
      currentUser = current_user})
    .catch(err=> alert(err));
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