const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const config = {
  context: path.resolve(__dirname, 'src'),
  entry: './app.js',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [{
      test: /\.js$/,
      include: path.resolve(__dirname, 'src'),
      use: [{
        loader: 'babel-loader',
        options: {
          presets: [
            ['es2015', { modules: false }]
          ]
        }
      }]
    },
    {
      test: /\.scss$/,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: ['css-loader', 'sass-loader']
      })
    }]
  },
  plugins: [
    new ExtractTextPlugin('style.bundle.css')
  ]
}

module.exports = config