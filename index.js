'use strict';

const _ = require('lodash');
const startingDefaults = {
  type: 'console',
  filter: null,
  defaultTags: [],
  renderOptions: {
    console: {
      consoleBell: ['error'],
      timestamp: true,
      pretty: false,
      colors: {
        error: 'bgRed',
        warn: 'bgYellow',
        notice: 'bgBlue'
      }
    },
    json: {
      tagsObject: false,
      additional: {}
    }
  }
};
// defaults are set globally:
global.logr = {
  defaults: startingDefaults
};

class Logger {
  constructor(options) {
    // use node's 'global' namespace
    if (options) {
      if (options.setDefaults) {
        global.logr.defaults = _.defaultsDeep(options, global.logr.defaults);
      }
      if (options.restoreDefaults) {
        global.logr.defaults = startingDefaults;
      }
    }
    this.config = _.defaultsDeep(options, global.logr.defaults);
    this.renderers = {
      console: require('./lib/console'),
      json: require('./lib/json'),
      cli: require('./lib/cli'),
    };

    if (options && options.type === false) {
      this.config.type = false;
    }

    if (process.env.LOGR_TYPE) {
      this.config.type = process.env.LOGR_TYPE;
      //env vars come in as strings
      if (this.config.type === 'false') {
        this.config.type = false;
      }
    }

    if (process.env.LOGR_FILTER) {
      this.config.filter = process.env.LOGR_FILTER.split(',');
    }

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
    if (arguments.length === 1) {
      message = tags;
      tags = [];
    }
    if (!this.config.type) {
      return;
    }

    if (!this.filterMatch(this.config.filter, tags)) {
      return;
    }

    tags = this.config.defaultTags.concat(tags);

    const out = this.renderers[this.config.type](this.renderOptions, tags, message);
    /*eslint-disable no-console*/
    console.log(out);
    /*eslint-enable no-console*/
  }
}

module.exports = Logger;
