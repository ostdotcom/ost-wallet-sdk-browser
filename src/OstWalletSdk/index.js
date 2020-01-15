import uuidv4 from 'uuid/v4';
import {OstBrowserMessenger} from "../common-js/OstBrowserMessenger";
import OstHelpers from "../common-js/OstHelpers";

document.querySelector(".blockquote").innerHTML = `uuidv4() from OstWalletSdk.js: ${uuidv4()}`;

console.log("================= walletSdk/index");

window.addEventListener("message", receiveMessage, false);

function receiveMessage(event) {
  console.log("========= Inside OstWalletSdk.init :: receiveMessage", event)
}

let ostBrowserMessenger = new OstBrowserMessenger();

ostBrowserMessenger.perform()
  .then(() => {
    createSdkMappyIframe();
  })
  .catch( () => {
    console.log("catch createSdkMappyIframe");
  });

function createSdkMappyIframe() {
  console.log("createSdkMappyIframe");
  var ifrm = document.createElement('iframe');
  ifrm.setAttribute('id', 'sdkMappyIFrame');

  document.getElementById('sdkMappy').appendChild(ifrm);
  const url = 'http://localhost:9001';

  let dataToSign = `${url}/?publicKeyHex=${ostBrowserMessenger.publicKeyHex}&timestamp=${Date.now()}`;

  ostBrowserMessenger.getSignature(dataToSign)
    .then((signedMessage) => {
      const signature = OstHelpers.byteArrayToHex(signedMessage);
      let url = dataToSign+`&signature=${signature}`;

      ifrm.setAttribute('src', url);
      ifrm.setAttribute('width', '100%');
      ifrm.setAttribute('height', '200');
    })
    .catch((err) => {

    });


}
