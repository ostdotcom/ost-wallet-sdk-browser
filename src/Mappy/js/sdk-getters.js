import OstSetup from "./common";
import '../css/active_page.css';
import "../../../node_modules/jquery.json-viewer/json-viewer/jquery.json-viewer.css";
import "../../../node_modules/jquery.json-viewer/json-viewer/jquery.json-viewer";
import hljs from "../../../node_modules/highlight.js";
hljs.registerLanguage('javascript', require('../../../node_modules/highlight.js/lib/languages/javascript'));
//const hljs = require("highlight.js");




const Handlebars = require("handlebars");


var currentUser = null;
var user_Json = null ;
var device_Json = null;
var token_Json = null;
var active_session_json = null;
$(function() {
  loadGetters("getUser","left","handlebar-main");
  var ostSetup = new OstSetup();
  ostSetup.setupDevice();
  ostSetup.getCurrentUser()
    .then((current_user) => {
      console.log(current_user);
      currentUser = current_user;
      loadGetters("getUser","left","handlebar-main");
      loadGetters("getDevice","left1","handlebar-main1");
      loadGetters("getToken","left2","handlebar-main2");
      loadGetters("getActiveSessions","left3","handlebar-main3");
      //expand_all();
    })
    .catch(err=> alert(err));

    document.getElementById("logOutBtn").addEventListener("click", function(e) {
      logout();
 });
});
function loadGetters(functionName,upperTag,lowerTag){

  var source = $("#replace-demo").html();
  var template = Handlebars.compile(source);
  var context = { current_user_id:"123",function_name:functionName};
  var html = template(context);

  var source1 = document.getElementById(lowerTag).innerHTML;
  var template1 = Handlebars.compile(source1);
  var context1 = { replace:html};
  var html1 = template1(context1);
  const highlightedCode = hljs.highlight('javascript',html).value
  
    document.getElementById(upperTag).innerHTML = highlightedCode;
    switch(functionName) {
      case "getUser":
          //getUser();
        break;
      case "getDevice":
          getDevice();
        break;
      case "getToken":
          getToken();
        break;
      case "getActiveSessions":
          getActiveSessions();
          break;
      default:
        console.error("Not valid function call");
    }
  
}
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

// $("#get-user").on('click', function(event){
//   var functionName = "getUser";
  

//   var source = $("#replace-demo").html();
//   var template = Handlebars.compile(source);
//   var context = { current_user_id:currentUser.user_id,function_name:functionName};
//   var html = template(context);

//   var source1 = document.getElementById("handlebar-main").innerHTML;
//   var template1 = Handlebars.compile(source1);
//   var context1 = { replace:html};
//   var html1 = template1(context1);
  
//     document.getElementById("left").innerHTML = html1;
  

//   //getUser();
// });
$("#get-user-retry").on('click', function(event){
  $('#card1').on('click',function(event){
    toggle: false
  });
  getUser();
  
});

$("#get-device-retry").on('click', function(event){
  getDevice();
});

$("#get-token-retry").on('click', function(event){
  getToken();
});

$("#get-active-sessions-retry").on('click', function(event){
  getActiveSessions();
});

function expand_all(){
  $('.collapse').each(function(){
      $(this).addClass('show');
  });
  $('.accordion-btn').each(function(){
      $(this).attr('aria-expanded','true');
  });
}

function getUser() {

    window.OstSdkWallet.getUser(currentUser.user_id)
    .then((user) => {
        console.log("MAppy :: index :: getUser :: then :: " , user);
        $('#json-renderer-get-user').jsonViewer(user, { collapsed: false, withQuotes: true, withLinks: false});
        
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