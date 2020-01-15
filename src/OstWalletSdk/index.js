import uuidv4 from 'uuid/v4';
import '../styles/login.css'

//document.querySelector(".blockquote").innerHTML = `uuidv4() from OstWalletSdk.js: ${uuidv4()}`;

window.addEventListener("message", receiveMessage, false);

function receiveMessage(event)
{
  console.log("========= Inside OstWalletSdk.init :: receiveMessage", event)
}