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
import BigNumber from 'bignumber.js';

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
		const oThis = this
		;

    console.log(LOG_TAG, "getUser :: ", args);
    const userId = args.user_id;
    const subscriberId =  args.subscriber_id;

    OstUser.getById(userId)
      .then((userData) => {
        console.log(LOG_TAG, "user data ", userData);
        if (userData) {
					return oThis.onSuccess({user: userData}, subscriberId);
        }
        else {
          let err = new OstError('os_osa_i_gu_1', OstErrorCodes.INVALID_USER_ID);
          return oThis.onError(err, subscriberId);
        }
      })
      .catch((err) => {
				return oThis.onError(OstError.sdkError(err, 'os_osa_i_gu_2', OstErrorCodes.SKD_INTERNAL_ERROR));
      });

  }

  getToken ( args ) {
		const oThis = this
			, tokenId = args.token_id
			, subscriberId = args.subscriber_id
		;

		console.log(LOG_TAG, "getToken :: ", args);
    OstToken.getById( tokenId )
      .then( (tokenData) => {
        if (tokenData) {
          console.log(LOG_TAG, "token data ", tokenData);
					return oThis.onSuccess({token: tokenData}, subscriberId);
        } else {
          let err = new OstError('os_osa_i_gt_1', OstErrorCodes.INVALID_TOKEN_ID);
					return oThis.onError(err, subscriberId);
        }
      })
      .catch((err) => {
				return oThis.onError(OstError.sdkError(err, 'os_osa_i_gt_2', OstErrorCodes.SKD_INTERNAL_ERROR));
      });
  }

  //get current device Getter Method
  getDevice ( args ) {
		const oThis = this
			, userId = args.user_id
			, subscriberId = args.subscriber_id
		;

		console.log(LOG_TAG, "getDevice :: ", args);
		OstUser.getById(userId)
			.then((user) => {
				if (!user) {
					let err = new OstError('os_osa_i_gd_1', OstErrorCodes.INVALID_USER_ID);
					return oThis.onError(err, subscriberId);
				}
				return user.getCurrentDevice(this.getKeyManagerProxy(userId))
					.then((deviceData) => {
						console.log("device ====", deviceData);
						if (deviceData) {
							return oThis.onSuccess({device: deviceData}, subscriberId);
						} else {
							let err = new OstError('os_osa_i_gd_2', OstErrorCodes.DEVICE_NOT_SETUP);
							return oThis.onError(err, subscriberId);
						}
					})
			})
			.catch((err) => {
				err = OstError.sdkError(err, 'os_osa_i_gd_3', OstErrorCodes.INVALID_USER_ID);
				return oThis.onError(err, subscriberId);
			});
	}

  getActiveSessions( args ) {
		const oThis = this
			, userId = args.user_id
			, spendingLimit = args.spending_limit
			, subscriberId = args.subscriber_id
		;

		console.log(LOG_TAG, "getActiveSessions :: ", args);
		OstSession.getAllSessions()
			.then((sessionArray) => {
				console.log(LOG_TAG, "sessions ==== ", sessionArray);

				if (!sessionArray) sessionArray = [];

				if (!sessionArray.length) {
					return oThis.onSuccess({activeSessions: []}, subscriberId);
				}

				let spendingLimitBN = new BigNumber(0);
				if (spendingLimit) {
					spendingLimitBN = new BigNumber(spendingLimit);
				}

				console.log(LOG_TAG, "spending limit-----", spendingLimitBN.toString());
				let filterSessions = sessionArray.filter(function (x) {
					return x.user_id === userId
						&& x.status === 'AUTHORIZED'
						&& new BigNumber(x.spending_limit).isGreaterThanOrEqualTo(spendingLimitBN);
				});

				console.log(LOG_TAG, "filtered =====", filterSessions);
				return oThis.onSuccess({activeSessions: filterSessions}, subscriberId);
			})
			.catch((err) => {
				err = OstError.sdkError(err, 'os_osa_i_gas_1', OstErrorCodes.SKD_INTERNAL_ERROR);
				return oThis.onError(err, subscriberId);
			});
	}

  //JSON APIs

  getUserFromServer( args ) {
    const oThis = this
			, userId = args.user_id
			, subscriberId = args.subscriber_id
    ;

    let apiClient = new OstApiClient(userId, OstConstants.getBaseURL(), this.getKeyManagerProxy(userId))
    apiClient.getUser()
      .then(( response ) => {

          if (!response) {
            let ostError = OstError.sdkError(null, 'os_osa_i_gufs_1', OstErrorCodes.SKD_INTERNAL_ERROR);
            return oThis.onError(ostError, subscriberId);
          }

          return oThis.onSuccess(response, subscriberId);
      })
      .catch((err) => {
        let ostError = OstError.sdkError(err, 'os_osa_i_gufs_2',OstErrorCodes.SDK_API_ERROR);
        return oThis.onError(ostError, subscriberId);
      });
  }

  getTokenFromServer( args ) {
    const oThis = this
			, userId = args.user_id
			, subscriberId = args.subscriber_id
    ;

    let apiClient = new OstApiClient(userId, OstConstants.getBaseURL(), this.getKeyManagerProxy(userId))
    apiClient.getToken()
      .then((response) => {

        if (!response) {
          let ostError = OstError.sdkError(null, 'os_osa_i_gtfs_1', OstErrorCodes.SKD_INTERNAL_ERROR);
          return oThis.onError(ostError, subscriberId);
        }

        return oThis.onSuccess(response, subscriberId);
      })
      .catch((err) => {
        let ostError = OstError.sdkError(err, 'os_osa_i_gtfs_2',OstErrorCodes.SDK_API_ERROR);
        console.error(ostError);
        return oThis.onError(ostError, subscriberId);
      });
  }

  getTransactionsFromServer( args ) {
    const oThis = this
			, userId = args.user_id
			, subscriberId = args.subscriber_id
    ;

    let apiClient = new OstApiClient(userId, OstConstants.getBaseURL(), this.getKeyManagerProxy(userId))
    apiClient.getTransactions()
      .then((response) => {

        if (!response) {
          let ostError = OstError.sdkError(null, 'os_osa_i_gtxfs_1', OstErrorCodes.SKD_INTERNAL_ERROR);
          return oThis.onError(ostError, subscriberId);
        }

        return oThis.onSuccess(response, subscriberId);
      })
      .catch((err) => {
        let ostError = OstError.sdkError(err, 'os_osa_i_gtxfs_2',OstErrorCodes.SDK_API_ERROR);
        console.error(ostError);
        return oThis.onError(ostError, subscriberId);
      });
  }

  getTokenHolderFromServer( args ) {
    const oThis = this
			, userId = args.user_id
			, subscriberId = args.subscriber_id
    ;

    let apiClient = new OstApiClient(userId, OstConstants.getBaseURL(), this.getKeyManagerProxy(userId))
    apiClient.getTokenHolder()
      .then((response) => {

        if (!response) {
          let ostError = OstError.sdkError(null, 'os_osa_i_gthfs_1', OstErrorCodes.SKD_INTERNAL_ERROR);
          return oThis.onError(ostError, subscriberId);
        }

        return oThis.onSuccess(response, subscriberId);
      })
      .catch((err) => {
        let ostError = OstError.sdkError(err, 'os_osa_i_gthfs_2',OstErrorCodes.SDK_API_ERROR);
        console.error(ostError);
        return oThis.onError(ostError, subscriberId);
      });
  }

  getRulesFromServer( args ) {
    const oThis = this
			, userId = args.user_id
			, subscriberId = args.subscriber_id
    ;

    let apiClient = new OstApiClient(userId, OstConstants.getBaseURL(), this.getKeyManagerProxy(userId))
    apiClient.getRules()
      .then((response) => {

        if (!response) {
          let ostError = OstError.sdkError(null, 'os_osa_i_grfs_1', OstErrorCodes.SKD_INTERNAL_ERROR);
          return oThis.onError(ostError, subscriberId);
        }

        return oThis.onSuccess(response, subscriberId);
      })
      .catch((err) => {
        let ostError = OstError.sdkError(err, 'os_osa_i_grfs_2',OstErrorCodes.SDK_API_ERROR);
        console.error(ostError);
        return oThis.onError(ostError, subscriberId);
      });
  }


  /**
     * API to get user's current device.
     * @param {String} userId - Ost User id
     * @public
  */

  getCurrentDeviceFromServer( args ) {

    const oThis = this
			, userId = args.user_id
			, subscriberId = args.subscriber_id
    ;

    let address = null
    OstUser.getById(userId)
      .then((user) => {
        //BUG: New device should not be created here.
        //If no current device, throw an error.
        //Someone took a short-cut. Not good.
        return user.createOrGetDevice(this.getKeyManagerProxy(userId));
      })
      .then((device) => {

        console.log(LOG_TAG,"device =====", device['data'].address);
        let address = device['data'].address;
        if (!address) {
          let ostError = OstError.sdkError(null, 'os_osa_i_gcdfs_1', OstErrorCodes.SKD_INTERNAL_ERROR);
          return oThis.onError(ostError, subscriberId);
        }
        let apiClient = new OstApiClient(userId, OstConstants.getBaseURL(), this.getKeyManagerProxy(userId));
        return apiClient.getDevice(address);

      })
      .then((response) => {
        console.log("apiClient.getDevice response", response);

        if (!response) {
          let ostError = OstError.sdkError(null, 'os_osa_i_gcdfs_2', OstErrorCodes.SKD_INTERNAL_ERROR);
          return oThis.onError(ostError, subscriberId);
        }

        return oThis.onSuccess(response, subscriberId);
      })
      .catch((err) => {
        //BUG: This error be informed to upstream OstWalletSdk.
        //Someone took a short-cut. Not good.
        let ostError = OstError.sdkError(err, 'os_osa_i_gcdfs_3', OstErrorCodes.INVALID_USER_ID);
        console.error(ostError);
        return oThis.onError(ostError, subscriberId);
      })
  }
  /**
  * Api to get user balance
  * @param {String} userId - Ost User id
  * @public
  */
  getBalanceFromServer( args ) {

    const oThis = this
			, userId = args.user_id
			, subscriberId = args.subscriber_id
    ;

    const balance = oThis.getBalanceFromOstPlatform( args );

    return Promise.resolve(balance)
      .then((response)=>{
        const balanceResponse = response;

        if (!balanceResponse || balanceResponse.err) {
          const ostError = OstError.sdkError(balanceResponse.err, 'os_osa_i_gppfs_1', OstErrorCodes.SDK_API_ERROR);
          return oThis.onError(ostError, subscriberId);
        }

        console.log(LOG_TAG, "balanceResponse :", balanceResponse);
        return oThis.onSuccess(balanceResponse, subscriberId);

      })
      .catch( (error) => {
        console.error(LOG_TAG, "Unexpected state error", error);
      });
  }

  /**
  * Api to get user Price Points
  * @param {String} userId - Ost User id
  * @public
  */
  getPricePointFromServer( args ) {
    const oThis = this
			, userId = args.user_id
			, subscriberId = args.subscriber_id
    ;

    const pricePoint = oThis.getPricePointFromOstPlatform( args );

    return Promise.resolve(pricePoint)
      .then((response)=>{
        const pricePointResponse = response;

        if (!pricePointResponse || pricePointResponse.err) {
          const ostError = OstError.sdkError(pricePointResponse.err, 'os_osa_i_gppfs_1', OstErrorCodes.SDK_API_ERROR);
          return oThis.onError(ostError, subscriberId);
        }

        console.log(LOG_TAG, "pricePointResponse :", pricePointResponse);
        return oThis.onSuccess(pricePointResponse, subscriberId);

      })
      .catch( (error) => {
        console.error(LOG_TAG, "Unexpected state error", error);
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
				return Promise.resolve(OstError.sdkError(err, 'os_osa_i_gbfop_1'));
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
						if (!chainId) {
						 	console.error(LOG_TAG, 'chainId not found');
						 	return Promise.resolve({err: new OstError('os_osa_i_gppfop_2', OstErrorCodes.SKD_INTERNAL_ERROR)});
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
				return Promise.resolve(OstError.sdkError(err, 'os_osa_i_gppfop_1'));
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
					const ostError = OstError.sdkError(pricePointResponse.err, 'os_osa_i_gbppfs_2', OstErrorCodes.SDK_API_ERROR);
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
    ostMsg.setArgs({data: args});
    console.log(LOG_TAG,"onSuccess");
		this.browserMessenger.sendMessage(ostMsg, SOURCE.UPSTREAM);
	}

	onError(errMsgObj, subscriberId) {
		const ostMsg = new OstMessage();
		ostMsg.setSubscriberId(subscriberId);
    ostMsg.setFunctionName('onError');
    console.log(LOG_TAG,"onError");
		ostMsg.setArgs({err: errMsgObj.getJSONObject()});
		this.browserMessenger.sendMessage(ostMsg, SOURCE.UPSTREAM);
	}

	/**
	 * Api to get user balance
	 * @param args
	 */
  getPendingRecoveryFromServer( args ) {
    const oThis = this
    , userId = args.user_id
    , subscriberId = args.subscriber_id
  ;

    let apiClient = new OstApiClient(userId, OstConstants.getBaseURL(), this.getKeyManagerProxy(userId));
    apiClient.getPendingRecovery()
      .then((response) => {

        if (!response) {
          let ostError = OstError.sdkError(null, 'os_osa_i_gprfs_1', OstErrorCodes.SKD_INTERNAL_ERROR);
          return oThis.onError(ostError, subscriberId);
        }

        return oThis.onSuccess(response, subscriberId);
      })
      .catch((err) => {
        let ostError = OstError.sdkError(err, 'os_osa_i_gprfs_2', OstErrorCodes.SDK_API_ERROR);
        return oThis.onError(ostError, subscriberId);
      });
  }

  /**
  * Api to get user's device list
  * @param {String} userId - Ost User id
  * @public
  */
  getDeviceListFromServer( args ) {
    //const nextPagePayload = args.next_page_payload;
    const oThis = this
    , userId = args.user_id
    , subscriberId = args.subscriber_id
  ;


    let apiClient = new OstApiClient(userId, OstConstants.getBaseURL(), this.getKeyManagerProxy(userId))
    apiClient.getDeviceList()
      .then((response) => {

        if (!response) {
          let ostError = OstError.sdkError(null, 'os_osa_i_gdlfs_1', OstErrorCodes.SKD_INTERNAL_ERROR);
          return oThis.onError(ostError, subscriberId);
        }

        return oThis.onSuccess(response, subscriberId);
      })
      .catch((err) => {
        let ostError = OstError.sdkError(err, 'os_osa_i_gdlfs_2',OstErrorCodes.SDK_API_ERROR);
        console.error(ostError);
        return oThis.onError(ostError, subscriberId);
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


