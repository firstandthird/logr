/* global describe, it, beforeEach */
'use strict';
const expect = require('chai').expect;
const Logr = require('../');
const path = require('path');
describe('logr', () => {
  let lastMessage = null;

  beforeEach((done) => {
    const originalConsole = console.log;
    console.log = function(msg) { //eslint-disable-line
      lastMessage = msg;
      originalConsole.apply(null, arguments);
    };
    done();
  });

  describe('init', () => {
    it('should return a function', () => {
      const log = new Logr();
      expect(typeof log).to.equal('function');
    });
  });

  describe('no type', () => {
    it('should not output', () => {
      const oldMessage = lastMessage;
      const log = new Logr({ type: false });
      log(['tag1', 'tag2'], 'this should not output');
      expect(lastMessage).to.equal(oldMessage);
    });
  });

  describe('console', () => {
    it('should output to console formatted', () => {
      const log = new Logr();
      log(['tag1', 'tag2'], 'message');
      expect(lastMessage).to.contain('[tag1,tag2] message');
    });
    it('allows you to specify a tag to trigger a ding', () => {
      const log = new Logr({
        renderOptions: {
          console: {
            consoleBell: ['error', 'ding']
          }
        }
      });
      log(['tag1', 'tag2', 'ding'], 'message with a ding added');
      expect(lastMessage).to.contain('\u0007');
    });
    it('will not ding if you do not use the tags', () => {
      const log = new Logr({
        renderOptions: {
          console: {
            consoleBell: ['error', 'ding']
          }
        }
      });
      log(['tag1', 'tag2'], 'message with no  ding added');
      expect(lastMessage).to.not.contain('\u0007');
    });
    it('allows you to disable all dings', () => {
      const log = new Logr({
        renderOptions: {
          console: {
            consoleBell: false
          }
        }
      });
      log(['tag1', 'tag2', 'error'], 'message with a ding added');
      expect(lastMessage).to.not.contain('\u0007');
    });
    it('should allow disable timestamp', () => {
      const log = new Logr({
        renderOptions: {
          console: {
            timestamp: false
          }
        }
      });
      log(['tag1', 'tag2'], 'message');
      expect(lastMessage).to.equal('[tag1,tag2] message');
    });

    it('should stringify json', () => {
      const log = new Logr({ renderOptions: { console: { timestamp: false } } });
      log(['tag1'], { message: 'hi there' });
      expect(lastMessage).to.equal('[tag1] {"message":"hi there"}');
    });

    it('should stringify json in a safe way', () => {
      const circularObj = {};
      circularObj.circularRef = circularObj;
      circularObj.list = [circularObj, circularObj];
      const log = new Logr({ renderOptions: { console: { timestamp: false } } });
      log(['tag1'], circularObj);
      expect(lastMessage).to.equal('[tag1] {"circularRef":"[Circular ~]","list":["[Circular ~]","[Circular ~]"]}');
    });

    it('should allow pretty printing json', () => {
      const log = new Logr({
        renderOptions: {
          console: {
            timestamp: false,
            pretty: true
          }
        }
      });
      log(['tag1'], { message: 'hi there' });
      expect(lastMessage).to.equal('[tag1] {\n  "message": "hi there"\n}');
    });

    it('should replace escaped newlines if pretty', () => {
      const log = new Logr({
        renderOptions: {
          console: {
            timestamp: false,
            pretty: true
          }
        }
      });
      log(['tag1'], { message: 'hi\nthere' });
      expect(lastMessage).to.equal('[tag1] {\n  "message": "hi\nthere"\n}');
    });

    it('should color tags', () => {
      const log = new Logr({
        renderOptions: {
          console: {
            timestamp: false,
            pretty: true,
            colors: {
              tag1: 'red'
            }
          }
        }
      });
      log(['tag1'], 'message');
      expect(lastMessage).to.equal('[\u001b[31mtag1\u001b[0m] message');
    });
    it('should default color error, warn, notice', () => {
      const log = new Logr({
        renderOptions: {
          console: {
            timestamp: false,
            pretty: true
          }
        }
      });
      log(['error', 'warn', 'notice'], 'message');
      expect(lastMessage).to.equal('[\u001b[41merror\u001b[0m,\u001b[43mwarn\u001b[0m,\u001b[44mnotice\u001b[0m] message\u0007');
    });
    it('should default color error, warning, notice', () => {
      const log = new Logr({
        renderOptions: {
          console: {
            timestamp: false,
            pretty: true
          }
        }
      });
      log(['error', 'warning', 'notice'], 'message');
      expect(lastMessage).to.equal('[\u001b[41merror\u001b[0m,\u001b[43mwarning\u001b[0m,\u001b[44mnotice\u001b[0m] message\u0007');
    });

    it('should allow to disable colors', () => {
      const log = new Logr({
        renderOptions: {
          console: {
            timestamp: false,
            pretty: true,
            colors: false
          }
        }
      });
      log(['error', 'warn', 'notice'], 'message');
      expect(lastMessage).to.equal('[error,warn,notice] message\u0007');
    });

    it('should allow default tags to be set', () => {
      const log = new Logr({
        defaultTags: ['default'],
        renderOptions: {
          console: {
            timestamp: false
          }
        }
      });
      log(['tag1'], 'test');
      expect(lastMessage).to.equal('[default,tag1] test');
    });
    it('should let you optionally leave out the tags ', () => {
      const log = new Logr({
        defaultTags: ['default'],
        renderOptions: {
          console: {
            timestamp: false
          }
        }
      });
      log('test');
      expect(lastMessage).to.equal('[default] test');
      log({ test: 123 });
      expect(lastMessage).to.equal('[default] {"test":123}');
    });
    it('should let you have no tags at all ', () => {
      const log = new Logr({
        renderOptions: {
          console: {
            timestamp: false
          }
        }
      });
      log('test');
      expect(lastMessage).to.equal('test');
      log({ test: 123 });
      expect(lastMessage).to.equal('{"test":123}');
    });
    it('should be able to accept an error instance', () => {
      const log = new Logr({});
      log(new Error('my error'));
      expect(lastMessage).to.include('[\u001b[41merror\u001b[0m]');
      expect(lastMessage).to.include('my error');
      expect(lastMessage).to.include('Error: my error');
      expect(lastMessage).to.include('logr.test.js');
    });
  });

  describe('cli', () => {
    it('should print correctly (indented, no timestamp, tags last)', () => {
      const log = new Logr({
        type: 'cli',
        renderOptions: {
          cli: {
            colors: {
              tag1: 'red'
            }
          }
        }
      });
      log(['tag1'], 'message');
      expect(lastMessage).to.equal('  message (\u001b[31mtag1\u001b[0m)');
    });
    it('should pretty-print objects correctly (indented, no timestamp, tags last)', () => {
      const log = new Logr({
        type: 'cli',
        renderOptions: {
          cli: {
            colors: {
              tag1: 'red'
            }
          }
        }
      });
      log(['tag1'], { message: 123 });
      expect(lastMessage).to.equal('  {\n  "message": 123\n} (\u001b[31mtag1\u001b[0m)');
    });
    it('should take in an optional color to color the whole line)', () => {
      const log = new Logr({
        type: 'cli',
        renderOptions: {
          cli: {
            lineColor: 'bgGreen',
            colors: {
              tag1: 'red'
            }
          }
        }
      });
      log(['tag1'], 'message');
      expect(lastMessage).to.equal('\x1b[42m  message\x1b[0m (\u001b[31mtag1\u001b[0m)');
    });
    it('should default color error, warn, notice', () => {
      const log = new Logr({
        type: 'cli'
      });
      log(['error', 'warn', 'notice'], 'message');
      expect(lastMessage).to.equal('  message\u0007 (\u001b[41merror\u001b[0m,\u001b[43mwarn\u001b[0m,\u001b[44mnotice\u001b[0m)');
    });
    it('should default color error, warning, notice', () => {
      const log = new Logr({
        type: 'cli'
      });
      log(['error', 'warning', 'notice'], 'message');
      expect(lastMessage).to.equal('  message\u0007 (\u001b[41merror\u001b[0m,\u001b[43mwarning\u001b[0m,\u001b[44mnotice\u001b[0m)');
    });
    it('should ding on "error" tag by default', () => {
      const log = new Logr({
        type: 'cli',
      });
      log(['error', 'tag2', 'ding'], 'message with a ding added');
      expect(lastMessage).to.contain('\u0007');
    });
    it('should be able to accept an error instance', () => {
      const log = new Logr({
        type: 'cli'
      });
      log(new Error('my error'));
      expect(lastMessage).to.include('(\u001b[41merror\u001b[0m)');
      expect(lastMessage).to.include('my error');
      expect(lastMessage).to.include('Error: my error');
      expect(lastMessage).to.include('logr.test.js');
    });
  });

  describe('json', () => {
    it('should output to json formatted', () => {
      const log = new Logr({ type: 'json' });
      log(['tag1', 'tag2'], 'message');
      expect(typeof lastMessage).to.equal('string');
      const jsonMessage = JSON.parse(lastMessage);
      expect(jsonMessage.tags).to.deep.equal(['tag1', 'tag2']);
      expect(jsonMessage.message).to.equal('message');
      expect(jsonMessage.timestamp).to.exist;
    });
    it('should output tags as objects if config set', () => {
      const log = new Logr({
        type: 'json',
        renderOptions: {
          json: {
            tagsObject: true
          }
        }
      });
      log(['tag1', 'tag2'], 'message');
      expect(typeof lastMessage).to.equal('string');
      const jsonMessage = JSON.parse(lastMessage);
      expect(jsonMessage.tags).to.deep.equal({ tag1: true, tag2: true });
      expect(jsonMessage.message).to.equal('message');
      expect(jsonMessage.timestamp).to.exist;
    });
    it('should be able to accept an error instance', () => {
      const log = new Logr({ type: 'json' });
      log(new Error('my error'));
      const jsonObject = JSON.parse(lastMessage);
      expect(jsonObject.tags).to.include('error');
      expect(jsonObject.message.message).to.include('my error');
      expect(jsonObject.message.stack).to.include('Error: my error');
      expect(jsonObject.message.stack).to.include('logr.test.js');
    });
    it('should allow additional data to be logged', () => {
      const log = new Logr({
        type: 'json',
        renderOptions: {
          json: {
            additional: {
              host: 'blah.com'
            }
          }
        }
      });
      log(['tag1', 'tag2'], 'message');
      expect(typeof lastMessage).to.equal('string');
      const jsonMessage = JSON.parse(lastMessage);
      expect(jsonMessage.tags).to.deep.equal(['tag1', 'tag2']);
      expect(jsonMessage.message).to.equal('message');
      expect(jsonMessage.host).to.equal('blah.com');
      expect(jsonMessage.timestamp).to.exist;
    });
    it('should stringify json in a safe way', () => {
      const circularObj = {};
      circularObj.circularRef = circularObj;
      circularObj.list = [circularObj, circularObj];
      const log = new Logr({ type: 'json' });
      log(['tag1'], circularObj);
    });
  });

  describe('env overrides', () => {
    it('should look at LOGR_TYPE to override type', () => {
      process.env.LOGR_TYPE = 'json';
      const log = new Logr({ type: 'console' });
      log(['tag1'], 'message1');
      expect(lastMessage[0]).to.equal('{');
      delete process.env.LOGR_TYPE;
    });

    it('should LOGR_TYPE=false should disable output', () => {
      const oldMessage = lastMessage;
      process.env.LOGR_TYPE = 'false';
      const log = new Logr();
      log(['tag1'], 'this should not output');
      expect(lastMessage).to.equal(oldMessage);
      delete process.env.LOGR_TYPE;
    });

    it('should look at LOGR_FILTER to override filters', () => {
      process.env.LOGR_FILTER = 'tag1,tag2';
      const log = new Logr({ type: 'console', renderOptions: { console: { timestamp: false } } });
      log(['tag1'], 'message1');
      expect(lastMessage).to.equal('[tag1] message1');
      log(['tag3'], 'message1');
      expect(lastMessage).to.equal('[tag1] message1');
      delete process.env.LOGR_FILTER;
    });
  });

  describe('filter', () => {
    it('should filter based on tags', () => {
      const log = new Logr({ filter: ['tag1'], renderOptions: { console: { timestamp: false } } });
      log(['tag1'], 'message1');
      expect(lastMessage).to.equal('[tag1] message1');
      log(['tag2'], 'message2');
      expect(lastMessage).to.equal('[tag1] message1');
    });
  });
});

describe('logr plugins', function() {
  it('can load a plugin from code', (done) => {
    const pluginCalls = {};
    const log = new Logr({
      type: 'anExamplePlugin',
      renderOptions: {
        anExamplePlugin: {
          colors: {
            tag1: 'red'
          }
        }
      },
      plugins: {
        anExamplePlugin: (options, tags, message) => {
          pluginCalls.options = options;
          pluginCalls.tags = tags;
          pluginCalls.message = message;
        }
      }
    });
    log(['myTag', 'tag1'], 'my message');
    expect(pluginCalls.tags.length).to.equal(2);
    expect(pluginCalls.tags[0]).to.equal('myTag');
    expect(pluginCalls.message).to.equal('my message');
    expect(pluginCalls.options.colors.tag1).to.equal('red');
    done();
  });
  it('can load a plugin with require ', (done) => {
    const log = new Logr({
      type: 'aSamplePlugin',
      plugins: {
        aSamplePlugin: path.join(__dirname, 'aSamplePlugin.js')
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
});
