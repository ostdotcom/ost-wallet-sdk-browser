import OstIndexDB from "../../common-js/OstIndexedDB";
import OstSecureEnclave from "./OstSecureEnclave";
import OstError from "../../common-js/OstError";

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

KEY_TYPE = {
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
		const oThis = this;
		this.kmDB.createDatabase()
			.then(() => {
				console.debug(LOG_TAG, "Getting KeyMeta struct for", oThis.userId);
				return oThis.kmDB.getData(OstIndexDB.STORES.KEY_STORE_TABLE, "id")
			})
			.then((kmData) => {
				if (kmData) {
					console.debug(LOG_TAG, "Key meta struct found");
					oThis.kmStruct = kmData;
					return kmData;
				} else {
					console.debug(LOG_TAG, "Key meta struct not found", "Building it...");
					return oThis.buildKeyMetaStruct()
						.then((kmData) => {
							console.debug(LOG_TAG, "Storing KM keys");
							return oThis.storeKmData(kmData);
						});
				}
			}).catch((err) => {
				console.error(LOG_TAG, "IKM initialization failed", err);
			});
			// .then(()=> {
			// 	return oThis.kmDB.insertData(OstIndexDB.STORES.KEY_STORE_TABLE, {id: "id", data: "data", extraData: "extraData"});
			// })
			// .catch(()=> {
			// 	return;
			// })
			// .then(() => {
			// 	return oThis.kmDB.getData(OstIndexDB.STORES.KEY_STORE_TABLE, "id")
			// }).catch((err) => {
			// console.error(LOG_TAG, "constructor error ", err);
		// });

	}

	buildKeyMetaStruct() {
		const oThis = this;
		this.kmStruct = new KeyMetaStruct();

		return Promise.all([oThis.createApiKey(), oThis.createDeviceKey()])
			.then((res) => {
				if (res[0] && res[1]) {
					return this.kmStruct;
				} else {
					throw "Meta Struct building failed";
				}
			});
	}

	createApiKey() {
		const oThis = this;
		const ecKeyPair = oThis.generateECKeyPair(KEY_TYPE.API);

		const privateKey = ecKeyPair.getPrivateKey();

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
			})
			.catch((err) => {
				throw OstError.sdkError(err, "okm_e_ikm_1");
			});
	}

	createDeviceKey() {
		const oThis = this;

		const mnemonics = oThis.generateMnemonics();

		const ecKeyPair = oThis.generateECWalletWithMnemonics(mnemonics, KEY_TYPE.DEVICE);
		const privateKey = ecKeyPair.getPrivateKey();
		console.log(LOG_TAG, "createDeviceKey :: Encrypting the generated keys");

		OstSecureEnclave.encrypt(oThis.userId, privateKey);

		const deviceApiKey = ecKeyPair.getChecksumAddressString();
		this.kmStruct.apiAddress = deviceApiKey;

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

	personalSign(ethWallet, messageToSign) {
		const messageHash = ethUtil.hashPersonalMessage(messageToSign);
		return this.signHash(ethWallet, messageHash);
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

export default IKM;
