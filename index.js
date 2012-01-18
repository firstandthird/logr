var Dispatcher = require('./lib/dispatcher');
var Logger = require('./lib/logger');


var dispatcher;
module.exports = function(name, section, options) {
  if (typeof section === 'object') {
    options = section;
    section = '';
  }
  if (!dispatcher)
    dispatcher = new Dispatcher(options);
  var logger = new Logger(dispatcher, name, section, options);
  dispatcher.useLogger(logger);
  return logger;
};
