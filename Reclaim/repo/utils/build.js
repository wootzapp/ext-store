const webpack = require('webpack');
const config = require('../webpack.config');

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.BABEL_ENV = 'production';

// Run webpack build
webpack(config, (err, stats) => {
  if (err || stats.hasErrors()) {
    process.exit(1);
  }
});
