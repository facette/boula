const path = require("path");

const htmlPlugin = require("html-webpack-plugin");
const miniCSSExtractPlugin = require("mini-css-extract-plugin");
const uglifyJSPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
    context: path.resolve(__dirname, "src"),
    devtool: "source-map",
    entry: "./index",
    externals: {
        d3: "d3",
    },
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
            new uglifyJSPlugin({
                sourceMap: true,
                uglifyOptions: {
                    keep_fnames: true,
                },
            }),
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
