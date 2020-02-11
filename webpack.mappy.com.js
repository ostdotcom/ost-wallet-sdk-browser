const path = require('path');
var webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const mappyDefinations = new webpack.DefinePlugin({
    "DEMO_MAPPY_UI_API_ENDPOINT": JSON.stringify(process.env.DEMO_MAPPY_UI_API_ENDPOINT),
    "DEMO_MAPPY_UI_PLATFORM_API_ENDPOINT": JSON.stringify(process.env.DEMO_MAPPY_UI_PLATFORM_API_ENDPOINT),
    "DEMO_MAPPY_UI_OST_SDK_IFRAME_URL": JSON.stringify(process.env.DEMO_MAPPY_UI_OST_SDK_IFRAME_URL),
    "DEMO_MAPPY_UI_OST_SDK_JS_URL": JSON.stringify(process.env.DEMO_MAPPY_UI_OST_SDK_JS_URL),
    "DEMO_MAPPY_UI_JS_ENDPOINT": JSON.stringify(process.env.DEMO_MAPPY_UI_JS_ENDPOINT),
});

console.log("DEMO_MAPPY_UI_API_ENDPOINT", process.env.DEMO_MAPPY_UI_API_ENDPOINT);

const commonConfig = {
    entry: {
        'users': './src/Mappy/js/users-new.js',
        'login': './src/Mappy/js/login.js',
        'json-api':'./src/Mappy/js/json-api-new.js',
        'sdk-getters':'./src/Mappy/js/sdk-getter-new.js',
        'workflow':'./src/Mappy/js/workflow.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
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
    target: "web"
};


const devConfig = {
    mode: "development",
    devtool: "inline-source-map",
    devServer: {
        contentBase: "./dist",
        port: 9000,
        liveReload: false,
        hot: false,
        inline: false,
        clientLogLevel: 'silent',
        disableHostCheck: true
    },
    plugins: [
        mappyDefinations,
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: "Demo Mappy Web UI",
            template: "./src/Mappy/html/login.html",
            inject: false,
            jsEndpoint: process.env.DEMO_MAPPY_UI_JS_ENDPOINT,
            OstWalletSdkUrl: process.env.DEMO_MAPPY_UI_OST_SDK_JS_URL,
            chunks: ['login']
        }),
        new HtmlWebpackPlugin({
            title: "users.com",
            template: "./src/Mappy/html/users-new.html",
            inject: false,
            jsEndpoint: process.env.DEMO_MAPPY_UI_JS_ENDPOINT,
            OstWalletSdkUrl: process.env.DEMO_MAPPY_UI_OST_SDK_JS_URL,
            filename: "users",
            chunks: ['users']
        }),
        new HtmlWebpackPlugin({
            title: "JsonApi.com",
            template: "./src/Mappy/html/json-api-new.html",
            inject: false,
            jsEndpoint: process.env.DEMO_MAPPY_UI_JS_ENDPOINT,
            OstWalletSdkUrl: process.env.DEMO_MAPPY_UI_OST_SDK_JS_URL,
            filename: "json-api",
            chunks: ['json-api']
        }),
        new HtmlWebpackPlugin({
            title: "Getters.com",
            template: "./src/Mappy/html/sdk-getters-new.html",
            inject: false,
            jsEndpoint: process.env.DEMO_MAPPY_UI_JS_ENDPOINT,
            OstWalletSdkUrl: process.env.DEMO_MAPPY_UI_OST_SDK_JS_URL,
            filename: "sdk-getters",
            chunks: ['sdk-getters']
        }),
        new HtmlWebpackPlugin({
            title: "workflow.com",
            template: "./src/Mappy/html/workflow.html",
            inject: false,
            jsEndpoint: process.env.DEMO_MAPPY_UI_JS_ENDPOINT,
            OstWalletSdkUrl: process.env.DEMO_MAPPY_UI_OST_SDK_JS_URL,
            filename: "workflow",
            chunks: ['workflow']
        })
    ]
};

const prodConfig = {
    mode: "production",
    devtool: "source-map",
    plugins: [
        new CleanWebpackPlugin()
    ]
};

module.exports = env => {

    let envConfig = env.NODE_ENV === 'prod' ? prodConfig : devConfig;

    return {
        ...commonConfig,
        ...envConfig
    }
};

