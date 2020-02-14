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

let LOG_TAG = "OstBaseSdk";

class OstBaseSdk {
  constructor(window){
    this.defineImmutableProperty("_window", window);

    const location = window.location
      , origin = location.origin
      , pathname = location.pathname
      , ancestorOrigins = this.getAncestorOrigins()
      , searchParams = location.search
    ;

    this.defineImmutableProperty("_location", location);
    this.defineImmutableProperty("origin", origin);
    this.defineImmutableProperty("pathname", pathname);
    this.defineImmutableProperty("ancestorOrigins", ancestorOrigins);
    this.defineImmutableProperty("searchParams", searchParams);

    this.urlParams = null;
    this.browserMessenger = null;
    this.sdkConfig = null;
    this.setURLParams();
    LOG_TAG = LOG_TAG + "-" + this.getReceiverName();
  }

  getAncestorOrigins() {
    return [''];
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

  getUrlParams() {
    return this.urlParams;
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
        // oThis.createAssist();
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

  getDocument() {
    return document;
  }

  //endregion


  /** -------------------------------------- NEW CODE ------------------------------- */
  //region - new code

  /**
   * Ensures all features required by the Sdk are supported by the browser.
   * @return {Promise} The promise resolves if all features required by the Sdk are supported by the browser.
   */
  validateBrowser() {
		const oThis = this
    ;

		oThis.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

		//Check for DB
		if(!oThis.indexedDB) {
		  let ostError = new OstError('obsdk_pr_vb_1', EC.BROWSER_VALIDATION_FAILED);
			console.error(LOG_TAG, "Browser does not support IndexedDB");
			return Promise.reject( ostError );
		}

		//Check for Crypto object
		let cryptoNotSupported = (
		  !window.crypto ||
      !window.crypto.subtle ||
      !window.crypto.subtle.encrypt || !window.crypto.subtle.decrypt ||
			!window.crypto.subtle.sign || !window.crypto.subtle.verify ||
      !window.crypto.getRandomValues
    );

		if(cryptoNotSupported) {
			let ostError = new OstError('obsdk_pr_vb_2', EC.BROWSER_VALIDATION_FAILED);
			console.error(LOG_TAG, "Browser does not support crypto and its apis");
			return Promise.reject( ostError );
    }

		//Check for postMessage
		if(!window.postMessage) {
			let ostError = new OstError('obsdk_pr_vb_3', EC.BROWSER_VALIDATION_FAILED);
			console.error(LOG_TAG, "Browser does not support postMessage");
			return Promise.reject( ostError );
		}

    //Check for encryption and decryption
		return oThis.validateCryptoEncryptDecrypt()
			.then(() => {
				return Promise.resolve(true);
			})
			.catch((err) => {
				let ostError = new OstError('obsdk_pr_vb_4', EC.BROWSER_VALIDATION_FAILED);
				console.error("Browser does not support crypto's encryption or decryption algorithm", err);
				return Promise.reject(ostError);
			});
  }

	validateCryptoEncryptDecrypt() {
		const oThis = this
			, algoKeyGen = {
				name: 'AES-GCM',
				length: 256
			}
			, keyUsages = [
				'encrypt',
				'decrypt'
			]
		;

		let iv = window.crypto.getRandomValues(new Uint8Array(12));
		let algo = {
			name: 'AES-GCM',
			iv: iv,
			tagLength: 128
		};
		let aesKey;

		//generate key
		return window.crypto.subtle.generateKey(algoKeyGen, false, keyUsages)
			.then(function (key) {
			  aesKey = key;
			  //encrypt using key
        let dataToEncryptAB = OstHelpers.strToArrayBuffer("data");
				return window.crypto.subtle.encrypt(
					algo,
					aesKey,
					dataToEncryptAB);
			}).then(function (encryptedData) {
				//decrypt using key
				return window.crypto.subtle.decrypt(
					algo,
					aesKey,
					encryptedData);
      });
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
        let downstreamEndpoint = oThis.getDownstreamEndpoint();
        if (downstreamEndpoint) {
          let url = new URL(downstreamEndpoint);
          oThis.setDownStreamOrigin( url.origin );
        }

        return oThis.waitForIframeLoad(signedUrl);
      })
  }

  waitForIframeLoad(signedUrl) {
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
    const iframeLoadEventListener = (event) => {
      try {
        console.log(LOG_TAG, oThis.getReceiverName(), " :: Downstream Iframe loaded! :: ", _isIframeLoaded);
        if ( _isIframeLoaded ) {
          // Already received load event. Something is not right.
          console.warn("Unexpectedly received load event more than once from downstream iframe. Destroying the iframe. The sdk shall not work any more");
          oThis.destroySelfIfRequired();
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

    downstreamIframe.addEventListener('load', iframeLoadEventListener);

    setTimeout(() => {
      if ( _isIframeLoaded ) {
        return;
      }

      // Mark as timedout.
      _isIframeTimedout = true;

      // Destory the downstream iframe.
      oThis.destroySelfIfRequired();

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
          console.log(LOG_TAG, ":: init :: calling setSdkConfig");
          return oThis.setSdkConfig( sdkConfig );
        })

        // Create Browser Messenger Object
        .then( () => {
          console.log(LOG_TAG, ":: init :: calling createBrowserMessengerObject");
          return oThis.createBrowserMessengerObject();
        })

        // Allow sub-clases to do tasks on browserMessenger creation.
        .then( () => {
          console.log(LOG_TAG, ":: init :: calling onBrowserMessengerCreated");
          return oThis.onBrowserMessengerCreated( this.browserMessenger );
        })

        // Init db instance
        .then(() => {
         console.log(LOG_TAG, ":: init :: calling initDb");
          return oThis.initDBInstance();
        })

        // Subscribe to on setup complete
        .then( () => {
          console.log(LOG_TAG, ":: init :: calling createAssist");
          return oThis.createAssist() || true;
        })

        // Create Downstream Iframe
        .then( () => {
          console.log(LOG_TAG, ":: init :: calling createDownstreamIframe");
          return oThis.createDownstreamIframe();
        })

        // Wait for Downstream Iframe Initialization.
        .then( () => {
          console.log(LOG_TAG, ":: init :: calling waitForDownstreamInitialization");
          return oThis.waitForDownstreamInitialization();
        })

        //Mark Sdk as init.
        .then( () => {
          console.log(LOG_TAG, ":: init :: calling markSdkInitialized");
          oThis.markSdkInitialized();
          return true;
        })

        // Inform Upstream
        .then( () => {
          if ( oThis.hasUpstream() ) {
            console.log(LOG_TAG, ":: init :: calling sendInitialzedMessage");
            return oThis.sendInitialzedMessage();
          }
          return true;
        })
        .catch((err) => {
          try  {
            oThis.sendInitializationFailed();
            setTimeout(() => {
              oThis.destroySelfIfRequired();
            },1000);
          }catch(otherErr) {
            console.log(LOG_TAG, ":: init :: failed to destroy iframe");
            console.error(otherErr);
          }
          // Promise should NOT resolve. init has failed.
          throw err;
        });
  }

  initDBInstance() {
    return Promise.resolve();
  }

  hasUpstream() {
    return true;
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
    this.defineImmutableProperty("browserMessenger", messenger);
    return this.browserMessenger.perform();
  }

  /**
   * onBrowserMessengerCreated - An empty method for derived class to over-ride.
   * @param  {OstBrowserMessenger} browserMessenger instance.
   * @return {Promise} Dericed class must return a promise.
   */
  onBrowserMessengerCreated( browserMessenger ) {
    const oThis = this;
    if ( !oThis.hasUpstream() ) {
      console.log(LOG_TAG, ":: onBrowserMessengerCreated :: hasUpstream returned false");
      return Promise.resolve();
    }

    console.log(LOG_TAG, ":: onBrowserMessengerCreated :: calling setUpstreamPublicKey");

    // Set up stream public key
    return oThis.setUpstreamPublicKey()

      // Verify Iframe Init Data - whatever that means.
      .then(() => {
        console.log(LOG_TAG, ":: onBrowserMessengerCreated :: calling verifyIframeInitData");
        return oThis.verifyIframeInitData();
      })

      // Do post verification tasks.
      .then((isVerified) => {
        if (!isVerified) {
          console.log(LOG_TAG, ":: onBrowserMessengerCreated :: isVerified is false");
          throw new OstError('os_i_p_1', 'INVALID_VERIFIER');
        }

        console.log(LOG_TAG, ":: onBrowserMessengerCreated :: calling sendPublicKey");
        oThis.sendPublicKey();
      })

      // Catch the error and throw the erro.
      // Remove the public key.
      .catch((err) => {
        console.error(LOG_TAG, ":: onBrowserMessengerCreated :: err", err);
        console.log(LOG_TAG, ":: onBrowserMessengerCreated :: calling removeUpstreamPublicKey");
        oThis.browserMessenger.removeUpstreamPublicKey();

        if (err instanceof OstError) {
          throw err;
        }
        throw new OstError('os_i_p_1', 'SKD_INTERNAL_ERROR', err);
      });
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
   * destroyDownstreamIframe - Removes downstream iframe from the document.
   * @return {null} null.
   */
  destroyDownstreamIframe() {
    const oThis = this;
    if ( downstreamIframe ) {
      try {
        downstreamIframe.src = 'about:blank';
        oThis.getDocument().body.removeChild( downstreamIframe );
      } catch( err ) {
        //ignore.
      }
    }
    downstreamIframe = null;
  }

  destroySelfIfRequired() {
    const oThis = this;
    console.log(LOG_TAG, " :: destroySelfIfRequired :: ", this.getReceiverName());
    if ('OstWalletSdk' !== this.getReceiverName() || oThis.hasUpstream()) {
      console.log(LOG_TAG, " :: destroySelf", this.getReceiverName());
      oThis.destroyDownstreamIframe();
      oThis.getDocument().location = 'about:blank';
    }else {
      console.log(LOG_TAG, " :: destroyDownstreamIframe ", this.getReceiverName());
      oThis.destroyDownstreamIframe();
    }
  }

  getUpstreamReceiverName() {
    const error = new Error("getUpstreamReceiverName needs to be overridden by derived class.");
    const ostError = OstError.sdkError(error, "obsdk_wfhsc_1");
  }

  waitForDownstreamInitialization() {
    const oThis = this;

    if ( oThis.isDownstreamInitialized() ) {
      // Downstream is already initialized.
      return Promise.resolve( true );
    }

    let isTimedout = false;
    let _resolve, _reject;
    oThis.onDownstreamInitialzedCallback = () => {
      if ( isTimedout ) {
        // We have already rejected the promise.
        // Do nothing.
        return;
      }
      oThis.markDownstreamInitialized();
      _resolve( true );
    };

    setTimeout(() => {
      if ( oThis.isDownstreamInitialized() ) {
        // Do nothing. all good.
        return;
      }
      isTimedout = true;
      let error = new OstError("obsdk_wfdsi_1", EC.SDK_INITIALIZATION_TIMEDOUT);
      _reject( error );
    }, oThis.getDownstreamInitializationTimeout());

    return new Promise((resolve, reject) => {
      _resolve = resolve;
      _reject = reject;
    });
  }

  getDownstreamInitializationTimeout() {
    return 5000;
  }

  sendInitialzedMessage() {
    const oThis = this;

    if ( !oThis.hasUpstream() ) {
      return Promise.resolve( true );
    }

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

  sendInitializationFailed() {
    const oThis = this;

    let ostMessage = new OstMessage();
    ostMessage.setFunctionName( "onDownstreamInitializationFailed" );
    ostMessage.setReceiverName( oThis.getUpstreamReceiverName() );

    return oThis.browserMessenger.sendMessage(ostMessage, SOURCE.UPSTREAM)
  }

  onDownstreamInitializationFailed(args) {
    const oThis = this;

    oThis.destroySelfIfRequired();
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
