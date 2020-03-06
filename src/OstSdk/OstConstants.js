class OstConstants {
  constructor(args = null) {
    this.baseUrl = null;
    this.blockGenerationTime = args.block_generation_time || 3;
  }

  getBaseURL() {
    return this.baseUrl
  }

  getBlockGenerationTime() {
    return this.blockGenerationTime * 1000;
  }

  setBaseURL(url) {
    this.defineImmutableProperty("baseUrl", url);
  }

  defineImmutableProperty(propName, val) {
    Object.defineProperty(this, propName, {
      "value": val,
      "writable": false,
      "enumerable": true
    })
  }
}

export default new OstConstants({});

