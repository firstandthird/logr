var Core = require('./lib/core');
var Logger = require('./lib/logger');


var core;
module.exports = function(name, options) {
  if (!core)
    core = new Core(options);
  var logger = new Logger(core, name, options);
  //core.addLogger(logger);
  return logger;
};
