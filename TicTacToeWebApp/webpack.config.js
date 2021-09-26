const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = (env, options) => {
    const isDev = options.mode == 'development';
    const outputFilename = isDev ? '[name].js' : '[name].[contenthash].js';
    const cssFilename = isDev ? '[name].css' : '[name].[contenthash].css';
    const devtool = isDev ? 'source-map' : undefined;

    return {

        entry: [ './src/js/index.js' ],

        output: {
            path: path.resolve(__dirname, './wwwroot'),
            filename: outputFilename,
            clean: true,
            assetModuleFilename: 'images/[name][ext]'
        },

        plugins: [
            new HtmlWebpackPlugin({ template: './src/index.html' }),
            new MiniCssExtractPlugin({ filename: cssFilename })
        ],

        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: [MiniCssExtractPlugin.loader, 'css-loader'],
                },
                {
                    test: /\.html$/i,
                    use: ["html-loader"]
                },
                {
                    test: /\.(svg)$/i,
                    type: 'asset/resource',
                }
            ],
        },

        devtool: devtool,

        optimization: {
            minimizer: [
                '...',
                new CssMinimizerPlugin({ parallel: true }),
            ]
        }
    }
}
