const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const commonConfig = {};

const DEMO_MAPPY_UI_DOMAIN = process.env.DEMO_MAPPY_UI_DOMAIN;

const devConfig = {
    mode: "development",
    devtool: "inline-source-map",
    devServer: {
        contentBase: "./dist",
        port: 9001,
        liveReload: false,
        hot: false,
        inline: false,
        clientLogLevel: 'silent'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: "",
            template: "./devserver/sdk-mappy.ostwalletsdk.com.html",
            inject: false
        }),
        new HtmlWebpackPlugin({
            title: "Sdk-mappy.ostwalletsdk.com",
            template: "./src/OstSdk/html/allowed-domains",
            ALLOWED_DOMAIN: DEMO_MAPPY_UI_DOMAIN,
            filename: "allowed-domains.json",
            inject: false
        }),
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

