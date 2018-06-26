const path = require('path');
const webpack = require('webpack');
const HtmlWebpack = require('html-webpack-plugin');
const WebpackPreBuildPlugin = require('pre-build-webpack');
const del = require('del'); 
const rootDir = path.resolve(__dirname);
const buildFolder = path.resolve(__dirname, 'dist');

module.exports = {
    devtool: "source-map",
    context: rootDir,
    target: "web",
    entry: {
        app: './src/index',
        main: path.resolve(rootDir, 'example.js')
    },
    output: {
        path:  buildFolder,
        filename: "js/[name].js"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [
                    path.resolve(rootDir)
                ],
                loader: 'babel-loader'
            }
        ]
    },
    resolve: {
         extensions: [".js"],
    },
    serve: { //object
        port: 9000,
        content: buildFolder
    },
    devServer: {
        contentBase: buildFolder,
        port: 9000
    },
    plugins: [
        new WebpackPreBuildPlugin(function (stats) {
            del([buildFolder]);
        }),
        new HtmlWebpack({
            filename: 'index.html',
            inject: 'body',
            template: path.resolve(rootDir, 'index.html')
        })
    ]
}