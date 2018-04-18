const path = require('path')
const webpack = require('webpack')
const { productName, dependencies } = require('./package.json')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  target: 'electron-renderer',
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'eval',
  entry: [
    'source-map-support/register',
    'typeface-source-sans-pro',
    './src/index.css',
    './src/index.jsx',
  ],
  plugins: [
    new webpack.ExternalsPlugin('commonjs', Object.keys(dependencies)),
    new ExtractTextPlugin({
      filename: '[name].[id].css',
      allChunks: true,
      disable: process.env.NODE_ENV === 'development',
    }),
    new HtmlWebpackPlugin({
      title: productName,
      filename: 'index.html',
      template: 'src/index.ejs',
    }),
  ],
  mode: process.env.NODE_ENV,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'renderer.js',
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.js', '.jsx', '.json', '.css'],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            { loader: 'css-loader', options: { importLoaders: 1 } },
            'postcss-loader',
          ],
        }),
      },
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        include: [
          path.resolve('./src'),
          path.resolve('./node_modules/react-icons'),
        ],
      },
      {
        use: 'file-loader',
        include: [
          path.resolve('./node_modules/typeface-source-sans-pro/files'),
        ],
      },
    ],
  },
}
