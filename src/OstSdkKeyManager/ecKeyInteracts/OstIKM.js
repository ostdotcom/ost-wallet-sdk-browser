import OstIndexDB from "../../common-js/OstIndexedDB";
import OstSecureEnclave from "./OstSecureEnclave";
import OstError from "../../common-js/OstError";
import * as Wallet from "ethereumjs-wallet";
import * as EthUtil from "ethereumjs-util";
import OstKeyManager from "./OstKeyManager"
import OstApiSigner from "./OstApiSigner";

const bip39 = require('bip39');
const randomBytes = require('randombytes');
const { SHA3 } = require('sha3');
var hdKey = require('ethereumjs-wallet/hdkey');
var ethUtil = require('ethereumjs-util');

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
	constructor(userId) {
		this.userId = userId;
		this.kmDB = OstIndexDB.newInstance(KM_DB_NAME, KM_DB_VERSION, STORES);
	}

	init() {
		console.log(LOG_TAG, "init IKM");

		const oThis = this;
		return this.kmDB.createDatabase()
			.then(() => {
				console.debug(LOG_TAG, "Getting KeyMeta struct for", oThis.userId);
				return oThis.kmDB.getData(OstIndexDB.STORES.KEY_STORE_TABLE, oThis.userId)
			})
			.then((kmData) => {
				if (kmData) {
					console.log(LOG_TAG, "Key meta struct found", kmData);
					oThis.kmStruct = kmData.data;
					return kmData;
				} else {
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

	storeKmData(kmData) {
		const oThis = this;
		const dataToStore = {
			id: oThis.userId,
			data: kmData
		};

		console.log(LOG_TAG, "Storing KM data", kmData);
		return oThis.kmDB.insertData(STORES.KEY_STORE_TABLE, dataToStore)
			.then(() => {
				return kmData;
			});
	}

	buildKeyMetaStruct() {
		const oThis = this;
		this.kmStruct = new KeyMetaStruct();
		this.kmStruct.isTrustable = false;

		return oThis.createApiKey()
			.then(() => {
				return oThis.createDeviceKey();
			})
			.then(() => {
				return this.kmStruct;
			})
			.catch((err) =>{
				throw "Meta Struct building failed";
			})
	}

	setIsTrustable( isTrustable ) {
		const oThis = this;
		oThis.kmStruct.isTrustable = isTrustable;
		return oThis.storeKmData(oThis.kmStruct);
	}

	getDeviceAddress() {
		return this.kmStruct.deviceAddress;
	}

	getApiAddress() {
		return this.kmStruct.apiAddress;
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
						return apiKeyAddress;
					})
			})
			.then((apiKeyAddress)=> {
				oThis.kmStruct.apiAddress = apiKeyAddress;
				return true;
			})
			.catch((err) => {
				throw OstError.sdkError(err, "okm_e_ikm_1");
			});
	}

	createDeviceKey() {
		const oThis = this;

		const mnemonics = oThis.generateMnemonics();

		const ecKeyPair = oThis.generateECWalletWithMnemonics(mnemonics, KEY_TYPE.DEVICE);
		const privateKey = ecKeyPair.getPrivateKeyString();
		console.log(LOG_TAG, "createDeviceKey :: Encrypting the generated keys");

		return OstSecureEnclave.encrypt(oThis.userId, privateKey)
			.then((encryptedData) => {
				const deviceAddress = ecKeyPair.getChecksumAddressString();
				const deviceAddressId = oThis.createEthKeyMetaId(deviceAddress);

				const dataToStore = {
					id: deviceAddressId,
					data: encryptedData
				};

				console.log(LOG_TAG, "CreateDeviceKey :: Inserting keys");
				return oThis.kmDB.insertData(STORES.KEY_STORE_TABLE, dataToStore)
					.then(() => {
						return deviceAddress;
					})
			})
			.then((deviceAddress)=> {
				oThis.kmStruct.deviceAddress = deviceAddress;
				return true;
			})
			.catch((err) => {
				throw OstError.sdkError(err, "okm_e_ikm_1");
			});
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
		const messageHash = ethUtil.keccak256(messageToSign);
		return this.signHash(ethWallet, messageHash);
	}

	personalSign(messageToSign, ethWallet) {
		const oThis = this;
		const messageHash = ethUtil.hashPersonalMessage(messageToSign);
		if (ethWallet) {
			return oThis.getApiWallet()
				.then((ethWallet) => {
					return oThis.signHash(ethWallet, messageHash);
				})
		} else {
			return Promise.resolve(oThis.signHash(ethWallet, messageHash));
		}
	}

	getApiWallet() {
		const oThis = this,
			apiKeyId = "ApikeyId"
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
				throw OstError.sdkError(err, "okm_e_ikm_1");
			});
	}

	signHash(ethWallet, msgHash) {
		const msgSignature = ethUtil.ecsign(msgHash, ethWallet.getPrivateKey());
		console.debug(LOG_TAG, "signature", msgSignature);
		return msgSignature;
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

const getInstance = (userId) => {
	if (ostKeyManager && ostKeyManagerUserId === userId) {
		return Promise.resolve(ostKeyManager);
	}

	console.debug(LOG_TAG,'Creating IKM instance for userId ', userId);
	ostKeyManagerUserId = userId;
	ostKeyManager = new IKM(userId);

	return ostKeyManager.init()
		.then(()=> {
			return ostKeyManager;
		})
		.catch(()=> {
			return ostKeyManager;
		})
};


export default {
	getKeyManager (userId) {
		return getInstance(userId)
			.then( (instance) => {
				return new OstKeyManager(instance);
			});
	},

	getApiSigner (userId) {
		return getInstance(userId)
			.then( (instance) => {
				return new OstApiSigner(instance);
			});
	}
}
