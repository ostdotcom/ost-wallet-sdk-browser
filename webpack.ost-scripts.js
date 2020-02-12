const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SriPlugin = require('webpack-subresource-integrity');

String.prototype.trimRight = function(charlist) {
  if (charlist === undefined)
    charlist = "\s";

  return this.replace(new RegExp("[" + charlist + "]+$"), "");
};

//region - validations
if ( !process.env.DEMO_MAPPY_UI_DOMAIN ) {
    throw "||| BUILD FAILED!!! |||\n||| ATTENTION NEEDED|||\n"  + "Environemnt Variable DEMO_MAPPY_UI_DOMAIN is not set.\n" + "||| BUILD FAILED!!! |||\n";
}

if ( !process.env.OST_BROWSER_SDK_BASE_URL )  {
    throw "||| BUILD FAILED!!! |||\n||| ATTENTION NEEDED|||\n"  + "Environemnt Variable OST_BROWSER_SDK_BASE_URL is not set.\n" + "||| BUILD FAILED!!! |||\n";
}
//endregion

const commonConfig = {
    entry: {
        "OstWalletSdk": "./src/browser.js",
        "ost-sdk-iframe-script": "./src/OstSdk/index.js",
        "ost-sdk-key-manager-script": "./src/OstSdkKeyManager/index.js"
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
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
    },
};

const DEMO_MAPPY_UI_DOMAIN = process.env.DEMO_MAPPY_UI_DOMAIN;
const sdkVersion = process.env.OST_BROWSER_SDK_VERSION;

let sdkBaseUrl = process.env.OST_BROWSER_SDK_BASE_URL;
console.log("process.env.OST_BROWSER_SDK_BASE_URL", process.env.OST_BROWSER_SDK_BASE_URL);
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
        }),
        new HtmlWebpackPlugin({
            template: "./src/blank/blank.html",
            filename: "ost-sdk/index.html",
            chunks: ['ost-sdk-iframe-script'],
            inject: true
        }),
        new HtmlWebpackPlugin({
            title: "Sdk-mappy.ostwalletsdk.com",
            template: "./src/OstSdk/html/allowed-domains",
            ALLOWED_DOMAIN: DEMO_MAPPY_UI_DOMAIN,
            filename: "ost-sdk/allowed-domains.json",
            inject: false
        }),
        new HtmlWebpackPlugin({
            template: "./src/blank/blank.html",
            filename: "ost-sdk-key-manager/index.html",
            chunks: ['ost-sdk-key-manager-script'],
            inject: true
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
            enabled: true,
        }),
        new HtmlWebpackPlugin({
            template: "./src/blank/blank.html",
            filename: "../ost-sdk/index.html",
            chunks: ['ost-sdk-iframe-script'],
            inject: true
        }),
        new HtmlWebpackPlugin({
            title: "Sdk-mappy.ostwalletsdk.com",
            template: "./src/OstSdk/html/allowed-domains",
            ALLOWED_DOMAIN: DEMO_MAPPY_UI_DOMAIN,
            filename: "../ost-sdk/allowed-domains.json",
            inject: false
        }),
        new HtmlWebpackPlugin({
            template: "./src/blank/blank.html",
            filename: "../ost-sdk-key-manager/index.html",
            chunks: ['ost-sdk-key-manager-script'],
            inject: true
        })
    ],
    output: {
        path: path.resolve(__dirname, distPath),
        publicPath: publicPath
    }
};

module.exports = (env) => {
    let envConfig = env.NODE_ENV === 'prod' ? prodConfig : devConfig;

    if ( env.NODE_ENV === 'prod' ) {
       if ( !process.env.OST_BROWSER_SDK_VERSION ) {
        throw "||| BUILD FAILED!!! |||\n||| ATTENTION NEEDED|||\n"  + "Environemnt Variable OST_BROWSER_SDK_VERSION is not set.\n" + "||| BUILD FAILED!!! |||\n";
       }
    }
    return {
        ...commonConfig,
        ...envConfig
    }
};

