import OstIndexDB from "../../common-js/OstIndexedDB";
import OstError from "../../common-js/OstError";

const SE_DB_VERSION = 1;
const SE_DB_NAME = 'SecureEnclaveDB';
const STORES = {
	KEY_STORE_TABLE:'KEY_STORE_TABLE',
};

const LOG_TAG = "SecureEnclave";


class SecureEnclave {

	constructor(userId) {
		this.userId = userId;
		this.kmDB = OstIndexDB.newInstance(SE_DB_NAME, SE_DB_VERSION, STORES);
	}

	init() {
		const oThis = this;
		return this.kmDB.createDatabase()
			.then(() => {
				return oThis.getKeyObject();
			})
			.then((keyObject) => {
				if (!keyObject) {
					return oThis.generateSEKey()
						.then((keyObject) => {
							keyObject.id = oThis.userId;
							return oThis.storeInDb(keyObject);
						});
				}
				keyObject = null;
			})
			.catch((err) => {
				throw OstError.sdkError(err, 'okm_e_se_1');
			});
	}


	generateSEKey() {
		let algoKeyGen = {
			name: 'AES-GCM',
			length: 256
		};
		let iv = window.crypto.getRandomValues(new Uint8Array(12));
		let keyUsages = [
			'encrypt',
			'decrypt'
		];

		console.debug(LOG_TAG,'Generating key');

		return window.crypto.subtle.generateKey(algoKeyGen, false, keyUsages)
			.then(function (key) {
				return {key: key, iv: iv}
			})
			.catch(function (err) {
				console.error(LOG_TAG,'Error in generate Secure Enclave Key: ' + err.message);
				throw "Key generation failed";
			});
	}

	storeInDb(keyObject) {
		return this.kmDB.insertData(STORES.KEY_STORE_TABLE, keyObject);
	}

	getKeyObject() {
		return this.kmDB.getData(STORES.KEY_STORE_TABLE, this.userId);
	}

	strToArrayBuffer(str) {
		var buf = new ArrayBuffer(str.length);
		var bufView = new Uint8Array(buf);
		for (var i = 0, strLen = str.length; i < strLen; i++) {
			bufView[i] = str.charCodeAt(i);
		}
		return buf;
	}

	arrayBufferToString(buf) {
		return String.fromCharCode.apply(null, new Uint8Array(buf));
	}

	encrypt(dataToEncrypt) {
		const oThis = this;

		dataToEncrypt = oThis.strToArrayBuffer(dataToEncrypt);

		return this.getKeyObject()
			.then((keyObject) => {
				console.debug(LOG_TAG, "Encrypting data");

				return window.crypto.subtle.encrypt(
					oThis.getAlgo(keyObject.iv),
					keyObject.key,
					dataToEncrypt);
			})
			.then(function (cipherText) {
				console.log(LOG_TAG, 'Data encrypted');

				return cipherText;
			}).catch(function (err) {
				console.error(LOG_TAG, "Encryption fail");

				throw "Encryption failed";
			});
	}

	decrypt(dataToDecrypt) {
		const oThis = this;

		return this.getKeyObject()
			.then((keyObject) => {
				console.debug(LOG_TAG, "Decrypting data");

				return window.crypto.subtle.decrypt(
					oThis.getAlgo(keyObject.iv),
					keyObject.key,
					dataToDecrypt)
			})
			.then(function (decryptedData) {
				console.log(LOG_TAG, 'Data decrypted');

				return oThis.arrayBufferToString(decryptedData);

			}).catch(function (err) {
				console.error(LOG_TAG, "Decryption fail");

				throw "Decryption failed";
			});
	}


	getAlgo(iv) {
		return {
			name: 'AES-GCM',
			iv: iv,
			tagLength: 128
		};
	}

}

let secureEnclave = null;
let secureEnclaveUserId = null;


const getInstance = (userId) => {
	if (secureEnclave && secureEnclaveUserId === userId) {
		return Promise.resolve(secureEnclave);
	}

	console.debug(LOG_TAG,'Creating new secure enclave instance for userId ', userId);
	secureEnclaveUserId = userId;
	secureEnclave = new SecureEnclave(userId);

	return secureEnclave.init()
		.then(() => {
			return secureEnclave;
		})
		.catch(() => {
			return secureEnclave;
		})
};

export default {
	encrypt(userId, dataToEncrypt) {
		return getInstance(userId)
			.then( (instance) => {
				return instance.encrypt(dataToEncrypt);
			});
	},

	decrypt(userId, dataToDecrypt) {
		return getInstance(userId)
			.then( (instance) => {
				return instance.decrypt(dataToDecrypt);
			});
	}
}
