import path from 'path';
import nodeExternals from 'webpack-node-externals';
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    mode: "development",
    devtool: "inline-source-map",
    entry: {
        main: "./src/index.js",
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: "auto-kdp.js",
        clean: true
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
        fallback: {
          "fs": false
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            }
        ]
    },
    externals: [nodeExternals()],
};
