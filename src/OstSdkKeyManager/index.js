import uuidv4 from 'uuid/v4';

document.querySelector(".blockquote").innerHTML = `uuidv4() from OstSdkKeyManager: ${uuidv4()}`;

window.addEventListener("message", receiveMessage, false);

function receiveMessage(event)
{
  console.log("========= Inside OstSdkKeyManager.init :: receiveMessage", event)
}