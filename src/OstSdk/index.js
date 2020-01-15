import uuidv4 from 'uuid/v4';
import {SOURCE, OstBrowserMessenger} from '../common-js/OstBrowserMessenger'
import OstMessage from '../common-js/OstMessage'

const qs = require('querystring');

document.querySelector(".blockquote").innerHTML = `uuidv4() from OstSdk: ${uuidv4()}`;

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