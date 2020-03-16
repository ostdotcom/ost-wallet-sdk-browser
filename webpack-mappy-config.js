const fs = require('fs');
const path = require('path');

String.prototype.trimRight = function(charlist) {
  if (charlist === undefined)
    charlist = "\s";

  return this.replace(new RegExp("[" + charlist + "]+$"), "");
};

const loadMappyPartial = ( fileName ) => {
  const __dirname = path.resolve();
  let filePath = path.resolve(__dirname, "./src/Mappy/html/partials/" + fileName);
  fileContent = fs.readFileSync(filePath).toString();
  return fileContent;
};

const loadEncodedMappyPartial = ( fileName ) => {
  return encodeURIComponent( loadMappyPartial(fileName) );
}


const configBuilder = (OST_TOKEN_ID, DEMO_MAPPY_UI_API_ENDPOINT) => {
  const sdkVersion = process.env.OST_BROWSER_SDK_VERSION || "";

  // Global Vars
  let GC_VARS = {
    "OST_TOKEN_ID": OST_TOKEN_ID,
    "DEMO_MAPPY_UI_API_ENDPOINT": DEMO_MAPPY_UI_API_ENDPOINT,
    "_htmlPartials": {
      "DATA_DISPLAY_TEMPLATE": loadEncodedMappyPartial("data_display_template.html"),
      "AFTER_SESSION": loadEncodedMappyPartial("after_session.html"),
      "CREATE_SESSION_MODAL": loadEncodedMappyPartial("create_session_modal.html"),
      "DELETE_SESSION_MODAL": loadEncodedMappyPartial("delete_session_modal.html"),      
      "JSON_API_TEMPLATE": loadEncodedMappyPartial("json_api_template.html"),
      "METHOD_TEMPLATE": loadEncodedMappyPartial("method_template.html"),
      "WORKFLOW_MODAL": loadEncodedMappyPartial("workflow_modal.html")
    }
  };

  const LOADER_HTML = loadMappyPartial("page_loader.html");

  // Entity
  const entry = {};
  /**
   *  The below code is enables you to host independent js
   *  files for different token-ids. Just change to:
   *  const JS_MIDFIX = "-/" + OST_TOKEN_ID;
   */
  const JS_MIDFIX="";
  const eMap = {
    "users": "mappy-js" + JS_MIDFIX + "/users",
    "login": "mappy-js" + JS_MIDFIX + "/login",
    "json_api": "mappy-js" + JS_MIDFIX + "/json_api",
    "sdk_getters": "mappy-js" + JS_MIDFIX + "/sdk_getters",
  }

  entry[ eMap.users ]       = './src/Mappy/js/users-new.js';
  entry[ eMap.login ]       = './src/Mappy/js/login.js';
  entry[ eMap.json_api ]    = './src/Mappy/js/json-api-new.js';
  entry[ eMap.sdk_getters ] = './src/Mappy/js/sdk-getter-new.js';


  const htmlPrefix = "../mappy-" + OST_TOKEN_ID;
  const produtionHtmlPlugins = [
      /* http://devmappy.com/index.html  */
      {
          GC_VARS: JSON.stringify(GC_VARS),
          LOADER_HTML: LOADER_HTML,
          title: "Login - Demo Mappy Web UI",
          template: "./src/Mappy/html/login.html",
          inject: true,
          filename: htmlPrefix + "/index.html",
          chunks: [eMap.login, 'OstWalletSdk']
      },

      /* http://devmappy.com/login.html  */
      {
          GC_VARS: JSON.stringify(GC_VARS),
          LOADER_HTML: LOADER_HTML,
          title: "Login - Demo Mappy Web UI",
          template: "./src/Mappy/html/login.html",
          inject: true,
          filename: htmlPrefix + "/login.html",
          chunks: ['OstWalletSdk', eMap.login]
      },

      /* http://devmappy.com/users.html  */
      {
          GC_VARS: JSON.stringify(GC_VARS),
          LOADER_HTML: LOADER_HTML,
          title: "Users List - Demo Mappy Web UI",
          template: "./src/Mappy/html/users-new.html",
          inject: true,
          filename: htmlPrefix + "/users.html",
          chunks: [eMap.users, 'OstWalletSdk']
      },

      /* http://devmappy.com/sdk-getters.html  */
      {
          GC_VARS: JSON.stringify(GC_VARS),
          LOADER_HTML: LOADER_HTML,
          title: "Sdk Getter Methods - Demo Mappy Web UI",
          template: "./src/Mappy/html/sdk-getters-new.html",
          inject: true,
          filename: htmlPrefix + "/sdk-getters.html",
          chunks: [eMap.sdk_getters, 'OstWalletSdk']
      },

      /* http://devmappy.com/json-api.html  */
      {
          GC_VARS: JSON.stringify(GC_VARS),
          LOADER_HTML: LOADER_HTML,
          title: "JSON API Methods - Demo Mappy Web UI",
          template: "./src/Mappy/html/json-api-new.html",
          inject: true,
          filename: htmlPrefix + "/json-api.html",
          chunks: [eMap.json_api, 'OstWalletSdk']
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
    if ( conf.filename && conf.filename.startsWith( htmlPrefix ) ) {
      let newFileName = conf.filename.replace(htmlPrefix, "mappy");
      conf.filename = newFileName;
    }

    // Add it.
    devHtmlPlugins.push( conf )
  }
  const webpackDefinations = null;

  return {
    "prod": {
      "entry": entry,
      "htmlPlugins": produtionHtmlPlugins
    },

    "dev": {
      "entry": entry,
      "htmlPlugins": devHtmlPlugins
    }
  };

}

module.exports = configBuilder;
