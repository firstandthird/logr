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


const defaultPlugin = require('./lib/defaultPlugin.js');

class Logger {
  constructor(options) {
    if (options && options.setDefaults) {
      defaults = _.defaultsDeep(options, defaults);
    }
    this.config = _.defaultsDeep(options, defaults);
    // load all renderers:
    this.renderers = {
      console: require('./lib/console'),
      json: require('./lib/json'),
      cli: require('./lib/cli'),
    };
    if (this.config.additionalRenderers) {
      _.each(options.additionalRenderers, (renderer, renderName) => {
        // renderers can be passed directly or with a path to module:
        let rendererModule;
        if (typeof renderer === 'string') {
          rendererModule = require(renderer);
        } else {
          rendererModule = renderer;
        }
        // each renderer can either be a callable function or an
        // object having a 'register' and 'render' function
        if (rendererModule.register) {
          rendererModule.register(this.config.renderOptions[renderName], (err) => {
            if (err) {
              throw err;
            }
            this.renderers[renderName] = rendererModule.render;
          });
        } else if (typeof rendererModule === 'function') {
          this.renderers[renderName] = rendererModule;
        }
      });
    }
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
    // hook up plugin events:
    this.hooks = {
      initialize: {},
      filter: {
        defaultPlugin: defaultPlugin.filter
      },
      process: {
        defaultPlugin: defaultPlugin.process
      },
      output: {
        defaultPlugin: defaultPlugin.output
      }
    };
    this.renderOptions = this.config.renderOptions[this.config.type];
    this.plugins = {};
    const pluginList = this.config.plugins ? this.config.plugins : [];
    // load the default plugin:
    pluginList.push('./lib/defaultPlugin');
    pluginList.forEach((plugin) => {
      // load the plugin, either as module or object:
      let pluginModule;
      if (typeof plugin === 'string') {
        pluginModule = require(plugin);
        plugin = pluginModule.pluginName;
      } else {
        pluginModule = plugin;
        plugin = pluginModule.pluginName;
      }
      this.plugins[plugin] = pluginModule;
      // load all hooks from the plugin:
      ['filter', 'process', 'output'].forEach((hookName) => {
        if (pluginModule[hookName] !== undefined) {
          this.hooks[hookName][plugin] = pluginModule[hookName];
        }
      });
      if (pluginModule.initialize) {
        if (this.config.pluginOptions && this.config.pluginOptions[plugin]) {
          pluginModule.initialize(this.config.pluginOptions[plugin], this.renderers);
        } else {
          pluginModule.initialize(this.config, this.renderers);
        }
      }
    });
    return this.log.bind(this);
  }

  log(tags, message) {
    if (arguments.length === 1) {
      message = tags;
      tags = [];
    }
    if (!this.config.type) {
      return;
    }
    // use 'filter' to determine which plugins will respond:
    const applicablePlugins = [];
    Object.keys(this.plugins).forEach((plugin) => {
      if (this.plugins[plugin].filter) {
        if (this.plugins[plugin].filter(tags, message)) {
          applicablePlugins.push(plugin);
        }
      } else {
        applicablePlugins.push(plugin);
      }
    });
    // process the data for each plugin:
    applicablePlugins.forEach((plugin) => {
      if (this.hooks.process) {
        this.hooks.process[plugin](tags, message);
      }
    });
    // now print the plugins:
    applicablePlugins.forEach((plugin) => {
      if (this.hooks.output) {
        this.hooks.output[plugin](tags, message);
      }
    });
  }
}

module.exports = Logger;
