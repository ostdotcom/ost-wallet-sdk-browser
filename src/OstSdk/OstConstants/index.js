class OstConstants {
  constructor( args = null ) {
    this.baseUrl = args.base_url || 'https://api.stagingostproxy.com/testnet/v2/';
  }

  getBaseURL() {
    return this.baseUrl
  }
}

export default new OstConstants({});

