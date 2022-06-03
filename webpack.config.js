const { resolve } = require("path");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const smp = new SpeedMeasurePlugin();

module.exports = smp.wrap({
  mode: "development",
  context: __dirname,
  devtool: "inline-source-map",
  entry: {
    popup: "./popup/index.tsx",
    options: "./options/index.tsx",
    not_available: "./not_available/index.tsx",
    background: "./background/index.ts",
  },
  output: {
    path: resolve("./public"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{ loader: "ts-loader", options: { transpileOnly: true } }],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [new ForkTsCheckerWebpackPlugin()],
});
