const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SriPlugin = require('webpack-subresource-integrity');
const webpack = require('webpack');

String.prototype.trimRight = function(charlist) {
  if (charlist === undefined)
    charlist = "\s";

  return this.replace(new RegExp("[" + charlist + "]+$"), "");
};

//region - validations
if ( !process.env.OST_BROWSER_SDK_BASE_URL )  {
    throw "||| BUILD FAILED!!! |||\n||| ATTENTION NEEDED|||\n"  + "Environemnt Variable OST_BROWSER_SDK_BASE_URL is not set.\n" + "||| BUILD FAILED!!! |||\n";
}

if ( !process.env.OST_BROWSER_SDK_PLATFORM_API_ENDPOINT ) {
    throw "||| BUILD FAILED!!! |||\n||| ATTENTION NEEDED|||\n"  + "Environemnt Variable OST_BROWSER_SDK_PLATFORM_API_ENDPOINT is not set.\n" + "||| BUILD FAILED!!! |||\n";
}

if ( !process.env.OST_BROWSER_SDK_IFRAME_ORIGIN ) {
    throw "||| BUILD FAILED!!! |||\n||| ATTENTION NEEDED|||\n"  + "Environemnt Variable OST_BROWSER_SDK_IFRAME_ORIGIN is not set.\n" + "||| BUILD FAILED!!! |||\n";
}

if ( !process.env.DEMO_MAPPY_UI_ORIGIN ) {
    throw "||| BUILD FAILED!!! |||\n||| ATTENTION NEEDED|||\n"  + "Environemnt Variable DEMO_MAPPY_UI_ORIGIN is not set.\n" + "||| BUILD FAILED!!! |||\n";
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

const DEMO_MAPPY_UI_ORIGIN = process.env.DEMO_MAPPY_UI_ORIGIN;
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
        })
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
        })
    ],
    output: {
        path: path.resolve(__dirname, distPath),
        publicPath: publicPath
    }
};

const ostConfig     = require("./webpack-ost-config.js");
const mappyConfig   = require("./webpack-mappy-config.js");

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
    let mappyConf = null;

    if ( env.NODE_ENV === 'dev' ) {
        envConfig   = devConfig;
        sdkConf     = ostConfig.dev;
        mappyConf   = mappyConfig.dev;
    } else {
       if ( !process.env.OST_BROWSER_SDK_VERSION ) {
        throw "||| BUILD FAILED!!! |||\n||| ATTENTION NEEDED|||\n"  + "Environemnt Variable OST_BROWSER_SDK_VERSION is not set.\n" + "||| BUILD FAILED!!! |||\n";
       }

        envConfig   = prodConfig;
        sdkConf     = ostConfig.prod;
        mappyConf   = mappyConfig.prod;
    }

    // Add 'entry'
    envConfig.entry = Object.assign({}, mappyConf.entry, sdkConf.entry);

    // Add HtmlWebpackPlugin(s)
    let pluginsArray = envConfig.plugins;
    AddHtmlPlugins(sdkConf.htmlPlugins, pluginsArray);
    AddHtmlPlugins(mappyConf.htmlPlugins, pluginsArray);

    // Add webpackDefinations
    let webpackDefinations = {};
    if ( mappyConf.webpackDefinations ) {
        Object.assign(webpackDefinations, mappyConf.webpackDefinations);
    }
    if ( sdkConf.webpackDefinations ) {
        Object.assign(webpackDefinations, sdkConf.webpackDefinations);
    }
    const webpackDefinePlugin = new webpack.DefinePlugin( webpackDefinations );
    pluginsArray.push( webpackDefinePlugin );
    
    return {
        ...commonConfig,
        ...envConfig
    }
};

