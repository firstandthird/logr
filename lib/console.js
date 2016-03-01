'use strict';
const stringify = require('json-stringify-safe');

module.exports = function(options, tags, message) {
  const ts = (options.timestamp) ? `${new Date().toTimeString()}: ` : '';
  if (typeof message === 'object') {
    message = stringify(message);
  }
  const out = `${ts}[${tags.join(',')}] ${message}`;
  return out;
};
