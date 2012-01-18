var Core = require('./lib/core');
var Logger = require('./lib/logger');


var core;
module.exports = function(name, section, options) {
  if (typeof section === 'object') {
    options = section;
    section = '';
  }
  if (!core)
    core = new Core(options);
  var logger = new Logger(core, name, section, options);
  //core.addLogger(logger);
  return logger;
};
