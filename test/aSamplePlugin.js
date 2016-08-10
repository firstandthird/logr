'use strict';
module.exports.pluginName = 'aSamplePlugin';

let pluginCalls;
module.exports.initialize = (config, renderers) => {
  pluginCalls = config;
};

module.exports.filter = (tags, message) => {
  pluginCalls.filterCalled = true;
  return true;
};

module.exports.process = (tags, message) => {
  pluginCalls.processCalled = true;
};

module.exports.output = (tags, message) => {
  pluginCalls.outputCalled = true;
  pluginCalls.message = message;
  pluginCalls.tags = tags;
};
