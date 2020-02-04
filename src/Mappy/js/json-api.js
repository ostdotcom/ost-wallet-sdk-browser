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

$("#json-api-btn").on('click', function(event){
   //getCurrentDeviceFromServer();
    //getBalanceFromServer();
    //getPricePointFromServer()
    //getBalanceWithPricePointFromServer()
    //getPendingRecoveryFromServer() ----> error
    //getUserFromServer()
    getTokenFromServer()
    //getTransactionsFromServer() ----> no api call
    //getTokenHolderFromServer();
    //getRulesFromServer()
});


  //json Api Calls
  
  function getUserFromServer() {
    window.OstSdkWallet.getUserFromServer(currentUser.user_id)
    .then((user) => {
      console.log("MAppy :: index :: getUserFromServer :: then :: " ,  user);
    })
    .catch((err) => {
      console.log("MAppy :: index :: getUserFromServer :: catch ::" , err);
    });
  }
  
  function getTokenFromServer() {
    window.OstSdkWallet.getTokenFromServer(currentUser.user_id)
    .then((token) => {
      console.log("MAppy :: index :: getTokenFromServer :: then :: " ,  token);
    })
    .catch((err) => {
      console.log("MAppy :: index :: getTokenFromServer :: catch ::" , err);
    });
  }
  
  function getCurrentDeviceFromServer() {
    window.OstSdkWallet.getCurrentDeviceFromServer(currentUser.user_id)
    .then((device) => {
      console.log("MAppy :: index :: getCurrentDeviceFromServer :: then :: " ,  device);
    })
    .catch((err) => {
      console.log("MAppy :: index :: getCurrentDeviceFromServer :: catch ::" , err);
    });
  }
  
  function getBalanceFromServer() {
    window.OstSdkWallet.getBalanceFromServer(currentUser.user_id)
    .then((balance) => {
      console.log("MAppy :: index :: getBalanceFromServer :: then :: " ,  balance);
    })
    .catch((err) => {
      console.log("MAppy :: index :: getBalanceFromServer :: catch ::" , err);
    });
  }
  
  function getPricePointFromServer() {
    window.OstSdkWallet.getPricePointFromServer(currentUser.user_id)
    .then((pricePoint) => {
      console.log("MAppy :: index :: getPricePointFromServer :: then :: " ,  pricePoint);
    })
    .catch((err) => {
      console.log("MAppy :: index :: getPricePointFromServer :: catch ::" , err);
    });
  }
  
  function getBalanceWithPricePointFromServer() {
    window.OstSdkWallet.getBalanceWithPricePointFromServer(currentUser.user_id)
    .then((balancePricePointData) => {
      console.log("MAppy :: index :: getBalanceWithPricePointFromServer :: then :: " ,  balancePricePointData);
    })
    .catch((err) => {
      console.log("MAppy :: index :: getBalanceWithPricePointFromServer :: catch ::" , err);
    });
  }
  
  function getPendingRecoveryFromServer() {
    window.OstSdkWallet.getPendingRecoveryFromServer(currentUser.user_id)
    .then((pendingRecovery) => {
      console.log("MAppy :: index :: getPendingRecoveryFromServer :: then :: " ,  pendingRecovery);
    })
    .catch((err) => {
      console.log("MAppy :: index :: getPendingRecoveryFromServer :: catch ::" , err);
    });
  }
  
  function getTransactionsFromServer() {
    window.OstSdkWallet.getTransactionsFromServer(currentUser.user_id)
    .then((transactions) => {
      console.log("MAppy :: index :: getTransactionsFromServer :: then :: " ,  transactions);
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
  