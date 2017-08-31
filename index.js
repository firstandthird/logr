'use strict';

const aug = require('aug');
const intersection = require('lodash.intersection');

const defaults = {
  filter: [],
  unhandledRejection: false,
  uncaughtException: false,
  exclude: [],
  defaultTags: [],
  logger: null,
  reporters: null,
  reporterDefaults: {
    filter: [],
    throttle: false,
    throttleBasedOnTags: false,
    exclude: []
  }
};

class Logger {
  constructor(options) {
    this.config = aug('defaults', defaults, options);
    this.rateLimits = {};
    //override filter with env vars
    if (process.env.LOGR_FILTER) {
      this.config.filter = process.env.LOGR_FILTER.split(',');
    }
    //override exclude with env vars
    if (process.env.LOGR_EXCLUDE) {
      this.config.exclude = process.env.LOGR_EXCLUDE.split(',');
    }

    //be able to override core logger
    if (this.config.logger) {
      this.logger = this.config.logger;
    }

    if (this.config.unhandledRejection) {
      process.on('unhandledRejection', (reason) => {
        this.log(['promise', 'error'], reason);
        process.exit(1);
      });
    }

    if (this.config.uncaughtException) {
      process.on('uncaughtException', (err) => {
        this.log(['exception', 'error'], err);
        process.exit(1);
      });
    }
    this.reporters = {};
    this.setupReporters();
  }

  setupReporters() {
    //if no reporters, default to the basic console
    if (!this.config.reporters) {
      this.config.reporters = {
        console: {
          reporter: require('./lib/console'),
          options: {}
        }
      };
    }
    //loop through all reporters and make sure they are valid
    Object.keys(this.config.reporters).forEach((reporterName) => this.setupReporter(reporterName));
  }

  setupReporter(key) {
    /*
     * Reporter structure
     *
     * OPTION 1
     *
     * exports.defaults = {
     * }
     *
     * exports.log = function(options, tags, message) {
     * }
     *
     *
     * OPTION 2 - if no options, then can just do
     *
     * module.exports = function(options, tags, message) {
     * }
     */

    /*
     * Loading Reporters
     *
     * reporters: {
     *   name: {
     *     reporter: require('path/to/reporter'),
     *     options: {
     *       project level options
     *     }
     *   },
     *   shorthand(options, tags, message) {
     *
     *   }
     */

    let reporterObj = this.config.reporters[key];

    //support shorthand of just a simple function
    if (typeof reporterObj === 'function') {
      reporterObj = {
        reporter: reporterObj
      };
    }

    if (!reporterObj.reporter) {
      throw new Error('reporters must be registered with { reporter, options }');
    }

    //pass in a string and then require it
    if (typeof reporterObj.reporter === 'string') {
      reporterObj.reporter = require(reporterObj.reporter);
    }

    //support for shorthand version with no defaults
    if (typeof reporterObj.reporter === 'function') {
      reporterObj.reporter = {
        log: reporterObj.reporter,
        options: {}
      };
    }

    //make sure reporter log is a function
    if (typeof reporterObj.reporter.log !== 'function') {
      throw new Error('log must be a function');
    }

    //merge logr reporter defaults, defaults defined by reporter and options passed in
    reporterObj.options = aug(
      {},
      this.config.reporterDefaults,
      reporterObj.reporter.defaults || {},
      reporterObj.options || {}
    );

    //copy global filters into each reporter so only have to check one place
    //TODO switch to a lodash merge so dupes don't show up
    reporterObj.options.filter = reporterObj.options.filter.concat(this.config.filter);
    reporterObj.options.exclude = reporterObj.options.exclude.concat(this.config.exclude);

    this.reporters[key] = reporterObj;
  }

  log(tags, message, options) {
    //tags are optional
    if (arguments.length === 1) {
      message = tags;
      tags = [];
    }

    //if message is an error, turn it into a pretty object because Errors aren't json.stringifiable
    if (message instanceof Error) {
      message = {
        message: message.message,
        stack: message.stack
      };
      //auto add error tag if its an error
      if (!options) {
        options = {};
      }
      if (options.addErrorTagToErrors === undefined) {
        options.addErrorTagToErrors = true;
      }
      if (tags.indexOf('error') < 0 && options.addErrorTagToErrors) {
        tags.push('error');
      }
    }
    if (this.config.defaultTags.length !== 0) {
      tags = this.config.defaultTags.concat(tags);
    }
    Object.keys(this.reporters).forEach((name) => {
      const messageClone = (typeof message === 'object') ? aug({}, message) : message;
      this.reporterLog(name, tags.slice(0), messageClone, options);
    });
  }

  reporterLog(reporterName, tags, message, additionalOptions) {
    const reporterObj = this.reporters[reporterName];
    if (additionalOptions && additionalOptions[reporterName]) {
      aug(reporterObj.options, additionalOptions[reporterName]);
    }
    const options = reporterObj.options;

    //reporters can be disabled on the option level
    if (options.enabled === false) {
      return;
    }
    //if there are filters and it doesn't match, stop here
    if (options.filter.length !== 0 && intersection(options.filter, tags).length === 0) {
      return;
    }
    //if there are excludes and they match, stop here
    if (options.exclude.length !== 0 && intersection(options.exclude, tags).length > 0) {
      return;
    }
    // if throttling was specified then throttle log rate:
    if (options.throttle) {
      const tagKey = options.throttleBasedOnTags ? tags.join('') : 'all';
      const curTime = new Date().getTime();
      if (this.rateLimits[tagKey]) {
        if (curTime - this.rateLimits[tagKey] < options.throttle) {
          return;
        }
      }
      this.rateLimits[tagKey] = curTime;
    }
    //pass in the options, tag and message to reporter
    const out = reporterObj.reporter.log(reporterObj.options, tags, message);

    //check if anything meaningful was returned
    if (!out) {
      return;
    }
    //pass ouput string to logger
    this.logger(out);
  }

  logger(msg) {
    console.log(msg); //eslint-disable-line no-console
  }
}

Logger.createLogger = function(options) {
  const logr = new Logger(options);
  return logr.log.bind(logr);
};

module.exports = Logger;
