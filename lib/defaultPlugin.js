'use strict';
/*
This is the 'default' Logr plugin. You can copy this plugin
to make your own Logr plugins.
A Logr plugin has a pluginName and consists of a series of event handlers that
are called at different phases of log processing.

These events are (in the order in which they are called)
  // initialize  (called once when Logr first loads, takes in a copy of the Logr's config and all available renderers)
  // filter   (determines whether the plugin needs to respond to a log message. If not defined it will always respond.
  // process  (process the tags/message in any way)
  // output   (prints, stores, exports, etc the logged message)
*/
const _ = require('lodash');

let logrConfig;
let logrRenderers;
let logrMessage;
let logrTags;

// each plugin has a name:
module.exports.pluginName = 'defaultPlugin';

// each plugin can be initialized one time when Logr starts up:
module.exports.initialize = (config, renderers) => {
  logrConfig = config;
  logrRenderers = renderers;
};

// plugins optionally have a 'filter' method that returns false
// if this plugin does not need to do any additional processing:
// for example, this plugin will fire if the 'filter' option is matched:
module.exports.filter = (tags, message) => {
  // an option that will turn off the 'default' logr behavior:
  if (logrConfig.disableDefaultBehavior) {
    return false;
  }
  const filter = process.env.LOGR_FILTER ? process.env.LOGR_FILTER : logrConfig.filter;
  if (!_.isArray(filter)) {
    return true;
  }
  return filter.some((filterTag) => {
    return tags.indexOf(filterTag) !== -1;
  });
};

// plugins optionally have a 'process' method that can
// perform operations, modify the tags/message, etc.
// the default plugin converts Error objects into message
// and adds any additional tags:
module.exports.process = (tags, message) => {
  if (_.isError(message)) {
    logrMessage = {
      message: message.message,
      stack: message.stack
    };
    if (tags.indexOf('error') < 0) {
      tags.push('error');
    }
  } else {
    logrMessage = message;
  }
  logrTags = logrConfig.defaultTags.concat(tags);
};

// plugins optionally have an 'output' method that
// actually display the log.
// the default plugin uses the default renderer
// to print a message
module.exports.output = (tags, message) => {
  const out = logrRenderers[logrConfig.type](logrConfig.renderOptions[logrConfig.type], logrTags, logrMessage);
  /*eslint-disable no-console*/
  console.log(out);
}
