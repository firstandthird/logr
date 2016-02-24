'use strict';

const aug = require('aug');
const stringify = require('json-stringify-safe');
const defaults = {
  type: 'console',
  timestamp: true,
  filter: null,
  jsonOptions: {
    tagsObject: false,
    additional: {},
    pretty: false
  }
};

class Logger {
  constructor(options) {
    this.config = aug({}, defaults, options);

    this.renderers = {
      console: (tags, message) => {
        const ts = (this.config.timestamp) ? `${new Date().toTimeString()}: ` : '';
        if (typeof message === 'object') {
          message = stringify(message);
        }
        const out = `${ts}[${tags.join(',')}] ${message}`;
        return out;
      },
      json: (tags, message) => {
        if (this.config.jsonOptions.tagsObject) {
          const tagsObj = {};
          tags.forEach((tag) => {
            tagsObj[tag] = true;
          });
          tags = tagsObj;
        }
        let out = {
          timestamp: new Date(),
          tags,
          message
        };
        out = aug(out, this.config.jsonOptions.additional);
        return stringify(out);
      }
    };

    if (this.config.type && !this.renderers[this.config.type]) {
      throw new Error('invalid type');
    }

    return this.log.bind(this);
  }

  filterMatch(filter, tags) {
    if (filter === null) {
      return true;
    }
    return filter.some((filterTag) => {
      return tags.indexOf(filterTag) !== -1;
    });
  }

  log(tags, message) {
    if (!this.filterMatch(this.config.filter, tags)) {
      return;
    }

    const out = this.renderers[this.config.type](tags, message);
    /*eslint-disable no-console*/
    console.log(out);
    /*eslint-enable no-console*/
  }
}

module.exports = Logger;
