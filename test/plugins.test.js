/* global describe, it, beforeEach */
'use strict';
const expect = require('chai').expect;
const Logr = require('../');
const path = require('path');

describe('logr plugins', function() {
  it('can load a plugin from code', (done) => {
    const pluginCalls = {};
    const log = new Logr({
      type: 'console',
      renderOptions: {
        console: {
          colors: {
            tag1: 'red'
          }
        }
      },
      pluginOptions: {
        testPlugin: {
          mySampleOption: '1234'
        }
      },
      plugins: [{
        pluginName: 'testPlugin',
        initialize: (config, renderers) => {
          pluginCalls.options = config;
          pluginCalls.renderers = renderers;
        },
        filter: (tags, message) => {
          pluginCalls.filterCalled = true;
          return true;
        },
        process: (tags, message) => {
          pluginCalls.processCalled = true;
        },
        output: (tags, message) => {
          pluginCalls.outputCalled = true;
          pluginCalls.message = message;
          pluginCalls.tags = tags;
        }
      }]
    });
    log(['myTag', 'tag1'], 'my message');
    expect(pluginCalls.tags.length).to.equal(2);
    expect(pluginCalls.tags[0]).to.equal('myTag');
    expect(pluginCalls.message).to.equal('my message');
    expect(pluginCalls.options.mySampleOption).to.equal('1234');
    expect(pluginCalls.filterCalled).to.equal(true);
    expect(pluginCalls.processCalled).to.equal(true);
    expect(pluginCalls.outputCalled).to.equal(true);
    done();
  });
  it('can load a plugin from module', (done) => {
    const pluginCalls = {};
    const log = new Logr({
      type: 'console',
      renderOptions: {
        console: {
          colors: {
            tag1: 'red'
          }
        }
      },
      pluginOptions: {
        aSamplePlugin: pluginCalls
      },
      plugins: [path.join(__dirname, 'aSamplePlugin.js')]
    });
    log(['myTag', 'tag1'], 'my message');
    expect(pluginCalls.tags.length).to.equal(2);
    expect(pluginCalls.tags[0]).to.equal('myTag');
    expect(pluginCalls.message).to.equal('my message');
    expect(pluginCalls.filterCalled).to.equal(true);
    expect(pluginCalls.processCalled).to.equal(true);
    expect(pluginCalls.outputCalled).to.equal(true);
    done();
  });
});
describe('logr renderers', function() {
  it('can load a renderer with require ', (done) => {
    const log = new Logr({
      type: 'aSampleRenderer',
      additionalRenderers: {
        aSampleRenderer: path.join(__dirname, 'aSampleRenderer.js')
      }
    });
    const prevConsole = console.log;
    const pluginCalls = {
      set: false
    };
    console.log = () => {
      pluginCalls.set = true;
    };
    log(['tag1', 'tag2'], 'my message');
    console.log = prevConsole;
    expect(pluginCalls.set).to.equal(true);
    done();
  });
  it('can load a renderer with a register and render method', (done) => {
    const renderCalls = {
      registered: false
    };
    const log = new Logr({
      type: 'anExampleRenderer',
      renderOptions: {
        anExampleRenderer: {
          colors: {
            tag1: 'red'
          }
        }
      },
      additionalRenderers: {
        anExampleRenderer: {
          register: (options, callback) => {
            renderCalls.registered = true;
            callback();
          },
          render: (options, tags, message) => {
            renderCalls.options = options;
            renderCalls.tags = tags;
            renderCalls.message = message;
          }
        }
      }
    });
    expect(renderCalls.registered).to.equal(true);
    log(['myTag', 'tag1'], 'my message');
    expect(renderCalls.tags.length).to.equal(2);
    expect(renderCalls.tags[0]).to.equal('myTag');
    expect(renderCalls.message).to.equal('my message');
    expect(renderCalls.options.colors.tag1).to.equal('red');
    done();
  });
});
