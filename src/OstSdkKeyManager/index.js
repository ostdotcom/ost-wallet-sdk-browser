import uuidv4 from 'uuid/v4';
import IKM from './ecKeyInteracts/internalKeyManager'

const ikm = new IKM(uuidv4());
const wallet = ikm.generateHDWallet();
const gensig = ikm.signMessage(wallet, "message");
const persig = ikm.personalSign(wallet, "message");
document.querySelector(".blockquote").innerHTML = `uuidv4() from OstSdkKeyManager: ${uuidv4()}`;

window.addEventListener("message", receiveMessage, false);

function receiveMessage(event)
{
  console.log("========= Inside OstSdkKeyManager.init :: receiveMessage", event)
}
