const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = function override(config, env) {
  // Remove the entry points since we're using the public folder
  // config.entry = {
  //   main: path.join(__dirname, 'src/index.js'),
  //   background: path.join(__dirname, 'extension/background.js'),
  //   content: path.join(__dirname, 'extension/content.js')
  // };

  // Modify output configuration
  config.output = {
    ...config.output,
    filename: 'static/js/[name].js',
  };

  // Add fallbacks for extension compatibility
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "zlib": require.resolve("browserify-zlib"),
    "stream": require.resolve("stream-browserify"),
  };

  return config;
};