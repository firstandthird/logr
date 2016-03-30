'use strict';
const stringify = require('json-stringify-safe');
const _ = require('lodash');
const colors = require('./colors');

module.exports = function(options, tags, message) {
  if (typeof message === 'object') {
    message = stringify(message, null, (options.pretty) ? '  ' : '').replace(/\\n/g, '\n');
  }

  if (options.colors) {
    tags.forEach((tag, i) => {
      if (options.colors[tag]) {
        tags[i] = `${colors[options.colors[tag]]}${tag}${colors.reset}`;
      }
    });
  }
  if (options.lineColor) {
    message = `${colors[options.lineColor]}  ${message}${colors.reset}`;
  } else {
    message = `  ${message}`;
  }

  const renderTags = (tagsToRender) => {
    if (tagsToRender.length === 0) {
      return '';
    }
    return ` (${tagsToRender.join(',')})`;
  }
  const out = `${message}${renderTags(tags)}`;

  return out;
};
