var aug = require('aug');

var defaultOptions = {
  levels: [
    'EMERGENCY',
    'CRITICAL',
    'ERROR',
    'WARN',
    'NOTICE',
    'INFO',
    'DEBUG'
  ]
};


var Logger = function(dispatcher, mod, section, options) {
  if (!dispatcher)
    throw new Error('dispatcher is required');
  if (!mod)
    throw new Error('module name is required');
  if (typeof section === 'object') {
    options = section;
    section = '';
  }

  this.dispatcher = dispatcher;
  this.options = aug({}, defaultOptions, options);
  this.module = mod;
  this.section = section;

  this._initLevels();
};

Logger.prototype._initLevels = function() {
  for (var i = 0, c = this.options.levels.length; i < c; i++) {
    var level = this.options.levels[i];
    this.createLogLevel(level);
  }
};

Logger.prototype.createLogLevel = function(level) {
  var self = this;
  this[level.toLowerCase()] = function(message, data) {
    self.log(level, message, data);
  };
};

Logger.prototype.use = function(f, level, module, section) {
  this.dispatcher.useAdaptor(f, level, module, section);
};

Logger.prototype.log = function(level, message, data) {
  this.dispatcher.emit(this.module, this.section, level, message, data);
};

Logger.prototype.filter = function(filter) {
  this.dispatcher.filter(filter);
};

module.exports = Logger;
