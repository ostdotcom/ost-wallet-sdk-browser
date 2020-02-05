import OstSdkSetupDevice from "../workflows/OstSdkSetupDevice";
import OstSdkCreateSession from "../workflows/OstSdkCreateSession";
import OstUser from "../entities/OstUser";
import OstToken from "../entities/OstToken";
import OstMessage from '../../common-js/OstMessage';
import {SOURCE} from "../../common-js/OstBrowserMessenger";
import KeyManagerProxy from "../OstKeyManagerProxy/index";
import OstSession from "../entities/OstSession";
import OstApiClient from "../../Api/OstApiClient";
import OstConstants from "../OstConstants";
import OstError from "../../common-js/OstError";
import OstErrorCodes  from '../../common-js/OstErrorCodes'
import OstSdkExecuteTransaction from "../workflows/OstSdkExecuteTransaction";

const LOG_TAG = "OstSdkAssist :: ";
class OstSdkAssist {
  constructor( messenger, receiverName ) {
    this.browserMessenger = messenger;
    this.receiverName = receiverName;
    this.browserMessenger.subscribe(this, this.receiverName);

    this.uuid = null;
  }

  getKeyManagerProxy(userId) {
    let keyManagerProxy = new KeyManagerProxy(this.browserMessenger, userId);
    return keyManagerProxy
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

	executeTransaction (args) {
		console.log(LOG_TAG, "executeTransaction :: ", args);
		let executeTransaction = new OstSdkExecuteTransaction( args, this.browserMessenger );
		executeTransaction.perform();
	}

  getUser ( args ) {
    console.log(LOG_TAG, "getUser :: ", args);
    const userId = args.user_id;
    const subscriberId =  args.subscriber_id;
    let functionParams = {};
    let functionName = 'onError';
    OstUser.getById(userId)
      .then((userData) => {
        console.log("user data ", userData);
        if (userData) {
          functionParams = {user: userData};
          functionName = 'onSuccess';
        }
        else {
          let err = new OstError('os_osa_i_gu_1', OstErrorCodes.INVALID_USER_ID);
          functionParams = err.getJSONObject()
        }
        this.sendToOstWalletSdk(functionName, subscriberId, functionParams);
      })
      .catch((err) => {
        throw OstError.sdkError(err, 'os_osa_i_gu_2', OstErrorCodes.INVALID_USER_ID)
      });

  }

  getToken ( args ) {
    console.log(LOG_TAG, "getToken :: ", args);
    const userId = args.user_id
    const subscriberId =  args.subscriber_id
    let functionParams = {};
    let functionName = 'onError';
    OstUser.getById(userId)
      .then((user) => {
        console.log("token id ", user.getTokenId());

        OstToken.getById(user.getTokenId())
          .then( (tokenData => {
            if (tokenData) {
              console.log("token data ", tokenData);
              functionParams = {token: tokenData};
              functionName = 'onSuccess';
            }
            else {
              let err = new OstError('os_osa_i_gt_1', OstErrorCodes.INVALID_TOKEN_ID);
              functionParams = err.getJSONObject()
            }
            this.sendToOstWalletSdk(functionName, subscriberId, functionParams);
          })).catch((err) => {
            throw OstError.sdkError(err, 'os_osa_i_gt_2', OstErrorCodes.INVALID_TOKEN_ID);
          });
      }).catch((err) => {
        throw OstError.sdkError(err, 'os_osa_i_gt_3', OstErrorCodes.INVALID_USER_ID);
      });
  }

  //get current device Getter Method
  getDevice ( args ) {
    console.log(LOG_TAG, "getDevice :: ", args);
    const userId = args.user_id;
    const subscriberId =  args.subscriber_id;
    let functionParams = {};
    let functionName = 'onError';

    OstUser.getById(userId)
      .then((user) => {

        user.createOrGetDevice(this.getKeyManagerProxy(userId))
          .then( (deviceData)=> {
            console.log("device ====",deviceData);

            if (deviceData) {
              functionParams = {device: deviceData};
              functionName = 'onSuccess';
            }
            else {
              let err = new OstError('os_osa_i_gd_1', OstErrorCodes.DEVICE_NOT_SETUP);
              functionParams = err.getJSONObject();
            }

            this.sendToOstWalletSdk(functionName, subscriberId, functionParams);
          }).catch((err) => {
        throw OstError.sdkError(err, 'os_osa_i_gd_2', OstErrorCodes.DEVICE_NOT_SETUP);
        });
      }).catch((err) => {
        throw OstError.sdkError(err, 'os_osa_i_gd_3', OstErrorCodes.INVALID_USER_ID);
      });
    }

  getActiveSessions( args ) {
    console.log(LOG_TAG, "getActiveSessions :: ", args);
    const userId = args.user_id;
    const spendingLimit = args.spending_limit;
    const subscriberId =  args.subscriber_id;
    let functionParams = {};
    let functionName = 'onError';

    OstSession.getAllSessions()
      .then( (sessionsData) => {
        console.log("sessions ==== ", sessionsData);
        if(sessionsData) {
          let filterSessions;
          if(spendingLimit !== ''){
            filterSessions = sessionsData.filter( function(x){
              return x.user_id === userId
                    && x.status === 'AUTHORIZED'
                    && x.spending_limit >= spendingLimit ;
            });
          }
          else {
            filterSessions = sessionsData.filter( function(x){
              return x.user_id === userId
                    && x.status === 'AUTHORIZED';
            });
          }

          console.log("filtered =====", filterSessions);
          if(filterSessions){
            functionParams = {activeSessions: filterSessions};
            functionName = 'onSuccess';
          }
          else {
            console.log("No Active Sessions ");
            //let err = new OstError('os_osa_i_gas_1', OstErrorCodes.DEVICE_NOT_SETUP);
            //functionParams = err.getJSONObject();
          }
        }else {
          console.log("No session data found ");
          throw OstError.sdkError(err, 'os_osa_i_gas_2', OstErrorCodes.DEVICE_NOT_SETUP);
        }

        this.sendToOstWalletSdk(functionName, subscriberId, functionParams);
      }).catch( (err) => {
        console.log(err);
      });
  }

  //JSON APIs

  getUserFromServer( args ) {
    const userId = args.user_id;
    const subscriberId =  args.subscriber_id;
    let functionParams = {};
    let functionName = 'onError';

    let apiClient = new OstApiClient(userId, OstConstants.getBaseURL(), this.getKeyManagerProxy(userId))
    apiClient.getUser()
      .then((user) => {
          if (user) {
            functionParams = {user: user.data.data.user};
            functionName = 'onSuccess';
            console.log("user api ====", user.data.data);
            this.sendToOstWalletSdk(functionName, subscriberId, functionParams);
          }
          else {
            let error = OstError.sdkError(null, 'os_osa_i_gufs_1');
            console.log(error);
          }
      })
      .catch((err) => {
        let error = OstError.sdkError(err, 'os_osa_i_gufs_2');
        console.log(error);
      });
  }

  getTokenFromServer( args ) {
    const userId = args.user_id;
    const subscriberId =  args.subscriber_id;
    let functionParams = {};
    let functionName = 'onError';

    let apiClient = new OstApiClient(userId, OstConstants.getBaseURL(), this.getKeyManagerProxy(userId))
    apiClient.getToken()
      .then((token) => {
          if (token) {
            functionParams = {token: token.data.data.token};
            functionName = 'onSuccess';
            console.log("token api ====", token.data.data);
            this.sendToOstWalletSdk(functionName, subscriberId, functionParams);
          }
          else {
            let error = OstError.sdkError(null, 'os_osa_i_gtfs_1');
            console.log(error);
          }
      })
      .catch((err) => {
        let error = OstError.sdkError(err, 'os_osa_i_gtfs_2');
        console.log(error);
      });
  }

  getTransactionsFromServer( args ) {
    const userId = args.user_id;
    const subscriberId =  args.subscriber_id;
    let functionParams = {};
    let functionName = 'onError';

    let apiClient = new OstApiClient(userId, OstConstants.getBaseURL(), this.getKeyManagerProxy(userId))
    apiClient.getTransactions()
      .then((transactions) => {
          if (transactions) {
            functionParams = {transactions: transactions.data.data};
            functionName = 'onSuccess';
            console.log("transactions api ====", transactions.data.data);
            this.sendToOstWalletSdk(functionName, subscriberId, functionParams);
          }
          else {
            let error = OstError.sdkError(null, 'os_osa_i_gtxfs_1');
            console.log(error);
          }
      })
      .catch((err) => {
        let error = OstError.sdkError(err, 'os_osa_i_gtxfs_2');
        console.log(error);
      });
  }

  getTokenHolderFromServer( args ) {
    const userId = args.user_id;
    const subscriberId =  args.subscriber_id;
    let functionParams = {};
    let functionName = 'onError';

    let apiClient = new OstApiClient(userId, OstConstants.getBaseURL(), this.getKeyManagerProxy(userId))
    apiClient.getTokenHolder()
      .then((tokenHolder) => {
          if (tokenHolder) {
            functionParams = {token_holder: tokenHolder.data.data};
            functionName = 'onSuccess';
            console.log("tokenHolder api ====", tokenHolder.data.data);
            this.sendToOstWalletSdk(functionName, subscriberId, functionParams);
          }
          else {
            let error = OstError.sdkError(null, 'os_osa_i_gthfs_1');
            console.log(error);
          }
      })
      .catch((err) => {
        let error = OstError.sdkError(err, 'os_osa_i_gthfs_2');
        console.log(error);
      });
  }

  getRulesFromServer( args ) {
    const userId = args.user_id;
    const subscriberId =  args.subscriber_id;
    let functionParams = {};
    let functionName = 'onError';

    let apiClient = new OstApiClient(userId, OstConstants.getBaseURL(), this.getKeyManagerProxy(userId))
    apiClient.getRules()
      .then((rules) => {
          if (rules) {
            functionParams = {token_holder: rules.data.data};
            functionName = 'onSuccess';
            console.log("rules api ====", rules.data.data);
            this.sendToOstWalletSdk(functionName, subscriberId, functionParams);
          }
          else {
            let error = OstError.sdkError(null, 'os_osa_i_grfs_1');
            console.log(error);
          }
      })
      .catch((err) => {
        let error = OstError.sdkError(err, 'os_osa_i_grfs_2');
        console.log(error);
      });
  }


  /**
     * API to get user's current device.
     * @param {String} userId - Ost User id
     * @public
  */

  getCurrentDeviceFromServer( args ) {
    const userId = args.user_id;
    const subscriberId =  args.subscriber_id;
    let functionParams = {};
    let functionName = 'onError';

    let address = null
    OstUser.getById(userId)
      .then((user) => {
        return user.createOrGetDevice(this.getKeyManagerProxy(userId));
      })
      .then((device) => {
        console.log("device =====", device['data'].address);
        let address = device['data'].address;
        if (!address) {
          throw OstError.sdkError(err, 'os_osa_i_gcdfs_1', OstErrorCodes.INVALID_USER_ID);
        }
        let apiClient = new OstApiClient(userId, OstConstants.getBaseURL(), this.getKeyManagerProxy(userId));
        return apiClient.getDevice(address);
      })
      .then((deviceData) => {
        if (deviceData) {
          let deviceEntity = deviceData.data.data;
          functionParams = {device: deviceEntity};
          functionName = 'onSuccess';
          console.log("device api ====", deviceData.data.data);
          this.sendToOstWalletSdk(functionName, subscriberId, functionParams);
        }
        else {
          let error = OstError.sdkError(null, 'os_osa_i_gcdfs_2');
          throw error;
        }
      })
      .catch((err) => {
          console.log(err);
      })
  }
  /**
  * Api to get user balance
  * @param {String} userId - Ost User id
  * @public
  */
  getBalanceFromServer( args ) {
    const userId = args.user_id;
    const subscriberId =  args.subscriber_id;
    let functionParams = {};
    let functionName = 'onError';

    let apiClient = new OstApiClient(userId, OstConstants.getBaseURL(), this.getKeyManagerProxy(userId))
    apiClient.getBalance()
      .then((balance) => {
          if (balance) {
            functionParams = {balance: balance.data.data};
            functionName = 'onSuccess';
            console.log("balance api ====", balance.data.data);
            this.sendToOstWalletSdk(functionName, subscriberId, functionParams);
          }
          else {
            let error = OstError.sdkError(null, 'os_osa_i_gbfs_1');
            console.log(error);
          }
      })
      .catch((err) => {
        let error = OstError.sdkError(err, 'os_osa_i_gbfs_2');
        console.log(error);
      });
  }

  /**
  * Api to get user Price Points
  * @param {String} userId - Ost User id
  * @public
  */
  getPricePointFromServer( args ) {
    const userId = args.user_id;
    const subscriberId =  args.subscriber_id;
    let functionParams = {};
    let functionName = 'onError';

    OstUser.getById(userId)
      .then((user)=> {
        var tokenId = user.getTokenId();
        console.log(" token id", tokenId);
        OstToken.getById(tokenId)
          .then( (token) => {
            return token.getAuxiliaryChainId();
          })
            .then((chainId) => {
              console.log("auxiliary chain id", chainId);
              let apiClient = new OstApiClient(userId, OstConstants.getBaseURL(), this.getKeyManagerProxy(userId))
              apiClient.getPricePoints(chainId)
                .then((pricePoint) => {
                    if (pricePoint) {
                      functionParams = {price_points: pricePoint.data.data};
                      functionName = 'onSuccess';
                      console.log("pricepoints api ====", pricePoint.data.data);
                      this.sendToOstWalletSdk(functionName, subscriberId, functionParams);
                    }
                    else {
                      let error = OstError.sdkError(null, 'os_osa_i_gppfs_1');
                      console.log(error);
                    }
                })
                .catch((err) => {
                  let error = OstError.sdkError(err, 'os_osa_i_gppfs_2');
                  console.log(error);
                });
            }).catch((err) => {
              throw OstError.sdkError(err, 'os_osa_i_gppfs_3', OstErrorCodes.INVALID_TOKEN_ID);
            });
        }).catch((err) => {
          throw OstError.sdkError(err, 'os_osa_i_gppfs_4', OstErrorCodes.INVALID_USER_ID);
        });
  }

  /**
  * Api to get user balance and PricePoint
  * @param {String} userId - Ost User id
  * @public
  */
  getBalanceWithPricePointFromServer( args ) {
    const userId = args.user_id;
    const subscriberId =  args.subscriber_id;
    let functionParams = {};
    let functionParams1 = {};
    let functionName = 'onError';

    OstUser.getById(userId)
      .then((user)=> {
        var tokenId = user.getTokenId();
        console.log(" token id", tokenId);
        OstToken.getById(tokenId)
          .then( (token) => {
            return token.getAuxiliaryChainId();
          })
            .then((chainId) => {
              console.log("auxiliary chain id", chainId);

              let apiClient1 = new OstApiClient(userId, OstConstants.getBaseURL(), this.getKeyManagerProxy(userId))
              apiClient1.getBalance()
                .then((balance) => {
                    if (balance) {
                      functionParams = {balance: balance.data.data};
                      return functionParams;
                    }
                    else {
                      let error = OstError.sdkError(null, 'os_osa_i_gbwppfs_1');
                      throw error;
                    }
                })
                .then( (functionParams) => {

                  console.log("balance :: functionParams1", functionParams);
                  let apiClient2 = new OstApiClient(userId, OstConstants.getBaseURL(), this.getKeyManagerProxy(userId));
                  apiClient2.getPricePoints(chainId)
                    .then((pricePoint) => {
                        if (pricePoint) {
                          functionParams1 = pricePoint.data.data.price_point;
                          functionParams.price_point = functionParams1;
                          functionName = 'onSuccess';
                          console.log("balance pricepoints api ====>>", functionParams);
                          this.sendToOstWalletSdk(functionName, subscriberId, functionParams);
                        }
                        else {
                          let error = OstError.sdkError(null, 'os_osa_i_gbwppfs_2');
                          throw error;
                        }
                    })
                    .catch((err) => {
                      let error = OstError.sdkError(err, 'os_osa_i_gbwppfs_3');
                      console.log(error);
                    });
                })
                .catch((err) => {
                  let error = OstError.sdkError(err, 'os_osa_i_gbwppfs_4');
                  console.log(error);
                });
            }).catch((err) => {
              throw OstError.sdkError(err, 'os_osa_i_gbwppfs_5', OstErrorCodes.INVALID_TOKEN_ID);
            });
        }).catch((err) => {
          throw OstError.sdkError(err, 'os_osa_i_gbwppfs_6', OstErrorCodes.INVALID_USER_ID);
        });
  }

  /**
  * Api to get user balance
  * @param {String} userId - Ost User id
  * @public
  */
  getPendingRecoveryFromServer( args ) {
    const userId = args.user_id;
    const subscriberId =  args.subscriber_id;
    let functionParams = {};
    let functionName = 'onError';

    let apiClient = new OstApiClient(userId, OstConstants.getBaseURL(), this.getKeyManagerProxy(userId))
    apiClient.getPendingRecovery()
      .then((devices) => {
          if (devices) {
            functionParams = {devices: devices.data.data};
            functionName = 'onSuccess';
            console.log("pending recovery api ====", devices.data.data);
            this.sendToOstWalletSdk(functionName, subscriberId, functionParams);
          }
          else {
            throw OstError.sdkError(null, 'os_osa_i_gprfs_1');
          }
      })
      .catch((err) => {
        let error = OstError.sdkError(err, 'os_osa_i_gprfs_2');
        console.log(error);
      });
  }

  /**
  * Api to get user's device list
  * @param {String} userId - Ost User id
  * @public
  */
  getDeviceListFromServer( args ) {
    const userId = args.user_id;
    //const nextPagePayload = args.next_page_payload;
    const subscriberId =  args.subscriber_id;
    let functionParams = {};
    let functionName = 'onError';

    let apiClient = new OstApiClient(userId, OstConstants.getBaseURL(), this.getKeyManagerProxy(userId))
    apiClient.getDeviceList()
      .then((devices) => {
          if (devices) {
            functionParams = {devices: devices.data.data};
            functionName = 'onSuccess';
            console.log("getDeviceList api ====", devices.data.data);
            this.sendToOstWalletSdk(functionName, subscriberId, functionParams);
          }
          else {
            throw OstError.sdkError(null, 'os_osa_i_gdlfs_1');
          }
      })
      .catch((err) => {
        let error = OstError.sdkError(err, 'os_osa_i_gdlfs_2');
        console.log(error);
      });
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


