'use strict';

const aug = require('aug');
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
      console: require('./lib/console'),
      json: require('./lib/json')
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

    const out = this.renderers[this.config.type](this.config, tags, message);
    /*eslint-disable no-console*/
    console.log(out);
    /*eslint-enable no-console*/
  }
}

module.exports = Logger;
