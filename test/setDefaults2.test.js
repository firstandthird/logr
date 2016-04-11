/* global describe, it, beforeEach */
'use strict';
const expect = require('chai').expect;
const Logr = require('../');

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

  it('should preserve the defaults set in the previous test file ', () => {
    const log2 = new Logr();
    log2(['tag1'], 'message');
    expect(lastMessage).to.equal('\x1b[42m  message\x1b[0m (\u001b[31mtag1\u001b[0m)');
  });

  it('should let you restore the original "defaults"  of Logger in a project ', () => {
    const log3 = new Logr({
      restoreDefaults: true,
      renderOptions: {
        console: {
          timestamp: false
        }
      }
    });
    log3(['tag1', 'tag2'], 'message');
    expect(lastMessage).to.equal('[tag1,tag2] message');
  });
});
