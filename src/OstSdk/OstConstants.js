const DEFAULT_API_ORIGIN = "https://api.ost.com";
const DEFAULT_API_VERSION = "v2";

class OstConstants {
  constructor( args = null ) {
    this.apiEndpoint = null;
    this.apiEnvironment = null;
    this.blockGenerationTime = args.block_generation_time || 3;
  }

  getApiEndpoint() {
    return this.apiEndpoint;
  }

  getApiOrigin() {
    if (typeof WP_OST_BROWSER_SDK_PLATFORM_API_ORIGIN === 'string' && WP_OST_BROWSER_SDK_PLATFORM_API_ORIGIN ) {
      return WP_OST_BROWSER_SDK_PLATFORM_API_ORIGIN;
    }
    return DEFAULT_API_ORIGIN;
  }

  getBlockGenerationTime() {
    return this.blockGenerationTime * 1000;
  }

  setApiEnvironment( apiEnvironment ) {
    const apiOrigin   = this.getApiOrigin();
    const apiVersion  = DEFAULT_API_VERSION;
    const apiEndpoint = `${apiOrigin}/${apiEnvironment}/${apiVersion}`;

    this.defineImmutableProperty("apiEnvironment", apiEnvironment);
    this.defineImmutableProperty("apiEndpoint", apiEndpoint);

    console.log("||RAC||", "apiEndpoint defined as", apiEndpoint);
  }

  defineImmutableProperty(propName, val) {
    Object.defineProperty( this, propName, {
      "value": val,
      "writable": false,
      "enumerable": true
    })
  }
}

export default new OstConstants({});

