const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Modify entry points
      webpackConfig.entry = {
        main: path.resolve(__dirname, 'src/index.js'),
        widget: path.resolve(__dirname, 'src/widget.js')
      };

      // Add HTML plugin for widget
      webpackConfig.plugins.push(
        new HtmlWebpackPlugin({
          template: path.resolve(__dirname, 'public/widget.html'),
          filename: 'widget.html',
          chunks: ['widget']
        })
      );

      return webpackConfig;
    }
  }
}; 