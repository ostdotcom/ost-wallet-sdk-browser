import {OstBaseEntity, STORES} from "./OstBaseEntity";

class OstRule extends OstBaseEntity {

  constructor(jsonObject) {
    super(jsonObject)
  }

  getIdKey() {
    return 'name';
  }

  getType() {
    return 'rule';
  }


  static getById(name) {
    const rule = new OstRule(
      {name: name}
    );
    return rule.sync();
  }

  static parse(data) {
    const ostRule = new OstRule(data);
    return ostRule.forceCommit();
  }

  getStoreName() {
    return STORES.OST_RULE;
  }

  getAbi() {
    return this.getData().abi;
  }

  getAddress() {
    return this.getData().address;
  }

  getName() {
    return this.getData().name;
  }
}

export default OstRule;
