var strf = require('strf');
var aug = require('aug');
var EventEmitter2 = require('eventemitter2').EventEmitter2;

var defaultOptions = {
  console: true,
  filter: (process.env.LOGR)?process.env.LOGR.split(','):false
};

var Dispatcher = function(options) {
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

Dispatcher.prototype.adaptors = require('./adaptors');

Dispatcher.prototype.getEventName = function(name, section, level) {
  if (!name) name = '*';
  if (!section) section = '*';
  if (!level) level = '*';
  return strf('logr.{0}.{1}.{2}', name, section, level);
};

Dispatcher.prototype.useAdaptor = function(f, level, moduleName, section) {
  var self = this;
  var on = function(level) {
    var event = self.getEventName(moduleName, section, level);
    self.emitter.on(event, f);
  };
  if (!level) 
    level = ['*'];
  else if (typeof level === 'string')
    level = [level];
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

Dispatcher.prototype.filter = function(filter) {
  var self = this;
  if (typeof filter === 'string')
    filter = [filter];
  filter.forEach(function(f, i) {
    self.filters.push(f);
  });
};

Dispatcher.prototype.emit = function(module, section, level, message, data) {
  var event = this.getEventName(module, section, level);
  if (this.filters.length === 0 || this.filters.indexOf(module) != -1)
    this.emitter.emit(event, module, section, level, message, data);
};


Dispatcher.prototype.removeAdaptors = function() { 
  this.emitter.removeAllListeners(this.getEventName());
};

Dispatcher.prototype.useLogger = function(logger) {
  this.loggers.push(logger);
};


module.exports = Dispatcher;
