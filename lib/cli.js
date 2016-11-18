'use strict';
const stringify = require('json-stringify-safe');
const colors = require('./colors');
const _ = require('lodash');

const wrapColor = (message, colorName) => {
  if (!colorName) {
    return message;
  }
  return `${colors[colorName]}${message}${colors.reset}`;
};

module.exports = function(options, tags, message) {
  if (typeof message === 'object') {
    message = stringify(message, null, (options.pretty) ? '  ' : '').replace(/\\n/g, '\n');
  }
  if (options.consoleBell && (_.intersection(options.consoleBell, tags).length > 0)) {
    message += '\u0007';
  }
  if (options.colors) {
    tags.forEach((tag, i) => {
      if (options.colors[tag]) {
        tags[i] = wrapColor(tag, options.colors[tag]);
      }
    });
  }
  if (options.lineColor) {
    message = wrapColor(message, options.lineColor);
  }

  const renderTags = (tagsToRender) => {
    if (tagsToRender.length === 0) {
      return '';
    }
    return ` (${tagsToRender.join(',')})`;
  };

  let prefix = '  ';
  if (options.prefix) {
    prefix = `${wrapColor(`${options.prefix}`, options.prefixColor)}`;
  }

  const out = `${prefix}${message}${renderTags(tags)}`;
  return out;
};
