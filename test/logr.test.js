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

    it('should not think an object is an error', () => {
      const log = new Logr({ renderOptions: { console: { timestamp: false } } });
      log(['tag1'], { message: 'hi there', name: 'bob' });
      expect(lastMessage).to.equal('[tag1] {"message":"hi there","name":"bob"}');
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
      expect(lastMessage).to.equal('  \x1b[42mmessage\x1b[0m (\u001b[31mtag1\u001b[0m)');
    });

    it('should take in an optional prefix and color the prefix)', () => {
      const log = new Logr({
        type: 'cli',
        renderOptions: {
          cli: {
            prefix: 'app | ',
            prefixColor: 'bgGreen',
            colors: {
              tag1: 'red'
            }
          }
        }
      });
      log(['tag1'], 'message');
      expect(lastMessage).to.equal('\u001b[42mapp | \u001b[0mmessage (\u001b[31mtag1\u001b[0m)');
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

  describe('excludes', () => {
    it ('should exclude a specified tags', () => {
      const log = new Logr({ exclude: 'tag1', renderOptions: { console: { timestamp: false } } });
      log(['tag1', 'tag2'], 'message1');
      expect(lastMessage).to.not.equal('[tag1,tag2] message1');
      log(['tag2', 'tag3'], 'message2');
      expect(lastMessage).to.equal('[tag2,tag3] message2');
    });
    it ('should exclude from a list of one or more specified tags', () => {
      const log = new Logr({ exclude: ['tag1'], renderOptions: { console: { timestamp: false } } });
      log(['tag1', 'tag2'], 'message1');
      expect(lastMessage).to.not.equal('[tag1,tag2] message1');
      log(['tag2', 'tag3'], 'message2');
      expect(lastMessage).to.equal('[tag2,tag3] message2');
    });
  });
});

describe('logr reporters', function() {
  it('can load a reporter from code', (done) => {
    const reporterCalls = {};
    const log = new Logr({
      type: 'anExampleReporter',
      renderOptions: {
        anExampleReporter: {
          colors: {
            tag1: 'red'
          }
        }
      },
      reporters: {
        anExampleReporter: (options, tags, message) => {
          reporterCalls.options = options;
          reporterCalls.tags = tags;
          reporterCalls.message = message;
        }
      }
    });
    log(['myTag', 'tag1'], 'my message');
    expect(reporterCalls.tags.length).to.equal(2);
    expect(reporterCalls.tags[0]).to.equal('myTag');
    expect(reporterCalls.message).to.equal('my message');
    expect(reporterCalls.options.colors.tag1).to.equal('red');
    done();
  });
  it('can load a reporter with require ', (done) => {
    const log = new Logr({
      type: 'aSampleReporter',
      reporters: {
        aSampleReporter: path.join(__dirname, 'aSampleReporter.js')
      }
    });
    const prevConsole = console.log;
    const reporterCalls = {
      set: false
    };
    console.log = () => {
      reporterCalls.set = true;
    };
    log(['tag1', 'tag2'], 'my message');
    console.log = prevConsole;
    expect(reporterCalls.set).to.equal(true);
    done();
  });
  it('should be able to use multiple extended reporters with filters', (done) => {
    let testTags = false;
    let testData = false;
    let testOptions = false;
    const log = new Logr({
      reporters: {
        test: {
          render: (options, tags, data) => {
            testTags = tags;
            testData = data;
            testOptions = options;
          },
          options: {
            option1: 'hi',
            option2: 'bye'
          }
        }
      },
      type: [{
        reporter: 'cli',
        filter: ['do-cli']
      },
        {
          reporter: 'test',
          filter: ['do-test']
        }
    ],
      filter: ['tag1'],
      renderOptions: {
        console: {
          timestamp: false
        },
        test: {
          someOptions: 'isSet'
        }
      }
    });
    log(['tag1', 'do-cli'], 'message1');
    log(['tag1', 'do-test'], 'message2');
    expect(testTags).to.not.equal(false);
    expect(testData).to.equal('message2');
    log(['tag1'], 'no');
    expect(testData).to.equal('message2');
    expect(testOptions).to.not.equal(false);
    expect(testOptions.someOptions).to.equal('isSet');
    done();
  });
  it('should be able to load a reporter from an object', (done) => {
    let renderTags = false;
    let renderData = false;
    let renderOptions = false;
    let registerOptions = false;
    const reporter = {
      register: (options, callback) => {
        registerOptions = options;
        callback();
      },
      render: (options, tags, msg) => {
        renderTags = tags;
        renderData = msg;
        renderOptions = options;
      }
    };
    const log = new Logr({
      reporters: {
        test: reporter
      },
      type: [{
        reporter: 'cli'
      },
        {
          reporter: 'test'
        }
    ],
      renderOptions: {
        console: {
          timestamp: false
        },
        test: {
          someOptions: 'set'
        }
      }
    });
    log(['test-tag'], 'a msg');
    // expects here:
    expect(renderTags).to.not.equal(false);
    expect(renderData).to.equal('a msg');
    expect(renderOptions).to.not.equal(false);
    expect(registerOptions).to.not.equal(false);
    expect(registerOptions.someOptions).to.equal('set');
    done();
  });
});
