String.prototype.trimRight = function(charlist) {
  if (charlist === undefined)
    charlist = "\s";

  return this.replace(new RegExp("[" + charlist + "]+$"), "");
};

const sdkVersion = process.env.OST_BROWSER_SDK_VERSION || "";

let OstSdkIframeUrl = process.env.OST_BROWSER_SDK_IFRAME_ORIGIN;
OstSdkIframeUrl = OstSdkIframeUrl.trimRight("/");

if ( sdkVersion && sdkVersion.length ) {
    OstSdkIframeUrl = OstSdkIframeUrl + "/" + sdkVersion;
}
OstSdkIframeUrl = OstSdkIframeUrl.trimRight("/");
OstSdkIframeUrl = OstSdkIframeUrl + "/index.html";



const entry = {
  'mappy-js/users'          : './src/Mappy/js/users-new.js',
  'mappy-js/login'          : './src/Mappy/js/login.js',
  'mappy-js/json-api'       : './src/Mappy/js/json-api-new.js',
  'mappy-js/sdk-getters'    : './src/Mappy/js/sdk-getter-new.js',
  'mappy-js/workflow'       : './src/Mappy/js/workflow.js'
};

const produtionHtmlPlugins = [
    /* http://devmappy.com/index.html  */
    {
        title: "Login - Demo Mappy Web UI",
        template: "./src/Mappy/html/login.html",
        inject: true,
        filename: "../mappy/index.html",
        chunks: ['OstWalletSdk', 'mappy-js/login']
    },

    /* http://devmappy.com/login.html  */
    {   
        title: "Login - Demo Mappy Web UI",
        template: "./src/Mappy/html/login.html",
        inject: true,
        filename: "../mappy/login.html",
        chunks: ['OstWalletSdk', 'mappy-js/login']
    },

    /* http://devmappy.com/users.html  */
    {
        title: "Users List - Demo Mappy Web UI",
        template: "./src/Mappy/html/users-new.html",
        inject: true,
        filename: "../mappy/users.html",
        chunks: ['OstWalletSdk', 'mappy-js/users']
    },

    /* http://devmappy.com/sdk-getters.html  */
    {
        title: "Sdk Getter Methods - Demo Mappy Web UI",
        template: "./src/Mappy/html/sdk-getters-new.html",
        inject: true,
        filename: "../mappy/sdk-getters.html",
        chunks: ['OstWalletSdk', 'mappy-js/sdk-getters']
    },

    /* http://devmappy.com/json-api.html  */
    {
        title: "JSON API Methods - Demo Mappy Web UI",
        template: "./src/Mappy/html/json-api-new.html",
        inject: true,
        filename: "../mappy/json-api.html",
        chunks: ['OstWalletSdk', 'mappy-js/json-api']
    }
];

let devHtmlPlugins = [];
// Copy and modify prod config.
let len = produtionHtmlPlugins.length;
while(len--) {
  let conf = produtionHtmlPlugins[ len ];
  // Clone it.
  conf = Object.assign({}, conf);

  // Process it.
  if ( conf.filename && conf.filename.startsWith("../") ) {
    conf.filename = conf.filename.replace("../", "");
  }

  // Add it.
  devHtmlPlugins.push( conf )
};

const webpackDefinations = {
    "OST_BROWSER_SDK_PLATFORM_API_ENDPOINT": JSON.stringify(process.env.OST_BROWSER_SDK_PLATFORM_API_ENDPOINT),
    "OST_BROWSER_SDK_IFRAME_URL": JSON.stringify(OstSdkIframeUrl),
    "DEMO_MAPPY_UI_API_ENDPOINT": JSON.stringify(process.env.DEMO_MAPPY_UI_API_ENDPOINT)
};

module.exports = {
  "prod": {
    "entry": entry,
    "htmlPlugins": produtionHtmlPlugins,
    "webpackDefinations": webpackDefinations
  },
  
  "dev": {
    "entry": entry,
    "htmlPlugins": devHtmlPlugins,
    "webpackDefinations": webpackDefinations
  }
};