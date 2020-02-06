import OstSetup from "./common";
import "../../../node_modules/jquery.json-viewer/json-viewer/jquery.json-viewer.css";
import "../../../node_modules/jquery.json-viewer/json-viewer/jquery.json-viewer";

var currentUser = null;
$(function() {

  var ostSetup = new OstSetup();
  ostSetup.setupDevice();
  ostSetup.getCurrentUser()
    .then((current_user) => {
      console.log(current_user);
      currentUser = current_user})
    .catch(err=> alert(err));

    document.getElementById("logOutBtn").addEventListener("click", function(e) {
      logout();
 });
});
function logout(){
  $.post(baseUrl+"/users/logout",
  {
      

  },
  function (data, status) {

  if(data.success==true){
    window.location="/login"; 
  }


  });
}

$("#sdk-getter-btn").on('click', function(event){
  //getUser();
  //getDevice();
  getToken();
  //getActiveSessions()
});

$("#get-user").on('click', function(event){
  getUser();
});
$("#get-user-retry").on('click', function(event){
  $('#card1').on('click',function(event){
    toggle: false
  });
  getUser();
  
});

$("#get-device").on('click', function(event){
  getDevice();
});

$("#get-token").on('click', function(event){
  getToken();
});

$("#get-active-sessions").on('click', function(event){
  getActiveSessions();
});



function getUser() {

    window.OstSdkWallet.getUser(currentUser.user_id)
    .then((user) => {
        console.log("MAppy :: index :: getUser :: then :: " , user);
        $('#json-renderer-get-user').jsonViewer(user, { collapsed: false, withQuotes: true, withLinks: false});
        //document.getElementById("get-user-retry").setAttribute("data-toggle","collapse show");
        //$("#get-user-retry").attr("data-toggle", "collapse show");
        //$("#get-user-retry").collapse({show : true});
     })
    .catch((err) => {
      console.log("MAppy :: index :: getUser :: catch ::" , err);
      $('#json-renderer-get-user').jsonViewer(err, { collapsed: false, withQuotes: true, withLinks: false});
    });
  
  }
  
  function getToken() {
  
    window.OstSdkWallet.getToken(currentUser.user_id)
    .then((token) => {
        console.log("MAppy :: index :: getToken :: then :: " ,  token);
        $('#json-renderer-get-token').jsonViewer(token, { collapsed: false, withQuotes: true, withLinks: false});
     })
    .catch((err) => {
      console.log("MAppy :: index :: getToken :: catch ::" , err);
      $('#json-renderer-get-token').jsonViewer(err, { collapsed: false, withQuotes: true, withLinks: false});
    });
  
  }
  
  function getDevice() {
  
    window.OstSdkWallet.getDevice(currentUser.user_id)
    .then((device) => {
        console.log("MAppy :: index :: getDevice :: then :: " ,  device);
        $('#json-renderer-get-device').jsonViewer(device, {collapsed: false, withQuotes: true, withLinks: false});
     })
    .catch((err) => {
      console.log("MAppy :: index :: getDevice :: catch ::" , err);
      $('#json-renderer-get-token').jsonViewer(err, {collapsed: false, withQuotes: true, withLinks: false});
    });
  
  }

  // spending limit as function parameters
  var spendingLimit = '10000000000000';

  function getActiveSessions() {
    window.OstSdkWallet.getActiveSessions(currentUser.user_id, spendingLimit)
    .then((session) => {
        console.log("MAppy :: index :: getActiveSessions :: then :: " ,  session);
        $('#json-renderer-get-active-sessions').jsonViewer(session, {collapsed: false, withQuotes: true, withLinks: false});
     })
    .catch((err) => {
      console.log("MAppy :: index :: getActiveSessions :: catch ::" , err);
      $('#json-renderer-get-token').jsonViewer(err, { collapsed: false, withQuotes: true, withLinks: false});
    });
  }