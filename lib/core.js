var strf = require('strf');
var aug = require('aug');
var EventEmitter2 = require('eventemitter2').EventEmitter2;

var defaultOptions = {
  console: true,
  filter: (process.env.LOGR)?process.env.LOGR.split(','):false
};

var Core = function(options) {
  this.options = aug({}, defaultOptions, options);
  this.emitter = new EventEmitter2({
    wildcard: true
  });
  this.filters = [];
  this.loggers = [];
  if (this.options.console)
    this.useAdaptor(this.adaptors.console());
  if (this.options.filter) {
    this.filter(this.options.filter);
  }
};

Core.prototype.adaptors = require('./adaptors');

Core.prototype.getEventName = function(name, level) {
  return strf('logr.{0}.{1}', name, level);
};

Core.prototype.useAdaptor = function(f, level, moduleName) {
  var self = this;
  var on = function(level) {
    var event = self.getEventName(moduleName, level);
    self.emitter.on(event, f);
  };
  if (!moduleName) moduleName = '*';
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

Core.prototype.emit = function(name, level, message, data) {
  var event = this.getEventName(name, level);
  if (this.filters.length === 0 || this.filters.indexOf(name) != -1)
    this.emitter.emit(event, name, level, message, data);
};


Core.prototype._removeAdaptors = function() { 
  this.emitter.removeAllListeners('logr.*.*');
};

Core.prototype.useLogger = function(logger) {
  this.loggers.push(logger);
};

Core.prototype.filter = function(filter) {
  var self = this;
  if (typeof filter === 'string')
    filter = [filter];
  filter.forEach(function(f, i) {
    self.filters.push(f);
  });
};

module.exports = Core;
