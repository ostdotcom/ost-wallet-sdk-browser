import OstIndexDB from "../../common-js/OstIndexedDB";
import OstSecureEnclave from "./OstSecureEnclave";
import OstError from "../../common-js/OstError";
import * as Wallet from "ethereumjs-wallet";
import * as EthUtil from "ethereumjs-util";
import OstKeyManager from "./OstKeyManager"
import OstApiSigner from "./OstApiSigner";
import OstQRSigner from "./OstQRSigner";
import OstTransactionSigner from "./OstTransactionSigner";

import * as bip39 from "bip39";
import * as randomBytes from "randombytes";
import {SHA3} from "sha3";
import * as hdKey from "ethereumjs-wallet/hdkey";

const LOG_TAG = "IKM";
const SHOULD_USE_SEED_PWD = true;

const KM_DB_VERSION = 1;
const KM_DB_NAME = 'KeyManagerDB';
const STORES = {
	KEY_STORE_TABLE : 'KEY_STORE_TABLE'
};

const HD_DERIVATION_PATH_FIRST_CHILD = "m/44'/60'/0'/0";

const KEY_TYPE = {
	API: 'API',
	DEVICE: 'DEVICE',
	SESSION: 'SESSION',
	RECOVERY: 'RECOVERY'
};

class IKM {
	constructor(userId, avoidKMBuilding) {
		this.userId = userId;
		this.avoidKMBuilding = avoidKMBuilding;
		this.kmDB = OstIndexDB.newInstance(KM_DB_NAME, KM_DB_VERSION, STORES);
	}

	init() {
		console.log(LOG_TAG, "init IKM");

		const oThis = this;
		return this.kmDB.createDatabase()
			.then(() => {
				let userMetaId = oThis.createUserMataId(oThis.userId);
				console.debug(LOG_TAG, "Getting KeyMeta struct for", userMetaId);
				return oThis.kmDB.getData(STORES.KEY_STORE_TABLE, userMetaId)
			})
			.then((kmData) => {
				if (kmData && kmData.data && kmData.data.isTrustable) {
					console.log(LOG_TAG, "Key meta struct found", kmData);
					oThis.kmStruct = kmData.data;
					return kmData.data;
				} else {
					if (oThis.avoidKMBuilding) {
						return {};
					}
					console.log(LOG_TAG, "Key meta struct not found", "Building it...");
					return oThis.buildKeyMetaStruct()
						.then((kmData) => {
							console.debug(LOG_TAG, "Storing KM keys");
							return oThis.storeKmData(kmData);
						});
				}
			}).catch((err) => {
				console.error(LOG_TAG, "IKM initialization failed", err);
			});
	}

	askForConfirmation() {
		const result = confirm("Would you like to setup your wallet?");
		return Promise.resolve(!!result);
	}

	storeKmData(kmData) {
		const oThis = this;
		const dataToStore = {
			id: oThis.createUserMataId(oThis.userId),
			data: kmData
		};

		console.log(LOG_TAG, "Storing KM data", kmData);
		return oThis.kmDB.putData(STORES.KEY_STORE_TABLE, dataToStore)
			.then(() => {
				oThis.kmData = kmData;
				return kmData;
			});
	}

	buildKeyMetaStruct() {
		const oThis = this;
		this.kmStruct = new KeyMetaStruct();
		this.kmStruct.isTrustable = false;

		return oThis.askForConfirmation()
			.then((isTrustable) => {
				oThis.kmStruct.isTrustable = isTrustable;

				//If not trustable don't crate api and device keys
				if (!isTrustable) {
					return oThis.kmStruct;
				}

				//Browser is trustable create api and device keys
				return oThis.createApiKey()
					.then((apiKey) => {
						oThis.kmStruct.apiAddress = apiKey;
						return oThis.createDeviceKey();
					})
					.then((deviceKey) => {
						oThis.kmStruct.deviceAddress = deviceKey;
						return oThis.kmStruct;
					});
			})
			.catch((err) => {
				console.error(LOG_TAG, "Error while building meta", err);
				throw "Meta Struct building failed";
			})
	}

	setIsTrustable( isTrustable ) {
		const oThis = this;
		oThis.kmStruct.isTrustable = isTrustable;
		return oThis.storeKmData(oThis.kmStruct)
			.then((kmStruct) => {
				return kmStruct.isTrustable;
			})
	}

	isTrustable( ) {
		return this.kmStruct.isTrustable;
	}

	getDeviceAddress() {
		return this.kmStruct.deviceAddress;
	}

	getApiAddress() {
		return this.kmStruct.apiAddress;
	}

	createSessionKey() {
		const oThis = this;
		const ecKeyPair = oThis.generateECKeyPair(KEY_TYPE.SESSION);

		const privateKey = ecKeyPair.getPrivateKeyString();

		console.log(LOG_TAG, "Create Session Key :: Encrypting the generated keys");

		return OstSecureEnclave.encrypt(oThis.userId, privateKey)
			.then((encryptedData) => {
				const sessionAddress = ecKeyPair.getChecksumAddressString();
				const sessionKeyId = oThis.createEthKeyMetaId(sessionAddress);

				const dataToStore = {
					id: sessionKeyId,
					data: encryptedData
				};

				console.log(LOG_TAG, "Creating Session :: Inserting keys");
				return oThis.kmDB.insertData(STORES.KEY_STORE_TABLE, dataToStore)
					.then(() => {
						return sessionAddress;
					})
			})
			.catch((err) => {
				throw OstError.sdkError(err, "okm_e_ikm_cak_1");
			});
	}

	createApiKey() {
		const oThis = this;
		const ecKeyPair = oThis.generateECKeyPair(KEY_TYPE.API);

		const privateKey = ecKeyPair.getPrivateKeyString();

		console.log(LOG_TAG, "CreateApiKey :: Encrypting the generated keys");

		return OstSecureEnclave.encrypt(oThis.userId, privateKey)
			.then((encryptedData) => {
				const apiKeyAddress = ecKeyPair.getChecksumAddressString();
				const apiKeyId = oThis.createEthKeyMetaId(apiKeyAddress);

				const dataToStore = {
					id: apiKeyId,
					data: encryptedData
				};

				console.log(LOG_TAG, "CreateApiKey :: Inserting keys");
				return oThis.kmDB.insertData(STORES.KEY_STORE_TABLE, dataToStore)
					.then(() => {
						console.log(LOG_TAG, "created Api key", apiKeyAddress);
						return apiKeyAddress;
					})
			})
			.catch((err) => {
				throw OstError.sdkError(err, "okm_e_ikm_cak_1");
			});
	}

	createDeviceKey() {
		const oThis = this;

		const mnemonics = oThis.generateMnemonics();
		const ecKeyPair = oThis.generateECWalletWithMnemonics(mnemonics, KEY_TYPE.DEVICE);
		const deviceAddress = ecKeyPair.getChecksumAddressString();
		console.log(LOG_TAG, "created device key", deviceAddress);
		return Promise.resolve(deviceAddress);
	}

	createEthKeyMetaId( address) {
		return "ETHEREUM_KEY_FOR_" + address;
	}

	createUserMataId(userId) {
		return "USER_DEVICE_INFO_FOR_" + userId;
	}

	createMnemonicsMetaId(address) {
		return "ETHEREUM_KEY_MNEMONICS_FOR_" + address;
	}

	signMessage(ethWallet, messageToSign) {
		const messageHash = EthUtil.keccak256(messageToSign);
		return this.signHash(ethWallet, messageHash);
	}

	personalSign(messageToSign, ethWallet) {
		const oThis = this;
		const bufferMessage = Buffer.from(messageToSign, 'utf-8');
		const messageHash = EthUtil.hashPersonalMessage(bufferMessage);
		if (!ethWallet) {
			return oThis.getWalletFromAddress(oThis.kmStruct.apiAddress)
				.then((ethWallet) => {
					return oThis.signHash(ethWallet, messageHash);
				})
		} else {
			return Promise.resolve(oThis.signHash(ethWallet, messageHash));
		}
	}

	getWalletFromAddress(walletAddress) {
		const oThis = this,
			apiKeyId = oThis.createEthKeyMetaId(walletAddress)
		;
		return oThis.kmDB.getData(STORES.KEY_STORE_TABLE, apiKeyId)
			.then((data) => {
				const privateKey = data.data;
				return OstSecureEnclave.decrypt(oThis.userId, privateKey, true);
			})
			.then((privateKey) => {
				console.log(LOG_TAG, "Result", privateKey);
				const priv = EthUtil.toBuffer(privateKey);

				const wallet = Wallet.fromPrivateKey(priv);
				console.log(LOG_TAG, "Wallet address", wallet.getChecksumAddressString());
				return wallet;
			})
			.catch((err) => {
				throw OstError.sdkError(err, "okm_e_ikm_gaw_1");
			});
	}

	deleteSessions(addresses) {
		const oThis = this;
		let promiseList = [];

		addresses.forEach((address) => {
			let apiKeyId = oThis.createEthKeyMetaId(address);
			let deletePromise = oThis.kmDB.deleteData(STORES.KEY_STORE_TABLE, apiKeyId);
			promiseList.push(deletePromise);
		});

		return Promise.all(promiseList)
			.then(() => {
				return Promise.resolve();
			})
			.catch((err) => {
				console.error(LOG_TAG, "Delete Session failed", err);
				return Promise.resolve();
			});
	}

	signWithSession(sessionAddress, hashToSign) {
		const oThis = this;
		const bufferHash = Buffer.from(hashToSign, 'hex');
		return oThis.getWalletFromAddress(sessionAddress)
			.then((ethWallet) => {
				return oThis.signHash(ethWallet, bufferHash);
			});
	}

	signHash(ethWallet, msgHash) {
		const msgSignature = EthUtil.ecsign(msgHash, ethWallet.getPrivateKey());
		const rpcSig = EthUtil.toRpcSig(msgSignature.v, msgSignature.r, msgSignature.s);
		console.debug(LOG_TAG, "signature", rpcSig);
		return rpcSig;
	}

	generateMnemonics() {
		const randBytes = randomBytes(32);
		console.debug(LOG_TAG, "Generated random bytes:", randBytes);

		return bip39.entropyToMnemonic(randBytes);
	}

	generateECKeyPair(keyType) {
		const mnemonics = this.generateMnemonics();
		return this.generateECWalletWithMnemonics(mnemonics, keyType)
	}

	generateHDWallet() {
		const mnemonics = this.generateMnemonics();
		console.debug(LOG_TAG, "12 random mnemonics:", mnemonics);

		return this.generateECWalletWithMnemonics(mnemonics, "Sessions");
	}

	generateECWalletWithMnemonics(mnemonics, keyType) {
		let seedPassword = "";
		if (SHOULD_USE_SEED_PWD) {
			seedPassword = this.buildSeedPassword(keyType);
			console.info(LOG_TAG, "Seed pwd being used:", seedPassword);
		}

		const seed = bip39.mnemonicToSeedSync(mnemonics, seedPassword).toString('hex');
		console.info(LOG_TAG, "Generated Hex seed ", seed);

		const hdMasterKey = hdKey.fromMasterSeed(seed);

		const derivedKey =  hdMasterKey.derivePath(HD_DERIVATION_PATH_FIRST_CHILD);

		const ethWallet = derivedKey.getWallet();
		console.info(LOG_TAG, "hdWallet public address", ethWallet.getChecksumAddressString());

		return ethWallet;
	}

	buildSeedPassword(keyType) {
		let components = [];
		components.push("OstSdk");
		components.push(keyType);
		components.push(this.userId);
		const strToHash = components.join("-");

		const hash = new SHA3(512);
		hash.update(strToHash);
		return hash.digest('hex');
	}
}

class KeyMetaStruct {
	constructor() {
		this.apiAddress = "";
		this.deviceAddress = "";
		this.isTrustable = false;
		this.ethKeyMetaMapping = {};
		this.ethKeyMnemonicsMetaMapping = {};
	}

	getApiAddress() {
		return this.apiAddress;
	}

	getEthKeyIdentifier( address ) {
		return this.ethKeyMetaMapping[address];
	}

	hasAddress( address ) {
		return !this.getEthKeyIdentifier[address];
	}

	getEthKeyMnemonicsIdentifier( address ) {
		return this.ethKeyMnemonicsMetaMapping[address];
  }

 getDeviceAddress() {
	return this.deviceAddress;
 }
}


let ostKeyManager = null;
let ostKeyManagerUserId = null;

const getInstance = (userId, avoidKMBuilding) => {
	if (ostKeyManager && ostKeyManagerUserId === userId) {
		return Promise.resolve(ostKeyManager);
	}
	avoidKMBuilding = avoidKMBuilding || false;

	console.debug(LOG_TAG,'Creating IKM instance for userId ', userId);
	let uid = userId;
	let okm = new IKM(userId, avoidKMBuilding);

	return okm.init()
		.then(() => {
          ostKeyManager = okm;
          ostKeyManagerUserId = uid;
		  return ostKeyManager;
		})
		.catch((err) => {
			console.err(LOG_TAG, "getInstance failed", err);
		})
};


export default {
	getKeyManager (userId, avoidKMBuilding) {
		return getInstance(userId, avoidKMBuilding)
			.then( (instance) => {
				return new OstKeyManager(instance);
			});
	},

	getApiSigner (userId) {
		return getInstance(userId)
			.then( (instance) => {
				return new OstApiSigner(instance);
			});
	},

	getQRSigner (userId) {
		return getInstance(userId)
			.then( (instance) => {
				return new OstQRSigner(instance);
			});
	},

	getTransactionSigner (userId) {
		return getInstance(userId)
			.then( (instance) => {
				return new OstTransactionSigner(instance);
			});
	}
}
