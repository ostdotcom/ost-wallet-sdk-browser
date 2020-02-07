const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const commonConfig = {};

const devConfig = {
    mode: "development",
    devtool: "inline-source-map",
    devServer: {
        contentBase: "./dist",
        port: 9002,
        liveReload: false,
        hot: false,
        inline: false,
        clientLogLevel: 'silent'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: "Ost Wallet Key Manager",
            template: "./devserver/km-mappy.ostwalletsdk.com.html",
            inject: false
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

