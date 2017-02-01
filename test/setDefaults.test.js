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
    expect(lastMessage).to.equal('  \u001b[42mmessage\u001b[49m \u001b[90m(\u001b[39m\u001b[31mtag1\u001b[39m\u001b[90m)\u001b[39m');
  });
});
