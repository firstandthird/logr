'use strict';
const stringify = require('json-stringify-safe');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  fgBlack: '\x1b[30m',
  fgRed: '\x1b[31m',
  fgGreen: '\x1b[32m',
  fgYellow: '\x1b[33m',
  fgBlue: '\x1b[34m',
  fgMagenta: '\x1b[35m',
  fgCyan: '\x1b[36m',
  fgWhite: '\x1b[37m',
  black: '\x1b[40m',
  red: '\x1b[41m',
  green: '\x1b[42m',
  yellow: '\x1b[43m',
  blue: '\x1b[44m',
  magenta: '\x1b[45m',
  cyan: '\x1b[46m',
  white: '\x1b[47m'
};

module.exports = function(options, tags, message) {
  const ts = (options.timestamp) ? `${new Date().toTimeString()}: ` : '';
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

  const out = `${ts}[${tags.join(',')}] ${message}`;
  return out;
};
