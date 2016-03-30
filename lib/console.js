'use strict';
const stringify = require('json-stringify-safe');
const _ = require('lodash');
const colors = require('./colors');

module.exports = function(options, tags, message) {
  const ts = (options.timestamp) ? `${new Date().toTimeString()}: ` : '';
  if (typeof message === 'object') {
    message = stringify(message, null, (options.pretty) ? '  ' : '').replace(/\\n/g, '\n');
  }
  if (options.consoleBell && (_.intersection(options.consoleBell, tags).length > 0)) {
    message += '\u0007';
  }

  if (options.colors) {
    tags.forEach((tag, i) => {
      if (options.colors[tag]) {
        tags[i] = `${colors[options.colors[tag]]}${tag}${colors.reset}`;
      }
    });
  }

  const out = `${ts}[${tags.join(',')}] ${message}`;

  return out;
};
