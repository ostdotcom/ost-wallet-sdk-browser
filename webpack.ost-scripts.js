const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SriPlugin = require('webpack-subresource-integrity');
const webpack = require('webpack');
const fs = require('fs');

String.prototype.trimRight = function(charlist) {
  if (charlist === undefined)
    charlist = "\s";

  return this.replace(new RegExp("[" + charlist + "]+$"), "");
};

// Define variables that need to be available in Ost JS files.
const webpackVariables = {};

//region - validations
if ( !process.env.OST_BROWSER_SDK_BASE_URL )  {
    throw "||| BUILD FAILED!!! |||\n||| ATTENTION NEEDED|||\n"  + "Environemnt Variable OST_BROWSER_SDK_BASE_URL is not set.\n" + "||| BUILD FAILED!!! |||\n";
}

let OST_BROWSER_SDK_PLATFORM_API_ORIGIN = process.env.OST_BROWSER_SDK_PLATFORM_API_ORIGIN;
if ( !OST_BROWSER_SDK_PLATFORM_API_ORIGIN ) {
    OST_BROWSER_SDK_PLATFORM_API_ORIGIN = "https://api.ost.com";
    console.log("!! OST_BROWSER_SDK_PLATFORM_API_ORIGIN not specified.");
    console.log("-- OST_BROWSER_SDK_PLATFORM_API_ORIGIN set to", OST_BROWSER_SDK_PLATFORM_API_ORIGIN);
}
webpackVariables.WP_OST_BROWSER_SDK_PLATFORM_API_ORIGIN = JSON.stringify(OST_BROWSER_SDK_PLATFORM_API_ORIGIN);

if ( !process.env.TOKEN_IDS ) {
  throw "||| BUILD FAILED!!! |||\n||| ATTENTION NEEDED|||\n"  + "Environemnt Variable TOKEN_ID is not set.\n" + "||| BUILD FAILED!!! |||\n";
}

let OST_BROWSER_SDK_MAIN_DOMAIN = process.env.OST_BROWSER_SDK_MAIN_DOMAIN;
if ( !OST_BROWSER_SDK_MAIN_DOMAIN ) {
    OST_BROWSER_SDK_MAIN_DOMAIN = "ostwalletsdk.com";
    console.log("!! OST_BROWSER_SDK_MAIN_DOMAIN not specified.");
    console.log("-- OST_BROWSER_SDK_MAIN_DOMAIN set to", OST_BROWSER_SDK_MAIN_DOMAIN);
}
webpackVariables.WP_OST_BROWSER_SDK_MAIN_DOMAIN = JSON.stringify(OST_BROWSER_SDK_MAIN_DOMAIN);

let OST_BROWSER_SDK_VERSION = process.env.OST_BROWSER_SDK_VERSION;
if ( typeof OST_BROWSER_SDK_VERSION !== 'string') {
    const packageJson = require("./package.json");
    OST_BROWSER_SDK_VERSION = `v-${packageJson.version}`;
    console.log("!! OST_BROWSER_SDK_VERSION not specified.");
    console.log("-- OST_BROWSER_SDK_VERSION set to", OST_BROWSER_SDK_VERSION);
}
webpackVariables.WP_OST_BROWSER_SDK_VERSION = JSON.stringify( OST_BROWSER_SDK_VERSION );

const TOKEN_IDS = process.env.TOKEN_IDS.split(",");

const mappyConfigs = [];
const mappyConfigBuilder = require("./webpack-mappy-config.js");
function buildTokenInfo( tokenIds ) {
    if (!( tokenIds instanceof Array )) {
        tokenIds = tokenIds.split(",");
    }
    let len = tokenIds.length;
    while( len-- ) {
        let thisTokenId = tokenIds[len];
        let apiEnvVarName = "DEMO_MAPPY_UI_API_ENDPOINT_" + thisTokenId;
        let apiEndPoint = process.env[apiEnvVarName];
        if ( !apiEndPoint ) {
            throw "||| BUILD FAILED!!! |||\n||| ATTENTION NEEDED|||\n"  + "Environemnt Variable " + envVarName + " is not set.\n" + "||| BUILD FAILED!!! |||\n";
        }

        mappyConfigs.push( {
            "token_id": thisTokenId,
            "api_end_point": apiEndPoint,
            "config": mappyConfigBuilder(
                thisTokenId, 
                apiEndPoint
            )
        });
    }
}
buildTokenInfo( process.env.TOKEN_IDS );



function getMappyConfig( configName, env ) {
    // console.log("\n\n\n getMappyConfig: input", configName, env);
    let len = mappyConfigs.length;
    let output;
    while( len-- ) {
        let mappyInfo   = mappyConfigs[ len ];
        let mappyConfig = mappyInfo.config[ env ];
        let thisConfig  = mappyConfig[ configName ];
        if ( !thisConfig ) {
            continue;
        }
        
        if ( thisConfig instanceof Array ) {
            if ( !output ) {
                output = [];
            }
            output.push(...thisConfig);
        } else {
            //Its an object!
            if ( !output ) {
                output = {};
            }
            Object.assign(output, thisConfig);
        }
    }
    // console.log("getMappyConfig: output", output, "\n\n\n");
    return output;
}


//endregion

const commonConfig = {
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "@babel/preset-env"
                        ],
                        plugins: [
                            "@babel/plugin-proposal-class-properties",
                            "@babel/plugin-transform-async-to-generator",
                            ["@babel/plugin-transform-runtime",
                              {
                                "regenerator": true
                              }
                            ]
                        ]
                    }
                }
            },
            {
                test: /\.css$/, 
                use: ['style-loader','css-loader' ]
            }
        ]
    }
};

const sdkVersion = process.env.OST_BROWSER_SDK_VERSION;

let sdkBaseUrl = process.env.OST_BROWSER_SDK_BASE_URL;
sdkBaseUrl = sdkBaseUrl.trimRight("/");

let publicPath = sdkBaseUrl;
let distPath = "dist";

if ( sdkVersion ) {
 publicPath = publicPath + "/" + sdkVersion + "/";
 distPath = distPath + "/" + sdkVersion + "/ost-sdk-scripts/";
}
publicPath = publicPath.trimRight("/");

const devConfig = {
    mode: "development",
    devtool: "inline-source-map",
    devServer: {
        http2: true,
        https: {
            key: fs.readFileSync('/usr/local/etc/nginx/dev-proxy-https-certificates/dev-proxy-https.key'),
            cert: fs.readFileSync('/usr/local/etc/nginx/dev-proxy-https-certificates/dev-proxy-https.crt')
        },
        contentBase: "./dist",
        port: 9090,
        liveReload: false,
        hot: false,
        inline: false,
        clientLogLevel: 'silent'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new SriPlugin({
            hashFuncNames: ['sha256', 'sha384'],
            enabled: false,
        }),
        new webpack.DefinePlugin(webpackVariables)
    ],
    output: {
        publicPath: publicPath
    }
};

const prodConfig = {
    mode: "production",
    devtool: "source-map",
    plugins: [
        new CleanWebpackPlugin(),
        new SriPlugin({
            hashFuncNames: ['sha256', 'sha384'],
            enabled: true
        }),
        new webpack.DefinePlugin(webpackVariables)
    ],
    output: {
        path: path.resolve(__dirname, distPath),
        publicPath: publicPath
    }
};

const ostConfig     = require("./webpack-ost-config.js");


/**
 * [description]
 * @param  {Array} configs - an Array of configs
 * @param  {Array} pluginsArray - array of plugins to which HtmlWebpackPlugin instances will be pushed into.
 * @return {Array[HtmlWebpackPlugin]} Array of HtmlWebpackPlugin instances for the given config
 */
const AddHtmlPlugins = ( configs, pluginsArray ) => {
    let cnt = 0;
    let len = configs.length;
    for(cnt = 0; cnt < len; cnt++ ) {
        let conf = configs[cnt];
        let pInstance = new HtmlWebpackPlugin( conf );
        pluginsArray.push( pInstance );
    }
};

module.exports = (env) => {
    let envConfig = null;
    let sdkConf = null;

    let mappyEnv = "prod";

    if ( env.NODE_ENV === 'dev' ) {
        envConfig   = devConfig;
        sdkConf     = ostConfig.dev;
        mappyEnv = "dev";
    } else {
        if ( !process.env.OST_BROWSER_SDK_VERSION ) {
            throw "||| BUILD FAILED!!! |||\n||| ATTENTION NEEDED|||\n"  + "Environemnt Variable OST_BROWSER_SDK_VERSION is not set.\n" + "||| BUILD FAILED!!! |||\n";
        }
        envConfig   = prodConfig;
        sdkConf     = ostConfig.prod;
    }

    // Add 'entry'
    envConfig.entry = Object.assign({}, getMappyConfig("entry", mappyEnv), sdkConf.entry);

    // Add HtmlWebpackPlugin(s)
    let pluginsArray = envConfig.plugins;
    let mappyHtmlPlugins = getMappyConfig("htmlPlugins", mappyEnv);
    AddHtmlPlugins(mappyHtmlPlugins, pluginsArray);

    AddHtmlPlugins(sdkConf.htmlPlugins, pluginsArray);

    return {
        ...commonConfig,
        ...envConfig
    }
};

