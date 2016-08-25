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

  it('should let you specify a "default" config once for all instances of Logger in a project ', () => {
    const log = new Logr({
      setDefaults: true,
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
    const log2 = new Logr();
    log2(['tag1'], 'message');
    expect(lastMessage).to.equal('\x1b[42m  message\x1b[0m (\u001b[31mtag1\u001b[0m)');
  });

  it('should default color error, warn, notice', () => {
    const log = new Logr({
      type: 'cli'
    });
    log(['error', 'warn', 'notice'], 'message');
    expect(lastMessage).to.equal('  message\u0007 (\u001b[41merror\u001b[0m,\u001b[43mwarn\u001b[0m,\u001b[44mnotice\u001b[0m)');
  });
  // it('should default color error, warning, notice', () => {
  //   const log = new Logr({
  //     type: 'cli'
  //   });
  //   log(['error', 'warning', 'notice'], 'message');
  //   expect(lastMessage).to.equal('  message\u0007 (\u001b[41merror\u001b[0m,\u001b[43mwarning\u001b[0m,\u001b[44mnotice\u001b[0m)');
  // });
});
