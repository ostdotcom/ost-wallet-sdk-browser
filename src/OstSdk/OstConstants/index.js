class OstConstants {
  constructor( args = null ) {
    this.baseUrl = args.base_url || 'https://api.stagingostproxy.com/testnet/v2/';
    this.blockGenerationTime = args.block_generation_time || 3;
  }

  getBaseURL() {
    return this.baseUrl
  }

  getBlockGenerationTime() {
    return this.blockGenerationTime * 1000;
  }
}

export default new OstConstants({});

