import uuidv4 from 'uuid/v4';
import {SOURCE, OstBrowserMessenger} from '../common-js/OstBrowserMessenger'

document.querySelector(".blockquote").innerHTML = `uuidv4() from OstSdk: ${uuidv4()}`;

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