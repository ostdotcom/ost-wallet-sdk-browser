import uuidv4 from 'uuid/v4';
import {SOURCE, OstBrowserMessenger} from '../common-js/OstBrowserMessenger'
<<<<<<< HEAD
import OstErrorCodes from '../common-js/OstErrorCodes'
=======
import OstMessage from '../common-js/OstMessage'

const qs = require('querystring');
>>>>>>> 3359f2ac3d7ddaf54c775a9ff8e55e06fc3c05d4

console.log("Checking error codes", OstErrorCodes);

<<<<<<< HEAD
// window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

//document.querySelector(".blockquote").innerHTML = `uuidv4() from OstSdk: ${uuidv4()}`;
function createDatabase(tokenId){
  if(!window.indexedDB){
    alert("indexed Db not supported");
  }
  let request = window.indexedDB.open("EntitiesDB"+tokenId,1), db, tx, store;
  
    

}

function createTable(name){
  let db = window.request.result;
  store = db.createObjectStore(name,{keypath: "userId"})
  
}
window.addEventListener("message", receiveMessage, false);


function receiveMessage(event)
{
  console.log("========= Inside OstSdk.init :: receiveMessage", event)
=======
console.log("================= ostSdk/index");

var url = window.location.search.substring(0);
console.log("url : ", url);

let urlparams = getUrlVars();
console.log("urlparams : ", urlparams);

let signature = urlparams.signature;
delete urlparams['signature']
let parentPublicKeyHex = urlparams.publicKeyHex;

let params = qs.stringify(urlparams);
console.log("qs params: ", params);

function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    vars[key] = value;
  });
  return vars;
>>>>>>> 3359f2ac3d7ddaf54c775a9ff8e55e06fc3c05d4
}

function sendMessage() {
  let browserMessenger = new OstBrowserMessenger();
  browserMessenger.perform()
    .then( () => {
      browserMessenger.setParentPublicKeyHex(parentPublicKeyHex)
        .then(() => {

          let url = `${window.location.origin}/?publicKeyHex=${urlparams.publicKeyHex}&timestamp=${urlparams.timestamp}`;

          browserMessenger.verify(url, signature)
            .then((isVerified) => {
              console.log("isVerified: ", isVerified);
            })
        })

      // browserMessenger.sendMessage(messageObj, SOURCE.UPSTREAM);
    }).catch((error) => {
      console.log("error occurred while sending data =======", error)
  });
}

sendMessage();