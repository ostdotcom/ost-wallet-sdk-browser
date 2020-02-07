import OstSetup from "./common";
import '../css/active_page.css';
import "../../../node_modules/jquery.json-viewer/json-viewer/jquery.json-viewer.css";
import "../../../node_modules/jquery.json-viewer/json-viewer/jquery.json-viewer";
import { stringify } from "qs";
import hljs from "../../../node_modules/highlight.js";
//const hljs = require('../../ ./highlight.js');

var baseUrl="https://demo-devmappy.stagingostproxy.com/demo/api/1129/3213e2cfeed268d4ff0e067aa9f5f528d85bdf577e30e3a266f22556865db23a";
var currentUser = null;


$(function() {
  console.log("document loaded!");
    $(".logOutBtn").click( function(e) {
      logout();    
    });

  var ostSetup = new OstSetup();
  ostSetup.setupDevice()
    .then((current_user) => {
      currentUser = current_user;
      load_apis("getCurrentDevice","left1","handlebar-main1");
      load_apis("getBalanceWithPricePoint","left2","handlebar-main2");
       load_apis("getBalance","left3","handlebar-main3");
       load_apis("getPricePoint","left4","handlebar-main4");

       load_apis("getDeviceListFromServer","left6","handlebar-main6");
       load_apis("getTransactions","left7","handlebar-main7");
  });

  function load_apis(functionName,upperTag,lowerTag){

    var source = $("#replace-demo").html();
    var template = Handlebars.compile(source);
    var context = { current_user_id:currentUser.user_id,function_name:functionName};
    var html = template(context);

    var source1 = document.getElementById(lowerTag).innerHTML;
    var template1 = Handlebars.compile(source1);
    var context1 = { replace:html};
    var html1 = template1(context1);
    
      document.getElementById(upperTag).innerHTML = html1;
      switch(functionName) {
        case "getCurrentDevice":
          
          getCurrentDevice();
          break;
        case "getBalanceWithPricePoint":
          
          getBalanceWithPricePoint();
          
          break;
        case "getBalance":
          getBalance();
          break;
        case "getPricePoint":
          getPricePoint();
            break;
        case "getDeviceListFromServer":
          getDeviceListFromServer();
          break;
        case "getTransactions":
          getTransactions();
          break;
        default:
          console.error("Not valid function call");
      }
    
  }


  $("#get-cur-device").on('click', function(event){
    getRules();
  });

  $("#balance-wpp").on('click', function(event){
    getTokenHolderFromServer()
    //getBalanceWithPricePoint();
  });

  $("#bal-uid").on('click', function(event){
    getBalance();
  });

  $("#pp-uid").on('click', function(event){
    getPricePoint();
  });

  $("#dev-list-uid").on('click', function(event){
    getDeviceListFromServer();
  });

  $("#transactions-uid").on('click', function(event){
    getTransactions();
  });

    //json Api Calls
    
    function getUser() {
      OstJsonApi.getUser(currentUser.user_id)
      .then((user) => {
        console.log("MAppy :: index :: getUser :: then :: " ,  user);
        $('#json-renderer').jsonViewer(user, { collapsed: false, withQuotes: true, withLinks: false});
      })
      .catch((err) => {
        console.log("MAppy :: index :: getUser :: catch ::" , err);
        $('#json-renderer').jsonViewer(err, { collapsed: false, withQuotes: true, withLinks: false});
      });
    }
    
    function getToken() {
      OstJsonApi.getToken(currentUser.user_id)
      .then((token) => {
        console.log("MAppy :: index :: getToken :: then :: " ,  token);
        $('#json-renderer').jsonViewer(token, { collapsed: false, withQuotes: true, withLinks: false});
      })
      .catch((err) => {
        console.log("MAppy :: index :: getToken :: catch ::" , err);
      });
    }
    
    function getCurrentDevice() {
      OstJsonApi.getCurrentDevice(currentUser.user_id)
      .then((device) => {
        console.log("MAppy :: index :: getCurrentDevice :: then :: " ,  device);
        $('#json-renderer').jsonViewer(device, { collapsed: false, withQuotes: true, withLinks: false});
      })
      .catch((err) => {
        console.log("MAppy :: index :: getCurrentDevice :: catch ::" , err);
        $('#json-renderer').jsonViewer(err, { collapsed: false, withQuotes: true, withLinks: false});
      });
    }
    
    function getBalance() {
      OstJsonApi.getBalance(currentUser.user_id)
      .then((balance) => {
        
        console.log("MAppy :: index :: getBalance :: then :: " ,  balance);
        $('#json-renderer-bal-id').jsonViewer(balance, { collapsed: false, withQuotes: true, withLinks: false});
      })
      .catch((err) => {
        
        console.log("MAppy :: index :: getBalance :: catch ::" , err);
        $('#json-renderer-bal-id').jsonViewer(err, { collapsed: false, withQuotes: true, withLinks: false});
      });
    }
    
    function getPricePoint() {
      OstJsonApi.getPricePoint(currentUser.user_id)
      .then((pricePoint) => {
        console.log("MAppy :: index :: getPricePoint :: then :: " ,  pricePoint);
        $('#json-renderer-pp-id').jsonViewer(pricePoint, { collapsed: false, withQuotes: true, withLinks: false});
      })
      .catch((err) => {
        console.log("MAppy :: index :: getPricePoint :: catch ::" , err);
        $('#json-renderer-pp-id').jsonViewer(err, { collapsed: false, withQuotes: true, withLinks: false});
      });
    }
    
    function getBalanceWithPricePoint() {
      OstJsonApi.getBalanceWithPricePoint(currentUser.user_id)
      .then((balancePricePointData) => {
        console.log("MAppy :: index :: getBalanceWithPricePoint :: then :: " ,  balancePricePointData);
        console.error("it is here");
        $('#json-renderer-bal-pp').jsonViewer(balancePricePointData, { collapsed: false, withQuotes: true, withLinks: false});
      })
      .catch((err) => {
        console.error("it is here");
        console.log("MAppy :: index :: getBalanceWithPricePoint :: catch ::" , err);
        $('#json-renderer-bal-pp').jsonViewer(err, { collapsed: false, withQuotes: true, withLinks: false});
      });
    }
    
    function getTransactions() {
      OstJsonApi.getTransactions(currentUser.user_id)
      .then((transactions) => {
        console.log("MAppy :: index :: getTransactions :: then :: " ,  transactions);
        $('#json-renderer-transaction').jsonViewer(transactions, { collapsed: false, withQuotes: true, withLinks: false});
      })
      .catch((err) => {
        console.log("MAppy :: index :: getTransactions :: catch ::" , err);
        $('#json-renderer-transaction').jsonViewer(err, { collapsed: false, withQuotes: true, withLinks: false});
      });
    }
    
    function getTokenHolderFromServer() {
      OstJsonApi.getTokenHolderFromServer(currentUser.user_id)
      .then((token_holder) => {
        console.log("MAppy :: index :: getTokenHolderFromServer :: then :: " ,  token_holder);
      })
      .catch((err) => {
        console.log("MAppy :: index :: getTokenHolderFromServer :: catch ::" , err);
      });
    }
    
    function getRules() {
      OstJsonApi.getRules(currentUser.user_id)
      .then((rules) => {
        console.log("MAppy :: index :: getRules :: then :: " ,  rules);
      })
      .catch((err) => {
        console.log("MAppy :: index :: getRules :: catch ::" , err);
      });
    }

    function getDeviceListFromServer() {
      OstJsonApi.getDeviceListFromServer(currentUser.user_id)
      .then((rules) => {
        console.log("MAppy :: index :: getDeviceListFromServer :: then :: " ,  rules);
        $('#json-renderer-dev-list').jsonViewer(rules, { collapsed: false, withQuotes: true, withLinks: false});
      })
      .catch((err) => {
        console.log("MAppy :: index :: getDeviceListFromServer :: catch ::" , err);
      });
    }


    function logout(){
      
      //var baseUrl = OstSetup.getBaseUrl();
      
      //console.error(baseUrl);
      $.post("https://demo-devmappy.stagingostproxy.com/demo/api/1129/3213e2cfeed268d4ff0e067aa9f5f528d85bdf577e30e3a266f22556865db23a/users/logout",
      {

      },
      function (data, status) {
        
        if(data.success==true){
          window.location="login"; 
        }
      });
      
    }

  });