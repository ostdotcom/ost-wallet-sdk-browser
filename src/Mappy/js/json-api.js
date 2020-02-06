import OstSetup from "./common";
import '../css/active_page.css';
import "../../../node_modules/jquery.json-viewer/json-viewer/jquery.json-viewer.css";
import "../../../node_modules/jquery.json-viewer/json-viewer/jquery.json-viewer";

//var baseUrl="https://demo-devmappy.stagingostproxy.com/demo/api/1129/3213e2cfeed268d4ff0e067aa9f5f528d85bdf577e30e3a266f22556865db23a";
var currentUser = null;


$(function() {

  var ostSetup = new OstSetup();
  ostSetup.setupDevice();
  ostSetup.getCurrentUser()
    .then((current_user) => {
      console.log(current_user);
      currentUser = current_user;
      load_apis("getCurrentDeviceFromServer","left1","handlebar-main1");
      load_apis("getBalanceWithPricePointFromServer","left2","handlebar-main2");
      load_apis("getBalanceFromServer","left3","handlebar-main3");
      load_apis("getPricePointFromServer","left4","handlebar-main4");
      load_apis("getPendingRecoveryFromServer","left5","handlebar-main5");
      load_apis("getDeviceListFromServer","left6","handlebar-main6");
      load_apis("getTransactionsFromServer","left7","handlebar-main7");

    })
    .catch(err=> alert(err));

    document.getElementById("logOutBtn").addEventListener("click", function(e) {
      logout();
 });
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
      case "getCurrentDeviceFromServer":
        getCurrentDeviceFromServer();
        break;
      case "getBalanceWithPricePointFromServer":
        getBalanceWithPricePointFromServer();
        break;
      case "getBalanceFromServer":
        getBalanceFromServer();
        break;
      case "getPricePointFromServer":
        getPricePointFromServer();
          break;
      case "getPendingRecoveryFromServer":
        getPendingRecoveryFromServer();
        break;
      case "getDeviceListFromServer":
        getDeviceListFromServer();
        break;
      case "getTransactionsFromServer":
        getTransactionsFromServer();
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

$("#get-cur-device").on('click', function(event){
  //getTokenFromServer()
  //getUserFromServer()
  getCurrentDeviceFromServer();
});

$("#balance-wpp").on('click', function(event){
  getBalanceWithPricePointFromServer();
});

$("#bal-uid").on('click', function(event){
  getBalanceFromServer();
});

$("#pp-uid").on('click', function(event){
  getPricePointFromServer();
});

$("#recovery-uid").on('click', function(event){
  getPendingRecoveryFromServer();
});

$("#dev-list-uid").on('click', function(event){
  getDeviceListFromServer();
});

$("#transactions-uid").on('click', function(event){
  getTransactionsFromServer();
});

  //json Api Calls
  
  function getUserFromServer() {
    window.OstSdkWallet.getUserFromServer(currentUser.user_id)
    .then((user) => {
      console.log("MAppy :: index :: getUserFromServer :: then :: " ,  user);
      $('#json-renderer').jsonViewer(user, { collapsed: false, withQuotes: true, withLinks: false});
    })
    .catch((err) => {
      console.log("MAppy :: index :: getUserFromServer :: catch ::" , err);
      $('#json-renderer').jsonViewer(err, { collapsed: false, withQuotes: true, withLinks: false});
    });
  }
  
  function getTokenFromServer() {
    window.OstSdkWallet.getTokenFromServer(currentUser.user_id)
    .then((token) => {
      console.log("MAppy :: index :: getTokenFromServer :: then :: " ,  token);
      $('#json-renderer').jsonViewer(token, { collapsed: false, withQuotes: true, withLinks: false});
    })
    .catch((err) => {
      console.log("MAppy :: index :: getTokenFromServer :: catch ::" , err);
    });
  }
  
  function getCurrentDeviceFromServer() {
    window.OstSdkWallet.getCurrentDeviceFromServer(currentUser.user_id)
    .then((device) => {
      console.log("MAppy :: index :: getCurrentDeviceFromServer :: then :: " ,  device);
      $('#json-renderer').jsonViewer(device, { collapsed: false, withQuotes: true, withLinks: false});
    })
    .catch((err) => {
      console.log("MAppy :: index :: getCurrentDeviceFromServer :: catch ::" , err);
      $('#json-renderer').jsonViewer(err, { collapsed: false, withQuotes: true, withLinks: false});
    });
  }
  
  function getBalanceFromServer() {
    window.OstSdkWallet.getBalanceFromServer(currentUser.user_id)
    .then((balance) => {
      console.log("MAppy :: index :: getBalanceFromServer :: then :: " ,  balance);
      $('#json-renderer-bal-id').jsonViewer(balance, { collapsed: false, withQuotes: true, withLinks: false});
    })
    .catch((err) => {
      console.log("MAppy :: index :: getBalanceFromServer :: catch ::" , err);
      $('#json-renderer-bal-id').jsonViewer(err, { collapsed: false, withQuotes: true, withLinks: false});
    });
  }
  
  function getPricePointFromServer() {
    window.OstSdkWallet.getPricePointFromServer(currentUser.user_id)
    .then((pricePoint) => {
      console.log("MAppy :: index :: getPricePointFromServer :: then :: " ,  pricePoint);
      $('#json-renderer-pp-id').jsonViewer(pricePoint, { collapsed: false, withQuotes: true, withLinks: false});
    })
    .catch((err) => {
      console.log("MAppy :: index :: getPricePointFromServer :: catch ::" , err);
      $('#json-renderer-pp-id').jsonViewer(err, { collapsed: false, withQuotes: true, withLinks: false});
    });
  }
  
  function getBalanceWithPricePointFromServer() {
    window.OstSdkWallet.getBalanceWithPricePointFromServer(currentUser.user_id)
    .then((balancePricePointData) => {
      console.log("MAppy :: index :: getBalanceWithPricePointFromServer :: then :: " ,  balancePricePointData);
      $('#json-renderer-bal-pp').jsonViewer(balancePricePointData, { collapsed: false, withQuotes: true, withLinks: false});
    })
    .catch((err) => {
      console.log("MAppy :: index :: getBalanceWithPricePointFromServer :: catch ::" , err);
      $('#json-renderer-bal-pp').jsonViewer(err, { collapsed: false, withQuotes: true, withLinks: false});
    });
  }
  
  function getPendingRecoveryFromServer() {
    window.OstSdkWallet.getPendingRecoveryFromServer(currentUser.user_id)
    .then((pendingRecovery) => {
      console.log("MAppy :: index :: getPendingRecoveryFromServer :: then :: " ,  pendingRecovery);
      $('#json-renderer-recovery').jsonViewer(pendingRecovery, { collapsed: false, withQuotes: true, withLinks: false});
    })
    .catch((err) => {
      console.log("MAppy :: index :: getPendingRecoveryFromServer :: catch ::" , err);
      $('#json-renderer-recovery').jsonViewer(err, { collapsed: false, withQuotes: true, withLinks: false});
    });
  }
  
  function getTransactionsFromServer() {
    window.OstSdkWallet.getTransactionsFromServer(currentUser.user_id)
    .then((transactions) => {
      console.log("MAppy :: index :: getTransactionsFromServer :: then :: " ,  transactions);
      $('#json-renderer-transaction').jsonViewer(transactions, { collapsed: false, withQuotes: true, withLinks: false});
    })
    .catch((err) => {
      console.log("MAppy :: index :: getTransactionsFromServer :: catch ::" , err);
      $('#json-renderer-transaction').jsonViewer(err, { collapsed: false, withQuotes: true, withLinks: false});
    });
  }
  
  function getTokenHolderFromServer() {
    window.OstSdkWallet.getTokenHolderFromServer(currentUser.user_id)
    .then((token_holder) => {
      console.log("MAppy :: index :: getTokenHolderFromServer :: then :: " ,  token_holder);
    })
    .catch((err) => {
      console.log("MAppy :: index :: getTokenHolderFromServer :: catch ::" , err);
    });
  }
  
  function getRulesFromServer() {
    window.OstSdkWallet.getRulesFromServer(currentUser.user_id)
    .then((rules) => {
      console.log("MAppy :: index :: getTokenHolderFromServer :: then :: " ,  rules);
    })
    .catch((err) => {
      console.log("MAppy :: index :: getTokenHolderFromServer :: catch ::" , err);
    });
  }

  function getDeviceListFromServer() {
    window.OstSdkWallet.getDeviceListFromServer(currentUser.user_id)
    .then((rules) => {
      console.log("MAppy :: index :: getDeviceListFromServer :: then :: " ,  rules);
    })
    .catch((err) => {
      console.log("MAppy :: index :: getDeviceListFromServer :: catch ::" , err);
    });
  }

  