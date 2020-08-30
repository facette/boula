const path = require("path");

const babelMinifyPlugin = require("babel-minify-webpack-plugin");
const htmlPlugin = require("html-webpack-plugin");
const miniCSSExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    context: path.resolve(__dirname, "src"),
    devtool: "source-map",
    entry: "./index",
    mode: "development",
    module: {
        rules: [
            {
                test: /\.scss$/,
                exclude: path.resolve(__dirname, "node_modules"),
                use: [
                    miniCSSExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: true,
                        },
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            implementation: require("sass"),
                        },
                    },
                ],
            },
            {
                test: /\.ts$/,
                exclude: path.resolve(__dirname, "node_modules"),
                loader: "babel-loader",
            },
        ],
    },
    optimization: {
        minimizer: [
            new babelMinifyPlugin(
                {
                    keepFnName: true,
                },
                {
                    sourceMap: true,
                },
            ),
        ],
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "boula.js",
        library: "Boula",
        libraryExport: "default",
        libraryTarget: "umd",
    },
    plugins: [
        new htmlPlugin({
            inject: false,
            template: path.resolve(__dirname, "public/index.html"),
        }),
        new miniCSSExtractPlugin({
            filename: "style.css",
        }),
    ],
    resolve: {
        extensions: [".js", ".ts"],
    },
};
