import OstHelpers from "./OstHelpers";
import OstURLHelpers from "./OstHelpers/OstUrlHelper";
import OstError from "./OstError";
import EC from "./OstErrorCodes";
import {OstBrowserMessenger, SOURCE} from "./OstBrowserMessenger";
import OstMessage from './OstMessage';
import '../common-css/sdk-stylesheet.css';

let hasBeenInitialized = false;
let hasDownstreamBeenInitialized = false;
let downstreamIframe = null;

const LOG_TAG = "OstBaseSdk";

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

  isDownstreamInitialized() {
    return hasDownstreamBeenInitialized;
  }

  markSdkInitialized() {
    hasBeenInitialized = true;
  }


  markDownstreamInitialized() {
    hasDownstreamBeenInitialized = true;
  }



  setURLParams() {
    if (this.searchParams) {
      this.urlParams = OstURLHelpers.getParamsFromURL(this.searchParams);
    }
  }


  onSetupComplete (args) {
    console.log("OstBaseSdk :: onSetupComplete :: ", this.getReceiverName(), " :: ",  args);
    return this.browserMessenger.setDownstreamPublicKeyHex( args.publicKeyHex );
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

    const oThis = this;
    return this.browserMessenger.verifyIframeInit(url, signature)
      .then((verified) => {
        if (!verified) {
          return verified;
        }
        return oThis.isWhiteListedParent()
      });
  }

  isWhiteListedParent() {
    const oThis = this
      , ancestorOrigin = oThis.ancestorOrigins[0]
    ;
    console.log(LOG_TAG, "AncestorOrigin of this iframe", ancestorOrigin);

    return oThis.getWhiteListedUrls()
      .then((whiteListedUrls) => {
        if (!Array.isArray(whiteListedUrls)) {
          throw "whiteListedUrls is not an array"
        }
        for (let i=0; i < whiteListedUrls.length; i++) {
          let urlObject = whiteListedUrls[i];
          if ( ancestorOrigin === urlObject.domain ) {
						console.log(LOG_TAG, "White listed url found", ancestorOrigin,urlObject.domain );
						return true
          }
        }
				console.log(LOG_TAG, "White listed url NOT found", ancestorOrigin);
        return false;
      })
  }

	getWhiteListedUrls() {
    //Todo: should come from Mappy Sdk endpoint
    return Promise.resolve([
			{
				"id": 1,
				"uts": 1234567890,
				"domain": "https://devmappy.com"
			},
			{
				"id": 2,
				"uts": 1234567890,
				"domain": "https://sdk-devmappy.ostsdkproxy.com"
			}
		]);
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

  getDocument() {
    return document;
  }

  //endregion


  /** -------------------------------------- NEW CODE ------------------------------- */
  //region - new code

  //TODO: Ensure all features required by the sdk are supported by the browser.
  /**
   * Ensures all features required by the Sdk are supported by the browser.
   * @return {Promise} The promise resolves if all features required by the Sdk are supported by the browser.
   */
  validateBrowser() {
    return Promise.resolve( true );
  }

  createDownstreamIframe() {
    const oThis = this;
    let iframeCssClassName = null;
    if ( oThis.sdkConfig.debug ) {
      iframeCssClassName = oThis.getDownstreamIframeCssClassName();
    } else {
      iframeCssClassName = OstBaseSdk.getHiddenIframeCssClassName();
    }

    oThis.onDownstreamInitialzedCallback = () => {
      oThis.markDownstreamInitialized();
    };

    return oThis.getDownstreamIframeUrl()
      .then( ( signedUrl ) => {
        downstreamIframe = document.createElement('iframe');
        downstreamIframe.setAttribute('src', signedUrl);
        downstreamIframe.className = iframeCssClassName;
        oThis.getDocument().body.appendChild( downstreamIframe );
        // Set down-stream contentWindow.
        oThis.setDownStreamWindow( downstreamIframe.contentWindow );
        // Set down-stream url.
        oThis.setDownStreamOrigin( oThis.getDownstreamEndpoint() );
        return oThis.waitForIframeLoad();
      })
  }

  waitForIframeLoad() {
    const oThis = this;

    // Create a promise.
    let _resolve  = null;
    let _reject   = null;
    let iframeLoadPromise = new Promise((resolve, reject) => {
      _resolve  = resolve;
      _reject   = reject;
    });

    let _isIframeLoaded = false;
    let _isIframeTimedout = false;
    let ifrmLoadEventListner = (event) => {
      try {
        console.log("Downstream Iframe loaded!");
        if ( _isIframeLoaded ) {
          // Already received load event. Something is not right.
          console.warn("Unexpectedly received load event more than once from downstream iframe. Destroying the iframe. The sdk shall not work any more");
          oThis.destoryDownstreamIframe();
          return;
        }

        if ( _isIframeTimedout ) {
          // We have already declared init as failed.
          // ignore it.
          return;
        }

        // Mark as loaded.
        _isIframeLoaded = true;
        _resolve( true );
      } catch( e ) {
        // Unexpected Error.
        let ostError = OstError.sdkError(e, "obsdk_wfifl_ilel_1");
        _reject( ostError );
      }
    };

    downstreamIframe.addEventListener('load', ifrmLoadEventListner);

    setTimeout(() => {
      if ( _isIframeLoaded ) {
        return;
      }

      // Mark as timedout.
      _isIframeTimedout = true;

      // Destory the downstream iframe.
      oThis.destoryDownstreamIframe();

      // Reject the promise.
      let errorInfo = {
        "reason": "Failed to load downstream iframe.",
        "iframeUrl": signedUrl
      };
      let error = new OstError("obsdk_wfifl_st_1", EC.SDK_INITIALIZATION_TIMEDOUT, errorInfo);
      _reject( error );

    }, oThis.getDownstreamIframeLoadTimeout());
    return iframeLoadPromise;
  }

  waitForIframeHandshake(_resolve, _reject) {
    _resolve();
  }
  //endregion


  /**
   * ------------------------- REVIEWED CODE ------------------------- *
   */

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

        // Allow sub-clases to do tasks on browserMessenger creation.
        .then( () => {
          return oThis.onBrowserMessengerCreated( this.browserMessenger );
        })

        // Subscribe to on setup complete
        .then( () => {
          return oThis.subscribeOnSetupComplete();
        })

        // Create Downstream Iframe
        .then( () => {
          return oThis.createDownstreamIframe();
        })

        // Wait for Downstream Iframe Initialization.
        .then( () => {
          return oThis.waitForDownstreamInitialization();
        })

        //Mark Sdk as init.
        .then( () => {
          oThis.markSdkInitialized();
          return true;
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
   * onBrowserMessengerCreated - An empty method for derived class to over-ride.
   * @param  {OstBrowserMessenger} browserMessenger instance.
   * @return {Promise} Dericed class must return a promise.
   */
  onBrowserMessengerCreated( browserMessenger ) {
    return Promise.resolve();
  }

  /**
   * getDownstreamIframeLoadTimeout - time to wait for downstream's iframe's load event.
   * @return {Number} time to wait for iframe's load event.
   */
  getDownstreamIframeLoadTimeout() {
    return 30 * 1000; //30 seconds.
  }

  /**
   * getHandshakeTimeout - time to wait for handshake to be completed once the iframe has been loaded.
   * @return {Number} time to wait for handshake to be completed once the iframe has been loaded.
   */
  getHandshakeTimeout() {
    return 5 * 1000; //5-seconds.
  }

  /**
   * getDownstreamIframeUrl - returns the down-stream iframe's signed url.
   * @return {String} returns the down-stream iframe's signed url.
   */
  getDownstreamIframeUrl() {
    const oThis = this;
    const downstreamEndpoint = this.getDownstreamEndpoint();
    const params = {
      publicKeyHex: oThis.getPublicKeyHex(),
      sdkConfig: this.sdkConfig
    };
    const stringToSign = OstURLHelpers.getStringToSign(downstreamEndpoint, params );

    // Sign the data.
    return oThis.signDataWithPrivateKey(stringToSign)
      // Return the url.
      .then((signature) => {
        return OstURLHelpers.appendSignature(stringToSign, signature);
      })
  }

  /**
   * getDownstreamEndpoint - returns the down-stream iframe's endpoint. Derived classes MUST over-ride this method.
   * @return {String} returns the down-stream iframe's endpoint.
   */
  getDownstreamEndpoint() {
    const error = new Error("getDownstreamEndpoint needs to be overridden by derived class.");
    const ostError = OstError.sdkError(error, "obsdk_gdsep_1");
    return Promise.reject( ostError );
  }

  /**
   * getDownstreamIframeCssClassName - class name to be applied to the down-stream iframe. Derived classes should over-ride this method.
   * @return {String} return css class name.
   */
  getDownstreamIframeCssClassName() {
    return OstBaseSdk.getHiddenIframeCssClassName();
  }

  /**
   * getHiddenIframeCssClassName - Default class name to be applied to the down-stream iframe.
   * @return {String} return css class name.
   */
  static getHiddenIframeCssClassName() {
    return "ostsdk-iframe-style";
  }

  /**
   * destoryDownstreamIframe - Removes downstream iframe from the document.
   * @return {null} null.
   */
  destoryDownstreamIframe() {
    if ( downstreamIframe ) {
      try {
        getDocument().body.removeChild( downstreamIframe );
      } catch( err ) {
        //ignore.
      }
    }
    downstreamIframe = null;
  }



  getUpstreamReceiverName() {
    const error = new Error("getUpstreamReceiverName needs to be overridden by derived class.");
    const ostError = OstError.sdkError(error, "obsdk_wfhsc_1");
  }

  waitForDownstreamInitialization() {
    const error = new Error("waitForDownstreamInitialization needs to be overridden by derived class.");
    const ostError = OstError.sdkError(error, "obsdk_wfhsc_1");
    return Promise.reject( ostError );
  }

  triggerDownstreamInitialzed() {
    const oThis = this;
    
    let ostMessage = new OstMessage();
    ostMessage.setFunctionName( "onDownstreamInitialzed" );
    ostMessage.setReceiverName( oThis.getUpstreamReceiverName() );
    // ostMessage.setArgs({
    //   publicKeyHex: this.browserMessenger.getPublicKeyHex()
    // });
    return oThis.browserMessenger.sendMessage(ostMessage, SOURCE.UPSTREAM)
  }

  onDownstreamInitialzed(...args) {
    const oThis = this;
    if ( oThis.onDownstreamInitialzedCallback ) {
      oThis.onDownstreamInitialzedCallback(...args);
    }
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
