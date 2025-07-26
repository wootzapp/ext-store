require('dotenv').config();

var webpack = require("webpack"),
  path = require("path"),
  fileSystem = require("fs-extra"),
  env = require("./utils/env"),
  CopyWebpackPlugin = require("copy-webpack-plugin"),
  HtmlWebpackPlugin = require("html-webpack-plugin"),
  TerserPlugin = require("terser-webpack-plugin");
var { CleanWebpackPlugin } = require("clean-webpack-plugin");
var ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
var NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const ASSET_PATH = process.env.ASSET_PATH || "/";
var secretsPath = path.join(__dirname, "secrets." + env.NODE_ENV + ".js");

var alias = {};
var fileExtensions = ["jpg", "jpeg", "png", "gif", "eot", "otf", "svg", "ttf", "woff", "woff2"];

if (fileSystem.existsSync(secretsPath)) {
  alias["secrets"] = secretsPath;
}

const isDevelopment = process.env.NODE_ENV !== "production";

var options = {
  mode: process.env.NODE_ENV || "development",
  ignoreWarnings: [
    /Circular dependency between chunks with runtime/,
    /ResizeObserver loop completed/,
    /Sass @import rules are deprecated/,
    /Should not import the named export/,
    /Can't resolve 'worker_threads'/,
    /Can't resolve 'fs'/,
    /Can't resolve 'child_process'/,
    /node:url/,
  ],
  entry: {
    "background/background": path.join(__dirname, "src", "background", "background.js"),
    "content/content": path.join(__dirname, "src", "content", "content.js"),
    "offscreen/offscreen": path.join(__dirname, "src", "offscreen", "offscreen.js"),
    "interceptor/network-interceptor": path.join(__dirname, "src", "interceptor", "network-interceptor.js"),
    "interceptor/injection-scripts": path.join(__dirname, "src", "interceptor", "injection-scripts.js"),
    "popup/popup": path.join(__dirname, "src", "popup", "index.js")
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "build"),
    clean: true,
    publicPath: ASSET_PATH,
    assetModuleFilename: '[name][ext]',
    chunkFilename: "[name].bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        use: [
          "style-loader",
          "css-loader",
          "postcss-loader",
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
              sassOptions: {
                silenceDeprecations: ["legacy-js-api"],
              }
            },
          },
        ],
      },
      {
        test: new RegExp(".(" + fileExtensions.join("|") + ")$"),
        type: "asset/resource",
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        loader: "html-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve("ts-loader"),
            options: {
              transpileOnly: isDevelopment,
            },
          },
        ],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          "source-map-loader",
          {
            loader: require.resolve("babel-loader"),
            options: {
              presets: [
                require.resolve('@babel/preset-env'),
                require.resolve('@babel/preset-react')
              ],
              plugins: [
                isDevelopment && require.resolve("react-refresh/babel"),
              ].filter(Boolean),
            },
          },
        ],
      },
      {
        test: /\.wasm$/,
        type: 'webassembly/async',
        generator: {
          filename: 'wasm/[name][ext]'
        },
      }
    ],
  },
  experiments: {
    asyncWebAssembly: true,
    syncWebAssembly: true,
    topLevelAwait: true,
  },
  resolve: {
    alias: {
      ...alias,
      'koffi': false,
      're2': false,
      'worker_threads': path.resolve(__dirname, 'src/utils/mocks/worker-threads-mock.js'),
      'node:url': require.resolve('url/'),
      'react-native-tcp-socket': false,
      'process/browser': require.resolve('process/browser.js'),
      'canvas': false,
      'jsdom': path.resolve(__dirname, 'src/utils/mocks/jsdom-mock.js'),
      'ws': path.resolve(__dirname, 'src/utils/websocket-polyfill.js'),
    },
    extensions: fileExtensions.map((ext) => "." + ext).concat([".js", ".jsx", ".ts", ".tsx", ".css"]),
    fallback: {
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/"),
      "crypto": require.resolve("crypto-browserify"),
      "https": require.resolve("https-browserify"),
      "http": require.resolve("stream-http"),
      "path": require.resolve("path-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "assert": require.resolve("assert/"),
      "url": require.resolve("url/"),
      "util": require.resolve("util/"),
      "os": require.resolve("os-browserify/browser"),
      "vm": require.resolve("vm-browserify"),
      "constants": require.resolve("constants-browserify"),
      "fs": false,
      "net": false,
      "tls": false,
      "child_process": false,
      "worker_threads": false,
      "readline": false,
    }
  },
  plugins: [
    isDevelopment && new ReactRefreshWebpackPlugin(),
    new CleanWebpackPlugin({ verbose: false }),
    new webpack.ProgressPlugin(),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),
    new webpack.DefinePlugin({
      'process.env.DEBUG': JSON.stringify(process.env.DEBUG || false),
      'process.env.EXTENSION_ID': JSON.stringify(env.EXTENSION_ID),
      'process.env.APP_SECRET': JSON.stringify(process.env.APP_SECRET),
      'process.env.APP_ID': JSON.stringify(process.env.APP_ID),
      'process.env.PROVIDER_ID': JSON.stringify(process.env.PROVIDER_ID)
    }),
    new NodePolyfillPlugin(),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser.js',
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^node:url$/
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/manifest.json",
          to: path.join(__dirname, "build"),
          force: true,
          transform(content) {
            return Buffer.from(JSON.stringify({
              description: process.env.npm_package_description,
              version: process.env.npm_package_version,
              ...JSON.parse(content.toString()),
            }));
          },
        },
        {
          from: "src/assets/img/logo.png",
          to: path.join(__dirname, "build", "assets", "img"),
          force: true,
        },
        {
          from: "public",
          to: path.join(__dirname, "build"),
          force: true,
        },
        {
          from: "src/content/components/ProviderVerificationPopup.css",
          to: path.join(__dirname, "build", "content", "components"),
          force: true,
        },
        {
          from: "src/content/components/ProviderVerificationPopup.html",
          to: path.join(__dirname, "build", "content", "components"),
          force: true,
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "offscreen", "offscreen.html"),
      filename: "offscreen/offscreen.html",
      chunks: ["offscreen/offscreen"],
      inject: true,
      cache: false,
      minify: false
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "popup", "index.html"),
      filename: "popup/index.html",
      chunks: ["popup/popup"],
      inject: true,
      cache: false,
      minify: false
    })
  ].filter(Boolean),
  infrastructureLogging: {
    level: "info",
  },
  devServer: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    }
  },
};

if (env.NODE_ENV === "development") {
  options.devtool = "cheap-module-source-map";
} else {
  options.devtool = "source-map";
  options.optimization = {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          compress: {
            drop_console: true
          },
        }
      }),
    ],
    splitChunks: false,
  };
}

module.exports = options;
