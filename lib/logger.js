var aug = require('aug');

var defaultOptions = {
  levels: [
    "EMERGENCY",
    "CRITICAL",
    "ERROR",
    "WARN",
    "NOTICE",
    "INFO",
    "DEBUG"
  ]
};


var Logger = function(core, module, options) {
  this.core = core;
  this.options = aug({}, defaultOptions, options);
  this.name = module;

  this.initLevels();
};

Logger.prototype.initLevels = function() {
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

Logger.prototype.log = function(level, message, data) {
  this.core.emit(this.name, level, message, data);
};


Logger.prototype.use = function(f, level, module) {
  this.core.useAdaptor(f, level, module);
};

Logger.prototype.filter = function(filter) {
  this.core.filter(filter);
};

module.exports = Logger;
