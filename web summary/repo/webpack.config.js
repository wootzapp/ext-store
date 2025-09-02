// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  target: 'web',               // ok for popup/content; bg also works if you don't use DOM APIs
  entry: {
    popup:      './src/pages/popup/index.jsx',
    background: './src/background/index.js',
    content:    './src/content/index.js',
  },
  output: { path: path.resolve(__dirname, 'dist'), filename: '[name].js', clean: true },
  module: {
    rules: [
      { test: /\.(js|jsx)$/, exclude: /node_modules/, use: { loader: 'babel-loader', options: { presets: ['@babel/preset-env','@babel/preset-react'] } } },
      { test: /\.css$/, use: ['style-loader','css-loader','postcss-loader'] },
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: { '@': path.resolve(__dirname, 'src') },   // <— nice to have
  },
  // externals: { chrome: 'chrome' }, // not needed unless you `import 'chrome'`
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/pages/popup/index.html',        // <— new location
      filename: 'popup.html',
      chunks: ['popup'],
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public/manifest.json', to: 'manifest.json' },
        { from: 'public/icons', to: 'icons', noErrorOnMissing: true },
      ],
    }),
  ],
  optimization: { splitChunks: false, runtimeChunk: false },
};