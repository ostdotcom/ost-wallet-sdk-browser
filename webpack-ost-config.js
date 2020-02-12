const entry = {
    "OstWalletSdk": "./src/browser.js",
    "ost-sdk-iframe-script": "./src/OstSdk/index.js",
    "ost-sdk-key-manager-script": "./src/OstSdkKeyManager/index.js"
};

const produtionHtmlPlugins = [
    /* sdk-[mappy]-ostsdk.com/index.html */
    {
        template: "./src/blank/blank.html",
        filename: "../ost-sdk/index.html",
        chunks: ['ost-sdk-iframe-script'],
        inject: true
    },

    /* sdk-[mappy]-ostsdk.com/allowed-domains.json */
    {
        template: "./src/OstSdk/html/allowed-domains",
        ALLOWED_DOMAIN: process.env.DEMO_MAPPY_UI_ORIGIN,
        filename: "../ost-sdk/allowed-domains.json",
        inject: false
    },

    /* km-[mappy]-ostsdk.com/index.html */
    {
        template: "./src/blank/blank.html",
        filename: "../ost-sdk-key-manager/index.html",
        chunks: ['ost-sdk-key-manager-script'],
        inject: true
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


module.exports = {
  "prod": {
    "entry": entry,
    "htmlPlugins": produtionHtmlPlugins
  },
  
  "dev": {
    "entry": entry,
    "htmlPlugins": devHtmlPlugins
  }
};

