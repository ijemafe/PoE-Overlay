var baseConfig = require('./karma-base.conf');

module.exports = function(config) {
  config.set(Object.assign({}, baseConfig, {
    autoWatch: false,
    singleRun: true
  }));
}
