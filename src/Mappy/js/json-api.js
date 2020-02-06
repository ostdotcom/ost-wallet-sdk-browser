import OstSetup from "./common";
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
      currentUser = current_user})
    .catch(err=> alert(err));
});

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
      $('#json-renderer').jsonViewer(user, {collapsed: true, withQuotes: true, withLinks: false});
    })
    .catch((err) => {
      console.log("MAppy :: index :: getUserFromServer :: catch ::" , err);
    });
  }
  
  function getTokenFromServer() {
    window.OstSdkWallet.getTokenFromServer(currentUser.user_id)
    .then((token) => {
      console.log("MAppy :: index :: getTokenFromServer :: then :: " ,  token);
      $('#json-renderer').jsonViewer(token, {collapsed: true, withQuotes: true, withLinks: false});
    })
    .catch((err) => {
      console.log("MAppy :: index :: getTokenFromServer :: catch ::" , err);
    });
  }
  
  function getCurrentDeviceFromServer() {
    window.OstSdkWallet.getCurrentDeviceFromServer(currentUser.user_id)
    .then((device) => {
      console.log("MAppy :: index :: getCurrentDeviceFromServer :: then :: " ,  device);
      $('#json-renderer').jsonViewer(device, {collapsed: true, withQuotes: true, withLinks: false});
    })
    .catch((err) => {
      console.log("MAppy :: index :: getCurrentDeviceFromServer :: catch ::" , err);
    });
  }
  
  function getBalanceFromServer() {
    window.OstSdkWallet.getBalanceFromServer(currentUser.user_id)
    .then((balance) => {
      console.log("MAppy :: index :: getBalanceFromServer :: then :: " ,  balance);
      $('#json-renderer-bal-id').jsonViewer(balance, {collapsed: true, withQuotes: true, withLinks: false});
    })
    .catch((err) => {
      console.log("MAppy :: index :: getBalanceFromServer :: catch ::" , err);
    });
  }
  
  function getPricePointFromServer() {
    window.OstSdkWallet.getPricePointFromServer(currentUser.user_id)
    .then((pricePoint) => {
      console.log("MAppy :: index :: getPricePointFromServer :: then :: " ,  pricePoint);
      $('#json-renderer-pp-id').jsonViewer(pricePoint, {collapsed: true, withQuotes: true, withLinks: false});
    })
    .catch((err) => {
      console.log("MAppy :: index :: getPricePointFromServer :: catch ::" , err);
    });
  }
  
  function getBalanceWithPricePointFromServer() {
    window.OstSdkWallet.getBalanceWithPricePointFromServer(currentUser.user_id)
    .then((balancePricePointData) => {
      console.log("MAppy :: index :: getBalanceWithPricePointFromServer :: then :: " ,  balancePricePointData);
      $('#json-renderer-bal-pp').jsonViewer(balancePricePointData, {collapsed: true, withQuotes: true, withLinks: false});
    })
    .catch((err) => {
      console.log("MAppy :: index :: getBalanceWithPricePointFromServer :: catch ::" , err);
    });
  }
  
  function getPendingRecoveryFromServer() {
    window.OstSdkWallet.getPendingRecoveryFromServer(currentUser.user_id)
    .then((pendingRecovery) => {
      console.log("MAppy :: index :: getPendingRecoveryFromServer :: then :: " ,  pendingRecovery);
      $('#json-renderer-recovery').jsonViewer(pendingRecovery, {collapsed: true, withQuotes: true, withLinks: false});
    })
    .catch((err) => {
      console.log("MAppy :: index :: getPendingRecoveryFromServer :: catch ::" , err);
    });
  }
  
  function getTransactionsFromServer() {
    window.OstSdkWallet.getTransactionsFromServer(currentUser.user_id)
    .then((transactions) => {
      console.log("MAppy :: index :: getTransactionsFromServer :: then :: " ,  transactions);
      $('#json-renderer-transaction').jsonViewer(transactions, {collapsed: true, withQuotes: true, withLinks: false});
    })
    .catch((err) => {
      console.log("MAppy :: index :: getTransactionsFromServer :: catch ::" , err);
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

  