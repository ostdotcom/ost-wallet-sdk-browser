import ethAbi from 'ethereumjs-abi';
import BigNumber from 'bignumber.js';
import * as ethUtil from "ethereumjs-util";

const LOG_TAG = "OstTransactionSigner";
const DIRECT_TRANSFER = "direct transfer";
const PRICER = "pricer";

let ikmInstance = null;

export default class OstTransactionSigner {
	constructor(ikm) {
		ikmInstance = ikm;
	}

	/**
	 * Sign transaction
	 * @param txnData
	 */
	signTransactionData(txnData) {
		const oThis = this
			, rule = txnData.rule
			, tokenHolderAddresses = txnData.to_token_holder_addresses
			, userTokenHolderAddress = txnData.from_token_holder_address
			, ruleMethod = txnData.rule_method
			, amounts = txnData.amounts
			, session = txnData.session
			, options = txnData.options
		;
		oThis.rule = rule;

		if (!rule) {
			throw "Rule object not found";
		}

		if (!rule.address) {
			throw "Rule Address not found";
		}

		if (!session) {
			throw "Session object not found";
		}

		if (!tokenHolderAddresses || !Array.isArray(tokenHolderAddresses)) {
			throw "Token holder addresses is not an Array";
		}

		if (!amounts || !Array.isArray(amounts)) {
			throw "Amounts is not an Array";
		}

		if (amounts.length !== tokenHolderAddresses.length) {
			throw "tokenHolderAddresses is not an equal to amounts";
		}

		const userId = ikmInstance.userId;
		const checkTokenHolderAddresses = this.toCheckSumAddresses(tokenHolderAddresses);

		const ruleNameLowerCase = rule.name.toLowerCase();
		let callData = null;
		let rawCallData = null;
		let spendingBtAmountInWei = new BigNumber(0);

		switch (ruleNameLowerCase) {

			case DIRECT_TRANSFER:
				console.log(LOG_TAG, "In Direct Transfer");
				console.log(LOG_TAG, "Building call data");

				callData = oThis.getTransactionExecutableData(ruleMethod, tokenHolderAddresses, amounts);
				rawCallData = oThis.getTransactionRawCallData(ruleMethod, tokenHolderAddresses, amounts);
				spendingBtAmountInWei = oThis.calDirectTransferSpendingLimit(amounts);
				break;

			case PRICER:

				let currencyCode = options.currency_code || 'USD';

				let weiPricePoint = oThis.convertPricePointFromEthToWei('1.0261864534', '18');

				callData = oThis.getTransactionExecutableData(ruleMethod,
					userTokenHolderAddress,
					tokenHolderAddresses,
					amounts,
					('0x' + oThis.stringToHex(currencyCode)),
					weiPricePoint,
				);

				rawCallData = oThis.getTransactionRawCallData(ruleMethod,
					userTokenHolderAddress,
					tokenHolderAddresses,
					amounts,
					currencyCode,
					weiPricePoint
				);

				break;

			default:
				throw "Rule name not found"
		}

		const ruleAddress = rule.address
			, sessionAddress = session.address;


		const eip1077TxnHash = oThis.createEIP1077TxnHash(callData, ruleAddress, userTokenHolderAddress, session.nonce);

		return ikmInstance.signWithSession(sessionAddress, eip1077TxnHash)
			.then((signature) => {
				return Object.assign({}, txnData, {
					signature: signature,
					raw_call_data: rawCallData,
					call_data: callData
				});
			})
			.catch((err) => {
				console.error(LOG_TAG, "Transaction Signing failed", err);
				throw "Transaction signing failed";
			});
	}

	calFiatMultiplier(pricePointOSTtoUSD, decimalExponent, conversionFactor, btDecimals) {
// weiDecimal = OstToUsd * 10^decimalExponent
// 		BigDecimal bigDecimal = new BigDecimal(String.valueOf(oneOstToUsd));
// 		BigDecimal toWeiMultiplier = new BigDecimal(10).pow(usdDecimalExponent);
// 		BigDecimal usdWeiDecimalDenominator = bigDecimal.multiply(toWeiMultiplier);
//
// 		// toBtWeiMultiplier = 10^btDecimal
// 		BigDecimal toBtWeiMultiplier = new BigDecimal(10).pow(btDecimalExponent);
//
// 		// btInWeiNumerator = conversionFactorOstToPin * toBtWeiMultiplier
// 		BigDecimal conversionFactorOstToPin = new BigDecimal(String.valueOf(oneOstToBT));
// 		BigDecimal btInWeiNumerator = conversionFactorOstToPin.multiply(toBtWeiMultiplier);
//
// 		int precision = usdDecimalExponent - btDecimalExponent;
// 		if (precision < 1) precision = 2;
//
// 		// multiplierForFiat = btInWeiNumerator / usdWeiDecimalDenominator
// 		BigDecimal multiplierForFiat = btInWeiNumerator.divide(usdWeiDecimalDenominator, precision, RoundingMode.DOWN);
//
// 		return multiplierForFiat;
	}

	convertPricePointFromEthToWei(pricePointOSTtoUSD, decimalExponent) {
		const bigDecimal = new BigNumber(pricePointOSTtoUSD);
		const toWeiMultiplier = new BigNumber(10).pow(decimalExponent);
		const weiDecimal = bigDecimal.multipliedBy(toWeiMultiplier);
		const weiInteger = weiDecimal.toNumber();
		return weiInteger.toString();
	}
	/**
	 *
	 * Test Example
	 * Address : 0xebe35A9dC1Aea4775b824EdCc8093bA25faBf0CC
	 * amount : 1000000
	 * callData = 0x94ac7a3f000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000ebe35a9dc1aea4775b824edcc8093ba25fabf0cc000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000f4240
	 *
	 * raw call data = {"method":"directTransfers","parameters":[["0xebe35A9dC1Aea4775b824EdCc8093bA25faBf0CC"],["1000000"]]}
	 *
	 * rule Address= 0x19784E6190436A50195CfD0c5d9334f254e3017D
	 * session address = 0x8e6a96bC778bbAE86894F86901697c7689d7040c | 1 nonce
	 *
	 * 0x97ebe030
	 * token holder =0x3677e3E20F389332A4855c44260767ECA55a5599
	 * eip1077 {"value":"0","gasPrice":"0","gas":"0","gasToken":"0","operationType":"0","nonce":"1","to":"0x19784E6190436A50195CfD0c5d9334f254e3017D","from":"0x3677e3E20F389332A4855c44260767ECA55a5599","data":"0x94ac7a3f000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000ebe35a9dc1aea4775b824edcc8093ba25fabf0cc000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000f4240","extraHash":"0x0","callPrefix":"0x97ebe030"}
	 *
	 *
	 * Hex valueTo hash = 19003677e3e20f389332a4855c44260767eca55a559919784e6190436a50195cfd0c5d9334f254e3017d00364df3be02f0571e06f43f9696722025842afbf7dc61b4f27a67376921b729f2000000000000000000000000000000000000000000000000000000000000000100000097ebe030000000000000000000000000000000000000000000000000000000000000000000
	 * eip1077TxnHash = 0xc6ace6dd7a28ba14961ba2543696573463bada56c0975e2627862fac91b0ab95
	 *
	 * pricer: currency code: "USD"
	 * price point ostToUsd: 1.0261864534
	 * decimal expo: 18
	 * weiPricepoint = 1026186453400000000
	 * conversion factor : 10
	 * btDecimalsString: 6
	 * fiatMultiplier: 9E-12
	 * ruleAddress : 0xEb7A84A777e6E899039eB35eA43c467493f0c93d
	 * activeSession: 0x8e6a96bC778bbAE86894F86901697c7689d7040c
	 * nonce: 2
	 * To token holder address: 0x9b2b6b72829b96d3cb332dd29fbd88616368fe07
	 * tokenholder = 0x3677e3E20F389332A4855c44260767ECA55a5599 amounts: 1000000000000000000
	 * call Data : 0x5a8870470000000000000000000000003677e3e20f389332a4855c44260767eca55a559900000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e055534400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e3dbf247439960000000000000000000000000000000000000000000000000000000000000000010000000000000000000000009b2b6b72829b96d3cb332dd29fbd88616368fe0700000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000de0b6b3a7640000
	 * raw call data: {"method":"pay","parameters":["0x3677e3E20F389332A4855c44260767ECA55a5599",["0x9b2B6B72829B96d3cB332Dd29fbd88616368Fe07"],["1000000000000000000"],"USD","1026186453400000000"]}
	 * spendingBTAmountInWei : 9000000
	 *
	 * sha3hash : 0x43b1acdb4da5c7d566c7e5bc2e295949177924224c2bfe8185a709046e32c712
	 * @param ruleMethod
	 * @param args
	 */
	getTransactionExecutableData(ruleMethod) {
		const args = Array.prototype.slice.call(arguments).slice(1);

		const methodSignature = this.getMethodSignature(ruleMethod);
		console.log(LOG_TAG, 'Method signature', methodSignature);

		if (!methodSignature) throw "method name is invalid";

		const encoderArgs = [methodSignature].concat(args);
		const encodedString = ethAbi.simpleEncode.apply(this, encoderArgs);
		return '0x' + encodedString.toString('hex');
	}

	getTransactionRawCallData(ruleMethod) {
		const args = Array.prototype.slice.call(arguments).slice(1);

		return {
			method: ruleMethod,
			parameters: args
		};
	}

	calDirectTransferSpendingLimit(amounts) {
		let  bigInteger = new BigNumber(0);
		for (let i = 0; i < amounts.length; i++) {
			bigInteger = bigInteger.plus(new BigNumber(amounts[i]));
		}
		return bigInteger.toString();
	}

	toCheckSumAddresses(addressList) {
		const checkSumAddressList = [];
		for (let i = 0; i < addressList.length; i++) {
			const address = ethUtil.toChecksumAddress(addressList[i]);
			checkSumAddressList.push(address);
		}
		return checkSumAddressList;
	}

	createEIP1077TxnHash(callData, ruleAddress, tokenHolderAddress ,nonce) {
		let txnHash;
		const oThis = this
			, toAddress = ruleAddress
			, fromAddress = tokenHolderAddress;

		const typeObject = [
			{t: 'bytes', v: Buffer.from('19', 'hex')},
			{t: 'bytes', v: Buffer.from('00', 'hex')},
			{t: 'address', v: fromAddress},
			{t: 'address', v: toAddress},
			{t: 'uint8', v: '0'},
			{t: 'bytes', v: oThis.sha3(callData)},
			{t: 'uint256', v: String(nonce)},
			{t: 'uint8', v: '0'},
			{t: 'uint8', v: '0'},
			{t: 'uint8', v: '0'},
			{t: 'bytes4', v: oThis.getCallPrefix()},
			{t: 'uint8', v: '0'},
			{t: 'bytes32', v: '0x00'}
		];

		const types = [];
		const values = [];
		for (let i=0; i<typeObject.length; i++) {
			let object = typeObject[i];
			types.push(object.t);
			values.push(object.v);
		}

		txnHash = ethAbi.soliditySHA3(types, values);
		return txnHash;
	}

	getMethodSignature(methodName) {
		const oThis = this
			, abi = this.rule.abi;

		for (let i = 0; i<abi.length; i++) {
			let entity = abi[i];
			if ('function' === entity.type && methodName === entity.name) {
				let signature = methodName;
				if (entity.inputs) {
					let inputString = entity.inputs.map(function (input) {
						return input.type
					}).join(',');
					signature = `${signature}(${inputString})`
				}

				if (entity.outputs && 0 < entity.outputs.length) {
					let outputString = entity.outputs.map(function (output) {
						return output.type
					}).join(',');
					signature = `${signature}:(${outputString})`
				}
				return signature;
			}
		}
		return null;
	}

	sha3(callData) {
		return ethUtil.keccak256(callData);
	}

	getCallPrefix() {
		const EXECUTABLE_CALL_STRING = "executeRule(address,bytes,uint256,bytes32,bytes32,uint8)";

		const hexString = '0x' + ethUtil.keccak256(EXECUTABLE_CALL_STRING).toString('hex');
		return hexString.substring(0,10);
	}

	stringToHex(tmp) {
		let str = '',
			i = 0,
			tmp_len = tmp.length,
			c;

		for (; i < tmp_len; i += 1) {
			c = tmp.charCodeAt(i);
			str += c.toString(16);
		}
		return str;
	}
}
