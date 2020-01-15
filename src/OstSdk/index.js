import uuidv4 from 'uuid/v4';
import {SOURCE, OstBrowserMessenger} from '../common-js/OstBrowserMessenger'
import OstErrorCodes from '../common-js/OstErrorCodes'

console.log("Checking error codes", OstErrorCodes);

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
}

function sendMessage() {
  let browserMessenger = new OstBrowserMessenger();
  browserMessenger.perform()
    .then( () => {
      console.log("then=======");
      browserMessenger.sendMessage('hi', SOURCE.UPSTREAM);
    }).catch((error) => {
      console.log("error=======", error)
  });
}

sendMessage();