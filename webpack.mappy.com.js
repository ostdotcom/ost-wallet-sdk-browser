const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const commonConfig = {
    entry: {'Mappy':'./src/Mappy/index.js',
        'users': './src/Mappy/js/users.js',
        'login': './src/Mappy/js/login.js',
        'json-api':'./src/Mappy/js/json-api.js',
        'sdk-getters':'./src/Mappy/js/sdk-getters.js',
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
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: "Mappy.com",
            template: "./devserver/mappy.com.html",
            inject: false,
            chunks: ['Mappy']
        }),
        new HtmlWebpackPlugin({
            title: "login.com",
            template: "./src/Mappy/html/login.html",
            inject: false,
            filename: "login",
            chunks: ['login']
        }),
        new HtmlWebpackPlugin({
            title: "users.com",
            template: "./src/Mappy/html/users.html",
            inject: false,
            filename: "users",
            chunks: ['users']
        }),
        new HtmlWebpackPlugin({
            title: "JsonApi.com",
            template: "./src/Mappy/html/json-api.html",
            inject: false,
            filename: "json-api",
            chunks: ['json-api']
        }),
        new HtmlWebpackPlugin({
            title: "Getters.com",
            template: "./src/Mappy/html/sdk-getters.html",
            inject: false,
            filename: "sdk-getters",
            chunks: ['sdk-getters']
        }),
        new HtmlWebpackPlugin({
            title: "workflow.com",
            template: "./src/Mappy/html/workflow.html",
            inject: false,
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

