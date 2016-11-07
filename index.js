'use strict';

const _ = require('lodash');
let defaults = {
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
        warning: 'bgYellow',
        notice: 'bgBlue'
      }
    },
    json: {
      tagsObject: false,
      additional: {}
    },
    cli: {
      consoleBell: ['error'],
      pretty: true,
      colors: {
        error: 'bgRed',
        warn: 'bgYellow',
        warning: 'bgYellow',
        notice: 'bgBlue'
      }
    }
  }
};

class Logger {
  constructor(options) {
    if (options && options.setDefaults) {
      defaults = _.defaultsDeep(options, defaults);
    }
    this.config = _.defaultsDeep(options, defaults);
    this.renderers = {
      console: require('./lib/console'),
      json: require('./lib/json'),
      cli: require('./lib/cli'),
    };
    if (this.config.reporters) {
      _.each(options.reporters, (renderFunction, renderName) => {
        if (typeof renderFunction === 'string') {
          renderFunction = require(renderFunction);
        }
        if (typeof renderFunction === 'function') {
          this.renderers[renderName] = renderFunction;
        } else {
          // if the reporter has a 'register' method, register it:
          if (renderFunction.register) {
            renderFunction.register(this.config.renderOptions[renderName], (err) => {
              if (err) {
                throw err;
              }
            });
          }
          // if the reporter defines a 'render' method, make it available:
          if (renderFunction.render) {
            this.renderers[renderName] = renderFunction.render;
          }
        }
      });
    }
    // list of keys of renderers to use:
    this.activeRenderers = [];
    this.activeFilters = {};
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
    // make sure all 'types' are set up:
    if (this.config.type !== false) {
      // type could be specified by a single string:
      if (typeof this.config.type === 'string') {
        this.config.type = [this.config.type];
      }
      this.config.type.forEach((type) => {
        if (typeof type === 'string') {
          if (!this.renderers[type]) {
            throw new Error('invalid type');
          }
          this.activeRenderers.push(type);
        } else {
          if (!this.renderers[type.reporter]) {
            throw new Error('invalid type');
          }
          this.activeRenderers.push(type.reporter);
          this.activeFilters[type.reporter] = type.filter;
        }
      });
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
    if (arguments.length === 1) {
      message = tags;
      tags = [];
    }
    if (this.config.exclude) {
      // if it's a string and it's in the list of tags then don't log:
      if (typeof this.config.exclude === 'string') {
        if (tags.indexOf(this.config.exclude) > -1) {
          return;
        }
      } else if (_.intersection(this.config.exclude, tags).length > 0) {
        return;
      }
    }
    if (!this.config.type || this.config.type.length === 0) {
      return;
    }
    if (!this.filterMatch(this.config.filter, tags)) {
      return;
    }
    if (message instanceof Error) {
      message = {
        message: message.message,
        stack: message.stack
      };
      if (tags.indexOf('error') < 0) {
        tags.push('error');
      }
    }
    tags = this.config.defaultTags.concat(tags);
    this.activeRenderers.forEach((type) => {
      const renderer = this.renderers[type];
      if (this.activeFilters[type] === undefined || this.filterMatch(tags, this.activeFilters[type])) {
        const out = renderer(this.config.renderOptions[type], tags, message);
        /*eslint-disable no-console*/
        console.log(out);
        /*eslint-enable no-console*/
      }
    });
  }
}

module.exports = Logger;
