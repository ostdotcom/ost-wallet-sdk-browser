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

        window.location = "/users";
        
        
        
      },
      error: function (error) {
        alert("hey+error");
        
      }
    });
    alert("PreLoad");

}
window.onpaint = preloadFunc();
var currentUser = null;

$(function() {
  const ostApiEndpoint = "https://api.stagingostproxy.com/testnet/v2/";
  const sdkUrl = "https://sdk-devmappy.ostsdkproxy.com/";
  const keyManagerUrl = "https://km-devmappy.ostsdkproxy.com/";

  console.log("Calling OstWalletSdk.init", OstWalletSdk);
  OstWalletSdk.init({
    "api_endpoint": ostApiEndpoint,
    "sdk_endpoint": sdkUrl
  }).then(() => {
    console.log("init resolved");
  }).catch(( error ) => {
    console.log("init caught!");
    console.error(error);
  });


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
        }
      });
  });
})



function setupDevice(args) {

  console.log(LOG_TAG, "setupDevice");

  let resultType = args.result_type
  ;
  currentUser = args[resultType];


  let sdkDelegate =  new OstSetupDeviceDelegate();
  sdkDelegate.registerDevice = function( apiParams ) {
    console.log(LOG_TAG, "registerDevice");

    return registerDevice(apiParams);
  };
  sdkDelegate.flowInterupt = () => {
    console.log("setupDevice workflow interupted!");
    document.getElementById("signupBtn").disabled = false;
  }
  sdkDelegate.flowComplete = () => {
    console.log("setupDevice workflow completed!");
    loadUsersList();
  }
  let workflowId = OstWalletSdk.setupDevice(
    currentUser.user_id,
    currentUser.token_id,
    sdkDelegate);
}

function loadUsersList() {
  $.ajax({
    type: 'GET',
    url: baseUrl+'/users',
    data: {
    },
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
    success: function (jsonData) {


      console.log(jsonData.data.users[0].token_id);

      var pageNo=1;

      uploadUserData(jsonData,pageNo);
    },
    error: function (error) {
      console.log('Error loading username=' + document.getElementById("usernameTb").value + error);
    }
  });
}

function getQRCode() {
  let sdkDelegate =  new OstWorkflowDelegate();
  sdkDelegate.showSessionQRCode = function (qrData) {
    makeCode(qrData);

  };

  sdkDelegate.requestAcknowledged = function( ostWorkflowContext, ostContextEntity ) {
    makeCode(ostContextEntity.qr_data);
    console.log(LOG_TAG, "getQRCode");
    console.log(LOG_TAG, "ostWorkflowContext :: ", ostWorkflowContext);
    console.log(LOG_TAG, "ostContextEntity :: ", ostContextEntity);
  };

  let workflowId = OstWalletSdk.createSession(
    currentUser.user_id,
    (parseInt(Date.now()/1000) + 60*60*24*30*5),
    '1',
    sdkDelegate);
}

function sendTokens(tokenHolderAddress) {

	let sdkDelegate =  new OstWorkflowDelegate();
	sdkDelegate.requestAcknowledged = function (ostWorkflowContext , ostContextEntity ) {
		alert("Transaction Acknowledged");
	};

	sdkDelegate.flowInterrupt = function (ostWorkflowContext , ostError ) {
	  console.log(LOG_TAG, ostError);
		alert("Transaction Interruped");
	};


	sdkDelegate.flowComplete = function( ostWorkflowContext, ostContextEntity ) {
		console.log(LOG_TAG, "getQRCode");
		console.log(LOG_TAG, "ostWorkflowContext :: ", ostWorkflowContext);
		console.log(LOG_TAG, "ostContextEntity :: ", ostContextEntity);
	};


	let workflowId = OstWalletSdk.executePayTransaction(currentUser.user_id,
		{
			token_holder_addresses: [tokenHolderAddress],
			amounts: ['100'],
			expected_spend_amount: '100'
		},
		sdkDelegate);
}



function uploadUserData(jsonData, pageNo) {
  if(!jsonData.data.meta.next_page_payload){
    return ;
  }

  console.log("user data is going to be add in this function");


  document.getElementById("signUpForm").style.display = "none";
  document.getElementById("icon").style.display = "none";
  document.createElement("label");
  let label = document.getElementById("logOutLabel");
  label.innerHTML = '<button id="logOutBtn" class="btn btn-info" name="btn">Log Out</button>';
  let logOutBtn = document.getElementById("logOutBtn");
  logOutBtn.classList.add("btn");
  logOutBtn.classList.add("btn-default");
  logOutBtn.classList.add("btn-sm");
  document.getElementById("logOutBtn").addEventListener("click", function(e) {
    logout();
  });

  document.getElementById("usersData").classList.add("table-responsive");
  var table = document.getElementById("usersTable");

  table.classList.add("table");
  table.classList.add("table-striped");

  table.style.width = "100%";


  if (pageNo == 1){
    var header = table.createTHead();
    header.classList.add("thead-dark");
    var row = header.insertRow(0);
    var cell1 = row.insertCell(0).innerHTML = "Id";
    //cell1.setAttribute("scope","col");
    cell1 = row.insertCell(1).innerHTML = "Username";
    //cell1.setAttribute("scope","col");
    cell1 = row.insertCell(2).innerHTML = "Address";
    //cell1.setAttribute("scope","col");
    cell1 = row.insertCell(3).innerHTML = "Send";
    //cell1.setAttribute("scope","col");
    cell1 = row.insertCell(4).innerHTML = "QR Code";
  }
  let count =i;
  let k=0;
  for( ; i<count+10 ; i++,k++){
    var row1 = document.createElement("tr");
    //var textNode = document.createTextNode(i);

    //var row1 = table.insertRow(i);
    var cell1 = row1.insertCell(0).innerHTML = i;
    console.log(jsonData.data.users[k].username);
    var cell2 = row1.insertCell(1).innerHTML = jsonData.data.users[k].username;
    var cell3 = row1.insertCell(2).innerHTML = jsonData.data.users[k].token_holder_address;

    var row1cell3 = row1.insertCell(3);
    var cell4 = row1cell3.innerHTML = '<button id="btn" class="btn btn-info sendButtonClass" name="btn">Send</button>';
		row1cell3.addEventListener('click', getOnSendClickFn( jsonData.data.users[k] ) );

    var cell5 = row1.insertCell(4).innerHTML = '<button id="Qrcodebtn" class="btn btn-info QrCodeBtnClass"  " data-toggle="modal" data-target="#myModal">Get QR</button> ';
    table.appendChild(row1);
  }
  count = i;

  var span = document.createElement('span');
  var buttonDiv = document.getElementById("buttonDiv");

  buttonDiv.innerHTML = '<button id="nextBtn" value="Next"  class ="nextButton arrow" >Next</button>';
  //buttonDiv.onclick = requestNextData(pageNo);
  document.getElementById("nextBtn").addEventListener("click", function(e) {
    requestNextData(pageNo);
  });

  $(".QrCodeBtnClass").on('click', function(event){

    getQRCode()
    //getUser();
    //getDevice();
    getToken();
    //getActiveSessions()
    //getCurrentDeviceFromServer();
    //getBalanceFromServer();
    //getPricePointFromServer()
    //getBalanceWithPricePointFromServer()
    //getPendingRecoveryFromServer() ----> error
    //getUserFromServer()
    //getTokenFromServer()
    //getTransactionsFromServer() ----> no api call
    //getTokenHolderFromServer();
    //getRulesFromServer()
  });

}

function getOnSendClickFn ( rowUserData ) {
  return function () {
		sendTokens(rowUserData.token_holder_address);
  }
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


function makeCode(object){
  let text = object;
  if (typeof object === 'object') {
    text = JSON.stringify(object)
  }

  $("#QrMainDiv div").html('');
  new QRCode(document.getElementById("qrcode"), {
    text: text,
    width: 470,
    height: 470,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
  });
}


function getUser() {

  OstWalletSdk.getUser(currentUser.user_id)
  .then((user) => {
      console.log("MAppy :: index :: getUser :: then :: " , user);
   })
  .catch((err) => {
    console.log("MAppy :: index :: getUser :: catch ::" , err);
  });

}

function getToken() {

  OstWalletSdk.getToken(currentUser.user_id)
  .then((token) => {
      console.log("MAppy :: index :: getToken :: then :: " ,  token);
   })
  .catch((err) => {
    console.log("MAppy :: index :: getToken :: catch ::" , err);
  });

}

function getDevice() {

  OstWalletSdk.getDevice(currentUser.user_id)
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
  OstWalletSdk.getActiveSessions(currentUser.user_id, spendingLimit)
  .then((session) => {
      console.log("MAppy :: index :: getActiveSessions :: then :: " ,  session);
   })
  .catch((err) => {
    console.log("MAppy :: index :: getActiveSessions :: catch ::" , err);
  });
}

//json Api Calls

function getUserFromServer() {
  window.OstWalletSdk.getUserFromServer(currentUser.user_id)
  .then((user) => {
    console.log("MAppy :: index :: getUserFromServer :: then :: " ,  user);
  })
  .catch((err) => {
    console.log("MAppy :: index :: getUserFromServer :: catch ::" , err);
  });
}

function getTokenFromServer() {
  window.OstWalletSdk.getTokenFromServer(currentUser.user_id)
  .then((token) => {
    console.log("MAppy :: index :: getTokenFromServer :: then :: " ,  token);
  })
  .catch((err) => {
    console.log("MAppy :: index :: getTokenFromServer :: catch ::" , err);
  });
}

function getCurrentDeviceFromServer() {
  window.OstWalletSdk.getCurrentDeviceFromServer(currentUser.user_id)
  .then((device) => {
    console.log("MAppy :: index :: getCurrentDeviceFromServer :: then :: " ,  device);
  })
  .catch((err) => {
    console.log("MAppy :: index :: getCurrentDeviceFromServer :: catch ::" , err);
  });
}

function getBalanceFromServer() {
  window.OstWalletSdk.getBalanceFromServer(currentUser.user_id)
  .then((balance) => {
    console.log("MAppy :: index :: getBalanceFromServer :: then :: " ,  balance);
  })
  .catch((err) => {
    console.log("MAppy :: index :: getBalanceFromServer :: catch ::" , err);
  });
}

function getPricePointFromServer() {
  window.OstWalletSdk.getPricePointFromServer(currentUser.user_id)
  .then((pricePoint) => {
    console.log("MAppy :: index :: getPricePointFromServer :: then :: " ,  pricePoint);
  })
  .catch((err) => {
    console.log("MAppy :: index :: getPricePointFromServer :: catch ::" , err);
  });
}

function getBalanceWithPricePointFromServer() {
  window.OstWalletSdk.getBalanceWithPricePointFromServer(currentUser.user_id)
  .then((balancePricePointData) => {
    console.log("MAppy :: index :: getBalanceWithPricePointFromServer :: then :: " ,  balancePricePointData);
  })
  .catch((err) => {
    console.log("MAppy :: index :: getBalanceWithPricePointFromServer :: catch ::" , err);
  });
}

function getPendingRecoveryFromServer() {
  window.OstWalletSdk.getPendingRecoveryFromServer(currentUser.user_id)
  .then((pendingRecovery) => {
    console.log("MAppy :: index :: getPendingRecoveryFromServer :: then :: " ,  pendingRecovery);
  })
  .catch((err) => {
    console.log("MAppy :: index :: getPendingRecoveryFromServer :: catch ::" , err);
  });
}

function getTransactionsFromServer() {
  window.OstWalletSdk.getTransactionsFromServer(currentUser.user_id)
  .then((transactions) => {
    console.log("MAppy :: index :: getTransactionsFromServer :: then :: " ,  transactions);
  })
  .catch((err) => {
    console.log("MAppy :: index :: getTransactionsFromServer :: catch ::" , err);
  });
}

function getTokenHolderFromServer() {
  window.OstWalletSdk.getTokenHolderFromServer(currentUser.user_id)
  .then((token_holder) => {
    console.log("MAppy :: index :: getTokenHolderFromServer :: then :: " ,  token_holder);
  })
  .catch((err) => {
    console.log("MAppy :: index :: getTokenHolderFromServer :: catch ::" , err);
  });
}

function getRulesFromServer() {
  window.OstWalletSdk.getRulesFromServer(currentUser.user_id)
  .then((rules) => {
    console.log("MAppy :: index :: getTokenHolderFromServer :: then :: " ,  rules);
  })
  .catch((err) => {
    console.log("MAppy :: index :: getTokenHolderFromServer :: catch ::" , err);
  });
}
