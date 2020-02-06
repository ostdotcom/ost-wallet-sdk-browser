import OstHelpers from "./OstHelpers";
import OstURLHelpers from "./OstHelpers/OstUrlHelper";
import OstError from "./OstError";
import EC from "./OstErrorCodes";
import {OstBrowserMessenger, SOURCE} from "./OstBrowserMessenger";
import '../common-css/sdk-stylesheet.css';

let hasBeenInitialized = false;
class OstBaseSdk {
  constructor(origin, pathname, ancestorOrigins, searchParams){
    this.defineImmutableProperty("origin", origin);
    this.defineImmutableProperty("pathname", pathname);
    this.defineImmutableProperty("ancestorOrigins", ancestorOrigins);
    this.defineImmutableProperty("searchParams", searchParams);

    this.urlParams = null;
    this.browserMessenger = null;
    this.sdkConfig = null;
    this.setURLParams();
  }

  isSdkInitialized() {
    return hasBeenInitialized;
  }

  markSdkInitialized() {
    hasBeenInitialized = true;
  }



  setURLParams() {
    if (this.searchParams) {
      this.urlParams = OstURLHelpers.getParamsFromURL(this.searchParams);
    }
  }


  onSetupComplete (args) {
    console.log("OstBaseSdk :: onSetupComplete :: ", this.getReceiverName(), " :: ",  args);
    this.browserMessenger.setDownstreamPublicKeyHex( args.publicKeyHex );
  };

  //TODO: To be Deprecated. 
  //@Deprecated
  perform() {
    let oThis = this;
    
    return oThis.createBrowserMessengerObject()
      .then(() => {
        oThis.subscribeOnSetupComplete();
      })
  }

  //Setter
  getReceiverName() {
    return '';
  }

  //TODO: To be Deprecated. 
  //@Deprecated
  setUpstreamOrigin() {
    if (this.ancestorOrigins) {
      let ancestorOrigins = this.ancestorOrigins;
      let upstreamOrigin = ancestorOrigins[0];
      this.browserMessenger.setUpStreamOrigin(upstreamOrigin);
    }
  }

  getUpstreamOrigin() {
    if (this.ancestorOrigins) { 
      return this.ancestorOrigins[0];
    }
    return null;
  }

  setDownStreamWindow( window ) {
    this.browserMessenger.setDownStreamWindow( window );
  }

  setDownStreamOrigin ( origin ) {
    this.browserMessenger.setDownStreamOrigin( origin );
  }


  getPublicKeyHex () {
    return this.browserMessenger.getPublicKeyHex();
  }

  signDataWithPrivateKey(stringToSign) {
    return this.browserMessenger.getSignature(stringToSign)
      .then((signatureBytes) => {
        return OstHelpers.byteArrayToHex(signatureBytes);
      });    
  }

  setUpstreamPublicKey() {
    let upstreamPublicKeyHex = this.urlParams.publicKeyHex;

    if (!upstreamPublicKeyHex) {
      throw new OstError('os_i_sppk_1', 'INVALID_UPSTREAM_PUBLIC_KEY');
    }
    return this.browserMessenger.setUpstreamPublicKeyHex( upstreamPublicKeyHex )
  }

  verifyIframeInitData() {
    const signature = this.urlParams.signature;
    let pageParams = Object.assign({}, this.urlParams);
    OstURLHelpers.deleteSignature(pageParams);

    let selfUrl = this.origin+ this.pathname;
    let url = OstURLHelpers.getStringToSign(selfUrl, pageParams);

    return this.browserMessenger.verifyIframeInit(url, signature);
  }

  setDownstreamPublicKeyHex( signer ) {
    return this.browserMessenger.setDownstreamPublicKeyHex(signer)
  }

  sendMessage(ostMessage, receiverSource) {
    return this.browserMessenger.sendMessage(ostMessage, receiverSource)
  }


  //Register listener
  registerOnce(type, callback) {
    this.browserMessenger.registerOnce(type, callback);
  }

  register(type, callback) {
    this.browserMessenger.register(type, callback);
  }

  unRegister(type, callback) {
    this.browserMessenger.unRegister(type, callback);
  }

  //region - revist these methods

  subscribeOnSetupComplete() {
    this.browserMessenger.subscribe(this, this.getReceiverName());
    return Promise.resolve( true );
  }

  //endregion


  //region - new code
  createDownstreamIframe() {
    const oThis = this;
    let iframeCssClassName = null;
    if ( oThis.sdkConfig.debug ) {
      iframeCssClassName = oThis.getDownstreamIframeCssClassName();
    } else {
      iframeCssClassName = OstBaseSdk.getHiddenIframeCssClassName();
    }

    return oThis.getDownstreamIframeUrl()
      .then( ( signedUrl ) => {
        const iframeObject = document.createElement('iframe');
        iframeObject.setAttribute('src', signedUrl);
        iframeObject.className = iframeCssClassName;
        document.body.appendChild( iframeObject );

        iframeObject.onload = () => {
          console.log("iframeObject.onload called");
        };

        iframeObject.onerror = () => {
          console.log("iframeObject.onerror called");
        };


        iframeObject.addEventListener('error', () => {
          console.log("iframeObject - error event fired");
        });

        iframeObject.addEventListener('load', () => {
          console.log("iframeObject - load event fired");
        });
      })
  } 

  getDownstreamIframeUrl() {
    const error = new Error("getDownstreamIframeUrl needs to be overridden by derived class.");
    const ostError = OstError.sdkError(error, "obsdk_gdiu_1");
    return Promise.reject( ostError );
  }

  getDownstreamIframeCssClassName() {
    return OstBaseSdk.getHiddenIframeCssClassName();
  }

  static getHiddenIframeCssClassName() {
    return "ostsdk-iframe-style";
  }
  //endregion


  /**
   * getDefaultConfig provide the default configuration supported by the sdk
   * @return {Object} Default configuration.
   */
  static getDefaultConfig() {
    return {
      "api_endpoint"        : null,
      "sdk_endpoint"        : null,
      "debug"               : false
    };
  }

  /**
   * Method to initialize the sdk
   * @param  {Object}  sdkConfig - See output of OstBaseSdk.getDefaultConfig() for all config options. 
   * @return {Promise} Promise that resolves if init is successful.
   */
  init( sdkConfig ) { 
    let oThis = this;
    if ( oThis.isSdkInitialized() ) {
      return Promise.reject( new OstError("obsdk_init_1", EC.SDK_ALREADY_INITIALIZED) );
    }

    // Validate Browser
    return oThis.validateBrowser()

        //Validate Sdk Config
        .then( () => {
          return oThis.setSdkConfig( sdkConfig );
        })
        
        // Create Browser Messenger Object
        .then( () => {
          return oThis.createBrowserMessengerObject();
        })
        
        // Subscribe to on setup complete
        .then( () => {          
          return oThis.subscribeOnSetupComplete();
        })

        // Create Downstream Iframe
        .then( () => {
          return oThis.createDownstreamIframe();
        })
  }

  /**
   * Validates and sets sdk config.
   * @param {Object} sdkConfig - see output of getDefaultConfig.
   */
  setSdkConfig( sdkConfig ) {
    if ( !sdkConfig ) {
      sdkConfig = {};
    }
    let finalConfig = OstBaseSdk.getDefaultConfig();
    Object.assign( finalConfig, sdkConfig);
    
    // Validate Config
    if ( !this.isValidHttpsUrl(finalConfig.api_endpoint) ) {
      let error = new OstError("obsdk_setSdkConfig_1", EC.INVALID_INITIALIZATION_CONFIGURATION, {
        "api_endpoint": finalConfig.api_endpoint
      })
      return Promise.reject( error );
    }

    if ( !this.isValidHttpsUrl(finalConfig.sdk_endpoint) ) {
      let error = new OstError("obsdk_setSdkConfig_2", EC.INVALID_INITIALIZATION_CONFIGURATION, {
        "sdk_endpoint": finalConfig.sdk_endpoint
      })
      return Promise.reject( error );
    }

    if ( "boolean" !== typeof finalConfig.debug ) {
      finalConfig.debug = false;
    }

    // Make config immutable.
    finalConfig = this.shallowCloneToImmutableObject( finalConfig );

    // store the sdk-config.
    this.defineImmutableProperty("sdkConfig", finalConfig);

    return Promise.resolve( this.sdkConfig );
  }


  /**
   * Method to create an instance of browserMessenger
   * @return {Promise} - resolves if browser initialization is successfull.
   */
  createBrowserMessengerObject () {
    const messenger = new OstBrowserMessenger( this.getReceiverName(), this.getUpstreamOrigin() );
    this.defineImmutableProperty("browserMessenger", messenger)
    return this.browserMessenger.perform();
  }

  /**
   * Validates if given url is a valid https url or not.
   * @param  {String}  urlString - Url String.
   * @return {Boolean}     returns false if invalid https url is provided.
   */
  isValidHttpsUrl(urlString) {
    var pattern = new RegExp('^(https:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(urlString);
  }

  //TODO: Ensure all features required by the sdk are supported by the browser.
  /**
   * Ensures all features required by the Sdk are supported by the browser.
   * @return {Promise} The promise resolves if all features required by the Sdk are supported by the browser.
   */
  validateBrowser() {
    return Promise.resolve( true );
  }

  /**
   * shallowCloneToImmutableObject - shallow clones the input object such that properties of returned objet are immutable.
   * @param  {Object} input Object to be cloned.
   * @return {Object}       Shallow cloned object.
   */
  shallowCloneToImmutableObject( input ) {
    const output = {};
    for( let k in input ) {
      let v = input[k];
      Object.defineProperty(output, k, {
        "value": v,
        "writable": false,
        "enumerable": true
      })
    }
    return output;
  }


  /**
   * defineImmutableProperty defines the property on 'this' scope, sets the value such that property is immutable.
   * @param  {String} propName Name of the property to be defined.
   * @param  {Any} val         Value of the property to be set.
   */
  defineImmutableProperty(propName, val) {
    Object.defineProperty( this, propName, {
      "value": val,
      "writable": false,
      "enumerable": true
    })
  }


}

export default OstBaseSdk
