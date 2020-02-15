import {OstBaseEntity, STORES} from "./OstBaseEntity";

class OstToken extends OstBaseEntity {

  static STATUS = {
    CREATED: 'CREATED'
  };

  constructor(jsonObject) {
    super(jsonObject)
  }

  static init(tokenId) {
    const token = new OstToken(
      {id: tokenId, status: OstToken.STATUS.CREATED}
    );
    return token.forceCommit();
  }

  getIdKey() {
    return 'id';
  }

  getType() {
    return 'token';
  }


  static getById(tokenId) {
    const token = new OstToken(
      {id: tokenId}
    );
    return token.sync();
  }

  static parse(data) {
    const ostToken = new OstToken(data);
    return ostToken.forceCommit();
  }

  getStoreName() {
    return STORES.OST_TOKEN;
  }

  getAuxiliaryChainId() {
    let auxiliaryChains = this.getData().auxiliary_chains;
    if (!auxiliaryChains || auxiliaryChains.length < 1) {
      return null
    }
    let auxiliaryChain = auxiliaryChains[0];
    return String(auxiliaryChain.chain_id);
  }

  getDecimals() {
    return parseInt(this.getData().decimals);
  }

  getBaseToken() {
    return String(this.getData().base_token);
  }
}
export default OstToken;
