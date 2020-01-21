const bip39 = require('bip39');
const randomBytes = require('randombytes');
const { SHA3 } = require('sha3');
var hdKey = require('ethereumjs-wallet/hdkey');
var ethUtil = require('ethereumjs-util');

const LOG_TAG = "IKM";
const SHOULD_USE_SEED_PWD = true;

const HD_DERIVATION_PATH_FIRST_CHILD = "m/44'/60'/0'/0";
class IKM {
	constructor(userId) {
		this.userId = userId;
	}

	init() {
		const keyMetaStruct = this.getKeyMetaStruct(this.userId);
	}

	getKeyMetaStruct(userId) {

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
	hash.update( strToHash );
	return hash.digest('hex');
}
}

export default IKM;
