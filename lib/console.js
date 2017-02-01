'use strict';
const stringify = require('json-stringify-safe');
const _ = require('lodash');
const flatten = require('flat');
const chalk = require('chalk');

module.exports = function(options, tags, message) {
  const colors = new chalk.constructor({ enabled: (options.colors) });
  const now = new Date();
  const ts = (options.timestamp) ? colors.gray(`${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} `) : '';

  if (typeof message === 'object') {
    if (options.flat === true) {
      const flatObj = flatten(message);
      message = '';
      Object.keys(flatObj).forEach((key) => {
        const keyColor = colors.gray(`${key}:`);
        message += `${keyColor}${flatObj[key]} `;
      });
    } else {
      message = stringify(message, null, (options.pretty) ? '  ' : '').replace(/\\n/g, '\n');
    }
  }

  if (options.consoleBell && (_.intersection(options.consoleBell, tags).length > 0)) {
    message += '\u0007';
  }

  tags.forEach((tag, i) => {
    const color = options.colors[tag];
    tags[i] = (color) ? colors[color](tag) : colors.gray(tag);
  });

  const renderTags = (localTags) => {
    if (localTags.length === 0) {
      return '';
    }
    return `${colors.gray('[')}${localTags.join(colors.gray(','))}${colors.gray(']')} `;
  };
  const out = `${ts}${renderTags(tags)}${message}`;
  return out;
};
