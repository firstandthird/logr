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
    expect(lastMessage).to.equal('  \x1b[42mmessage\x1b[0m (\u001b[31mtag1\u001b[0m)');
  });
});
