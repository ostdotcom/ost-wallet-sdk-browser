const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const commonConfig = {
    entry: {'Mappy':'./src/Mappy/index.js',
        'users': './src/Mappy/users.js',
        'login': './src/Mappy/login.js' 
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
            title: "users.com",
            template: "./devserver/users.html",
            inject: false,
            filename: "./devserver/users.html",
            chunks: ['users']
        }),
        new HtmlWebpackPlugin({
            title: "login.com",
            template: "./devserver/login.html",
            inject: false,
            filename: "./devserver/login.html",
            chunks: ['login']
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

