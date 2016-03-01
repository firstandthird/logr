'use strict';

const aug = require('aug');
const defaults = {
  type: 'console',
  filter: null,
  renderOptions: {
    console: {
      timestamp: true,
      pretty: false
    },
    json: {
      tagsObject: false,
      additional: {}
    }
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
    this.renderOptions = this.config.renderOptions[this.config.type];

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

    const out = this.renderers[this.config.type](this.renderOptions, tags, message);
    /*eslint-disable no-console*/
    console.log(out);
    /*eslint-enable no-console*/
  }
}

module.exports = Logger;
