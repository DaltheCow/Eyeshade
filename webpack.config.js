const { resolve } = require('path');

module.exports = {
  entry: {
    popup: './popup/index.jsx',
    options: './options/index.jsx',
    not_available: './not_available/index.jsx',
    background: './background/index.js'
  },
  output: {
    path: resolve('./public'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
        },
    },
    {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
        },
    },
    ]
  },
  devtool: '#inline-source-map',
};
