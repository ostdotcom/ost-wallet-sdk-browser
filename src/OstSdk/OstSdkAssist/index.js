import OstSdkSetupDevice from "../workflows/OstSdkSetupDevice";
import OstSdkCreateSession from "../workflows/OstSdkCreateSession";
import OstUser from "../entities/OstUser";
import OstToken from "../entities/OstToken";
import OstMessage from '../../common-js/OstMessage';
import {SOURCE} from "../../common-js/OstBrowserMessenger";
import KeyManagerProxy from "../OstKeyManagerProxy/index";
import OstDevice from "../entities/OstDevice";
import OstSession from "../entities/OstSession";
import OstApiClient from "../../Api/OstApiClient";
import OstConstants from "../OstConstants";
import OstError from "../../common-js/OstError";

const LOG_TAG = "OstSdkAssist :: ";
class OstSdkAssist {
  constructor( messenger, receiverName ) {
    this.browserMessenger = messenger;
    this.receiverName = receiverName;
    this.browserMessenger.subscribe(this, this.receiverName);

    this.keyManagerProxy = new KeyManagerProxy(this.browserMessenger, userId);

    this.uuid = null;
  }

  onSetupComplete( args ) {
    console.log(LOG_TAG, "onSetupComplete :: ", args);
  }

  setupDevice ( args ) {
    console.log(LOG_TAG, "setupDevice :: ", args);

    let setupDevice = new OstSdkSetupDevice( args, this.browserMessenger );
    setupDevice.perform();
  }

  createSession ( args ) {
    console.log(LOG_TAG, "createSession :: ", args);

    let createSession = new OstSdkCreateSession( args, this.browserMessenger );
    createSession.perform();
  }

  getUser ( args ) {
    console.log(LOG_TAG, "getUser :: ", args);
    const userId = args.user_id
    const subscriberId =  args.subscriber_id
    let functionParams = {};
    let functionName = 'onError';
    OstUser.getById(userId)
      .then((userData => {
        console.log("user data ", userData);
        if (userData) {
          functionParams = {user: userData};
          functionName = 'onSuccess';
        }
        this.sendToOstWalletSdk(functionName, subscriberId, functionParams);
      }));
      
  }

  getToken ( args ) {
    console.log(LOG_TAG, "getToken :: ", args);
    const userId = args.user_id
    const subscriberId =  args.subscriber_id
    let functionParams = {};
    let functionName = 'onError';
    OstUser.getById(userId)
      .then((user => {
        console.log("token id ", user.getTokenId());

        OstToken.getById(userData.getTokenId())
          .then( (tokenData => {
            if (tokenData) {
              console.log("token data ", tokenData);
              functionParams = {token: tokenData};
              functionName = 'onSuccess';
            }
            this.sendToOstWalletSdk(functionName, subscriberId, functionParams);
          }));
      }));
  }

  getDevice ( args ) {
    console.log(LOG_TAG, "getDevice :: ", args);
    const userId = args.user_id;
    const subscriberId =  args.subscriber_id;
    let functionParams = {};
    let functionName = 'onError';
    
    OstUser.getById(userId)
      .then((user => {

        user.createOrGetDevice(this.keyManagerProxy)
          .then( (deviceData)=> {
            console.log("device ====",deviceData);
            if (deviceData) {
              functionParams = {device: deviceData};
              functionName = 'onSuccess';
            }
            this.sendToOstWalletSdk(functionName, subscriberId, functionParams);
          });
      }));
  }

  getActiveSessions( args ) {
    console.log(LOG_TAG, "getActiveSessions :: ", args);
    const userId = args.user_id;
    const subscriberId =  args.subscriber_id;
    let functionParams = {};
    let functionName = 'onError';

    OstSession.getById(userId)
      .then( (sessionsData) => {
        console.log("sessions ==== ", sessionsData);
        if(sessionsData){
          functionParams = {sctiveSessions: sessionsData};
          functionName = 'onSuccess';
        }
        this.sendToOstWalletSdk(functionName, subscriberId, functionParams);
      });
  }

  //JSON APIs
  /**
     * API to get user's current device.
     * @param {String} userId - Ost User id
     * @public
  */

  getCurrentDeviceFromServer( args ) {
    const userId = args.user_id;
    
    let apiClient = new OstApiClient(userId, OstConstants.getBaseURL, this.keyManagerProxy)
    apiClient.getDevice()
      .then((device) => {
          if (device) {
              this.sendToOstWalletSdk('onSuccess', subId, device);
          }
          else {
            let error = OstError.sdkError(null, 'os_osa_i_gcdfs_1')
          }
      })
      .catch((err) => {
        let error = OstError.sdkError(err, 'os_osa_i_gcdfs_2')
      })
  }
  /**
  * Api to get user balance
  * @param {String} userId - Ost User id
  * @public
  */
  getBalanceFromServer( args ) {
    const userId = args.user_id;
  }

  /**
  * Api to get user Price Points
  * @param {String} userId - Ost User id
  * @public
  */
  getPricePointFromServer( args ) {
    const userId = args.user_id;
  }

  /**
  * Api to get user balance and PricePoint
  * @param {String} userId - Ost User id
  * @public
  */
  getBalanceWithPricePointFromServer( args ) {
    const userId = args.user_id;
  }

  /**
  * Api to get user balance
  * @param {String} userId - Ost User id
  * @public
  */
  getPendingRecoveryFromServer( args ) {
    const userId = args.user_id;
  }

  /**
  * Api to get user's transactions
  * @param {String} userId - Ost User id
  * @param {Object} nextPagePayload (@nullable). Pass null to get first page.
  * @public
  */
  getTransactionsFromServer( args)  {
    const userId = args.user_id;
    const nextPagePayload = args.next_page_payload;
  }

  /**
  * Api to get user's device list
  * @param {String} userId - Ost User id
  * @param {Object} nextPagePayload (@nullable). Pass null to get first page.
  * @public
  */
  getDeviceListFromServer( args ) {
    const userId = args.user_id;
    const nextPagePayload = args.next_page_payload;

  }

  sendToOstWalletSdk(functionName, subscriberId, functionParams) {
    let oThis = this;
    let message  = new OstMessage();
    message.setSubscriberId(subscriberId);
    message.setFunctionName(functionName);
    message.setArgs(functionParams);
    console.log(LOG_TAG, functionName);
    oThis.browserMessenger.sendMessage(message, SOURCE.UPSTREAM);
  }
}

export default OstSdkAssist;