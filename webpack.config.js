const { resolve } = require("path");

module.exports = {
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
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
};
