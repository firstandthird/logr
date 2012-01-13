var aug = require('aug');
var strf = require('strf');
var EventEmitter2 = require('eventemitter2').EventEmitter2;

var emitter;
var initEmitter = function() {
  emitter = new EventEmitter2({
    wildcard: true
  });
};
initEmitter();

var adaptors = require('./adaptors');
var getEventName = function(name, level) {
  return strf('logr.{0}.{1}', name, level);
};

var useAdaptor = function(f, level, module) {
  var self = this;
  var on = function(level) {
    var event = getEventName(module, level);
    emitter.on(event, f);
  };
  if (!module) module = '*';
  if (!level) 
    level = ['*'];
  else
    level = level.split(',');
  for (var i = 0, c = level.length; i < c; i++) {
    on(level[i]);
  }
  /* disabling bubbling of levels for now
  if (level) {
    var levelIndex = this.options.levels.indexOf(level);
    for (var i = 0; i <= levelIndex; i++) {
      on(this.options.levels[i]);
    }
  } else {
    on('*');
  }
  */
};


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

var Logger = function(module, options) {
  this.options = aug({}, defaultOptions, options);
  this.name = module;
  this.emitter = emitter;

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
  var event = getEventName(this.name, level);
  emitter.emit(event, this.name, level, message, data);
};

Logger.prototype._removeAdaptors = function() { 
  emitter.removeAllListeners('logr.*.*');
};

Logger.prototype.use = function(f, level, module) {
  useAdaptor(f, level, module);
};

Logger.prototype.adaptors = adaptors; 

//use console by default
useAdaptor(adaptors.console());

module.exports = function(module, options) {
  return new Logger(module, options);
};
