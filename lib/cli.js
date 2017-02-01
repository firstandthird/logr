'use strict';
const stringify = require('json-stringify-safe');
const chalk = require('chalk');
const _ = require('lodash');

module.exports = function(options, tags, message) {
  const colors = new chalk.constructor({ enabled: (options.colors) });

  if (typeof message === 'object') {
    message = stringify(message, null, (options.pretty) ? '  ' : '').replace(/\\n/g, '\n');
  }
  if (options.consoleBell && (_.intersection(options.consoleBell, tags).length > 0)) {
    message += '\u0007';
  }
  tags.forEach((tag, i) => {
    const color = options.colors[tag];
    tags[i] = colors[color] ? colors[color](tag) : tag;
  });
  if (options.lineColor) {
    message = colors[options.lineColor](message);
  }

  const renderTags = (tagsToRender) => {
    if (tagsToRender.length === 0) {
      return '';
    }
    return ` ${colors.gray('(')}${tagsToRender.join(colors.gray(','))}${colors.gray(')')}`;
  };

  let prefix = '  ';
  if (options.prefix) {
    prefix = colors[options.prefixColor](options.prefix);
  }

  const out = `${prefix}${message}${renderTags(tags)}`;
  return out;
};
