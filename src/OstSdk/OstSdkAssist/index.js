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

	executeDirectTransferTransaction (args) {
		args.transaction_data.rule_name = 'Direct Transfer';
		args.transaction_data.rule_method = 'directTransfers';
		args.transaction_data.meta = {};
		args.transaction_data.options = {};

		this.executeTransaction(args);
  }

	executePayTransaction (args) {
		args.transaction_data.rule_name = 'pricer';
		args.transaction_data.rule_method = 'pay';
		args.transaction_data.meta = {};
		args.transaction_data.options = {};

		this.executeTransaction(args);
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
    const oThis = this;
    console.log(LOG_TAG, "getToken :: ", args);


    const tokenId = args.token_id;
    const subscriberId =  args.subscriber_id;
    let functionParams = {};
    let functionName;
    OstToken.getById( tokenId )
      .then( (tokenData) => {
        if (tokenData) {
          console.log("token data ", tokenData);
          functionParams = {token: tokenData};
          functionName = 'onSuccess';
        } else {
          let err = new OstError('os_osa_i_gt_1', OstErrorCodes.INVALID_TOKEN_ID);
          functionParams = err.getJSONObject()
          functionName = 'onError';
        }

        oThis.sendToOstWalletSdk(functionName, subscriberId, functionParams);
      })
      .catch((err) => {
        let ostError = OstError.sdkError(err, 'os_osa_i_gt_2', OstErrorCodes.INVALID_TOKEN_ID);
        functionParams = ostError.getJSONObject();
        oThis.sendToOstWalletSdk('onError', subscriberId, functionParams);
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
          .then( (deviceData) => {
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
			.then((sessionsData) => {
				console.log("sessions ==== ", sessionsData);
				if (sessionsData) {
					let filterSessions;
					console.log("spending limit-----", spendingLimit);
					if (spendingLimit) {
						const spendingLimitBN = new BigNumber(spendingLimit);
						filterSessions = sessionsData.filter(function (x) {
							return x.user_id === userId
								&& x.status === 'AUTHORIZED'
								&& new BigNumber(x.spending_limit).isGreaterThanOrEqualTo(spendingLimitBN);
						});
					}
					else {
						filterSessions = sessionsData.filter(function (x) {
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
            console.error("Unexpected state: filterSessions is undefined");
          }
        } else {
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
      .then(( response ) => {
          if (response) {
            functionParams = response;
            functionName = 'onSuccess';
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
      .then((response) => {
          if (response) {
            functionParams = response;
            functionName = 'onSuccess';
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
      .then((response) => {
          if (response) {
            functionParams = response;
            functionName = 'onSuccess';
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
      .then((response) => {
          if (response) {
            functionParams = response;
            functionName = 'onSuccess';
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
      .then((response) => {
          if (response) {
            functionParams = response;
            functionName = 'onSuccess';
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
        //BUG: New device should not be created here.
        //If no current device, throw an error.
        //Someone took a short-cut. Not good.
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
      .then((response) => {
        console.log("apiClient.getDevice response", response);
        if (response) {
          functionParams = response;
          functionName = 'onSuccess';
          this.sendToOstWalletSdk(functionName, subscriberId, functionParams);
        }
        else {
          //BUG: #1: This error be informed to upstream OstWalletSdk.
          //BUG: #2: OstError.sdkError null ????
          //Someone took a too many short-cuts. Not good.
          let error = OstError.sdkError(null, 'os_osa_i_gcdfs_2');
          throw error;
        }
      })
      .catch((err) => {
        //BUG: This error be informed to upstream OstWalletSdk.
        //Someone took a short-cut. Not good.
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
      .then((response) => {
          if (response) {
            functionParams = response;
            functionName = 'onSuccess';
            console.log("balance api ====", response);
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
      .then((user) => {
        var tokenId = user.getTokenId();
        console.log(" token id", tokenId);
        OstToken.getById(tokenId)
          .then( (token) => {
            return token.getAuxiliaryChainId();
          })
            .then((chainId) => {
              console.log("auxiliary chain id", chainId);
              let apiClient = new OstApiClient(userId, OstConstants.getBaseURL(), this.getKeyManagerProxy(userId));
              apiClient.getPricePoints(chainId)
                .then((pricePoint) => {
                    if (pricePoint) {
                      functionParams = pricePoint;
                      functionName = 'onSuccess';
                      console.log("pricepoints api ====", pricePoint);
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


	getBalanceFromOstPlatform(args) {
		const userId = args.user_id
		;

		let apiClient = new OstApiClient(userId, OstConstants.getBaseURL(), this.getKeyManagerProxy(userId));
		return apiClient.getBalance()
			.then((response) => {
				return Promise.resolve(response);
			})
			.catch((err)=> {
				console.error(LOG_TAG, 'getBalanceFromOstPlatform', err);
				return Promise.resolve({err: OstError.sdkError(err, 'os_osa_i_gbfop_1').getJSONObject()});
			});
	}

	getPricePointFromOstPlatform(args) {
		const userId = args.user_id
		;

		return OstUser.getById(userId)
			.then((user) => {
				const tokenId = user.getTokenId();
				console.log(" token id", tokenId);
				return OstToken.getById(tokenId)
					.then((token) => {
						const chainId = token.getAuxiliaryChainId();
						if (true) {
							console.error(LOG_TAG, 'chainId not found');
							return Promise.resolve({err: new OstError('os_osa_i_gppfop_2', OstErrorCodes.SKD_INTERNAL_ERROR).getJSONObject()});
						}
						console.log("auxiliary chain id", chainId);
						let apiClient = new OstApiClient(userId, OstConstants.getBaseURL(), this.getKeyManagerProxy(userId));
						return apiClient.getPricePoints(chainId)
							.then((pricePoint) => {
								return Promise.resolve(pricePoint);
							})
					})

			})
			.catch((err) => {
				console.error(LOG_TAG, 'getPricePointFromOstPlatform', err);
				return Promise.resolve({err: OstError.sdkError(err, 'os_osa_i_gppfop_1').getJSONObject()});
			});

	}

  /**
  * Api to get user balance and PricePoint
  * @param {String} userId - Ost User id
  * @public
  */
  getBalanceWithPricePointFromServer( args ) {
		const oThis = this
			, userId = args.user_id
			, subscriberId = args.subscriber_id
		;

		const promiseArray = [oThis.getBalanceFromOstPlatform(args), oThis.getPricePointFromOstPlatform(args)];

		return Promise.all(promiseArray)
			.then((response) => {
				const balanceResponse = response[0]
					, pricePointResponse = response[1]
				;

				if (!balanceResponse || balanceResponse.err) {
					const ostError = OstError.sdkError(balanceResponse.err, 'os_osa_i_gbppfs_1', OstErrorCodes.SDK_API_ERROR);
					return oThis.onError(ostError, subscriberId);
				}

				if (!pricePointResponse || pricePointResponse.err) {
					const ostError = OstError.sdkError(pricePointResponse.err, 'os_osa_i_gbppfs_1', OstErrorCodes.SDK_API_ERROR);
					return oThis.onError(ostError, subscriberId);
				}

				const successResponse = {};
				console.log(LOG_TAG, "balanceResponse :", balanceResponse);
				console.log(LOG_TAG, "pricePointResponse :", pricePointResponse);

				const balanceRespKey = balanceResponse['result_type'];
				successResponse[balanceRespKey] = balanceResponse[balanceRespKey];

				const pricePointRespKey = pricePointResponse['result_type'];
				successResponse[pricePointRespKey] = pricePointResponse[pricePointRespKey];

				return oThis.onSuccess(successResponse, subscriberId);
			})
      .catch( (error) => {
        console.error(LOG_TAG, "Unexpected state error", error);
      });
  }


	onSuccess(args, subscriberId) {
		const ostMsg = new OstMessage();
		ostMsg.setSubscriberId(subscriberId);
		ostMsg.setFunctionName('onSuccess');
		ostMsg.setArgs(args);
		this.browserMessenger.sendMessage(ostMsg, SOURCE.UPSTREAM);
	}

	onError(errMsgObj, subscriberId) {
		const ostMsg = new OstMessage();
		ostMsg.setSubscriberId(subscriberId);
		ostMsg.setFunctionName('onError');
		ostMsg.setArgs(errMsgObj.getJSONObject());
		this.browserMessenger.sendMessage(ostMsg, SOURCE.UPSTREAM);
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

    let apiClient = new OstApiClient(userId, OstConstants.getBaseURL(), this.getKeyManagerProxy(userId));
    apiClient.getPendingRecovery()
      .then((response) => {
          if (response) {
            functionParams = response;
            functionName = 'onSuccess';
            console.log("pending recovery api ====", devices);
            this.sendToOstWalletSdk(functionName, subscriberId, functionParams);
          }
          else {
            throw OstError.sdkError(null, 'os_osa_i_gprfs_1');
          }
      })
      .catch((err) => {
        var ostError = new OstError(err, 'os_osa_i_gprfs_2',OstErrorCodes.SDK_RESPONSE_ERROR);
        //let error = OstError.sdkError(err, 'os_osa_i_gprfs_2');
        console.log("root-->",ostError.getJSONObject())
        let error = ostError.getJSONObject();
        functionName = 'onSuccess';
        functionParams = {root: error};
        this.sendToOstWalletSdk(functionName, subscriberId, functionParams);
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
      .then((response) => {
          if (response) {
            functionParams = response;
            functionName = 'onSuccess';
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


