const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    context: __dirname,
    entry: "./src/main.ts",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "dist"),
        publicPath: "/"
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: {
                    loader: "ts-loader"
                }
            },{
            test: /\.wgsl$/,
            use: {
                loader: "ts-shader-loader"
            }
        }
        ]
       
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "index.html",
            inject:true,
            filename: 'index.html'
        })
      ],
    resolve: {
        extensions: [".js",".ts"]
    }
   
}